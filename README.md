# ReLens — AI-Powered Research Paper Analyzer

**Making academic research papers easier to understand.**

Research papers contain valuable information, but technical terminology, mathematical formulations, experimental results, and lengthy explanations can make them difficult to understand quickly.

That is what we built **ReLens** for.

ReLens is an NLP-powered research paper analyzer that turns an uploaded academic PDF into a structured, readable explanation. It organizes the paper into meaningful sections so readers can understand the research objective, methodology, experiments, results, and limitations without losing the technical context.

It also includes interactive question answering for paper-grounded exploration.

---

## What can ReLens do?

- **PDF Analysis:** Extract text while preserving page-level information.
- **Structured Summarization:** Generate a six-section research analysis.
- **Research Insights:** Show objectives, methodology, datasets, findings, and limitations.
- **Keyword Extraction:** Identify important terms and concepts.
- **Interactive Q&A:** Ask questions about an uploaded paper.
- **Analysis History:** Access previously generated analyses through local SQLite storage.

## How the analysis is structured

| Section | What it explains |
|---|---|
| **01. Research Overview** | Central idea, motivation, objectives, and contribution. |
| **02. Background & Problem Statement** | Problem being addressed and research gap. |
| **03. Methodology** | Proposed approach, architecture, algorithms, and equations. |
| **04. Dataset & Experimental Setup** | Datasets, configurations, preprocessing, and experiments. |
| **05. Results & Discussion** | Metrics, numerical results, comparisons, and observations. |
| **06. Limitations & Conclusion** | Limitations, conclusions, and future directions. |

---

## Application Preview

Add screenshots captured from the running application to `assets/screenshots/`.

### 1. Home & Paper Upload

Starting point for uploading a research paper and initiating analysis.

![Home and paper upload](assets/screenshots/home-upload.png)

### 2. Research Paper Analysis

The main interface presents the paper through the six-section summary structure.

![Research paper analysis](assets/screenshots/analysis.png)

### 3. Research Insights

Focused view of objectives, methodology, datasets, findings, and limitations.

![Research insights](assets/screenshots/insights.png)

### 4. Interactive Paper Q&A

Paper-grounded questions and answers.

![Interactive paper Q&A](assets/screenshots/qa.png)

### 5. Analysis History

Previously analyzed papers stored through the FastAPI SQLite history service.

![Analysis history](assets/screenshots/history.png)

---

## Architecture

ReLens uses a React frontend and a Python FastAPI backend. The backend coordinates PDF extraction, preprocessing, section identification, summarization, evidence extraction, metadata enrichment, and paper-grounded Q&A.

### High-level architecture

```mermaid
flowchart TD
    U[User] --> FE[React + Vite Frontend]
    FE -->|PDF upload| API[FastAPI Backend]
    API --> PDF[PyMuPDF Extraction]
    PDF --> PRE[Text Preprocessing]
    PRE --> SEC[Section Detection]
    SEC --> NLP[T5 Summarization + spaCy Reconstruction]
    SEC --> EXT[Structured Evidence Extraction]
    NLP --> OUT[Six-Section Analysis]
    EXT --> OUT
    OUT --> FE
    FE -->|History API| DB[(Local SQLite)]
    FE -->|Paper-grounded questions| QA[Gemini Service]
    QA --> FE
```

---

## NLP Pipeline

```mermaid
flowchart TD
    A([Upload Research PDF]) --> B[PDF Text Extraction<br/>PyMuPDF]
    B --> C[Page-wise Text Processing]
    C --> D[Whitespace and Line-break Cleanup]
    D --> E[Section Identification]
    E --> F[Prepare Summarization Input]
    E --> G[Keyword Extraction<br/>YAKE]
    F --> H[Token-aware Chunking]
    H --> I[T5 Summarization]
    I --> J[Hierarchical Summary Reduction]
    J --> K[Summary Reconstruction]
    G --> L[Structured Analysis]
    K --> L
    L --> M[FastAPI Analysis Response]
    M --> N([ReLens Interface])
```

### Pipeline stages

1. **PDF extraction:** PyMuPDF extracts text, metadata, and page references.
2. **Text preprocessing:** Whitespace, line breaks, repeated margins, and layout noise are cleaned.
3. **Section extraction:** Research sections are identified and preserved.
4. **Keyword extraction:** YAKE surfaces important paper concepts.
5. **Chunking and summarization:** Long sections are split into tokenizer-aware chunks and summarized hierarchically.
6. **Summary reconstruction:** Generated content is formatted into readable, conservative paragraphs.
7. **Structured analysis:** Evidence is organized into the canonical six-section response.

---

## Technology Stack

| Technology | Role |
|---|---|
| Python | Backend and NLP processing |
| FastAPI | Backend API |
| PyMuPDF | PDF text extraction |
| Hugging Face Transformers / T5 | Transformer-based summarization |
| spaCy | Linguistic processing |
| YAKE | Keyword extraction |
| NLTK | Sentence tokenization fallback |
| Gemini | Interactive paper-grounded Q&A |
| React | Frontend |
| Vite | Frontend development and build tooling |
| SQLite | Local analysis history |
| Crossref | Optional publication metadata enrichment |

---

## Project Structure

```text
ReLens/
├── backend/
│   ├── api/
│   │   └── main.py
│   └── src/
│       ├── pdf_processor.py
│       ├── text_preprocessor.py
│       ├── section_extractor.py
│       ├── summarizer.py
│       ├── summary_reconstructor.py
│       ├── information_extractor.py
│       ├── metadata_extractor.py
│       ├── history_store.py
│       ├── keyword_extractor.py
│       └── gemini_service.py
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── utils/
│       └── App.jsx
├── tests/
├── pyproject.toml
└── README.md
```

---

## Running Locally

### Prerequisites

- Python
- Node.js and npm
- uv
- Git

### Backend

```powershell
Set-Location backend
uv sync
uv run uvicorn api.main:app --reload
```

### Frontend

Open another terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Configure the required Gemini environment variable using the project's environment configuration.

### Tests

```powershell
uv run pytest -q
Set-Location frontend
npm run build
```

---

## Contributors

Developed by **Team WiS (Women In STEM)**:

- Garima Johar
- Ifza Akhtar
- Priya Bora
- Riddhima

**Program:** B.Tech CSE (AI & ML)
**Domain:** Natural Language Processing, Document Intelligence, and Applied AI

## Future Improvements

- More reliable mathematical equation and table extraction.
- Better section detection across varied paper formats.
- Stronger source-grounded summary reconstruction.
- Broader factuality and coverage evaluation.
- Improved handling of scanned and complex-layout PDFs.
