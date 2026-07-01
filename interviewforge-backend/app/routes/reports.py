from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.report import Report
from app.models.session import Session

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/<report_id>", methods=["GET"])
@jwt_required()
def get_report(report_id):
    user_id = get_jwt_identity()

    report = (
        Report.query.join(Session, Report.session_id == Session.id)
        .filter(Report.id == report_id, Session.user_id == user_id)
        .first()
    )

    if not report:
        return jsonify({"error": "Report not found"}), 404

    return jsonify(
        {
            "id": report.id,
            "session_id": report.session_id,
            "overall_score": report.overall_score,
            "dimension_scores": report.dimension_scores,
            "question_feedback": report.question_feedback,
            "summary": report.summary,
            "created_at": report.created_at.isoformat() if report.created_at else None,
        }
    )


@reports_bp.route("/session/<session_id>", methods=["GET"])
@jwt_required()
def get_report_by_session(session_id):
    user_id = get_jwt_identity()

    report = (
        Report.query.join(Session, Report.session_id == Session.id)
        .filter(Session.id == session_id, Session.user_id == user_id)
        .first()
    )

    if not report:
        return jsonify({"error": "Report not found for this session"}), 404

    return jsonify(
        {
            "id": report.id,
            "session_id": report.session_id,
            "overall_score": report.overall_score,
            "dimension_scores": report.dimension_scores,
            "question_feedback": report.question_feedback,
            "summary": report.summary,
            "created_at": report.created_at.isoformat() if report.created_at else None,
        }
    )
