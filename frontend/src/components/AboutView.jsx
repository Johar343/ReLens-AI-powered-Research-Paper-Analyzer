import { Users, BookOpen, Layers, CheckCircle2, FileText, Cpu, Database, Award, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import './AboutView.css';

export default function AboutView({ onSelectSample, samplePapers, onGoToUpload }) {
  return (
    <div className="about-view-container">
      {/* Header */}
      <div className="about-header-card">
        <div className="about-header-kicker">
          <Users size={14} className="kicker-icon" />
          <span>Capstone Project Provenance</span>
        </div>
        <h1 className="about-title font-serif">About ReLens & Team WiS</h1>
        <p className="about-lead">
          ReLens was conceived and developed by <strong>Team WiS</strong> as a 3rd-year university capstone research project by students of <strong>B.Tech CSE (AI & ML)</strong>. The project addresses a common problem in computational research: important ideas are often buried in dense mathematical notation, technical jargon, multi-column formatting, tables, and lengthy experimental sections. ReLens helps students and researchers understand the central contribution, methodology, evidence, and limitations of a paper without spending hours deciphering its structure.
        </p>
      </div>

      {/* Developed by Team WiS Card */}
      <div className="academic-card team-wis-card">
        <div className="team-card-header">
          <div className="team-logo-badge">
            <span className="font-serif team-badge-text">WiS</span>
          </div>
          <div>
            <span className="team-kicker">Development Team</span>
            <h2 className="team-heading font-serif">Developed by Team WiS</h2>
            <span className="team-sub">3rd-Year B.Tech CSE (AI & ML) Capstone • NLP & AI Research Track</span>
          </div>
        </div>

        <p className="team-description">
          Team WiS (<strong>Women In STEM</strong>) designed ReLens from first principles to bridge the gap between heavy academic publications and practical researcher understanding. The team members are:
        </p>
        <ul className="team-members-list">
          <li>Garima Johar</li>
          <li>Ifza Akhtar</li>
          <li>Priya Bora</li>
          <li>Riddhima</li>
        </ul>
        <p className="team-description team-description-followup">
          Instead of treating a paper as a generic chatbot prompt, ReLens reads the paper carefully and summarizes its formulas, model design, datasets, results, and limitations using the original text as its source.
        </p>

        <div className="team-pillars-grid">
          <div className="team-pillar">
            <div className="pillar-icon-box">
              <Layers size={18} />
            </div>
            <div className="pillar-content">
              <strong className="pillar-title">Organized Paper Reading</strong>
              <span className="pillar-sub">Breaks the paper into clear sections and shows where each idea appears.</span>
            </div>
          </div>

          <div className="team-pillar">
            <div className="pillar-icon-box">
              <Cpu size={18} />
            </div>
            <div className="pillar-content">
              <strong className="pillar-title">Methods and Datasets</strong>
              <span className="pillar-sub">Explains how the study works and identifies the data used to test it.</span>
            </div>
          </div>

          <div className="team-pillar">
            <div className="pillar-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div className="pillar-content">
              <strong className="pillar-title">Paper-Based Questions</strong>
              <span className="pillar-sub">Answers questions using only the uploaded paper and points back to its sections.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why We Built ReLens */}
      <div className="academic-card why-card">
        <h3 className="section-heading font-serif">Why ReLens?</h3>
        <div className="why-grid">
          <div className="why-item">
            <div className="why-badge">The Problem</div>
            <p className="why-text">
              Academic papers routinely span 15 to 40 pages filled with dense multi-column layouts, heavy notation, and sprawling tables. Locating the core contribution or training setup often requires reading the entire document.
            </p>
          </div>

          <div className="why-item">
            <div className="why-badge">The ReLens Solution</div>
            <p className="why-text">
              ReLens extracts the research objective, methodology components, benchmark corpora, validated empirical gains, and critical limitations into structured cards in one go, followed by an interactive research assistant.
            </p>
          </div>
          <div className="why-item">
            <div className="why-badge">The Research Gap</div>
            <p className="why-text">
              Existing reading workflows separate text extraction, summarization, citation checking, and paper-grounded questions. This makes it difficult to connect an architecture to its experiments or distinguish reported evidence from interpretation. ReLens brings these steps together while preserving page context.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack & Architecture */}
      <div className="academic-card tech-card">
        <h3 className="section-heading font-serif">Architecture & Engineering</h3>
        <p className="tech-intro">
          Built following modern software engineering principles with complete separation between UI components and data layers for seamless FastAPI backend integration.
        </p>

        <div className="tech-specs-table">
          <div className="tech-row">
            <span className="tech-label">Frontend Framework</span>
            <span className="tech-value">React 19, Vite 8, Modular CSS Design System</span>
          </div>
          <div className="tech-row">
            <span className="tech-label">Typography & Palette</span>
            <span className="tech-value">Newsreader Serif, Plus Jakarta Sans, Pastel Warm Pink, Dark Brown, Sage Green</span>
          </div>
          <div className="tech-row">
            <span className="tech-label">Backend Compatibility</span>
            <span className="tech-value">FastAPI REST Endpoints, Pydantic Schemas, Asynchronous Processing</span>
          </div>
          <div className="tech-row">
            <span className="tech-label">NLP Pipeline</span>
            <span className="tech-value">Python, PyMuPDF, Hugging Face Transformers, T5, spaCy, YAKE, NLTK</span>
          </div>
          <div className="tech-row">
            <span className="tech-label">Persistence & Grounded QA</span>
            <span className="tech-value">SQLite history storage, Crossref metadata enrichment, Gemini paper-grounded Q&amp;A</span>
          </div>
          <div className="tech-row">
            <span className="tech-label">Document Extraction</span>
            <span className="tech-value">PDF hierarchy parsing, canonical section analysis, page provenance, structured evidence extraction</span>
          </div>
        </div>
      </div>

      {/* Quick Action to Explore */}
      <div className="about-action-strip">
        <div className="action-strip-text">
          <h4 className="strip-title font-serif">Ready to inspect research papers?</h4>
          <span className="strip-subtitle">Upload your own PDF or explore a peer-reviewed foundation paper.</span>
        </div>
        <div className="strip-buttons">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onSelectSample(samplePapers[0])}
          >
            <BookOpen size={14} />
            <span>Explore Attention (2017)</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onGoToUpload}
          >
            <FileText size={14} />
            <span>Upload Paper</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
