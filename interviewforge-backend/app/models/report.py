import uuid
from datetime import datetime, timezone
from app import db


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(
        db.String(36), db.ForeignKey("sessions.id"), nullable=False, unique=True
    )
    overall_score = db.Column(db.Integer, nullable=False)
    dimension_scores = db.Column(db.JSON, nullable=False)
    question_feedback = db.Column(db.JSON, nullable=False)
    summary = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
