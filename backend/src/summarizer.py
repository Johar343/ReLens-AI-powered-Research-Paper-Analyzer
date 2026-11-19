"""Section-wise abstractive summarisation using the repository's T5 checkpoint.

The model is loaded lazily so importing the API does not fail when Hugging Face
is temporarily unavailable (or when this module is used by lightweight tests).
"""

import logging
import re
import time
from typing import Any

import nltk
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from src.summary_reconstructor import reconstruct_summary
from src.text_preprocessor import (
    clean_academic_content,
    remove_paper_metadata,
    remove_table_content,
)

LOGGER = logging.getLogger(__name__)

MODEL_NAME = "Talina06/arxiv-summarization"

# The checkpoint's config has n_positions=512.  Leave room for the prompt and
# special tokens rather than relying on truncation to silently lose text.
INPUT_TOKEN_LIMIT = 512
CHUNK_TOKEN_LIMIT = 470
OUTPUT_TOKEN_LIMIT = 128
OUTPUT_MIN_TOKEN_LIMIT = 16
CHUNK_OVERLAP_SENTENCES = 1
CHUNK_OVERLAP_TOKENS = 24

# Keep the summarizer's section names aligned with the structured analysis
# contract.  Section extraction still accepts the paper's many common heading
# variants, so normalize them here rather than changing that API.
CANONICAL_SECTION_ALIASES = {
    "overview": {"abstract", "overview", "summary"},
    "background_problem": {
        "background", "introduction", "related_work", "background_problem",
    },
    "methodology": {"approach", "method", "methods", "methodology"},
    "dataset_analysis": {
        "data", "dataset", "datasets", "experiments", "experimental_setup",
        "dataset_analysis",
    },
    "results_comparisons": {
        "evaluation", "result", "results", "results_comparisons",
    },
    "limitations_conclusion": {
        "conclusion", "conclusions", "discussion", "future_work",
        "limitations", "limitations_conclusion",
    },
}
CANONICAL_SECTION_ORDER = tuple(CANONICAL_SECTION_ALIASES)
CANONICAL_SECTION_TITLES = {
    "overview": "01 · Research Overview",
    "background_problem": "02 · Background & Problem Statement",
    "methodology": "03 · Methodology",
    "dataset_analysis": "04 · Dataset & Experimental Setup",
    "results_comparisons": "05 · Results & Discussion",
    "limitations_conclusion": "06 · Limitations & Conclusion",
}
NOT_REPORTED = "Not explicitly reported in the paper."

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer: Any = None
model: Any = None
_load_attempted = False


def _load_model() -> bool:
    """Load the verified encoder-decoder checkpoint once, without import failure."""
    global tokenizer, model, _load_attempted
    if tokenizer is not None and model is not None:
        return True
    if _load_attempted:
        return False
    _load_attempted = True
    try:
        # Talina06/arxiv-summarization resolves to a T5ForConditionalGeneration
        # checkpoint (not a FLAN-T5 checkpoint), so Auto* classes are intentional.
        loaded_tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        loaded_model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
        loaded_model = loaded_model.to(DEVICE)
        loaded_model.eval()
        tokenizer, model = loaded_tokenizer, loaded_model
        return True
    except Exception as exc:  # network/cache/CUDA/model format errors are recoverable
        LOGGER.warning("Unable to load summarization model %s: %s", MODEL_NAME, exc)
        tokenizer, model = None, None
        return False


def _sentences(text: str) -> list[str]:
    """Use NLTK when its data is installed, with a deterministic fallback."""
    try:
        return [s.strip() for s in nltk.sent_tokenize(text) if s.strip()]
    except LookupError:
        return [
            s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", text)
            if s.strip()
        ]


def count_tokens(text: str) -> int:
    """Count the exact prompted input tokens, or use a conservative fallback."""
    if tokenizer is None and not _load_model():
        return len(text.split()) + 2
    return len(tokenizer.encode(
        f"Summarize: {text}",
        add_special_tokens=True,
        verbose=False,
    ))


def _token_chunks(text: str, max_tokens: int) -> list[str]:
    """Split an overlong sentence on tokenizer boundaries, with small overlap."""
    ids = tokenizer.encode(text, add_special_tokens=False, verbose=False)
    # ``max_tokens`` includes the prompt and special tokens, just like
    # ``count_tokens``.  Reserve that overhead for every decoded piece.
    overhead = len(tokenizer.encode(
        "Summarize: ",
        add_special_tokens=True,
        verbose=False,
    ))
    payload_limit = max(1, max_tokens - overhead)
    step = max(1, payload_limit - CHUNK_OVERLAP_TOKENS)
    pieces = []
    start = 0
    while start < len(ids):
        piece = tokenizer.decode(
            ids[start:start + payload_limit], skip_special_tokens=True
        )
        if piece.strip():
            pieces.append(piece.strip())
        if start + payload_limit >= len(ids):
            break
        start += step
    return pieces


def split_into_chunks(text: str, max_tokens: int = CHUNK_TOKEN_LIMIT) -> list[str]:
    """Create tokenizer-bounded paragraph/sentence chunks with safe overlap."""
    if not text or not text.strip() or max_tokens < 1:
        return []
    if tokenizer is None and not _load_model():
        # A failed model must not make chunking crash; this fallback is only for
        # diagnostics/tests and remains bounded by words.
        words = text.split()
        return [" ".join(words[i:i + max_tokens]) for i in range(0, len(words), max_tokens)]

    units: list[str] = []
    for paragraph in re.split(r"\n\s*\n+", text.strip()):
        units.extend(_sentences(paragraph))
    if not units:
        return []

    chunks: list[str] = []
    current: list[str] = []
    for sentence in units:
        if count_tokens(sentence) > max_tokens:
            if current:
                chunks.append(" ".join(current))
                current = []
            chunks.extend(_token_chunks(sentence, max_tokens))
            continue
        candidate = " ".join(current + [sentence])
        if current and count_tokens(candidate) > max_tokens:
            chunks.append(" ".join(current))
            # Overlap only a complete sentence that fits; this avoids unsafe
            # token duplication and preserves context across chunk boundaries.
            current = current[-CHUNK_OVERLAP_SENTENCES:]
            if count_tokens(" ".join(current + [sentence])) > max_tokens:
                current = []
        current.append(sentence)
    if current:
        chunks.append(" ".join(current))
    return chunks


def summarize_chunk(
    text: str,
    max_length: int = OUTPUT_TOKEN_LIMIT,
    min_length: int = OUTPUT_MIN_TOKEN_LIMIT,
) -> str:
    """Generate one summary, returning an empty string on model/token failures."""
    if not text or not text.strip() or not _load_model():
        return ""
    max_length = max(1, int(max_length))
    min_length = max(0, min(int(min_length), max_length - 1))
    try:
        inputs = tokenizer(
            f"Summarize: {text}",
            return_tensors="pt",
            truncation=True,
            max_length=INPUT_TOKEN_LIMIT,
        ).to(DEVICE)
        start_time = time.perf_counter()
        with torch.inference_mode():
            summary_ids = model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_new_tokens=max_length,
                min_new_tokens=min_length,
                num_beams=4,
                no_repeat_ngram_size=3,
                repetition_penalty=1.2,
                early_stopping=True,
            )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True).strip()
        LOGGER.info(
            "T5 generation: %.2fs | input tokens: %d",
            time.perf_counter() - start_time,
            inputs["input_ids"].shape[1],
        )
        return summary
    except Exception as exc:
        LOGGER.warning("Summarization generation failed: %s", exc)
        return ""


def reduce_summaries(summaries: list[str]) -> str:
    """Hierarchically reduce summaries while making guaranteed progress."""
    current = [s.strip() for s in summaries if isinstance(s, str) and s.strip()]
    if not current:
        return ""
    max_rounds = max(1, len(current).bit_length() + 2)
    for _ in range(max_rounds):
        combined = " ".join(current)
        if count_tokens(combined) <= CHUNK_TOKEN_LIMIT:
            return combined
        chunks = split_into_chunks(combined)
        if not chunks or len(chunks) >= len(current):
            # Returning the bounded first chunk is safer than an unbounded input.
            return chunks[0] if chunks else combined[:1000]
        reduced = [summarize_chunk(chunk) for chunk in chunks]
        reduced = [s for s in reduced if s]
        if not reduced or len(reduced) >= len(current):
            return " ".join(reduced) if reduced else combined
        current = reduced
    return " ".join(current)


def _canonical_section_name(section_name: str) -> str:
    """Return the public six-section name for a heading alias."""
    normalized = re.sub(r"\s+", "_", str(section_name).strip().lower())
    for canonical, aliases in CANONICAL_SECTION_ALIASES.items():
        if normalized in aliases:
            return canonical
    return normalized


def _paragraph_style(text: str) -> str:
    """Make model output readable prose without changing its terminology."""
    if not text or not text.strip():
        return ""
    paragraphs = []
    for paragraph in re.split(r"\n\s*\n+", text.strip()):
        lines = []
        for line in paragraph.splitlines():
            # Models sometimes emit a numbered/bulleted list despite the
            # paragraph prompt.  Removing only the marker keeps the prose.
            line = re.sub(r"^\s*(?:[-*•]|\d+[.)])\s+", "", line)
            if line.strip():
                lines.append(line.strip())
        if lines:
            paragraphs.append(re.sub(r"\s+", " ", " ".join(lines)).strip())
    return "\n\n".join(paragraphs)


def summarize_sections(sections: dict) -> dict:
    """Generate and reconstruct scientific paper summaries for each section."""
    excluded = {"unclassified", "references", "acknowledgements"}
    # Aggregate aliases before summarizing so a paper with repeated headings
    # still produces one coherent entry per canonical section.
    grouped: dict[str, list] = {}
    for raw_name, paragraphs in (sections or {}).items():
        normalized_raw_name = str(raw_name).strip().lower()
        if normalized_raw_name in excluded:
            continue
        name = _canonical_section_name(raw_name)
        grouped.setdefault(name, []).extend(paragraphs or [])

    section_summaries = {}
    original_sections = []
    ordered_names = [
        name for name in CANONICAL_SECTION_ORDER if name in grouped
    ]
    ordered_names.extend(name for name in grouped if name not in ordered_names)
    for section_name in ordered_names:
        paragraphs = grouped[section_name]
        cleaned, pages = [], set()
        for paragraph in remove_table_content(paragraphs or []):
            text = str(paragraph.get("text", "")).strip()
            if not text:
                continue
            text = remove_paper_metadata(clean_academic_content(text))
            if text:
                cleaned.append(text)
                if paragraph.get("page_number") is not None:
                    pages.add(paragraph["page_number"])
        if not cleaned:
            continue
        section_text = "\n\n".join(cleaned)
        original_sections.append(section_text)
        chunk_summaries = [summarize_chunk(chunk) for chunk in split_into_chunks(section_text)]
        t5_summary = _paragraph_style(reduce_summaries(chunk_summaries))
        section_summaries[section_name] = {
            "summary": _paragraph_style(
                reconstruct_summary(t5_summary, section_text, section_name)
            ),
            "t5_summary": t5_summary,
            "pages": sorted(pages),
        }

    combined = " ".join(item["t5_summary"] for item in section_summaries.values())
    original_full_text = "\n\n".join(original_sections)
    reduced_overview = reduce_summaries([combined]) if combined else ""
    quick_t5 = (
        summarize_chunk(reduced_overview, max_length=180, min_length=32)
        if reduced_overview else ""
    )
    quick_summary = (
        _paragraph_style(
            reconstruct_summary(quick_t5, original_full_text, "overview")
        )
        if quick_t5 else ""
    )
    canonical_sections = {
        name: section_summaries.get(name, {
            "summary": NOT_REPORTED,
            "t5_summary": "",
            "pages": [],
        })
        for name in CANONICAL_SECTION_ORDER
    }
    detailed = "\n\n".join(
        f"{CANONICAL_SECTION_TITLES[name]}\n"
        f"Pages: {', '.join(map(str, result['pages'])) or 'Not reported'}\n"
        f"{result['summary']}"
        for name, result in canonical_sections.items()
    )
    return {
        "sections": canonical_sections,
        "quick_summary": quick_summary,
        "detailed_summary": detailed,
    }
