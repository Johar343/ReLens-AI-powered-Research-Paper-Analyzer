import torch
import nltk
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from src.text_preprocessor import (
    clean_academic_content,
    remove_paper_metadata
)

MODEL_NAME = "sshleifer/distilbart-cnn-12-6"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

model = model.to(DEVICE)
model.eval()


def split_into_chunks(text: str, max_tokens: int = 900) -> list[str]:
    """
    Split text into sentence-aware chunks
    without exceeding the token limit.
    """
    sentences = nltk.sent_tokenize(text)

    chunks = []
    current_chunk = []
    current_tokens = 0

    for sentence in sentences:
        sentence_tokens = len(
            tokenizer.encode(sentence, add_special_tokens=False)
        )

        if sentence_tokens > max_tokens:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_tokens = 0

            # Handle unusually long individual sentences
            token_ids = tokenizer.encode(
                sentence,
                add_special_tokens=False
            )

            for i in range(0, len(token_ids), max_tokens):
                piece = tokenizer.decode(
                    token_ids[i:i + max_tokens],
                    skip_special_tokens=True
                )
                chunks.append(piece)

            continue

        if current_tokens + sentence_tokens > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_tokens = 0

        current_chunk.append(sentence)
        current_tokens += sentence_tokens

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def summarize_chunk(text: str, max_length=150, min_length=40):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    ).to(DEVICE)

    with torch.inference_mode():
        summary_ids = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=max_length,
            min_length=min_length,
            num_beams=4,
            no_repeat_ngram_size=3,
            early_stopping=True
        )

    return tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )

def reduce_summaries(summaries: list[str]) -> str:
    """
    Reduce multiple chunk summaries into a manageable
    representation for final summarization.
    """

    current_summaries = summaries

    while True:
        combined_text = " ".join(current_summaries)

        token_count = len(
            tokenizer.encode(
                combined_text,
                add_special_tokens=True
            )
        )

        if token_count <= 900:
            return combined_text

        summary_chunks = split_into_chunks(
            combined_text,
            max_tokens=800
        )

        if len(summary_chunks) >= len(current_summaries):
            return combined_text

        current_summaries = [
            summarize_chunk(chunk)
            for chunk in summary_chunks
        ]


def summarize_text(text: str) -> dict:
    """
    Generate quick and detailed summaries
    using hierarchical summarization.
    """

    # Stage 1: Split the original paper
    chunks = split_into_chunks(text)

    # Stage 2: Generate individual chunk summaries
    chunk_summaries = [
        summarize_chunk(chunk)
        for chunk in chunks
    ]

    # Stage 3: Reduce chunk summaries
    combined_text = reduce_summaries(chunk_summaries)

    # Stage 4: Generate quick overview
    quick_summary = summarize_chunk(
        combined_text,
        max_length=120,
        min_length=50
    )

    # Stage 5: Generate detailed summary
    detailed_summary = summarize_chunk(
        combined_text,
        max_length=450,
        min_length=180
    )

    return {
        "total_chunks": len(chunks),
        "chunk_summaries": chunk_summaries,
        "quick_summary": quick_summary,
        "detailed_summary": detailed_summary
    }


def summarize_text(text: str) -> dict:
    """
    Summarize a complete document using hierarchical summarization.
    """

    # Stage 1: Map - summarize individual chunks
    chunks = split_into_chunks(text)

    chunk_summaries = [
        summarize_chunk(chunk)
        for chunk in chunks
    ]

    # Stage 2: Reduce - combine summaries
    current_summaries = chunk_summaries

    while True:
        combined_text = " ".join(current_summaries)

        token_count = len(
            tokenizer.encode(
                combined_text,
                add_special_tokens=True
            )
        )

        # The combined text fits the model's input limit
        if token_count <= 900:
            break

        # Summarize groups of summaries
        summary_chunks = split_into_chunks(
            combined_text,
            max_tokens=800
        )

        # Safety check: prevent an infinite reduction loop
        if len(summary_chunks) >= len(current_summaries):
            break

        current_summaries = [
            summarize_chunk(chunk)
            for chunk in summary_chunks
        ]

    quick_summary = summarize_chunk(
        combined_text,
        max_length=120,
        min_length=50
    )

    detailed_summary = summarize_chunk(
        combined_text,
        max_length=450,
        min_length=180
    )
        # Generate the final overview
    final_summary = summarize_chunk(
        "Summarize the following research paper overview: "
        + combined_text,
        max_length=200,
        min_length=50
    )

    return {
        "total_chunks": len(chunks),
        "chunk_summaries": chunk_summaries,
        "detailed_summary" : detailed_summary,
        "quick_summary" : quick_summary,
        "final_summary": final_summary
    }

def summarize_sections(sections: dict) -> dict:
    excluded_sections = {
        "unclassified",
        "references",
        "acknowledgements"
    }

    section_summaries = {}

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

        section_text = "\n\n".join(cleaned_paragraphs)

        chunks = split_into_chunks(section_text)

        chunk_summaries = [
            summarize_chunk(chunk)
            for chunk in chunks
        ]

        final_summary = reduce_summaries(chunk_summaries)

        section_summaries[section_name] = {
            "summary": final_summary,
            "pages": sorted(page_numbers)
        }

    combined_summaries = " ".join(
    item["summary"]
    for item in section_summaries.values()
    )

    quick_summary = summarize_chunk(
        combined_summaries,
        max_length=120,
        min_length=40
    )

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