import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.services.question_generator import generate_questions
from app.services.scoring_engine import score_session

sessions_bp = Blueprint("sessions", __name__)


@sessions_bp.route("/start", methods=["POST"])
@jwt_required()
def start_session():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body required"}), 400

    resume_id = data.get("resume_id")
    mode = data.get("mode")

    if not resume_id or not mode:
        return jsonify({"error": "resume_id and mode are required"}), 400

    if mode not in ("resume_round", "technical_round"):
        return jsonify({"error": "mode must be resume_round or technical_round"}), 400

    resume = db.resumes.find_one({"_id": resume_id, "user_id": user_id})
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    user = db.users.find_one({"_id": user_id})
    target_role = user.get("target_role") or "SDE"
    experience_level = user.get("experience_level") or "fresher"

    questions_data = generate_questions(
        resume["parsed_data"], target_role, experience_level, mode
    )

    session_id = str(uuid.uuid4())
    session = {
        "_id": session_id,
        "user_id": user_id,
        "resume_id": resume_id,
        "mode": mode,
        "status": "active",
        "started_at": datetime.now(timezone.utc),
        "completed_at": None,
    }
    db.sessions.insert_one(session)

    saved_questions = []
    for q in questions_data:
        question_id = str(uuid.uuid4())
        question = {
            "_id": question_id,
            "session_id": session_id,
            "question_text": q["question_text"],
            "question_order": q.get("order", 1),
            "difficulty": q.get("difficulty", "medium"),
            "resume_anchor": q.get("resume_anchor"),
        }
        db.questions.insert_one(question)
        saved_questions.append(
            {
                "id": question_id,
                "text": q["question_text"],
                "order": q.get("order", 1),
            }
        )

    return (
        jsonify(
            {
                "session_id": session_id,
                "questions": saved_questions,
            }
        ),
        201,
    )


@sessions_bp.route("/<session_id>/answer", methods=["POST"])
@jwt_required()
def submit_answer(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body required"}), 400

    question_id = data.get("question_id")
    answer_text = data.get("answer_text", "").strip()

    if not question_id:
        return jsonify({"error": "question_id is required"}), 400

    if len(answer_text) < 30:
        return jsonify({"error": "Answer must be at least 30 characters"}), 400

    session = db.sessions.find_one({"_id": session_id, "user_id": user_id})
    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session["status"] != "active":
        return jsonify({"error": "Session is not active"}), 400

    question = db.questions.find_one({"_id": question_id, "session_id": session_id})
    if not question:
        return jsonify({"error": "Question not found in this session"}), 404

    existing_answer = db.answers.find_one({"question_id": question_id})
    if existing_answer:
        return jsonify({"error": "Question already answered"}), 400

    answer = {
        "_id": str(uuid.uuid4()),
        "question_id": question_id,
        "answer_text": answer_text,
        "submitted_at": datetime.now(timezone.utc),
    }
    db.answers.insert_one(answer)

    answered_ids = set(
        a["question_id"]
        for a in db.answers.find({"question_id": {"$ne": None}}).collation(None) if False
    )

    all_questions = (
        db.questions.find({"session_id": session_id})
        .sort("question_order", 1)
    )

    question_ids = [q["_id"] for q in all_questions]
    answered_q_ids = set(
        a["question_id"]
        for a in db.answers.find({"question_id": {"$in": question_ids}})
    )

    remaining = [qid for qid in question_ids if qid not in answered_q_ids]

    if not remaining:
        return jsonify({"session_complete": True})

    next_q = db.questions.find_one({"_id": remaining[0]})
    return jsonify(
        {
            "next_question": {
                "id": next_q["_id"],
                "text": next_q["question_text"],
                "order": next_q["question_order"],
            },
            "session_complete": False,
        }
    )


@sessions_bp.route("/<session_id>/complete", methods=["POST"])
@jwt_required()
def complete_session(session_id):
    user_id = get_jwt_identity()
    session = db.sessions.find_one({"_id": session_id, "user_id": user_id})
    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session["status"] != "active":
        return jsonify({"error": "Session already completed"}), 400

    questions = list(
        db.questions.find({"session_id": session_id})
        .sort("question_order", 1)
    )

    if not questions:
        return jsonify({"error": "Session has no questions"}), 400

    question_ids = [q["_id"] for q in questions]
    answers_found = list(db.answers.find({"question_id": {"$in": question_ids}}))
    answer_map = {a["question_id"]: a for a in answers_found}

    if len(answers_found) != len(questions):
        return jsonify({"error": "Not all questions have been answered"}), 400

    qa_pairs = []
    for q in questions:
        a = answer_map.get(q["_id"])
        qa_pairs.append(
            {
                "question_id": q["_id"],
                "question_text": q["question_text"],
                "answer_text": a["answer_text"] if a else "",
            }
        )

    try:
        scores = score_session(qa_pairs)
    except Exception as e:
        return jsonify({"error": f"Scoring failed: {str(e)}"}), 500

    report_id = str(uuid.uuid4())
    report = {
        "_id": report_id,
        "session_id": session_id,
        "overall_score": scores["overall_score"],
        "dimension_scores": scores["dimension_scores"],
        "question_feedback": scores["question_feedback"],
        "summary": scores["summary"],
        "created_at": datetime.now(timezone.utc),
    }
    db.reports.insert_one(report)

    db.sessions.update_one(
        {"_id": session_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}},
    )

    return jsonify({"report_id": report_id}), 201


@sessions_bp.route("/", methods=["GET"])
@jwt_required()
def list_sessions():
    user_id = get_jwt_identity()
    sessions_cursor = (
        db.sessions.find({"user_id": user_id})
        .sort("started_at", -1)
    )

    result = []
    for s in sessions_cursor:
        report = db.reports.find_one({"session_id": s["_id"]})
        result.append(
            {
                "id": s["_id"],
                "mode": s["mode"],
                "status": s["status"],
                "started_at": s["started_at"].isoformat() if s.get("started_at") else None,
                "completed_at": s["completed_at"].isoformat() if s.get("completed_at") else None,
                "has_report": report is not None,
            }
        )

    return jsonify({"sessions": result})


@sessions_bp.route("/<session_id>", methods=["GET"])
@jwt_required()
def get_session(session_id):
    user_id = get_jwt_identity()
    session = db.sessions.find_one({"_id": session_id, "user_id": user_id})
    if not session:
        return jsonify({"error": "Session not found"}), 404

    questions = list(
        db.questions.find({"session_id": session_id})
        .sort("question_order", 1)
    )

    question_ids = [q["_id"] for q in questions]
    answers_found = list(db.answers.find({"question_id": {"$in": question_ids}}))
    answer_map = {a["question_id"]: a for a in answers_found}

    return jsonify(
        {
            "id": session["_id"],
            "mode": session["mode"],
            "status": session["status"],
            "started_at": session["started_at"].isoformat() if session.get("started_at") else None,
            "completed_at": session["completed_at"].isoformat() if session.get("completed_at") else None,
            "questions": [
                {
                    "id": q["_id"],
                    "text": q["question_text"],
                    "order": q["question_order"],
                    "difficulty": q.get("difficulty"),
                    "resume_anchor": q.get("resume_anchor"),
                    "answered": q["_id"] in answer_map,
                    "answer_text": answer_map[q["_id"]]["answer_text"] if q["_id"] in answer_map else None,
                }
                for q in questions
            ],
        }
    )
