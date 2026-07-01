from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.resume import Resume
from app.models.session import Session, Question, Answer
from app.models.report import Report
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

    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    user = User.query.get(user_id)
    target_role = user.target_role or "SDE"
    experience_level = user.experience_level or "fresher"

    questions_data = generate_questions(
        resume.parsed_data, target_role, experience_level, mode
    )

    session = Session(
        user_id=user_id,
        resume_id=resume_id,
        mode=mode,
        status="active",
    )
    db.session.add(session)
    db.session.flush()

    saved_questions = []
    for q in questions_data:
        question = Question(
            session_id=session.id,
            question_text=q["question_text"],
            question_order=q.get("order", 1),
            difficulty=q.get("difficulty", "medium"),
            resume_anchor=q.get("resume_anchor"),
        )
        db.session.add(question)
        saved_questions.append(
            {
                "id": question.id,
                "text": question.question_text,
                "order": question.question_order,
            }
        )

    db.session.commit()

    return (
        jsonify(
            {
                "session_id": session.id,
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

    session = Session.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.status != "active":
        return jsonify({"error": "Session is not active"}), 400

    question = Question.query.filter_by(
        id=question_id, session_id=session_id
    ).first()
    if not question:
        return jsonify({"error": "Question not found in this session"}), 404

    if question.answer:
        return jsonify({"error": "Question already answered"}), 400

    answer = Answer(question_id=question_id, answer_text=answer_text)
    db.session.add(answer)
    db.session.commit()

    remaining = (
        Question.query.filter_by(session_id=session_id)
        .outerjoin(Answer, Question.id == Answer.question_id)
        .filter(Answer.id.is_(None))
        .order_by(Question.question_order)
        .all()
    )

    if not remaining:
        return jsonify({"session_complete": True})

    next_q = remaining[0]
    return jsonify(
        {
            "next_question": {
                "id": next_q.id,
                "text": next_q.question_text,
                "order": next_q.question_order,
            },
            "session_complete": False,
        }
    )


@sessions_bp.route("/<session_id>/complete", methods=["POST"])
@jwt_required()
def complete_session(session_id):
    from datetime import datetime, timezone

    user_id = get_jwt_identity()
    session = Session.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.status != "active":
        return jsonify({"error": "Session already completed"}), 400

    questions = (
        Question.query.filter_by(session_id=session_id)
        .order_by(Question.question_order)
        .all()
    )

    if not questions:
        return jsonify({"error": "Session has no questions"}), 400

    answered = all(q.answer for q in questions)
    if not answered:
        return jsonify({"error": "Not all questions have been answered"}), 400

    qa_pairs = []
    for q in questions:
        qa_pairs.append(
            {
                "question_id": q.id,
                "question_text": q.question_text,
                "answer_text": q.answer.answer_text if q.answer else "",
            }
        )

    try:
        scores = score_session(qa_pairs)
    except Exception as e:
        return jsonify({"error": f"Scoring failed: {str(e)}"}), 500

    report = Report(
        session_id=session_id,
        overall_score=scores["overall_score"],
        dimension_scores=scores["dimension_scores"],
        question_feedback=scores["question_feedback"],
        summary=scores["summary"],
    )
    db.session.add(report)

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({"report_id": report.id}), 201


@sessions_bp.route("/", methods=["GET"])
@jwt_required()
def list_sessions():
    user_id = get_jwt_identity()
    sessions = (
        Session.query.filter_by(user_id=user_id)
        .order_by(Session.started_at.desc())
        .all()
    )

    return jsonify(
        {
            "sessions": [
                {
                    "id": s.id,
                    "mode": s.mode,
                    "status": s.status,
                    "started_at": s.started_at.isoformat() if s.started_at else None,
                    "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                    "has_report": s.report is not None,
                }
                for s in sessions
            ]
        }
    )


@sessions_bp.route("/<session_id>", methods=["GET"])
@jwt_required()
def get_session(session_id):
    user_id = get_jwt_identity()
    session = Session.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    questions = (
        Question.query.filter_by(session_id=session_id)
        .order_by(Question.question_order)
        .all()
    )

    return jsonify(
        {
            "id": session.id,
            "mode": session.mode,
            "status": session.status,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "questions": [
                {
                    "id": q.id,
                    "text": q.question_text,
                    "order": q.question_order,
                    "difficulty": q.difficulty,
                    "resume_anchor": q.resume_anchor,
                    "answered": q.answer is not None,
                    "answer_text": q.answer.answer_text if q.answer else None,
                }
                for q in questions
            ],
        }
    )
