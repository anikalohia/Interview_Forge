import os
from urllib.parse import urlparse
from pymongo import MongoClient, ASCENDING, DESCENDING


class Database:
    def __init__(self):
        self._client = None
        self._db = None

    def init_app(self, app):
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/interviewforge")

        db_name = self._extract_db_name(uri)
        self._client = MongoClient(uri)
        self._db = self._client[db_name]

        self._ensure_indexes()

    def _extract_db_name(self, uri: str) -> str:
        parsed = urlparse(uri)
        path = parsed.path.lstrip("/")
        if path:
            return path.split("?")[0].split("/")[0]
        return os.getenv("MONGO_DB_NAME", "interviewforge")

    def _ensure_indexes(self):
        self.users.create_index("email", unique=True)
        self.resumes.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
        self.sessions.create_index([("user_id", ASCENDING), ("started_at", DESCENDING)])
        self.questions.create_index([("session_id", ASCENDING), ("question_order", ASCENDING)])
        self.answers.create_index("question_id", unique=True)
        self.reports.create_index("session_id", unique=True)

    @property
    def users(self):
        return self._db["users"]

    @property
    def resumes(self):
        return self._db["resumes"]

    @property
    def sessions(self):
        return self._db["sessions"]

    @property
    def questions(self):
        return self._db["questions"]

    @property
    def answers(self):
        return self._db["answers"]

    @property
    def reports(self):
        return self._db["reports"]


db = Database()
