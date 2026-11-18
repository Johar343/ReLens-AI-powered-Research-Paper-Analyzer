import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  Copy,
  Check,
} from "lucide-react";
import "./DetailedAnalysis.css";

export default function DetailedAnalysis({ paper, onAskQuestion }) {
  const [expandedSections, setExpandedSections] = useState({
    "sec-1": true,
    "sec-3": true,
    "cust-1": true,
    "cust-3": true,
    "rag-1": true,
    "rag-2": true,
    "bio-1": true,
    "bio-2": true,
  });
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!paper) return null;

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const all = {};
    paper.sectionSummaries?.forEach((s) => {
      all[s.id] = true;
    });
    setExpandedSections(all);
  };

  const handleCollapseAll = () => {
    setExpandedSections({});
  };

  const handleCopyDetailed = () => {
    navigator.clipboard.writeText(paper.detailedSummary).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    });
  };

  const allExpanded = paper.sectionSummaries?.every(
    (s) => expandedSections[s.id],
  );

  return (
    <div className="detailed-analysis-container" id="detailed-analysis">
      {/* Detailed Summary Card */}
      <div className="academic-card detailed-summary-card">
        <div className="card-top-row">
          <div className="title-with-badge">
            <span className="section-eyebrow">Comprehensive Synthesis</span>
            <h2 className="section-title font-serif">
              Detailed Paper Synthesis
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyDetailed}
            title="Copy full detailed summary"
          >
            {copiedSummary ? (
              <Check size={14} className="copy-ok" />
            ) : (
              <Copy size={14} />
            )}
            <span>{copiedSummary ? "Copied" : "Copy Synthesis"}</span>
          </button>
        </div>

        <div className="detailed-summary-body font-serif">
          {(paper.detailedSummary || "No detailed summary available.")
            .split("\n\n")
            .map((paragraph, idx) => (
              <p key={idx} className="summary-paragraph">
                {paragraph}
              </p>
            ))}
        </div>
      </div>

      {/* Section-Wise Summaries */}
      <div className="section-summaries-wrapper">
        <div className="section-breakdown-header">
          <div>
            <span className="section-eyebrow">Structural Hierarchy</span>
            <h3 className="section-title font-serif">
              Section-by-Section Analysis
            </h3>
            <p className="section-desc">
              Expandable decomposition of manuscript sections with specific page
              citations and conceptual takeaways.
            </p>
          </div>

          <div className="accordion-controls">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={allExpanded ? handleCollapseAll : handleExpandAll}
            >
              {allExpanded ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
            </button>
          </div>
        </div>

        <div className="accordion-list">
          {paper.sectionSummaries?.map((sec) => {
            const isExpanded = !!expandedSections[sec.id];
            return (
              <div
                key={sec.id}
                className={`accordion-item ${isExpanded ? "is-expanded" : ""}`}
              >
                {/* Accordion Header */}
                <div
                  className="accordion-header"
                  onClick={() => toggleSection(sec.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="header-meta-group">
                    <span className="section-number-pill">§ {sec.number}</span>
                    <h4 className="accordion-title font-serif">{sec.title}</h4>
                    <span className="page-range-badge">{sec.pageRange}</span>
                  </div>

                  <div className="header-arrow-group">
                    <span className="expand-hint">
                      {isExpanded ? "Hide" : "Read"}
                    </span>
                    <div className="chevron-circle">
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="accordion-content">
                    <p className="section-summary-text">{sec.summary}</p>

                    {sec.keyPoints && sec.keyPoints.length > 0 && (
                      <div className="key-takeaways-box">
                        <span className="takeaways-label">
                          Key Section Takeaways:
                        </span>
                        <ul className="takeaways-list">
                          {sec.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="takeaway-item">
                              <span className="bullet-dash">—</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {onAskQuestion && (
                      <div className="section-footer-action">
                        <button
                          type="button"
                          className="btn-ask-section"
                          onClick={() =>
                            onAskQuestion(
                              `What are the key technical concepts and takeaways from Section ${sec.number}: "${sec.title}"?`,
                            )
                          }
                        >
                          <MessageSquareQuote size={14} />
                          <span>Ask ReLens about Section {sec.number}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
