"""Contract tests for the canonical, evidence-grounded analysis response."""

from src.information_extractor import NOT_REPORTED, extract_information


CANONICAL_SECTIONS = (
    "overview",
    "background_problem",
    "methodology",
    "dataset_analysis",
    "results_comparisons",
    "limitations_conclusion",
)


def _assert_evidence_value(value):
    """Every classified value is either a source-backed list or explicit absence."""
    if value == NOT_REPORTED:
        return
    assert isinstance(value, list)
    for item in value:
        assert set(item) == {"text", "page_number"}
        assert item["text"].strip()
        assert isinstance(item["page_number"], int)


def test_extract_information_returns_exact_canonical_six_sections():
    sections = {
        "abstract": [{
            "page_number": 1,
            "text": "We propose a compact model and contribute a reproducible benchmark.",
        }],
        "introduction": [{
            "page_number": 2,
            "text": "The problem is costly inference; prior work uses larger models.",
        }],
        "methodology": [{
            "page_number": 3,
            "text": "Our method uses a Transformer architecture with batch size 32.",
        }],
        "experiments": [{
            "page_number": 4,
            "text": "The dataset contains 1,000 examples from a public corpus.",
        }],
        "results": [{
            "page_number": 5,
            "text": "The model achieved 91.2 accuracy and outperformed the baseline.",
        }],
        "conclusion": [{
            "page_number": 6,
            "text": "We conclude that the approach is effective, but future work remains.",
        }],
    }

    result = extract_information(sections)

    assert tuple(result["analysis_sections"]) == CANONICAL_SECTIONS
    assert result["analysis_sections"] == {
        name: result["analysis_sections"][name] for name in CANONICAL_SECTIONS
    }


def test_evidence_classification_is_source_backed_and_page_aware():
    result = extract_information({
        "results": [
            {"page_number": 7, "text": "Our method achieved 28.4 BLEU on the benchmark."},
            {"page_number": 8, "text": "The baseline achieved 25.1 BLEU in comparison."},
        ],
    })

    for section_name in CANONICAL_SECTIONS:
        section = result["analysis_sections"][section_name]
        assert {"evidence", "equations", "equation_explanations", "tables"} <= set(section)
        for value in section.values():
            _assert_evidence_value(value)

    findings = result["results_comparisons"]["numerical_results"]
    assert any("28.4 BLEU" in item["text"] for item in findings)
    assert {item["page_number"] for item in findings} == {7, 8}
    assert result["overview"]["objectives"] == NOT_REPORTED


def test_evidence_deduplication_keeps_one_record_and_first_page():
    sentence = "Our method achieved 28.4 BLEU on the benchmark."
    result = extract_information({
        "results": [
            {"page_number": 7, "text": sentence},
            {"page_number": 9, "text": sentence},
        ],
    })

    findings = result["results_comparisons"]["numerical_results"]
    matching = [item for item in findings if item["text"] == sentence]
    assert matching == [{"text": sentence, "page_number": 7}]


def test_legacy_fields_remain_compatible_with_canonical_analysis():
    result = extract_information({
        "abstract": [{
            "page_number": 1,
            "text": "We propose a method for a dataset of 1,000 examples.",
        }],
        "results": [{
            "page_number": 4,
            "text": "Our method achieved 28.4 BLEU on the benchmark.",
        }],
    })

    assert all(key in result for key in (
        "objective", "methodology", "datasets", "key_findings", "limitations",
    ))
    assert result["objective"] == result["overview"]["objectives"]
    assert result["key_findings"] == result["results_comparisons"]["numerical_results"]
    assert result["datasets"] == result["dataset_analysis"]["datasets"]
