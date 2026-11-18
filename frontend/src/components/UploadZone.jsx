import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  Cpu,
  Database,
  Award,
  AlertTriangle,
  HelpCircle,
  X,
} from "lucide-react";
import "./UploadZone.css";

export default function UploadZone({
  onUpload,
  onSelectSample,
  samplePapers,
  isAnalyzing,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMessage("");
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrorMessage(
        "Invalid file type. ReLens is tailored for academic research papers in PDF format (.pdf). Please select a valid PDF file.",
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(
        "File size exceeds 50MB. Please choose a smaller research paper.",
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitAnalysis = () => {
    if (!selectedFile) return;
    onUpload(selectedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="upload-zone-wrapper">
      {/* Paraphrased Simple Introduction */}
      <div className="landing-hero text-center">
        <h1 className="hero-headline font-serif">
          Analyze complex research papers in{" "}
          <span className="headline-accent">one go</span>.
        </h1>
        <p className="hero-subhead">
          ReLens breaks down heavy academic papers into clear section summaries,
          methodology formulas, key findings, and datasets—so you can understand
          big papers without getting lost in pages of jargon.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="upload-card-container">
        {errorMessage && (
          <div className="alert-error upload-error-banner" role="alert">
            <AlertCircle size={18} className="error-icon" />
            <div className="error-text">
              <strong>Upload Error:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="error-dismiss"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div
          className={`dropzone-box ${dragActive ? "drag-active" : ""} ${selectedFile ? "file-ready" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="file-input-hidden"
            onChange={handleFileChange}
          />

          {!selectedFile ? (
            <div className="dropzone-empty-content">
              <div className="dropzone-icon-plate">
                <UploadCloud size={32} className="upload-cloud-icon" />
              </div>
              <h3 className="dropzone-title">
                Upload your academic research paper
              </h3>
              <p className="dropzone-prompt">
                Drag and drop your PDF here, or{" "}
                <span className="browse-link">browse files</span> from your
                computer
              </p>
              <div className="dropzone-constraints">
                <span className="badge badge-muted">PDF format only</span>
                <span className="badge badge-muted">Max size: 50 MB</span>
                <span className="badge badge-muted">
                  Automatic section parsing
                </span>
              </div>
            </div>
          ) : (
            <div
              className="dropzone-selected-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="selected-file-badge-row">
                <div className="pdf-tag-indicator">
                  <FileText size={22} className="pdf-icon" />
                  <span className="pdf-tag">PDF</span>
                </div>
                <div className="selected-meta">
                  <h4 className="file-name" title={selectedFile.name}>
                    {selectedFile.name}
                  </h4>
                  <div className="file-specs">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span className="dot-sep">•</span>
                    <span>Ready for deep analysis</span>
                    <span className="dot-sep">•</span>
                    <span className="status-ready-pill">
                      <CheckCircle2 size={13} /> Valid academic format
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-remove-file"
                  onClick={handleClearSelected}
                  title="Remove selected file"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Button */}
              <div className="selected-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg upload-analyse-btn"
                  onClick={handleSubmitAnalysis}
                  disabled={isAnalyzing}
                >
                  <FileText size={18} />
                  <span>
                    {isAnalyzing
                      ? "Analyzing Document Hierarchy..."
                      : "Upload and Analyse Paper"}
                  </span>
                  {!isAnalyzing && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meet Your Research Assistant */}
      <div className="assistant-intro-section">
        <div className="assistant-intro-header">
          <span className="explorer-kicker">MEET YOUR RESEARCH ASSISTANT</span>

          <h3 className="explorer-title font-serif">
            Research papers, made easier to understand.
          </h3>

          <p className="assistant-intro-description">
            ReLens combines natural language processing and generative AI to
            help you understand academic papers without navigating every page
            manually.
          </p>
        </div>

        <div className="assistant-capabilities-grid">
          <div className="assistant-capability">
            <div className="feature-icon-wrapper">
              <Layers size={20} />
            </div>
            <h4 className="feature-title">Smart Summarisation</h4>
            <p className="feature-desc">
              Get quick overviews, detailed summaries and section-wise
              explanations of research papers.
            </p>
          </div>

          <div className="assistant-capability">
            <div className="feature-icon-wrapper">
              <Cpu size={20} />
            </div>
            <h4 className="feature-title">Research Insights</h4>
            <p className="feature-desc">
              Identify research objectives, methodologies, datasets, key
              findings and limitations.
            </p>
          </div>

          <div className="assistant-capability">
            <div className="feature-icon-wrapper">
              <Database size={20} />
            </div>
            <h4 className="feature-title">Keyword Extraction</h4>
            <p className="feature-desc">
              Discover important concepts and technical keywords from the
              uploaded paper.
            </p>
          </div>

          <div className="assistant-capability">
            <div className="feature-icon-wrapper">
              <HelpCircle size={20} />
            </div>
            <h4 className="feature-title">Ask ReLens</h4>
            <p className="feature-desc">
              Ask questions about the paper and receive conversational,
              paper-grounded answers with page references where available.
            </p>
          </div>
        </div>
      </div>

      {/* Instant Exploration Sample Papers Section */}
      <div className="sample-papers-section">
        <div className="sample-section-header">
          <div className="section-title-group">
            <h3 className="sample-title font-serif">
              Instant Demonstration Papers
            </h3>
            <p className="sample-subtitle">
              Don't have a paper handy? Explore one of these peer-reviewed
              foundation papers with complete extracted sections and benchmarks.
            </p>
          </div>
        </div>

        <div className="sample-cards-grid">
          {samplePapers.map((paper) => (
            <div
              key={paper.id}
              className="sample-paper-card"
              onClick={() => onSelectSample(paper)}
              role="button"
              tabIndex={0}
            >
              <div className="sample-card-top">
                <span className="badge badge-sage">
                  {paper.publication.field.split("/")[0]}
                </span>
                <span className="sample-pages-badge">
                  {paper.meta.totalPages} pages
                </span>
              </div>
              <h4 className="sample-card-title font-serif">
                {paper.shortTitle || paper.title}
              </h4>
              <p className="sample-card-authors">
                {paper.authors
                  .slice(0, 3)
                  .map((a) => a.name)
                  .join(", ")}
                {paper.authors.length > 3 ? " et al." : ""}
              </p>
              <div className="sample-card-venue">
                <BookOpen size={13} />
                <span>
                  {paper.publication.venue.split("(")[0]} ·{" "}
                  {paper.publication.year}
                </span>
              </div>
              <div className="sample-card-footer">
                <span className="explore-action-label">Explore Analysis</span>
                <ArrowRight size={14} className="explore-arrow" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="academic-features-grid">
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Layers size={20} />
          </div>
          <h4 className="feature-title">Section-Wise Decomposition</h4>
          <p className="feature-desc">
            Automatically parses hierarchy from abstract to conclusions with
            localized page references and summaries.
          </p>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Cpu size={20} />
          </div>
          <h4 className="feature-title">Methodology & Datasets</h4>
          <p className="feature-desc">
            Maps architectural components, mathematical equations, benchmark
            corpora, and quantitative metrics.
          </p>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <AlertTriangle size={20} />
          </div>
          <h4 className="feature-title">Critical Limitations Extraction</h4>
          <p className="feature-desc">
            Pinpoints author-acknowledged boundaries, computational bottlenecks,
            and future research requirements.
          </p>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <HelpCircle size={20} />
          </div>
          <h4 className="feature-title">Ask ReLens Academic AI</h4>
          <p className="feature-desc">
            Interactively converse with the paper with strict grounded
            citations, contribution summaries, and Q&A.
          </p>
        </div>
      </div>
    </div>
  );
}
