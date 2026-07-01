"""
Collection: resumes
Schema:
  _id: string (UUID)
  user_id: string
  parsed_data: dict
  raw_text: string
  created_at: datetime
Indexes: (user_id, created_at desc)
"""
