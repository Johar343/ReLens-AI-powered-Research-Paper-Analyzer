from pathlib import Path

from src import history_store
from src.metadata_extractor import NOT_REPORTED, enrich_with_crossref


def test_crossref_enriches_authors_and_citations(monkeypatch):
    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "message": {
                    "items": [{
                        "title": ["A Research Paper"],
                        "author": [{"given": "Ada", "family": "Lovelace"}],
                        "published-print": {"date-parts": [[1843]]},
                        "container-title": ["Journal of Computing"],
                        "DOI": "10.1234/example",
                        "is-referenced-by-count": 12,
                    }]
                }
            }

    monkeypatch.setattr(
        "src.metadata_extractor.requests.get",
        lambda *args, **kwargs: Response(),
    )
    metadata = enrich_with_crossref({
        "title": "A Research Paper",
        "authors": [],
        "publication": {
            "year": NOT_REPORTED,
            "venue": NOT_REPORTED,
            "doi": NOT_REPORTED,
            "citations": NOT_REPORTED,
        },
    })

    assert metadata["authors"][0]["name"] == "Ada Lovelace"
    assert metadata["publication"]["citations"] == 12
    assert metadata["publication"]["doi"] == "10.1234/example"


def test_history_store_round_trip(tmp_path, monkeypatch):
    db_path = tmp_path / "history.db"
    monkeypatch.setenv("RELENS_DB_PATH", str(db_path))

    history_store.save_history(
        "record-1",
        "browser-1",
        "paper.pdf",
        "Paper",
        3,
        {"summary": "summary"},
    )

    records = history_store.list_history("browser-1")
    assert records[0]["analysis"]["summary"] == "summary"
    assert records[0]["totalPages"] == 3
    assert history_store.delete_history("record-1", "browser-1")
    assert history_store.list_history("browser-1") == []
