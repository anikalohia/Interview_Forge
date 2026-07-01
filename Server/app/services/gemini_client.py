import os
import json
import time
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        self.has_key = bool(api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.has_key:
            return self._mock_response(prompt)

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = self.model.generate_content(full_prompt)
        return response.text

    def generate_json(self, prompt: str, system_prompt: str = "") -> dict:
        raw = self.generate(prompt, system_prompt)
        cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            raise ValueError(f"Gemini returned invalid JSON: {cleaned[:500]}")

    def _mock_response(self, prompt: str) -> str:
        prompt_lower = prompt.lower()

        if "parse" in prompt_lower or "resume parser" in prompt_lower:
            return json.dumps({
                "name": "Test Candidate",
                "skills": ["Python", "JavaScript", "React", "FastAPI", "PostgreSQL"],
                "tech_stack": ["Python", "React", "Node.js", "Docker"],
                "projects": [
                    {
                        "name": "DraftFusion",
                        "description": "Real-time collaborative editor with WebSockets",
                        "tech": ["WebSocket", "React", "Node.js"],
                        "key_claims": [
                            "Built real-time sync with WebSockets",
                            "Implemented conflict resolution for concurrent edits",
                            "Handles 10k concurrent users"
                        ]
                    },
                    {
                        "name": "E-Commerce Platform",
                        "description": "Full-stack e-commerce with payment integration",
                        "tech": ["React", "Node.js", "Stripe", "MongoDB"],
                        "key_claims": [
                            "Built complete checkout flow with Stripe",
                            "Implemented search with Elasticsearch"
                        ]
                    }
                ],
                "experience": [
                    {
                        "role": "Software Intern",
                        "company": "TechCorp",
                        "duration": "6 months",
                        "description": "Built internal tools and APIs"
                    }
                ],
                "education": [
                    {
                        "degree": "B.Tech CSE",
                        "institution": "University of Technology",
                        "year": "2025"
                    }
                ]
            })

        if "interview questions" in prompt_lower or "question generation" in prompt_lower:
            return json.dumps([
                {
                    "order": 1,
                    "question_text": "Walk me through the architecture of DraftFusion end to end. What was your design process?",
                    "resume_anchor": "Real-time collaborative editor with WebSockets",
                    "difficulty": "medium"
                },
                {
                    "order": 2,
                    "question_text": "Why did you choose WebSockets over HTTP polling or SSE for real-time sync? What tradeoffs did you consider?",
                    "resume_anchor": "Built real-time sync with WebSockets",
                    "difficulty": "hard"
                },
                {
                    "order": 3,
                    "question_text": "How did you implement conflict resolution when two users edit the same block simultaneously?",
                    "resume_anchor": "Implemented conflict resolution for concurrent edits",
                    "difficulty": "hard"
                },
                {
                    "order": 4,
                    "question_text": "What would break in your current implementation at 10,000 concurrent users? How would you scale it?",
                    "resume_anchor": "Handles 10k concurrent users",
                    "difficulty": "hard"
                },
                {
                    "order": 5,
                    "question_text": "Describe the checkout flow you built with Stripe. How did you handle webhook idempotency?",
                    "resume_anchor": "Built complete checkout flow with Stripe",
                    "difficulty": "medium"
                },
                {
                    "order": 6,
                    "question_text": "Explain your search implementation with Elasticsearch. How did you handle relevance scoring?",
                    "resume_anchor": "Implemented search with Elasticsearch",
                    "difficulty": "medium"
                },
                {
                    "order": 7,
                    "question_text": "Your resume mentions Docker. How would you containerize a Python FastAPI app for production?",
                    "resume_anchor": "Docker",
                    "difficulty": "easy"
                },
                {
                    "order": 8,
                    "question_text": "Walk me through your experience building internal tools at TechCorp. What was the most technically challenging one?",
                    "resume_anchor": "Built internal tools and APIs",
                    "difficulty": "easy"
                },
                {
                    "order": 9,
                    "question_text": "How would you design a logging system for a microservices architecture?",
                    "resume_anchor": "Python",
                    "difficulty": "medium"
                },
                {
                    "order": 10,
                    "question_text": "What's your approach to testing a WebSocket-based application? How is it different from testing REST APIs?",
                    "resume_anchor": "React",
                    "difficulty": "easy"
                }
            ])

        if "scoring" in prompt_lower or "evaluator" in prompt_lower:
            return json.dumps({
                "question_feedback": [
                    {
                        "question_id": "mock-q1",
                        "scores": {
                            "technical_depth": 75,
                            "clarity": 80,
                            "relevance": 85,
                            "communication": 70,
                            "problem_solving": 65
                        },
                        "strength": "Good understanding of WebSocket fundamentals and real-time communication patterns.",
                        "weakness": "Didn't explain the operational transformation or CRDT approach for conflict resolution. Mentioned the concept but didn't dive into tradeoffs.",
                        "model_answer": "A strong answer would describe the multi-client architecture with a central WebSocket server handling connections. For conflict resolution, you should compare OT vs CRDT approaches, explaining that OT transforms operations against each other while CRDTs use data structures that converge naturally. Mention why you chose one over the other."
                    }
                ],
                "summary": "Your technical foundations are solid but you need to go deeper into tradeoffs. Focus on: (1) Always compare alternatives with specific tradeoffs, (2) Use the CDTO framework (Context, Decision, Tradeoff, Outcome) for architecture questions, (3) Practice quantifying scale and performance claims."
            })

        return "Mock Gemini response"
