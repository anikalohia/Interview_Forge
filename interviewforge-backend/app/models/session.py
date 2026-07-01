import uuid
from datetime import datetime, timezone
from app import db


class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False
    )
    resume_id = db.Column(
        db.String(36), db.ForeignKey("resumes.id"), nullable=False
    )
    mode = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default="active")
    started_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    questions = db.relationship(
        "Question", backref="session", lazy=True, cascade="all, delete-orphan"
    )
    report = db.relationship("Report", backref="session", uselist=False, lazy=True)


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(
        db.String(36), db.ForeignKey("sessions.id"), nullable=False
    )
    question_text = db.Column(db.Text, nullable=False)
    question_order = db.Column(db.Integer, nullable=False)
    difficulty = db.Column(db.String(10))
    resume_anchor = db.Column(db.Text, nullable=True)

    answer = db.relationship(
        "Answer", backref="question", uselist=False, lazy=True, cascade="all, delete-orphan"
    )


class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = db.Column(
        db.String(36), db.ForeignKey("questions.id"), nullable=False, unique=True
    )
    answer_text = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
