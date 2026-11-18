import re
from src.text_preprocessor import clean_academic_content, remove_paper_metadata, remove_table_content

SECTION_PATTERNS = {
    "abstract": [
        r"abstract"
    ],
    "introduction": [
        r"introduction"
    ],
    "related_work": [
        r"related work",
        r"literature review",
        r"background",
        r"previous work"
    ],
    "methodology": [
        r"methodology",
        r"proposed method",
        r"proposed approach",
        r"method",
        r"model architecture",
        r"system architecture",
        r"approach"
    ],
    "experiments": [
        r"experiments?",
        r"experimental setup",
        r"experimental evaluation",
        r"implementation details"
    ],
    "results": [
        r"results?",
        r"results and analysis",
        r"evaluation"
    ],
    "discussion": [
        r"discussion"
    ],
    "conclusion": [
        r"conclusion",
        r"conclusions",
        r"concluding remarks"
    ],
    "limitations": [
        r"limitations?",
        r"limitations and challenges"
    ],
    "future_work": [
        r"future work",
        r"future directions"
    ],
    "references": [
        r"references",
        r"bibliography"
    ],
    "acknowledgements": [
        r"acknowledgements?",
        r"acknowledgments?"
    ]
}


def identify_section_heading(line: str):
    cleaned = line.strip().lower()

    cleaned = re.sub(
        r"^\d+(?:\.\d+)*\.?\s*",
        "",
        cleaned
    )

    cleaned = cleaned.strip(" .:")

    for section, patterns in SECTION_PATTERNS.items():
        for pattern in patterns:
            if re.fullmatch(pattern, cleaned):
                return section

    return None


def extract_sections(pages: list[dict]) -> dict:
    sections = {}
    current_section = "unclassified"

    for page in pages:
        page_number = page["page_number"]
        lines = page["text"].splitlines()

        for line in lines:
            line = line.strip()

            if not line:
                continue

            detected_section = identify_section_heading(line)

            if detected_section:
                current_section = detected_section
                sections.setdefault(current_section, [])
                continue

            sections.setdefault(current_section, [])

            sections[current_section].append({
            "page_number": page_number,
            "text": line
            })
    return sections

def prepare_summarization_text(sections: dict) -> str:
    excluded_sections = {
        "unclassified",
        "references",
        "acknowledgements"
    }
    selected_sections = []

    for section_name, paragraphs in sections.items():

        if section_name in excluded_sections:
            continue
        filtered_paragraphs = remove_table_content(paragraphs)

        for paragraph in filtered_paragraphs:
            text = paragraph["text"].strip()

            if not text:
                continue

            cleaned_text = clean_academic_content(text)
            cleaned_text = remove_paper_metadata(cleaned_text)

            if cleaned_text:
                selected_sections.append(cleaned_text)

    return "\n\n".join(selected_sections)