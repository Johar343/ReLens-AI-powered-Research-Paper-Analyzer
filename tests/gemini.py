
from src.pdf_processor import extract_pdf_text
from src.text_preprocessor import preprocess_text
from src.gemini_service import ask_gemini


with open("data/attention.pdf", "rb") as file:
    pdf_bytes = file.read()

result = extract_pdf_text(pdf_bytes)

pages = []

for page in result["pages"]:
    pages.append({
        "page_number": page["page_number"],
        "text": preprocess_text(page["text"])
    })


question = input("Ask ReLens : ")

answer = ask_gemini(
    pages=pages,
    question=question
)

print("\n========== ASK RELENS ==========\n")
print("Question:", question)
print("\nAnswer:\n", answer)
