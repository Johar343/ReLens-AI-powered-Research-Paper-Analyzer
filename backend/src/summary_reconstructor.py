
import re
from difflib import SequenceMatcher

import nltk


def clean_sentence(sentence: str) -> str:
    """Normalize spacing and basic punctuation."""

    sentence = re.sub(r"\s+", " ", sentence).strip()
    sentence = re.sub(r"\s+([,.!?;:])", r"\1", sentence)
    sentence = re.sub(r"([,.!?;:])([A-Za-z])", r"\1 \2", sentence)

    if sentence and sentence[-1] not in ".!?":
        sentence += "."

    return sentence


def tokenize_words(text: str) -> set:
    """Convert text into a normalized set of words."""

    return set(
        re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())
    )


def calculate_similarity(first: str, second: str) -> float:
    """Calculate lexical similarity between two sentences."""

    first_words = tokenize_words(first)
    second_words = tokenize_words(second)

    if not first_words or not second_words:
        return 0.0

    jaccard = len(first_words & second_words) / len(
        first_words | second_words
    )

    sequence = SequenceMatcher(
        None,
        first.lower(),
        second.lower()
    ).ratio()

    return (0.7 * jaccard) + (0.3 * sequence)


def source_alignment_score(
    sentence: str,
    source_sentences: list[str]
) -> float:
    """Find the strongest lexical match in the original section."""

    if not source_sentences:
        return 0.0

    return max(
        (
            len(tokenize_words(sentence) & tokenize_words(source))
            / max(
                len(tokenize_words(sentence) | tokenize_words(source)),
                1
            )
        )
        for source in source_sentences
    )


def remove_redundant_sentences(
    sentences: list[str],
    source_sentences: list[str]
) -> list[str]:
    """Remove repeated sentences while retaining the better-grounded version."""

    unique_sentences = []

    for sentence in sentences:

        duplicate_index = None

        for index, existing in enumerate(unique_sentences):
            if calculate_similarity(sentence, existing) >= 0.78:
                duplicate_index = index
                break

        if duplicate_index is None:
            unique_sentences.append(sentence)
            continue

        existing = unique_sentences[duplicate_index]

        new_score = source_alignment_score(
            sentence, source_sentences
        )
        old_score = source_alignment_score(
            existing, source_sentences
        )

        # Prefer the version with stronger source alignment.
        if new_score > old_score:
            unique_sentences[duplicate_index] = sentence

        elif new_score == old_score and len(sentence) > len(existing):
            unique_sentences[duplicate_index] = sentence

    return unique_sentences


def reconstruct_paragraphs(
    sentences: list[str],
    sentences_per_paragraph: int = 3
) -> str:
    """Group related summary sentences into readable paragraphs."""

    paragraphs = []

    for index in range(0, len(sentences), sentences_per_paragraph):
        paragraph = " ".join(
            sentences[index:index + sentences_per_paragraph]
        )
        paragraphs.append(paragraph)

    return "\n\n".join(paragraphs)


def reconstruct_summary(
    t5_summary: str,
    original_text: str,
    section_name: str = ""
) -> str:
    """
    Reconstruct a generated summary using the original section
    as a reference for redundancy and source alignment.
    """
    if not t5_summary or not t5_summary.strip():
        return ""

    # Split both texts into sentences.
    summary_sentences = nltk.sent_tokenize(t5_summary)
    source_sentences = nltk.sent_tokenize(original_text)

    # Normalize generated sentences.
    cleaned_sentences = [
        clean_sentence(sentence)
        for sentence in summary_sentences
        if len(tokenize_words(sentence)) >= 4
    ]

    # Remove repeated or highly similar sentences.
    unique_sentences = remove_redundant_sentences(
        cleaned_sentences,
        source_sentences
    )

    # Reconstruct readable paragraphs.
    return reconstruct_paragraphs(unique_sentences)
