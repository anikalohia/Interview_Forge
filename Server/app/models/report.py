"""
Collection: reports
Schema:
  _id: string (UUID)
  session_id: string (unique)
  overall_score: int
  dimension_scores: dict
  question_feedback: list
  summary: string
  created_at: datetime
Indexes: session_id (unique)
"""
