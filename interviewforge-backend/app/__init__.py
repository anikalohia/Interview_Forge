import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///interviewforge.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 1440)
    )
    app.config["MAX_CONTENT_LENGTH"] = (
        int(os.getenv("MAX_RESUME_SIZE_MB", 5)) * 1024 * 1024
    )

    CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","))

    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from app.models.user import User
        from app.models.resume import Resume
        from app.models.session import Session, Question, Answer
        from app.models.report import Report

        db.create_all()

    from app.routes.auth import auth_bp
    from app.routes.resumes import resumes_bp
    from app.routes.sessions import sessions_bp
    from app.routes.reports import reports_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(resumes_bp, url_prefix="/resumes")
    app.register_blueprint(sessions_bp, url_prefix="/sessions")
    app.register_blueprint(reports_bp, url_prefix="/reports")

    return app
