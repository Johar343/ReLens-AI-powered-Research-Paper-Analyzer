"""Lightweight smoke tests that do not load an NLP model."""

from src.summary_reconstructor import reconstruct_summary


def test_reconstruction_smoke():
    source = (
        "The Transformer uses self-attention instead of recurrence. "
        "It achieved 28.4 BLEU on English-German translation."
    )
    generated = (
        "The Transformer uses self-attention. "
        "It achieved 28.4 BLEU on English-German translation."
    )

    result = reconstruct_summary(generated, source, "results")

    assert "Transformer" in result
    assert "28.4" in result
