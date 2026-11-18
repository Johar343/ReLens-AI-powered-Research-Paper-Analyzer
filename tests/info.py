
from src.pdf_processor import extract_pdf_text
from src.text_preprocessor import preprocess_text
from src.section_extractor import extract_sections
from src.information_extractor import extract_information


with open("data/attention.pdf", "rb") as file:
    pdf_bytes = file.read()

result = extract_pdf_text(pdf_bytes)

cleaned_pages = []

for page in result["pages"]:
    cleaned_pages.append({
        "page_number": page["page_number"],
        "text": preprocess_text(page["text"])
    })

sections = extract_sections(cleaned_pages)

information = extract_information(sections)

for category, passages in information.items():

    print(f"\n========== {category.upper()} ==========")

    if not passages:
        print("No relevant passages found.")
        continue

    for passage in passages:
        print(f"\nPage: {passage['page_number']}")
        print(passage["text"])
