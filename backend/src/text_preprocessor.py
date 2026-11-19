import re



def preprocess_text(text: str) -> str:
    """
    Clean extracted PDF text while preserving its meaning.
    """

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove excessive spaces and tabs
    text = re.sub(r"[ \t]+", " ", text)

    # Fix words split across lines by PDF extraction without changing
    # meaningful hyphenated terminology.
    text = re.sub(r"(?<=[A-Za-z])-\n(?=[a-z])", "", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def remove_repeated_page_margins(pages: list[dict]) -> list[dict]:
    """Remove repeated first/last lines that are likely page furniture."""
    if len(pages) < 3:
        return pages

    occurrences = {}
    for page in pages:
        lines = [line.strip() for line in page["text"].splitlines() if line.strip()]
        candidates = set(lines[:2] + lines[-2:])
        for line in candidates:
            if len(line) >= 3:
                occurrences[line] = occurrences.get(line, 0) + 1

    threshold = max(3, (len(pages) + 1) // 2)
    repeated = {
        line for line, count in occurrences.items()
        if count >= threshold and not re.fullmatch(r"\d+", line)
    }

    cleaned_pages = []
    for page in pages:
        lines = page["text"].splitlines()
        while lines and lines[0].strip() in repeated:
            lines.pop(0)
        while lines and lines[-1].strip() in repeated:
            lines.pop()
        cleaned_pages.append({
            **page,
            "text": preprocess_text("\n".join(lines)),
        })

    return cleaned_pages

def clean_academic_content(text: str) -> str:

    # Remove standalone page numbers
    text = re.sub(
        r"(?m)^\s*\d+\s*$",
        "",
        text
    )

    # Remove copyright and permission statements
    text = re.sub(
        r"(?i)provided proper attribution.*?works\.",
        "",
        text
    )

    # Remove figure and table captions
    text = re.sub(
        r"(?im)^\s*(figure|fig\.|table)\s+\d+[^\n]*",
        "",
        text
    )

    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()

def remove_paper_metadata(text: str) -> str:

    # Remove author contribution statements
    text = re.sub(
        r"(?i)∗\s*Equal contribution\..*?(?=\n|31st Conference)",
        "",
        text
    )

    # Remove conference and publication metadata
    text = re.sub(
        r"(?i)\d+(?:st|nd|rd|th)\s+Conference.*?(?=\n|arXiv:)",
        "",
        text
    )

    # Remove arXiv identifier
    text = re.sub(
        r"arXiv:\S+",
        "",
        text
    )

    return text.strip()

def is_table_like_line(line: str) -> bool:
    line = line.strip()

    if not line:
        return False

    # Lines containing only numbers, symbols or mathematical notation
    if re.fullmatch(r"[\d\s.,%()+\-−×÷=<>·√]+", line):
        return True

    # Common table column headings
    table_headers = {
        "model",
        "bleu",
        "training cost",
        "complexity per layer",
        "maximum path length",
        "sequential operations",
        "layer type"
    }

    if line.lower() in table_headers:
        return True

    return False

TABLE_HEADER_MARKERS = {
    "layer type",
    "complexity per layer",
    "sequential",
    "maximum path length",
    "operations",
    "model",
    "bleu",
    "training cost (flops)",
    "en-de",
    "en-fr",
}


def is_table_caption(text: str) -> bool:
    return bool(
        re.match(r"^\s*table\s+\d+\s*[:.]", text, re.IGNORECASE)
    )


def is_table_header(text: str) -> bool:
    return text.strip().lower() in TABLE_HEADER_MARKERS


def is_table_ending_heading(text: str) -> bool:
    headings = {
        "positional encoding",
        "why self-attention",
        "training",
        "training data and batching",
        "hardware and schedule",
        "optimizer",
        "regularization",
        "residual dropout",
        "label smoothing",
    }

    return text.strip().lower() in headings

def remove_table_content(paragraphs: list[dict]) -> list[dict]:
    filtered_paragraphs = []

    waiting_for_header = False
    inside_table = False

    for paragraph in paragraphs:
        text = paragraph["text"].strip()

        # Detect the beginning of a table.
        if is_table_caption(text):
            waiting_for_header = True
            continue

        # Skip caption continuation until the table headers appear.
        if waiting_for_header:
            if is_table_header(text):
                waiting_for_header = False
                inside_table = True
            continue

        # Skip table cells until the next subsection heading.
        if inside_table:
            if is_table_ending_heading(text):
                inside_table = False
                filtered_paragraphs.append(paragraph)
            continue

        filtered_paragraphs.append(paragraph)

    return filtered_paragraphs
