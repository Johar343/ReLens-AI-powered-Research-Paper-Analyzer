import types
import pytest

import src.pdf_processor as pdf_processor
import src.summarizer as summarizer


class FakePage:
    def __init__(self, text):
        self.text = text

    def get_text(self, kind, **kwargs):
        return self.text


class FakeDocument:
    needs_pass = False
    metadata = {"title": "Offline Test Paper"}

    def __init__(self, pages):
        self.pages = pages

    def __iter__(self):
        return iter(self.pages)

    def close(self):
        pass


def test_pdf_diagnostics_preserve_page_numbers(monkeypatch):
    document = FakeDocument([FakePage("Page one"), FakePage("Page two")])
    monkeypatch.setattr(pdf_processor.pymupdf, "open", lambda **kwargs: document)

    result = pdf_processor.extract_pdf_text(b"%PDF-fake")
    assert result["title"] == "Offline Test Paper"
    assert result["total_pages"] == 2
    assert result["pages"][0]["page_number"] == 1
    assert result["pages"][1]["text"] == "Page two"
    assert result["diagnostics"]["text_page_count"] == 2


def test_password_protected_pdf_diagnostic(monkeypatch):
    document = types.SimpleNamespace(needs_pass=True, close=lambda: None)
    monkeypatch.setattr(pdf_processor.pymupdf, "open", lambda **kwargs: document)

    with pytest.raises(ValueError, match="Password-protected"):
        pdf_processor.extract_pdf_text(b"%PDF-fake")


def test_malformed_pdf_diagnostic(monkeypatch):
    def fail(**kwargs):
        raise RuntimeError("bad PDF")

    monkeypatch.setattr(pdf_processor.pymupdf, "open", fail)
    with pytest.raises(ValueError, match="Unable to extract text"):
        pdf_processor.extract_pdf_text(b"not-a-pdf")


def test_empty_pdf_pages(monkeypatch):
    document = FakeDocument([FakePage(""), FakePage("  ")])
    monkeypatch.setattr(pdf_processor.pymupdf, "open", lambda **kwargs: document)
    result = pdf_processor.extract_pdf_text(b"%PDF-fake")
    assert result["total_pages"] == 2
    assert result["pages"] == [
        {"page_number": 1, "text": "", "character_count": 0},
        {"page_number": 2, "text": "", "character_count": 0},
    ]
    assert result["full_text"] == "\n\n"
    assert result["diagnostics"]["warnings"]


def test_chunk_count_and_sentence_boundaries(monkeypatch):
    monkeypatch.setattr(summarizer, "count_tokens", lambda text: len(str(text).split()))
    chunks = summarizer.split_into_chunks(
        "First short sentence. Second short sentence.",
        max_tokens=5,
    )
    assert len(chunks) >= 1
    assert all(chunk.strip() for chunk in chunks)
    joined = " ".join(chunks)
    assert "First short sentence" in joined
    assert "Second short sentence" in joined


def test_empty_chunk_is_not_summarized(monkeypatch):
    monkeypatch.setattr(summarizer, "_load_model", lambda: False)
    assert summarizer.summarize_chunk("") == ""
