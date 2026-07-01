import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from app.database import db

load_dotenv()

jwt = JWTManager()


def create_app():
    app = Flask(__name__)

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

    from app.routes.auth import auth_bp
    from app.routes.resumes import resumes_bp
    from app.routes.sessions import sessions_bp
    from app.routes.reports import reports_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(resumes_bp, url_prefix="/resumes")
    app.register_blueprint(sessions_bp, url_prefix="/sessions")
    app.register_blueprint(reports_bp, url_prefix="/reports")

    return app
