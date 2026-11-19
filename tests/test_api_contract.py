import asyncio

from api import main


def test_health_and_home_response_compatibility():
    assert main.home() == {"message": "Welcome to ReLens", "status": "running"}
    assert main.health_check() == {"status": "healthy"}


def test_extract_response_keeps_api_fields(monkeypatch):
    class Upload:
        filename = "offline.pdf"

        async def read(self, limit):
            return b"%PDF-fake"

    async def run():
        monkeypatch.setattr(
            main,
            "extract_pdf_text",
            lambda data: {
                "title": "Offline Paper",
                "total_pages": 1,
                "total_characters": 24,
                "pages": [{"page_number": 1, "text": "Abstract\nWe propose a method."}],
            },
        )
        monkeypatch.setattr(main, "extract_keywords", lambda text: [])
        monkeypatch.setattr(
            main,
            "summarize_sections",
            lambda sections: {
                "quick_summary": "Offline summary.",
                "detailed_summary": "Detailed offline summary.",
                "sections": {},
            },
        )
        return await main.extract_paper(Upload())

    response = asyncio.run(run())
    assert set(response) >= {
        "filename", "title", "total_pages", "total_characters",
        "pages", "sections", "keywords", "summary",
        "detailed_summary", "section_summaries",
    }
    assert response["filename"] == "offline.pdf"
    assert response["pages"][0]["page_number"] == 1


def test_page_input_response_shape():
    page = main.PageInput(page_number=3, text="A sourced sentence.")
    dumped = page.model_dump()
    assert dumped == {"page_number": 3, "text": "A sourced sentence."}
