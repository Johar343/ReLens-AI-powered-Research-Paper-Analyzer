
from src.pdf_processor import extract_pdf_text
from src.text_preprocessor import preprocess_text
from src.section_extractor import (
    extract_sections,
    prepare_summarization_text
)
from src.keyword_extractor import extract_keywords


# Extract PDF
with open("data/attention.pdf", "rb") as file:
    pdf_bytes = file.read()

result = extract_pdf_text(pdf_bytes)

# Preprocess pages
cleaned_pages = []

for page in result["pages"]:
    cleaned_pages.append({
        "page_number": page["page_number"],
        "text": preprocess_text(page["text"])
    })

# Detect sections
sections = extract_sections(cleaned_pages)

# Prepare filtered academic content
filtered_text = prepare_summarization_text(sections)

# Extract keywords
keywords = extract_keywords(filtered_text)

print("\n========== YAKE KEYWORDS ==========\n")

for index, item in enumerate(keywords, start=1):
    print(
        f"{index}. {item['keyword']} "
        f"(Score: {item['score']})"
    )
