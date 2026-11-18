
import requests

PDF_PATH = "data/attention.pdf"
API_URL = "http://127.0.0.1:8000"

# 1. Read the PDF
with open(PDF_PATH, "rb") as file:
    files = {
        "file": ("attention.pdf", file, "application/pdf")
    }

    # 2. Extract the paper
    extract_response = requests.post(
        f"{API_URL}/api/extract",
        files=files
    )

extract_response.raise_for_status()
paper_data = extract_response.json()

pages = paper_data["pages"]

print(f"Extracted {len(pages)} pages successfully.")

# 3. Ask a question
question = input("\nAsk ReLens: ")

# 4. Send actual extracted pages to Gemini
ask_response = requests.post(
    f"{API_URL}/api/ask",
    json={
        "pages": pages,
        "question": question,
        "chat_history": []
    }
)

ask_response.raise_for_status()
answer = ask_response.json()["answer"]

# 5. Display the answer
print("\n========== ASK RELENS ==========\n")
print("Question:", question)
print("\nAnswer:\n", answer)
