import os
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.services.resume_parser import parse_resume

resumes_bp = Blueprint("resumes", __name__)

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_SIZE = int(os.getenv("MAX_RESUME_SIZE_MB", 5)) * 1024 * 1024


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@resumes_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File must be PDF or DOCX"}), 400

    file_bytes = file.read()
    if len(file_bytes) > MAX_SIZE:
        return jsonify({"error": f"File exceeds {MAX_SIZE // (1024*1024)}MB limit"}), 400

    try:
        result = parse_resume(file_bytes, file.filename)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to parse resume: {str(e)}"}), 500

    resume_id = str(uuid.uuid4())
    resume = {
        "_id": resume_id,
        "user_id": user_id,
        "parsed_data": result["parsed_data"],
        "raw_text": result["raw_text"],
        "created_at": datetime.now(timezone.utc),
    }
    db.resumes.insert_one(resume)

    return (
        jsonify(
            {
                "resume_id": resume_id,
                "parsed_data": resume["parsed_data"],
                "created_at": resume["created_at"].isoformat(),
            }
        ),
        201,
    )


@resumes_bp.route("/<resume_id>", methods=["GET"])
@jwt_required()
def get_resume(resume_id):
    user_id = get_jwt_identity()
    resume = db.resumes.find_one({"_id": resume_id, "user_id": user_id})
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    return jsonify(
        {
            "resume_id": resume["_id"],
            "parsed_data": resume["parsed_data"],
            "created_at": resume["created_at"].isoformat() if resume.get("created_at") else None,
        }
    )


@resumes_bp.route("/", methods=["GET"])
@jwt_required()
def list_resumes():
    user_id = get_jwt_identity()
    resumes_cursor = (
        db.resumes.find({"user_id": user_id})
        .sort("created_at", -1)
    )

    return jsonify(
        {
            "resumes": [
                {
                    "resume_id": r["_id"],
                    "parsed_data": r["parsed_data"],
                    "created_at": r["created_at"].isoformat() if r.get("created_at") else None,
                }
                for r in resumes_cursor
            ]
        }
    )
