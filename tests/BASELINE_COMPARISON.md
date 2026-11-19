# Baseline-versus-improved comparison strategy

Run the same fixtures and this test suite for both pipeline revisions.

## How to compare

1. Record the revision/commit hash and dependency versions.
2. Run `python -m pytest -q tests` without network calls or model downloads.
3. Capture the exact pass/fail counts and timing from pytest.
4. Run representative real-PDF fixtures separately (`attention.pdf`, `BERT.pdf`,
   `transfer_learning.pdf`, `unet.pdf`) only in an environment that has the
   production PDF/model dependencies.
5. Save the following per paper:
   - extracted page text,
   - detected sections and page numbers,
   - chunk counts and token maxima,
   - reconstructed summary,
   - extracted information entries,
   - keywords,
   - equations, citations, numerical results, and table-like spans.

## Acceptance

Do not claim improvement without evidence. Compare:

- section and paragraph preservation,
- source page provenance,
- equation and terminology exact-match counts,
- citation and numerical-result retention,
- malformed/empty input behavior,
- API field and status compatibility,
- readability by manual review of at least one representative output per paper.
