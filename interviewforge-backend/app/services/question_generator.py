import json
from app.services.gemini_client import GeminiClient

gemini = GeminiClient()


def generate_questions(
    resume_data: dict, target_role: str, experience_level: str, mode: str
) -> list:
    resume_json = json.dumps(resume_data, indent=2)

    if mode == "resume_round":
        system_prompt = (
            "You are a senior technical interviewer. Generate 10 interview questions for this candidate.\n\n"
            "Rules:\n"
            "- Every question must reference something specific from their resume\n"
            "- Include the resume_anchor field: the exact phrase from their resume the question targets\n"
            "- Mix levels: 3 easy, 4 medium, 3 hard\n"
            "- Focus on: project architecture, technology choices, tradeoffs, failure modes\n"
            "- Do NOT ask trivia or definition questions\n"
            "- Return ONLY valid JSON array\n\n"
            "Schema:\n"
            "[\n"
            "  {\n"
            '    "order": number,\n'
            '    "question_text": string,\n'
            '    "resume_anchor": string,\n'
            '    "difficulty": "easy" | "medium" | "hard"\n'
            "  }\n"
            "]"
        )
        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Experience Level: {experience_level}\n\n"
            f"Resume Data:\n{resume_json}"
        )
    else:
        system_prompt = (
            "You are a senior technical interviewer. Generate 10 technical interview questions "
            "for this candidate's target role.\n\n"
            "Rules:\n"
            "- Questions must be specific to the target role\n"
            "- Test conceptual depth, not trivia\n"
            "- Mix levels: 3 easy, 4 medium, 3 hard\n"
            "- Focus on: system design, architecture decisions, tradeoffs, real-world scenarios\n"
            "- Return ONLY valid JSON array\n\n"
            "Schema:\n"
            "[\n"
            "  {\n"
            '    "order": number,\n'
            '    "question_text": string,\n'
            '    "resume_anchor": null,\n'
            '    "difficulty": "easy" | "medium" | "hard"\n'
            "  }\n"
            "]"
        )
        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Experience Level: {experience_level}\n\n"
            f"Candidate's resume context:\n{resume_json}"
        )

    try:
        questions = gemini.generate_json(user_prompt, system_prompt)
        if isinstance(questions, dict) and "questions" in questions:
            questions = questions["questions"]
        if not isinstance(questions, list):
            questions = []
    except (ValueError, Exception):
        questions = _fallback_questions(mode, target_role)

    return questions


def _fallback_questions(mode: str, target_role: str) -> list:
    if mode == "resume_round":
        return [
            {
                "order": 1,
                "question_text": f"Walk me through the architecture of your most recent project. What were the key design decisions?",
                "resume_anchor": "Project architecture",
                "difficulty": "medium",
            },
            {
                "order": 2,
                "question_text": "What technology choices did you make and what alternatives did you consider?",
                "resume_anchor": "Technology choices",
                "difficulty": "medium",
            },
            {
                "order": 3,
                "question_text": "What would you do differently if you rebuilt this project from scratch?",
                "resume_anchor": "Project hindsight",
                "difficulty": "easy",
            },
            {
                "order": 4,
                "question_text": "How did you handle error cases and edge cases in your implementation?",
                "resume_anchor": "Error handling",
                "difficulty": "hard",
            },
            {
                "order": 5,
                "question_text": "Explain how you would scale your application to handle 10x the traffic.",
                "resume_anchor": "Scalability",
                "difficulty": "hard",
            },
            {
                "order": 6,
                "question_text": "What testing strategy did you use? How did you ensure reliability?",
                "resume_anchor": "Testing",
                "difficulty": "medium",
            },
            {
                "order": 7,
                "question_text": "Describe a technical challenge you faced and how you solved it.",
                "resume_anchor": "Technical challenge",
                "difficulty": "easy",
            },
            {
                "order": 8,
                "question_text": "How did you ensure security in your application?",
                "resume_anchor": "Security",
                "difficulty": "medium",
            },
            {
                "order": 9,
                "question_text": "What metrics would you track to measure the success of this project?",
                "resume_anchor": "Metrics",
                "difficulty": "easy",
            },
            {
                "order": 10,
                "question_text": "How would you debug a production issue in this system?",
                "resume_anchor": "Debugging",
                "difficulty": "hard",
            },
        ]
    else:
        role_questions = {
            "SDE": "Explain the difference between REST and GraphQL. When would you choose one over the other?",
            "AI/ML": "Explain how a transformer attention mechanism works. What problem does it solve?",
            "Full-Stack": "Compare server-side rendering with client-side rendering. What tradeoffs exist?",
            "Frontend": "Explain the React reconciliation algorithm. How does the virtual DOM work?",
            "Python": "Explain the Python GIL. How does it affect multithreaded applications?",
        }
        default_q = "Describe a system design for a URL shortening service. What are the key considerations?"
        q1 = role_questions.get(target_role, default_q)

        return [
            {"order": 1, "question_text": q1, "resume_anchor": None, "difficulty": "medium"},
            {"order": 2, "question_text": "How do you handle database indexing? When would an index hurt performance?", "resume_anchor": None, "difficulty": "medium"},
            {"order": 3, "question_text": "Explain the concept of idempotency in APIs. How would you implement it?", "resume_anchor": None, "difficulty": "hard"},
            {"order": 4, "question_text": "What's the difference between authentication and authorization? How would you implement both?", "resume_anchor": None, "difficulty": "easy"},
            {"order": 5, "question_text": "Describe the CAP theorem. How does it apply to distributed databases?", "resume_anchor": None, "difficulty": "hard"},
            {"order": 6, "question_text": "How would you design a rate-limiting system for a public API?", "resume_anchor": None, "difficulty": "medium"},
            {"order": 7, "question_text": "What is the difference between process and thread? When would you use each?", "resume_anchor": None, "difficulty": "easy"},
            {"order": 8, "question_text": "Explain how you would optimize a slow web page. What metrics would you track?", "resume_anchor": None, "difficulty": "medium"},
            {"order": 9, "question_text": "What is CORS and how does it work? How would you debug a CORS issue?", "resume_anchor": None, "difficulty": "easy"},
            {"order": 10, "question_text": "Design a notification system that supports email, SMS, and push notifications.", "resume_anchor": None, "difficulty": "hard"},
        ]
