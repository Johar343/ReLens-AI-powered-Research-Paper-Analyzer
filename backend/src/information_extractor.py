"""Grounded, page-aware extraction of research-paper evidence.

This module deliberately uses rules rather than a generative model.  Every
returned claim is a verbatim passage from the extracted PDF and has a page
reference; missing information is never guessed.
"""

import re
from collections import defaultdict

from src.text_preprocessor import remove_table_content


NOT_REPORTED = "Not explicitly reported in the paper."

_CUES = {
    "objective": (r"\bwe (?:propose|introduce|present|aim|address)\b",
                  r"\b(?:goal|objective|purpose) of\b"),
    "contribution": (r"\bcontribut(?:e|es|ed|ion|ions)\b",
                     r"\bwe (?:show|provide|develop|design)\b"),
    "methodology": (r"\b(?:method|approach|architecture|model|algorithm|pipeline)\b",
                    r"\b(?:we use|we employ|we design|we implement|we apply)\b"),
    "architecture": (r"\b(?:architecture|encoder|decoder|transformer|attention|embedding|layer|module|component|pipeline)\b",),
    "dataset": (r"\b(?:dataset|corpus|benchmark|training data|test set|validation set)\b",),
    "configuration": (
        r"\b(?:batch size|learning rate|epochs?|optimizer|hidden size|layers?|parameters?|hardware|implementation)\b",
        r"\btraining\s+(?:configuration|setup|details|procedure|regimen)\b",
    ),
    "metric": (r"\b(?:accuracy|precision|recall|f1|f-score|bleu|rouge|auc|mse|rmse|map|em|exact match|perplexity)\b",),
    "result": (r"\b(?:results?|achieve[sd]?|outperform|improv(?:e|ed|ement)|score|baseline|state[- ]of[- ]the[- ]art)\b",),
    "limitation": (r"\b(?:limitation|challenge|shortcoming|weakness|however)\b",),
    "conclusion": (r"\b(?:conclud|overall|findings?)\b",),
    "future": (r"\b(?:future work|future directions?|further work|remain(?:s)? to be)\b",),
    "problem": (r"\b(?:problem|challenge|gap|drawback|shortcoming|limitation|need)\b",),
    "equation_explanation": (r"\bwhere\b", r"\bdenot(?:es|ed|e)\b", r"\bvariable\b"),
    "dataset_source": (r"\b(?:from|obtained|collected|sourced|provided)\b",),
    "dataset_size": (r"\b\d[\d,.]*\s*(?:examples?|samples?|instances?|documents?|images?|records?|subjects?|tokens?)\b",),
    "dataset_split": (r"\b(?:train(?:ing)?|validation|dev|test|split|held[- ]out)\b",),
}

_SECTION_ALIASES = {
    "overview": ("abstract", "introduction"),
    "background_problem": ("related_work", "background", "introduction"),
    "methodology": ("methodology", "method", "methods", "approach", "experimental_setup"),
    "dataset_analysis": ("methodology", "experiments", "results"),
    "results_comparisons": ("results", "experiments", "discussion"),
    "limitations_conclusion": ("limitations", "discussion", "conclusion", "future_work"),
}


def _paragraph_texts(paragraphs):
    """Yield (text, page) while accepting both PDF and simple test fixtures."""
    for paragraph in paragraphs or []:
        if isinstance(paragraph, str):
            text, page = paragraph, None
        else:
            text = paragraph.get("text", "")
            page = paragraph.get("page_number")
        text = str(text).strip()
        if text and not re.match(r"^(?:figure|fig\.|table|tab\.)\s*\d+", text, re.I):
            yield text, page


def get_page_sentences(paragraphs: list[dict]) -> list[dict]:
    """Reconstruct sentences without losing their source page."""
    grouped = defaultdict(list)
    for text, page in _paragraph_texts(paragraphs):
        grouped[page].append(text)
    sentences = []
    for page, lines in grouped.items():
        joined = " ".join(lines)
        for sentence in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", joined):
            sentence = sentence.strip()
            if len(sentence) >= 30:
                sentences.append({"text": sentence, "page_number": page})
    return sentences


def _evidence(paragraphs, cues=(), limit=8):
    found = []
    seen = set()
    for item in get_page_sentences(paragraphs):
        # Section aliases can point at the same extracted paragraph (and PDF
        # layouts often repeat a sentence across columns).  Keep the source
        # page, but do not return the same claim more than once.
        key = re.sub(r"\s+", " ", item["text"]).strip().casefold()
        if key in seen:
            continue
        seen.add(key)
        # An empty cue set means section evidence, not "no evidence".
        score = sum(bool(re.search(cue, item["text"], re.I)) for cue in cues) if cues else 1
        if score:
            found.append((score, item))
    found.sort(key=lambda pair: pair[0], reverse=True)
    return [{"text": x["text"], "page_number": x["page_number"]}
            for _, x in found[:limit]]


def _all_paragraphs(sections, names):
    result = []
    for name in names:
        result.extend(remove_table_content(sections.get(name, []) or []))
    return result


def _field(paragraphs, cue_name, limit=8):
    values = _evidence(paragraphs, _CUES.get(cue_name, ()), limit)
    return values if values else NOT_REPORTED


def _dataset_field(paragraphs, cue_name, limit=8):
    """Extract dataset claims without leaking training configuration claims.

    Dataset cards are shown independently from methodology cards.  A common
    paper sentence says both "the dataset" and "we used Adam with batch size
    ..."; returning that sentence as dataset evidence makes the cards
    misleading.  Since evidence must remain verbatim, reject the whole
    sentence rather than redact it.
    """
    dataset_cue = _CUES["dataset"][0]
    configuration_cues = _CUES["configuration"]
    values = []
    seen = set()
    for item in get_page_sentences(paragraphs):
        text = item["text"]
        if not re.search(dataset_cue, text, re.I):
            continue
        if any(re.search(cue, text, re.I) for cue in configuration_cues):
            continue
        if not any(re.search(cue, text, re.I) for cue in _CUES.get(cue_name, ())):
            continue
        key = re.sub(r"\s+", " ", text).strip().casefold()
        if key not in seen:
            seen.add(key)
            values.append(item)
    return values[:limit] or NOT_REPORTED


def _dataset_section_result(sections):
    # Keep the dataset card scoped to passages that actually mention a
    # dataset/corpus/benchmark.  In particular, do not use all methodology
    # paragraphs as generic evidence.
    paragraphs = _all_paragraphs(sections, _SECTION_ALIASES["dataset_analysis"])
    result = {
        "evidence": _dataset_field(paragraphs, "dataset"),
        "equations": NOT_REPORTED,
        "equation_explanations": NOT_REPORTED,
        "tables": NOT_REPORTED,
    }
    for field, cue in {
        "datasets": "dataset",
        "dataset_names": "dataset",
        "sources": "dataset_source",
        "sizes": "dataset_size",
        "splits": "dataset_split",
        "splits_and_sizes": "dataset",
    }.items():
        result[field] = _dataset_field(paragraphs, cue)
    return result


def _technical_evidence(paragraphs, kind):
    """Return equations or table/number passages only when visibly present."""
    output = []
    for text, page in _paragraph_texts(paragraphs):
        equation = kind == "equations" and (
            bool(re.search(r"(?:[A-Za-z]\s*=|∑|∏|∫|√|≤|≥|\\frac|\\begin\{)", text))
            or bool(re.search(r"\b(?:where|loss function|objective function)\b", text, re.I))
        )
        table = kind == "tables" and (
            bool(re.match(r"^(?:table|tab\.)\s*\d+", text, re.I))
            or bool(re.search(r"\b(?:baseline|accuracy|precision|recall|f1|bleu|rouge)\b.*\d", text, re.I))
        )
        if equation or table:
            output.append({"text": text, "page_number": page})
    return output


def _section_result(sections, names, fields):
    paragraphs = _all_paragraphs(sections, names)
    result = {"evidence": _evidence(paragraphs, (), 8)}
    result["evidence"] = result["evidence"] or NOT_REPORTED
    for field, cue in fields.items():
        result[field] = _field(paragraphs, cue)
    result["equations"] = _technical_evidence(paragraphs, "equations") or NOT_REPORTED
    result["equation_explanations"] = _field(paragraphs, "equation_explanation")
    result["tables"] = _technical_evidence(paragraphs, "tables") or NOT_REPORTED
    return result


def extract_information(sections: dict) -> dict:
    """Extract six structured analysis sections plus legacy compatibility keys.

    Values are evidence records (``text`` and ``page_number``), or
    :data:`NOT_REPORTED` when no reliable source passage exists.
    """
    overview = _section_result(
        sections, _SECTION_ALIASES["overview"],
        {"objectives": "objective", "contributions": "contribution"},
    )
    background = _section_result(
        sections, _SECTION_ALIASES["background_problem"],
        {"problem": "problem", "prior_work": "contribution"},
    )
    methodology = _section_result(
        sections, _SECTION_ALIASES["methodology"],
        {"approach": "methodology", "architecture": "architecture",
         "experimental_configurations": "configuration"},
    )
    dataset = _dataset_section_result(sections)
    results = _section_result(
        sections, _SECTION_ALIASES["results_comparisons"],
        {"metrics": "metric", "numerical_results": "result", "baselines_comparisons": "result"},
    )
    limitations = _section_result(
        sections, _SECTION_ALIASES["limitations_conclusion"],
        {"limitations": "limitation", "conclusions": "conclusion", "future_work": "future"},
    )

    # Keep the original API's five list-valued keys intact.
    def legacy_value(value):
        return [] if value == NOT_REPORTED else value

    legacy = {
        "objective": legacy_value(overview["objectives"]),
        "methodology": legacy_value(methodology["approach"]),
        "datasets": legacy_value(dataset["datasets"]),
        "key_findings": legacy_value(results["numerical_results"]),
        "limitations": legacy_value(limitations["limitations"]),
    }
    structured_sections = {
        "overview": overview,
        "background_problem": background,
        "methodology": methodology,
        "dataset_analysis": dataset,
        "results_comparisons": results,
        "limitations_conclusion": limitations,
    }
    return {
        **structured_sections,
        "analysis_sections": structured_sections,
        **legacy,
    }
