
import pymupdf


def _extract_page_text(page) -> str:
    """Extract text in reading order, including a conservative column heuristic."""
    blocks = [
        block for block in page.get_text("blocks")
        if len(block) > 6 and block[6] == 0 and block[4].strip()
    ]
    if not blocks:
        return page.get_text("text", sort=True).strip()

    midpoint = page.rect.width / 2
    left = [block for block in blocks if block[0] < midpoint]
    right = [block for block in blocks if block[0] >= midpoint]

    if len(left) >= 2 and len(right) >= 2:
        ordered = sorted(left, key=lambda block: (block[1], block[0]))
        ordered.extend(sorted(right, key=lambda block: (block[1], block[0])))
    else:
        ordered = sorted(blocks, key=lambda block: (block[1], block[0]))

    return "\n".join(block[4].strip() for block in ordered)


def extract_pdf_text(pdf_bytes: bytes) -> dict:
    """
    Extract text from a PDF while preserving page numbers.
    """

    try:
        document = pymupdf.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        if document.needs_pass:
            document.close()
            raise ValueError("Password-protected PDFs are not supported.")

        pages = []
        text_page_count = 0
        text_poor_pages = []

        for page_number, page in enumerate(document, start=1):
            text = _extract_page_text(page).strip()
            character_count = len(text)

            if character_count:
                text_page_count += 1
            if character_count < 40:
                text_poor_pages.append(page_number)

            pages.append({
                "page_number": page_number,
                "text": text,
                "character_count": character_count,
            })

        metadata = document.metadata
        document.close()

        full_text = "\n\n".join(
            page["text"] for page in pages
        )
        total_pages = len(pages)
        warnings = []

        if not full_text.strip():
            warnings.append("No extractable text was found in the PDF.")
        elif text_page_count < max(1, total_pages // 2):
            warnings.append(
                "Most pages contain little or no extractable text; "
                "the PDF may be scanned or image-based."
            )

        return {
            "title": metadata.get("title"),
            "total_pages": total_pages,
            "total_characters": len(full_text),
            "pages": pages,
            "full_text": full_text,
            "diagnostics": {
                "text_page_count": text_page_count,
                "text_poor_pages": text_poor_pages,
                "is_text_poor": text_page_count == 0
                or text_page_count < max(1, total_pages // 2),
                "warnings": warnings,
            },
        }

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(
            "Unable to extract text from this PDF."
        ) from error
