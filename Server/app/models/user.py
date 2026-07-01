import uuid
from datetime import datetime, timezone
from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_role = db.Column(db.String(100))
    experience_level = db.Column(db.String(20))
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    resumes = db.relationship("Resume", backref="user", lazy=True)
    sessions = db.relationship("Session", backref="user", lazy=True)
