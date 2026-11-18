
import re


INFO_PATTERNS = {
    "objective": {
        "sections": ["abstract", "introduction"],
        "cues": [
            r"\bwe propose\b",
            r"\bwe introduce\b",
            r"\bwe aim\b",
            r"\bthe goal of\b",
            r"\bthe objective\b",
            r"\bwe address\b",
            r"\bwe present\b"
        ]
    },

    "methodology": {
        "sections": ["methodology"],
        "cues": [
            r"\bwe use\b",
            r"\bwe employ\b",
            r"\bwe introduce\b",
            r"\bwe design\b",
            r"\bwe implement\b",
            r"\barchitecture\b",
            r"\bconsists of\b",
            r"\bwe apply\b"
        ]
    },

    "datasets": {
        "sections": ["methodology", "results"],
        "cues": [
            r"\bdataset\b",
            r"\bcorpus\b",
            r"\bbenchmark\b",
            r"\btraining data\b",
            r"\bevaluation data\b",
            r"\btest set\b",
            r"\btraining set\b"
        ]
    },

    "key_findings": {
        "sections": ["results", "conclusion"],
        "cues": [
            r"\bresults show\b",
            r"\bour results\b",
            r"\bachieve\b",
            r"\bachieved\b",
            r"\boutperform",
            r"\bsuperior\b",
            r"\bimprov(?:e|es|ed|ement)\b",
            r"\bstate-of-the-art\b",
            r"\bscore of\b"
        ]
    },

    "limitations": {
        "sections": [
            "limitations",
            "discussion",
            "conclusion",
            "future_work"
        ],
        "cues": [
            r"\blimitation",
            r"\bchallenge",
            r"\bhowever\b",
            r"\bshortcoming",
            r"\bweakness",
            r"\bfuture work\b",
            r"\bremain(?:s)? challenging\b"
        ]
    }
}


def get_page_sentences(paragraphs: list[dict]) -> list[dict]:
    """Reconstruct sentences from extracted PDF lines."""

    pages = {}

    for paragraph in paragraphs:
        text = paragraph["text"].strip()

        # Ignore figure and table captions.
        if re.match(r"^(figure|fig\.|table)\s*\d+", text, re.I):
            continue

        page_number = paragraph["page_number"]
        pages.setdefault(page_number, []).append(text)

    sentences = []

    for page_number, lines in pages.items():

        # Join PDF lines so sentences are not cut off.
        page_text = " ".join(lines)

        page_sentences = re.split(
            r"(?<=[.!?])\s+(?=[A-Z0-9])",
            page_text
        )

        for sentence in page_sentences:
            sentence = sentence.strip()

            if len(sentence) >= 30:
                sentences.append({
                    "text": sentence,
                    "page_number": page_number
                })

    return sentences


def extract_information(sections: dict) -> dict:

    extracted_info = {}

    for info_type, config in INFO_PATTERNS.items():

        candidates = []

        for section_name in config["sections"]:

            paragraphs = sections.get(section_name, [])
            sentences = get_page_sentences(paragraphs)

            for sentence in sentences:

                text = sentence["text"]

                matched_cues = [
                    cue for cue in config["cues"]
                    if re.search(cue, text, re.IGNORECASE)
                ]

                if matched_cues:
                    candidates.append({
                        "text": text,
                        "page_number": sentence["page_number"],
                        "relevance": len(matched_cues)
                    })

        candidates.sort(
            key=lambda item: item["relevance"],
            reverse=True
        )

        extracted_info[info_type] = [
            {
                "text": item["text"],
                "page_number": item["page_number"]
            }
            for item in candidates[:3]
        ]

    return extracted_info
