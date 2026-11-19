
import { useState } from 'react';
import {
  Users, Calendar, Bookmark, Copy, Check,
  FileText, Clock, Layers, MessageSquareQuote
} from 'lucide-react';
import './SummaryCard.css';

export default function SummaryCard({ paper, onOpenChat }) {
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  if (!paper) return null;

  const authors = paper.authors || [];
  const publication = paper.publication || {};
  const meta = paper.meta || {};

  const displayValue = (value) =>
    value !== null && value !== undefined && value !== ''
      ? value
      : 'Not extracted';

  const handleCopyBibtex = () => {
    const citationKey = (paper.title || 'research-paper')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const fields = [
      `  title={${paper.title}}`,
    ];

    if (authors.length) {
      fields.push(
        `  author={${authors.map((a) => a.name).join(' and ')}}`
      );
    }

    if (publication.venue && publication.venue !== 'Not identified') {
      fields.push(`  journal={${publication.venue}}`);
    }

    if (
      publication.year &&
      publication.year !== 'Not identified'
    ) {
      fields.push(`  year={${publication.year}}`);
    }

    if (
      publication.doi &&
      publication.doi !== 'Not identified'
    ) {
      fields.push(`  doi={${publication.doi}}`);
    }

    const bibtex = `@article{${citationKey},\n${fields.join(',\n')}\n}`;

    navigator.clipboard.writeText(bibtex).then(() => {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2200);
    });
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      paper.quickOverview || ''
    ).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    });
  };

  const displayedAuthors = showAllAuthors
    ? authors
    : authors.slice(0, 4);

  const hasMoreAuthors = authors.length > 4;

  return (
    <div className="summary-card-container">
      <div className="academic-card paper-header-card">

        <div className="paper-meta-top-row">
          <div className="meta-left-badges">
            <span className="badge badge-terracotta">
              {displayValue(publication.field)}
            </span>

            <span className="badge badge-muted">
              <Calendar size={13} />
              {displayValue(publication.year)}
            </span>

            <span className="badge badge-sage">
              <Bookmark size={13} />
              {meta.totalPages || 0} pages
            </span>
          </div>

          <div className="meta-right-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyBibtex}
              title="Copy available BibTeX metadata"
            >
              {copiedBibtex
                ? <Check size={14} className="copy-success-icon" />
                : <Copy size={14} />}
              <span>
                {copiedBibtex ? 'BibTeX Copied!' : 'Copy BibTeX'}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopySummary}
              title="Copy Quick Overview text"
            >
              {copiedSummary
                ? <Check size={14} className="copy-success-icon" />
                : <FileText size={14} />}
              <span>
                {copiedSummary ? 'Copied!' : 'Copy Summary'}
              </span>
            </button>
          </div>
        </div>

        <h1 className="paper-title font-serif">
          {paper.title}
        </h1>

        <div className="authors-section">
          <div className="authors-label">
            <Users size={15} className="authors-icon" />
            <span className="authors-heading">
              Authors & Affiliations:
            </span>
          </div>

          <div className="authors-list">
            {authors.length > 0 ? (
              <>
                {displayedAuthors.map((author, idx) => (
                  <span
                    key={idx}
                    className="author-pill"
                    title={author.affiliation || ''}
                  >
                    <span className="author-name">
                      {author.name}
                    </span>
                    {author.affiliation && (
                      <span className="author-affiliation">
                        ({author.affiliation})
                      </span>
                    )}
                  </span>
                ))}

                {hasMoreAuthors && (
                  <button
                    type="button"
                    className="author-toggle-btn"
                    onClick={() => setShowAllAuthors(!showAllAuthors)}
                  >
                    {showAllAuthors
                      ? 'Show fewer'
                      : `+${authors.length - 4} more`}
                  </button>
                )}
              </>
            ) : (
              <span className="author-affiliation">
                Author information not extracted yet
              </span>
            )}
          </div>
        </div>

        <div className="publication-strip">
          <div className="pub-item">
            <span className="pub-label">Venue</span>
            <span className="pub-value">
              {displayValue(publication.venue)}
            </span>
          </div>

          <div className="pub-divider" />

          <div className="pub-item">
            <span className="pub-label">Identifier</span>
            <span className="pub-value">
              DOI: {displayValue(publication.doi)}
            </span>
          </div>

        </div>

        <div className="doc-metrics-strip">
          <div className="metric-box">
            <Clock size={15} className="metric-icon" />
            <div className="metric-text">
              <span className="metric-val">
                {meta.readingTimeMinutes || 0} min
              </span>
              <span className="metric-name">
                Estimated Reading Time
              </span>
            </div>
          </div>

          <div className="metric-box">
            <Layers size={15} className="metric-icon" />
            <div className="metric-text">
              <span className="metric-val">
                {paper.sectionSummaries?.length || 0} Sections
              </span>
              <span className="metric-name">
                Decomposed Hierarchy
              </span>
            </div>
          </div>

          <div className="metric-box">
            <FileText size={15} className="metric-icon" />
            <div className="metric-text">
              <span className="metric-val">
                {displayValue(meta.figuresCount)} Figures /{' '}
                {displayValue(meta.tablesCount)} Tables
              </span>
              <span className="metric-name">
                Exhibits & Data
              </span>
            </div>
          </div>

        </div>

        <div className="overview-quote-box">
          <div className="overview-quote-header">
            <span className="overview-label">
              Quick Executive Overview
            </span>

            {onOpenChat && (
              <button
                type="button"
                className="ask-btn-link"
                onClick={() =>
                  onOpenChat('What is the main contribution of this paper?')
                }
              >
                <MessageSquareQuote size={14} />
                <span>Ask ReLens to expand</span>
              </button>
            )}
          </div>

          <p className="overview-text font-serif">
            {paper.quickOverview || 'No summary available.'}
          </p>
        </div>

      </div>
    </div>
  );
}
