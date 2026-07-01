import io
import json
import re
from pypdf import PdfReader
import docx
from app.services.gemini_client import GeminiClient


gemini = GeminiClient()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    return text.strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join(p.text for p in doc.paragraphs)
    return text.strip()


def parse_resume(file_bytes: bytes, filename: str) -> dict:
    if filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError("Unsupported file format. Use PDF or DOCX.")

    if not raw_text or len(raw_text) < 50:
        raise ValueError(
            "Could not extract enough text from the resume. "
            "Ensure the file is not scanned or image-based."
        )

    system_prompt = (
        "You are a resume parser. Extract structured information from the resume text below. "
        "Return ONLY valid JSON. No markdown, no explanation.\n\n"
        "Schema:\n"
        "{\n"
        '  "name": string,\n'
        '  "skills": string[],\n'
        '  "tech_stack": string[],\n'
        '  "projects": [\n'
        "    {\n"
        '      "name": string,\n'
        '      "description": string,\n'
        '      "tech": string[],\n'
        '      "key_claims": string[]\n'
        "    }\n"
        "  ],\n"
        '  "experience": [\n'
        '    { "role": string, "company": string, "duration": string, "description": string }\n'
        "  ],\n"
        '  "education": [\n'
        '    { "degree": string, "institution": string, "year": string }\n'
        "  ]\n"
        "}"
    )

    try:
        parsed = gemini.generate_json(raw_text, system_prompt)
    except (ValueError, Exception) as e:
        parsed = _fallback_parse(raw_text)

    return {
        "parsed_data": parsed,
        "raw_text": raw_text,
    }


def _fallback_parse(raw_text: str) -> dict:
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    skills = []
    for line in lines[:20]:
        if re.search(
            r"(python|javascript|java|react|node|sql|docker|aws|git|typescript)",
            line,
            re.IGNORECASE,
        ):
            skills.extend(
                re.findall(
                    r"\b[A-Za-z#+.]+\b",
                    line,
                )
            )

    return {
        "name": lines[0] if lines else "Unknown",
        "skills": list(set(skills))[:15] if skills else [],
        "tech_stack": [],
        "projects": [],
        "experience": [],
        "education": [],
    }
