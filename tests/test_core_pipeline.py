import pytest

from src.text_preprocessor import (
    preprocess_text,
    clean_academic_content,
    is_table_like_line,
    remove_table_content,
)
from src.section_extractor import (
    identify_section_heading,
    extract_sections,
    prepare_summarization_text,
)
from src.summary_reconstructor import (
    clean_sentence,
    reconstruct_paragraphs,
    reconstruct_summary,
)
from src.information_extractor import extract_information, get_page_sentences
import src.pdf_processor as pdf_processor


def test_preprocess_normalizes_text_and_hyphenation():
    raw = "Attention\r\nis  all-\n\t you need.\r\n\r\n\r\nNext"
    assert preprocess_text(raw) == "Attention\nis all-\n you need.\n\nNext"
    # A hyphenated PDF line is joined only at a word/word boundary.
    assert preprocess_text("trans-\nformer") == "transformer"


@pytest.mark.parametrize("text,heading", [
    ("1 Introduction", "introduction"),
    ("3.2. Experimental Setup", "experiments"),
    ("5  Results  ", "results"),
    ("Conclusion.", "conclusion"),
])
def test_section_heading_detection(text, heading):
    assert identify_section_heading(text) == heading


def test_section_detection_preserves_page_provenance():
    pages = [
        {"page_number": 2, "text": "1 Introduction\nWe propose a new method.\n"},
        {"page_number": 3, "text": "5 Results\nWe achieved 28.4 BLEU."},
    ]
    sections = extract_sections(pages)
    assert sections["introduction"][0]["page_number"] == 2
    assert sections["results"][0]["page_number"] == 3


def test_malformed_empty_and_non_string_inputs():
    assert preprocess_text("") == ""
    assert extract_sections([]) == {}
    assert prepare_summarization_text({}) == ""
    assert get_page_sentences([]) == []
    info = extract_information({})
    assert set(("objective", "methodology", "datasets", "key_findings", "limitations")) <= set(info)
    assert all(info[name] == [] for name in
               ("objective", "methodology", "datasets", "key_findings", "limitations"))
    with pytest.raises(AttributeError):
        preprocess_text(None)


def test_paragraph_reconstruction_readability():
    result = reconstruct_paragraphs(
        ["The model uses attention.", "It achieved a 28.4 BLEU score.", "Training is parallel."],
        sentences_per_paragraph=2,
    )
    assert result.count("\n\n") == 1
    assert result.startswith("The model uses attention.")


def test_reconstruction_deduplicates_without_losing_equation():
    source = "The feed-forward network is FFN(x) = ReLU(W1x + b1)W2 + b2."
    generated = (
        "The feed-forward network is FFN(x) = ReLU(W1x + b1)W2 + b2. "
        "The feed-forward network is FFN(x) = ReLU(W1x + b1)W2 + b2."
    )
    result = reconstruct_summary(generated, source)
    assert "FFN(x)" in result
    assert result.count("FFN(x)") == 1


def test_clean_sentence_spacing_and_terminal_punctuation():
    assert clean_sentence("A result,  with no  spacing!") == "A result, with no spacing!"
    assert clean_sentence("The result is valid") == "The result is valid."


def test_table_and_equation_preservation():
    assert is_table_like_line("23.75  28.4")
    paragraphs = [
        {"page_number": 4, "text": "We use FFN(x) = ReLU(W1x+b1)W2+b2."},
        {"page_number": 4, "text": "Table 1: Main results"},
        {"page_number": 4, "text": "Model"},
        {"page_number": 4, "text": "Transformer 28.4"},
        {"page_number": 5, "text": "Training"},
    ]
    filtered = remove_table_content(paragraphs)
    texts = "\n".join(item["text"] for item in filtered)
    assert "FFN(x)" in texts
    assert "28.4" not in texts


def test_academic_cleanup_preserves_citations_numbers_and_terms():
    text = "Transformer [3] achieved 28.4 BLEU; see Equation (1)."
    cleaned = clean_academic_content(text)
    assert "[3]" in cleaned
    assert "28.4" in cleaned
    assert "Equation (1)" in cleaned


def test_information_extraction_with_page_provenance():
    sections = {
        "abstract": [{"page_number": 1, "text": "We propose a Transformer for translation."}],
        "results": [{"page_number": 7, "text": "Our results achieved 28.4 BLEU on the benchmark."}],
        "limitations": [{"page_number": 9, "text": "A limitation is the quadratic memory cost."}],
    }
    info = extract_information(sections)
    assert info["objective"][0]["page_number"] == 1
    assert info["key_findings"][0]["page_number"] == 7
    assert "28.4" in info["key_findings"][0]["text"]
    assert info["limitations"][0]["page_number"] == 9
