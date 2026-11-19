from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.pdf_processor import extract_pdf_text
from src.text_preprocessor import preprocess_text, remove_repeated_page_margins
from src.section_extractor import (
    extract_sections,
    prepare_summarization_text
)
from src.summarizer import summarize_sections
from src.keyword_extractor import extract_keywords
from src.information_extractor import extract_information
from src.metadata_extractor import extract_metadata
from src.history_store import delete_history, list_history, save_history
from typing import Literal
from pydantic import BaseModel, Field
from src.gemini_service import ask_gemini
from uuid import uuid4
import time

class PageInput(BaseModel):
    page_number: int
    text: str


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    text: str


class AskRequest(BaseModel):
    pages: list[PageInput]
    question: str
    chat_history: list[ChatMessage] = []


class HistoryRequest(BaseModel):
    browser_id: str = Field(alias="browserId")
    filename: str
    title: str | None = None
    total_pages: int | None = None
    analysis: dict

app = FastAPI(
    title="ReLens API",
    description="AI-powered research paper analysis system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:8788",
    "http://127.0.0.1:8788",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 50 * 1024 * 1024

@app.get("/")
def home():
    return {
        "message": "Welcome to ReLens",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/api/history")
def get_history(browserId: str):
    if not browserId.strip():
        raise HTTPException(status_code=400, detail="browserId is required.")
    return {"history": list_history(browserId)}


@app.post("/api/history", status_code=201)
def create_history(request: HistoryRequest):
    if not request.browser_id.strip() or not request.filename.strip():
        raise HTTPException(status_code=400, detail="Invalid history data.")
    if request.total_pages is not None and request.total_pages < 1:
        raise HTTPException(status_code=400, detail="Invalid total_pages.")

    record_id = str(uuid4())
    save_history(
        record_id=record_id,
        browser_id=request.browser_id.strip(),
        filename=request.filename.strip(),
        title=request.title,
        total_pages=request.total_pages,
        analysis=request.analysis,
    )
    return {"message": "Analysis saved successfully", "id": record_id}


@app.delete("/api/history/{record_id}")
def remove_history(record_id: str, browserId: str):
    if not browserId.strip():
        raise HTTPException(status_code=400, detail="browserId is required.")
    if not delete_history(record_id, browserId):
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {"message": "Analysis deleted successfully"}

@app.post("/api/extract")
async def extract_paper(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code = 415,
            detail = "Only PDF files are supported."
        )

    pdf_bytes = await file.read(MAX_FILE_SIZE + 1)

    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="PDF size cannot exceed 50 MB."
        )

    try:
        total_start = time.perf_counter()

        # 1. PDF extraction
        stage_start = time.perf_counter()
        result = extract_pdf_text(pdf_bytes)
        print(f"[TIMING] PDF extraction: {time.perf_counter() - stage_start:.2f}s")

        # 2. Text preprocessing
        stage_start = time.perf_counter()
        cleaned_pages = []

        for page in result["pages"]:
            cleaned_pages.append({
                "page_number": page["page_number"],
                "text": preprocess_text(page["text"])
            })
        cleaned_pages = remove_repeated_page_margins(cleaned_pages)
        metadata = extract_metadata(result.get("title"), cleaned_pages)

        print(f"[TIMING] Text preprocessing: {time.perf_counter() - stage_start:.2f}s")

        # 3. Section extraction
        stage_start = time.perf_counter()
        sections = extract_sections(cleaned_pages)
        print(f"[TIMING] Section extraction: {time.perf_counter() - stage_start:.2f}s")

        # 4. Keywords
        stage_start = time.perf_counter()
        summarization_text = prepare_summarization_text(sections)
        keywords = extract_keywords(summarization_text)
        structured_analysis = extract_information(sections)
        print(f"[TIMING] Keyword extraction: {time.perf_counter() - stage_start:.2f}s")

        # 5. Summarization refinement
        stage_start = time.perf_counter()
        summary_result = summarize_sections(sections)
        print(f"[TIMING] Summarization : {time.perf_counter() - stage_start:.2f}s")

        print(f"[TIMING] TOTAL: {time.perf_counter() - total_start:.2f}s")

        return {
            "filename": file.filename,
            "title": metadata["title"] or result["title"],
            "total_pages": result["total_pages"],
            "total_characters": result["total_characters"],
            "diagnostics": result.get("diagnostics", {}),
            "authors": metadata["authors"],
            "publication": metadata["publication"],
            "references_count": metadata["references_count"],
            "figures_count": metadata["figures_count"],
            "tables_count": metadata["tables_count"],
            "metadata_source": metadata["metadata_source"],
            "pages": cleaned_pages,
            "sections": sections,
            "keywords": keywords,
            "structured_analysis": structured_analysis,
            "summary": summary_result["quick_summary"],
            "detailed_summary": summary_result["detailed_summary"],
            "section_summaries": summary_result["sections"]
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
    )

@app.post("/api/ask")
def ask_question(request: AskRequest):

    try:
        pages = [
            page.model_dump()
            for page in request.pages
        ]

        chat_history = [
            message.model_dump()
            for message in request.chat_history
        ]

        answer = ask_gemini(
            pages=pages,
            question=request.question,
            chat_history=chat_history
        )

        return {
            "answer": answer
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate an answer right now."
        ) from error