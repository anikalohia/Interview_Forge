import json
from app.services.gemini_client import GeminiClient

gemini = GeminiClient()

DIMENSION_WEIGHTS = {
    "technical_depth": 0.30,
    "clarity": 0.20,
    "relevance": 0.20,
    "communication": 0.15,
    "problem_solving": 0.15,
}


def score_session(qa_pairs: list) -> dict:
    qa_json = json.dumps(qa_pairs, indent=2)

    system_prompt = (
        "You are an interview evaluator. Score each answer and provide specific feedback.\n\n"
        "Scoring dimensions (0-100 each):\n"
        "- technical_depth: accuracy and completeness of technical content\n"
        "- clarity: structure and ease of understanding\n"
        "- relevance: how directly the answer addresses the question\n"
        "- communication: professional tone, appropriate length\n"
        "- problem_solving: evidence of reasoning, not just recall\n\n"
        "Rules:\n"
        "- Feedback must be specific, not generic\n"
        "- Model answer should be 2-4 sentences\n"
        "- Return ONLY valid JSON\n\n"
        "Schema:\n"
        "{\n"
        '  "question_feedback": [\n'
        "    {\n"
        '      "question_id": string,\n'
        '      "scores": {\n'
        '        "technical_depth": number,\n'
        '        "clarity": number,\n'
        '        "relevance": number,\n'
        '        "communication": number,\n'
        '        "problem_solving": number\n'
        "      },\n"
        '      "strength": string,\n'
        '      "weakness": string,\n'
        '      "model_answer": string\n'
        "    }\n"
        "  ],\n"
        '  "summary": string\n'
        "}"
    )

    try:
        result = gemini.generate_json(qa_json, system_prompt)
    except (ValueError, Exception):
        result = _fallback_scores(qa_pairs)

    question_feedback = result.get("question_feedback", [])

    total_weighted = 0
    total_weight = 0
    if question_feedback:
        for qf in question_feedback:
            scores = qf.get("scores", {})
            for dim, weight in DIMENSION_WEIGHTS.items():
                score = scores.get(dim, 0)
                total_weighted += score * weight
                total_weight += weight

    overall_score = round(total_weighted / total_weight) if total_weight > 0 else 70

    dimension_scores = {}
    if question_feedback:
        for dim in DIMENSION_WEIGHTS:
            scores_list = [
                qf.get("scores", {}).get(dim, 0)
                for qf in question_feedback
                if qf.get("scores", {}).get(dim) is not None
            ]
            dimension_scores[dim] = round(sum(scores_list) / len(scores_list)) if scores_list else 0

    summary = result.get(
        "summary",
        "Based on your answers, focus on: (1) Structuring responses using the Context-Decision-Tradeoff-Outcome framework, "
        "(2) Including specific technical details and alternatives considered, "
        "(3) Quantifying results and tradeoffs where possible.",
    )

    return {
        "overall_score": overall_score,
        "dimension_scores": dimension_scores,
        "question_feedback": question_feedback,
        "summary": summary,
    }


def _fallback_scores(qa_pairs: list) -> dict:
    question_feedback = []
    for qa in qa_pairs:
        qid = qa.get("question_id", "unknown")
        answer_text = qa.get("answer_text", "")
        answer_len = len(answer_text)

        base = 65
        if answer_len > 200:
            base += 10
        if answer_len > 500:
            base += 10
        if answer_len < 50:
            base -= 20

        score = max(30, min(95, base))

        question_feedback.append(
            {
                "question_id": qid,
                "scores": {
                    "technical_depth": score,
                    "clarity": min(100, score + 5),
                    "relevance": min(100, score + 10),
                    "communication": min(100, score),
                    "problem_solving": max(30, score - 5),
                },
                "strength": "The answer shows understanding of the core concepts.",
                "weakness": "Could benefit from more specific technical details and comparison with alternatives.",
                "model_answer": "A strong answer would include specific technical details, compare alternatives with tradeoffs, and demonstrate depth of understanding through concrete examples.",
            }
        )

    return {
        "question_feedback": question_feedback,
        "summary": "Focus on adding more technical depth and comparing alternatives in your answers.",
    }
