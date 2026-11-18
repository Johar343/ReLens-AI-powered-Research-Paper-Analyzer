import time
import torch
from src.pdf_processor import extract_pdf_text
from src.text_preprocessor import preprocess_text
from src.summarizer import summarize_sections
from src.section_extractor import extract_sections

PDF_PATH = "data/attention.pdf"

print("Extracting PDF...")

with open(PDF_PATH, "rb") as pdf_file:
    pdf_bytes = pdf_file.read()

result = extract_pdf_text(pdf_bytes)

cleaned_pages = []

for page in result["pages"]:
    cleaned_pages.append({
        "page_number": page["page_number"],
        "text": preprocess_text(page["text"])
    })

sections = extract_sections(cleaned_pages)

print("\n========== DETECTED SECTIONS ==========")

for section_name, paragraphs in sections.items():
    print(f"{section_name}: {len(paragraphs)} paragraphs")

print("\nGenerating summaries...")

if torch.cuda.is_available():
    torch.cuda.reset_peak_memory_stats()
    torch.cuda.synchronize()

start_time = time.time()

start_time = time.time()

summary_result = summarize_sections(sections)

if torch.cuda.is_available():
    torch.cuda.synchronize()

elapsed_time = time.time() - start_time

print("\n========== SECTION-WISE SUMMARIES ==========")

for section_name, result in summary_result["sections"].items():
    print(f"\n--- {section_name.upper()} ---")
    print("Pages:", result["pages"])
    print("Summary:", result["summary"])

print("\n========== QUICK OVERVIEW ==========")
print(summary_result["quick_summary"])

print("\n========== DETAILED SUMMARY ==========")
print(summary_result["detailed_summary"])

print(f"\nProcessing time: {elapsed_time:.2f} seconds")

if torch.cuda.is_available():
    peak_memory = torch.cuda.max_memory_allocated() / (1024 ** 3)
    print(f"Peak GPU memory: {peak_memory:.2f} GB")