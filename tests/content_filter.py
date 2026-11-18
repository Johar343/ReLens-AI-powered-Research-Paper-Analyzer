from src.pdf_processor import extract_pdf_text
from src.text_preprocessor import preprocess_text
from src.section_extractor import (
    extract_sections,
    prepare_summarization_text
)
from src.text_preprocessor import is_table_like_line, is_table_caption
from src.text_preprocessor import remove_table_content


with open("data/attention.pdf", "rb") as file:
    pdf_bytes = file.read()

result = extract_pdf_text(pdf_bytes)

cleaned_pages = [
    {
        "page_number": page["page_number"],
        "text": preprocess_text(page["text"])
    }
    for page in result["pages"]
]

sections = extract_sections(cleaned_pages)
print("\n========== DETECTED SECTIONS ==========")

for section_name, paragraphs in sections.items():
    print(f"\n{section_name}: {len(paragraphs)} paragraphs")

print("\n========== UNCLASSIFIED CONTENT ==========")

for paragraph in sections.get("unclassified", []):
    print(paragraph["text"][:2000])

summary_text = prepare_summarization_text(sections)

sections = extract_sections(cleaned_pages)

summary_text = prepare_summarization_text(sections)

print("\n========== SECTION FILTER CHECK ==========")

print("Unclassified exists:", "unclassified" in sections)

print(
    "Unclassified in summary text:",
    any(
        paragraph["text"] in summary_text
        for paragraph in sections.get("unclassified", [])
    )
)

print("Original characters:", result["total_characters"])
print("Filtered characters:", len(summary_text))

print("\n========== FILTERED TEXT ==========")
print(summary_text[:5000])

print("\n========== METHODOLOGY EXTRACTION UNITS ==========")

for index, paragraph in enumerate(
    sections.get("methodology", []),
    start=1
):
    print(f"\nUnit {index} | Page {paragraph['page_number']}")
    print(paragraph["text"])


test_lines = [
    "Table 1: Maximum path lengths",
    "Table 2: The Transformer achieves better BLEU scores",
    "Transformer (base model)",
    "We trained our models on 8 NVIDIA P100 GPUs."
]




methodology = sections.get("methodology", [])
filtered_methodology = remove_table_content(methodology)

print("\n========== TABLE FILTER TEST ==========")

for index, paragraph in enumerate(filtered_methodology, start=1):
    print(
        f"Unit {index} | Page {paragraph['page_number']}"
    )
    print(paragraph["text"])

filtered_text = "\n".join(
    item["text"] for item in filtered_methodology
)

# Important content must survive.
required_content = [
    "FFN(x)",
    "PE(pos,2i)",
    "NVIDIA P100 GPUs",
    "Adam optimizer",
    "Residual Dropout",
    "Label Smoothing",
]

for item in required_content:
    print(f"{item}: {item in filtered_text}")


print("\n========== TABLE CAPTION TEST ==========")

for line in test_lines:
    print(line, "->", is_table_caption(line))

test_lines = [
    "Table 1: Maximum path lengths",
    "Table 2: The Transformer achieves better BLEU scores",
    "Model",
    "BLEU",
    "23.75",
    "Transformer (base model)",
    "We trained our models on 8 NVIDIA P100 GPUs.",
    "The model achieved 28.4 BLEU."
]

print("\n========== TABLE DETECTION TEST ==========")

for line in test_lines:
    print(
        line,
        "-> Caption:", is_table_caption(line),
        "| Table-like:", is_table_like_line(line)
    )