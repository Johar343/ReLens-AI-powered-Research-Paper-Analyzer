
import pymupdf #from PyMuPDF


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

# iterates through pages startin at page 1
        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text").strip()

            pages.append({
                "page_number": page_number,
                "text": text
            })

        metadata = document.metadata
        document.close()
# full text combines all extacted pages for subsequent nlp processing 
        full_text = "\n\n".join(
            page["text"] for page in pages
        )

        return {
            "title": metadata.get("title"),
            "total_pages": len(pages),
            "total_characters": len(full_text),
            "pages": pages,
            "full_text": full_text
        }

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(
            "Unable to extract text from this PDF."
        ) from error
