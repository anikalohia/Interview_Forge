import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    target_role = data.get("target_role", "").strip()
    experience_level = data.get("experience_level", "").strip()

    if not email or not password or not name:
        return jsonify({"error": "Email, password, and name are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    user_id = str(uuid.uuid4())
    user = {
        "_id": user_id,
        "email": email,
        "password_hash": generate_password_hash(password),
        "name": name,
        "target_role": target_role or None,
        "experience_level": experience_level or None,
        "created_at": datetime.now(timezone.utc),
    }
    db.users.insert_one(user)

    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return (
        jsonify(
            {
                "user_id": user_id,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "name": name,
                "email": email,
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user["_id"])
    refresh_token = create_refresh_token(identity=user["_id"])

    return jsonify(
        {
            "user_id": user["_id"],
            "access_token": access_token,
            "refresh_token": refresh_token,
            "name": user["name"],
            "email": user["email"],
        }
    )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {
            "id": user["_id"],
            "email": user["email"],
            "name": user["name"],
            "target_role": user.get("target_role"),
            "experience_level": user.get("experience_level"),
            "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
        }
    )


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    updates = {}
    if data.get("name"):
        updates["name"] = data["name"].strip()
    if data.get("target_role"):
        updates["target_role"] = data["target_role"].strip()
    if data.get("experience_level"):
        updates["experience_level"] = data["experience_level"].strip()

    if updates:
        db.users.update_one({"_id": user_id}, {"$set": updates})

    return jsonify({"message": "Profile updated"})
