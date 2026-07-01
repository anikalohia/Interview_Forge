from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/<report_id>", methods=["GET"])
@jwt_required()
def get_report(report_id):
    user_id = get_jwt_identity()

    report = db.reports.find_one({"_id": report_id})
    if not report:
        return jsonify({"error": "Report not found"}), 404

    session = db.sessions.find_one({"_id": report["session_id"], "user_id": user_id})
    if not session:
        return jsonify({"error": "Report not found"}), 404

    return jsonify(
        {
            "id": report["_id"],
            "session_id": report["session_id"],
            "overall_score": report["overall_score"],
            "dimension_scores": report["dimension_scores"],
            "question_feedback": report["question_feedback"],
            "summary": report["summary"],
            "created_at": report["created_at"].isoformat() if report.get("created_at") else None,
        }
    )


@reports_bp.route("/session/<session_id>", methods=["GET"])
@jwt_required()
def get_report_by_session(session_id):
    user_id = get_jwt_identity()

    session = db.sessions.find_one({"_id": session_id, "user_id": user_id})
    if not session:
        return jsonify({"error": "Session not found"}), 404

    report = db.reports.find_one({"session_id": session_id})
    if not report:
        return jsonify({"error": "Report not found for this session"}), 404

    return jsonify(
        {
            "id": report["_id"],
            "session_id": report["session_id"],
            "overall_score": report["overall_score"],
            "dimension_scores": report["dimension_scores"],
            "question_feedback": report["question_feedback"],
            "summary": report["summary"],
            "created_at": report["created_at"].isoformat() if report.get("created_at") else None,
        }
    )
