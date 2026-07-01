"""
Collection: sessions
Schema:
  _id: string (UUID)
  user_id: string
  resume_id: string
  mode: string (resume_round | technical_round)
  status: string (active | completed | abandoned)
  started_at: datetime
  completed_at: datetime (nullable)

Collection: questions
Schema:
  _id: string (UUID)
  session_id: string
  question_text: string
  question_order: int
  difficulty: string (easy | medium | hard)
  resume_anchor: string (nullable)
Indexes: (session_id, question_order)

Collection: answers
Schema:
  _id: string (UUID)
  question_id: string (unique)
  answer_text: string
  submitted_at: datetime
Indexes: question_id (unique)
"""
