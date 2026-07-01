import uuid
from datetime import datetime, timezone
from app import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False
    )
    parsed_data = db.Column(db.JSON, nullable=False)
    raw_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    sessions = db.relationship("Session", backref="resume", lazy=True)
