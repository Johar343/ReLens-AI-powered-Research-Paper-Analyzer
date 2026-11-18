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
          ReLens was conceived and developed by <strong>Team WiS</strong> as a 3rd-year university capstone research project. It addresses a fundamental challenge in computational research: helping students and researchers digest complex, mathematically dense research papers in one go without losing hours deciphering formatting and jargon.
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
            <span className="team-sub">3rd-Year University Capstone • NLP & AI Research Track</span>
          </div>
        </div>

        <p className="team-description">
          Team WiS designed ReLens from first principles to bridge the gap between heavy academic publications and practical researcher understanding. Instead of generic conversational chatbots that fabricate citations, ReLens enforces grounded extraction: identifying exact mathematical formulas, training splits, quantitative benchmark results, and author-acknowledged boundary constraints.
        </p>

        <div className="team-pillars-grid">
          <div className="team-pillar">
            <div className="pillar-icon-box">
              <Layers size={18} />
            </div>
            <div className="pillar-content">
              <strong className="pillar-title">Document Hierarchy Decomposition</strong>
              <span className="pillar-sub">Parses section-by-section structure from abstract to appendix with localized page ranges.</span>
            </div>
          </div>

          <div className="team-pillar">
            <div className="pillar-icon-box">
              <Cpu size={18} />
            </div>
            <div className="pillar-content">
              <strong className="pillar-title">Methodology & Dataset Mapping</strong>
              <span className="pillar-sub">Separates theoretical architectures, loss formulations, and benchmark dataset splits.</span>
            </div>
          </div>

          <div className="team-pillar">
            <div className="pillar-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div className="pillar-content">
              <strong className="pillar-title">Grounded, Non-Hallucinatory Q&A</strong>
              <span className="pillar-sub">Constrains assistant responses strictly to the analyzed text with explicit section references.</span>
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
            <span className="tech-label">Document Extraction</span>
            <span className="tech-value">PDF hierarchy parsing, section classification, keyword extraction, grounded QA</span>
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
