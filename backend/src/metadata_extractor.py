import re
from typing import Any
from difflib import SequenceMatcher

import requests

NOT_REPORTED = "Not explicitly reported in the paper."
CROSSREF_URL = "https://api.crossref.org/works"


def _fallback_title(pages: list[dict]) -> str | None:
    for page in pages[:1]:
        for line in page.get("text", "").splitlines():
            candidate = line.strip()
            if _usable_title(candidate) and not re.match(
                r"^(abstract|arxiv:|\d+\s*$)", candidate, re.IGNORECASE
            ):
                return candidate
    return None


def _usable_title(title: str | None) -> bool:
    if not title or not 10 <= len(title.strip()) <= 240:
        return False
    return not re.search(
        r"provided proper attribution|permission|copyright|license|"
        r"reproduce .*tables|journalistic|scholarly works",
        title,
        re.IGNORECASE,
    )


def _local_metadata(title: str | None, pages: list[dict]) -> dict[str, Any]:
    first_page = pages[0].get("text", "") if pages else ""
    title = title.strip() if _usable_title(title) else _fallback_title(pages)
    lines = first_page.splitlines()
    title_index = next(
        (index for index, line in enumerate(lines)
         if title and line.strip() == title),
        0,
    )
    author_lines = []

    for line in lines[title_index + 1:title_index + 20]:
        candidate = line.strip()
        if not candidate or re.search(
            r"abstract|university|department|google brain|research|@|"
            r"arxiv|https?://|copyright|provided proper",
            candidate,
            re.I,
        ):
            continue
        candidate = re.sub(r"[∗†‡\d]+", "", candidate).strip()
        if re.fullmatch(r"[A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+){1,4}", candidate):
            author_lines.append(candidate)
        elif author_lines:
            break

    authors = []
    if author_lines:
        for line in author_lines:
            for name in re.split(r",|\band\b|;", line):
                name = name.strip(" .")
                if 2 <= len(name.split()) <= 6:
                    authors.append({"name": name, "affiliation": ""})
    if not authors and author_lines:
        for name in re.split(r",|\band\b|;", author_lines[0]):
            name = name.strip(" .")
            if 2 <= len(name.split()) <= 6:
                authors.append({"name": name, "affiliation": ""})

    year_match = re.search(r"\b(19|20)\d{2}\b", first_page)
    doi_match = re.search(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b", first_page, re.I)
    reference_count = len(re.findall(r"(?im)^\s*\[\d+\]", "\n".join(
        page.get("text", "") for page in pages
    )))
    full_text = "\n".join(page.get("text", "") for page in pages)
    figure_count = len(re.findall(
        r"(?im)^\s*(?:figure|fig\.)\s+\d+", full_text
    ))
    table_count = len(re.findall(
        r"(?im)^\s*table\s+\d+", full_text
    ))

    return {
        "title": title,
        "authors": authors,
        "publication": {
            "year": year_match.group(0) if year_match else NOT_REPORTED,
            "venue": NOT_REPORTED,
            "doi": doi_match.group(0) if doi_match else NOT_REPORTED,
            "citations": NOT_REPORTED,
            "field": "Research Paper",
        },
        "references_count": reference_count or None,
        "figures_count": figure_count or None,
        "tables_count": table_count or None,
        "metadata_source": "pdf",
    }


def enrich_with_crossref(metadata: dict[str, Any]) -> dict[str, Any]:
    title = metadata.get("title")
    if not title:
        return metadata

    try:
        response = requests.get(
            CROSSREF_URL,
            params={"query.bibliographic": title, "rows": 1},
            headers={"User-Agent": "ReLens/1.0 (academic-paper-analyzer)"},
            timeout=5,
        )
        response.raise_for_status()
        items = response.json().get("message", {}).get("items", [])
        if not items:
            return metadata
        item = items[0]
        matched_title = (item.get("title") or [""])[0]
        if not matched_title:
            return metadata
        query_words = set(re.findall(r"\w+", title.lower()))
        match_words = set(re.findall(r"\w+", matched_title.lower()))
        overlap = len(query_words & match_words) / max(len(query_words), 1)
        similarity = SequenceMatcher(
            None, title.lower(), matched_title.lower()
        ).ratio()
        if overlap < 0.5 and similarity < 0.65:
            return metadata

        authors = [
            {
                "name": " ".join(
                    part for part in (author.get("given"), author.get("family"))
                    if part
                ).strip(),
                "affiliation": ", ".join(
                    affiliation.get("name", "")
                    for affiliation in author.get("affiliation", [])
                    if affiliation.get("name")
                ),
            }
            for author in item.get("author", [])
        ]
        published = item.get("published-print") or item.get("published-online") or {}
        date_parts = published.get("date-parts", [[]])[0]
        publication = metadata["publication"].copy()
        publication.update({
            "year": str(date_parts[0]) if date_parts else publication["year"],
            "venue": (item.get("container-title") or [publication["venue"]])[0],
            "doi": item.get("DOI") or publication["doi"],
            "citations": item.get(
                "is-referenced-by-count", publication["citations"]
            ),
        })
        return {
            **metadata,
            "title": matched_title,
            "authors": authors or metadata["authors"],
            "publication": publication,
            "metadata_source": "crossref",
        }
    except (requests.RequestException, ValueError, TypeError, KeyError):
        return metadata


def extract_metadata(
    title: str | None,
    pages: list[dict],
    use_crossref: bool = True,
) -> dict[str, Any]:
    metadata = _local_metadata(title, pages)
    return enrich_with_crossref(metadata) if use_crossref else metadata
