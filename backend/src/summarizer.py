import torch
import nltk
import time
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from src.summary_reconstructor import reconstruct_summary
from src.text_preprocessor import (
    clean_academic_content,
    remove_paper_metadata
)

MODEL_NAME = "Talina06/arxiv-summarization"

INPUT_TOKEN_LIMIT = 512
CHUNK_TOKEN_LIMIT = 470
OUTPUT_TOKEN_LIMIT = 128

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

model = model.to(DEVICE)
model.eval()


def count_tokens(text: str) -> int:
    """Count tokens including the summarization prefix."""
    encoded = tokenizer.encode(
        f"Summarize: {text}",
        add_special_tokens=True
    )
    return len(encoded)


def split_into_chunks(
    text: str,
    max_tokens: int = CHUNK_TOKEN_LIMIT
) -> list[str]:
    """Split text into sentence-aware chunks within the token limit."""

    sentences = nltk.sent_tokenize(text)

    chunks = []
    current_chunk = []

    for sentence in sentences:

        candidate = " ".join(current_chunk + [sentence])

        if count_tokens(candidate) <= max_tokens:
            current_chunk.append(sentence)
            continue

        if current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = []

        # Handle unusually long individual sentences
        if count_tokens(sentence) > max_tokens:

            token_ids = tokenizer.encode(
                sentence,
                add_special_tokens=False
            )

            # Leave room for the summarization prefix
            for i in range(0, len(token_ids), max_tokens - 10):
                piece = tokenizer.decode(
                    token_ids[i:i + max_tokens - 10],
                    skip_special_tokens=True
                )
                if piece.strip():
                    chunks.append(piece)

        else:
            current_chunk.append(sentence)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks



def summarize_chunk(text: str) -> str:
    """Generate an academic summary for one text chunk."""

    if not text.strip():
        return ""

    start_time = time.perf_counter()

    input_text = f"Summarize: {text}"

    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        truncation=True,
        max_length=INPUT_TOKEN_LIMIT
    ).to(DEVICE)

    token_count = inputs["input_ids"].shape[1]

    with torch.inference_mode():
        summary_ids = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=OUTPUT_TOKEN_LIMIT,
            num_beams=4,
            no_repeat_ngram_size=3,
            repetition_penalty=1.2,
            early_stopping=True
        )

    summary = tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    ).strip()

    elapsed = time.perf_counter() - start_time

    print(
    f"[TIMING] FLAN-T5 generation: {elapsed:.2f}s "
    f"| Input tokens: {token_count}",
    flush=True
    )

    return summary


def summarize_sections(sections: dict) -> dict:
    """Generate and reconstruct scientific paper summaries for each paper section."""

    excluded_sections = {
        "unclassified",
        "references",
        "acknowledgements"
    }

    section_summaries = {}
    original_sections = []

    for section_name, paragraphs in sections.items():

        if section_name in excluded_sections:
            continue

        cleaned_paragraphs = []
        page_numbers = set()

        for paragraph in paragraphs:

            text = paragraph["text"].strip()

            if not text:
                continue

            text = clean_academic_content(text)
            text = remove_paper_metadata(text)

            if text:
                cleaned_paragraphs.append(text)
                page_numbers.add(paragraph["page_number"])

        if not cleaned_paragraphs:
            continue

        # Original cleaned section text
        section_text = "\n\n".join(cleaned_paragraphs)
        original_sections.append(section_text)

        # Stage 1: FLAN-T5 summarization
        chunks = split_into_chunks(section_text)

        chunk_summaries = [
            summarize_chunk(chunk)
            for chunk in chunks
        ]

        t5_summary = reduce_summaries(chunk_summaries)

        # Stage 2: Custom summary reconstruction
        reconstructed_summary = reconstruct_summary(
            t5_summary=t5_summary,
            original_text=section_text,
            section_name=section_name
        )

        section_summaries[section_name] = {
            "summary": reconstructed_summary,
            "t5_summary": t5_summary,
            "pages": sorted(page_numbers)
        }

    # Generate the quick overview using FLAN-T5
    combined_summaries = " ".join(
        item["t5_summary"]
        for item in section_summaries.values()
    )

    original_full_text = "\n\n".join(original_sections)

    if combined_summaries.strip():

        reduced_overview = reduce_summaries(
            [combined_summaries]
        )

        quick_t5_summary = summarize_chunk(reduced_overview)

        quick_summary = reconstruct_summary(
            t5_summary=quick_t5_summary,
            original_text=original_full_text,
            section_name="overview"
        )

    else:
        quick_t5_summary = ""
        quick_summary = ""

    # Build detailed summary using reconstructed sections
    detailed_summary = "\n\n".join(
        f"{section_name.replace('_', ' ').title()}\n"
        f"Pages: {', '.join(map(str, result['pages']))}\n"
        f"{result['summary']}"
        for section_name, result in section_summaries.items()
    )

    return {
        "sections": section_summaries,
        "quick_summary": quick_summary,
        "detailed_summary": detailed_summary
    }


def reduce_summaries(summaries: list[str]) -> str:
    """Repeatedly summarize chunk summaries until they fit the model."""

    current_summaries = [
        summary for summary in summaries if summary.strip()
    ]

    if not current_summaries:
        return ""

    while True:

        combined_text = " ".join(current_summaries)

        if count_tokens(combined_text) <= CHUNK_TOKEN_LIMIT:
            return combined_text

        summary_chunks = split_into_chunks(combined_text)

        # Safety check to prevent an infinite reduction loop
        if len(summary_chunks) >= len(current_summaries):
            return combined_text

        current_summaries = [
            summarize_chunk(chunk)
            for chunk in summary_chunks
        ]
