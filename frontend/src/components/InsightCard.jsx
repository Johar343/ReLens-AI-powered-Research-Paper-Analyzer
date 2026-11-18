
import { useState } from 'react';
import {
  Target,
  Cpu,
  Database,
  Award,
  AlertTriangle,
  MessageSquareQuote,
  Check,
  Copy,
} from 'lucide-react';
import './InsightCard.css';

export default function InsightCard({ paper, onAskQuestion }) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);

  if (!paper) return null;

  const objective = paper.researchObjective?.trim();
  const methodology = paper.methodology || [];
  const datasets = paper.datasets || [];
  const findings = paper.keyFindings || [];
  const limitations = paper.limitations || [];

  const hasInsights =
    Boolean(objective) ||
    methodology.length > 0 ||
    datasets.length > 0 ||
    findings.length > 0 ||
    limitations.length > 0;

  if (!hasInsights) return null;

  const availableTabs = [
    { id: 'all', label: 'All Insights' },
    ...(objective
      ? [{ id: 'objective', label: 'Objective', icon: Target }]
      : []),
    ...(methodology.length
      ? [{ id: 'methodology', label: 'Methodology', count: methodology.length, icon: Cpu }]
      : []),
    ...(datasets.length
      ? [{ id: 'datasets', label: 'Datasets', count: datasets.length, icon: Database }]
      : []),
    ...(findings.length
      ? [{ id: 'findings', label: 'Key Findings', count: findings.length, icon: Award }]
      : []),
    ...(limitations.length
      ? [{ id: 'limitations', label: 'Limitations', count: limitations.length, icon: AlertTriangle }]
      : []),
  ];

  const visibleTab = availableTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : 'all';

  const handleCopyInsight = (key, text) => {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const showSection = (id) =>
    visibleTab === 'all' || visibleTab === id;

  return (
    <div className="insights-container" id="research-insights">
      <div className="insights-section-header">
        <div>
          <span className="section-eyebrow">Rigorous Synthesis</span>
          <h2 className="section-title font-serif">
            Research Insights & Empirical Framework
          </h2>
        </div>

        <p className="section-description">
          Explore the research objective, methodology, datasets,
          findings, and limitations identified from the paper.
        </p>
      </div>

      <div className="insights-tab-strip">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              className={`insight-tab-btn ${
                visibleTab === tab.id ? 'active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {Icon && <Icon size={14} className="tab-icon" />}
              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span className="tab-count-badge">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="insights-grid">
        {/* Research Objective */}
        {objective && showSection('objective') && (
          <div className="insight-card-item card-objective">
            <div className="insight-card-header">
              <div className="header-left">
                <div className="icon-wrapper icon-objective">
                  <Target size={18} />
                </div>
                <h3 className="insight-heading">
                  Research Objective & Hypothesis
                </h3>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  className="btn-icon-copy"
                  onClick={() => handleCopyInsight('obj', objective)}
                  title="Copy Objective"
                >
                  {copiedKey === 'obj' ? (
                    <Check size={14} className="copy-ok" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>

                {onAskQuestion && (
                  <button
                    type="button"
                    className="btn-ask-tag"
                    onClick={() =>
                      onAskQuestion(
                        'What is the main contribution and objective of this paper?'
                      )
                    }
                    title="Ask AI about this"
                  >
                    <MessageSquareQuote size={13} />
                    <span>Ask AI</span>
                  </button>
                )}
              </div>
            </div>

            <p className="objective-content font-serif">
              {objective}
            </p>
          </div>
        )}

        {/* Methodology */}
        {methodology.length > 0 && showSection('methodology') && (
          <div className="insight-card-item card-methodology">
            <div className="insight-card-header">
              <div className="header-left">
                <div className="icon-wrapper icon-methodology">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="insight-heading">
                    Methodology & Architectural Formulation
                  </h3>
                  <span className="card-subhead">
                    {methodology.length} core algorithmic components
                  </span>
                </div>
              </div>

              {onAskQuestion && (
                <div className="header-actions">
                  <button
                    type="button"
                    className="btn-ask-tag"
                    onClick={() =>
                      onAskQuestion(
                        'Explain the methodology and architecture of this paper in detail.'
                      )
                    }
                    title="Ask AI about methodology"
                  >
                    <MessageSquareQuote size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              )}
            </div>

            <div className="methodology-list">
              {methodology.map((item, idx) => (
                <div key={idx} className="methodology-row">
                  <div className="methodology-aspect">
                    <span className="aspect-num">{idx + 1}</span>
                    <strong className="aspect-title">
                      {item.aspect}
                    </strong>
                  </div>
                  <div className="methodology-detail">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Datasets */}
        {datasets.length > 0 && showSection('datasets') && (
          <div className="insight-card-item card-datasets">
            <div className="insight-card-header">
              <div className="header-left">
                <div className="icon-wrapper icon-datasets">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="insight-heading">
                    Datasets & Benchmark Corpora
                  </h3>
                  <span className="card-subhead">
                    Experimental evaluation sets
                  </span>
                </div>
              </div>

              {onAskQuestion && (
                <div className="header-actions">
                  <button
                    type="button"
                    className="btn-ask-tag"
                    onClick={() =>
                      onAskQuestion(
                        'What datasets and benchmarks were used in the evaluation?'
                      )
                    }
                    title="Ask AI about datasets"
                  >
                    <MessageSquareQuote size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              )}
            </div>

            <div className="datasets-grid">
              {datasets.map((ds, idx) => (
                <div key={idx} className="dataset-card">
                  <div className="dataset-top">
                    <span className="dataset-name">{ds.name}</span>
                    <span className="badge badge-muted">{ds.type}</span>
                  </div>

                  <div className="dataset-meta-row">
                    <span className="dataset-stat">
                      <strong>Corpus Size:</strong> {ds.size}
                    </span>

                    {ds.vocabulary && (
                      <span className="dataset-stat">
                        <strong>Vocab:</strong> {ds.vocabulary}
                      </span>
                    )}
                  </div>

                  <p className="dataset-purpose">
                    <strong>Experimental Purpose:</strong> {ds.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Findings */}
        {findings.length > 0 && showSection('findings') && (
          <div className="insight-card-item card-findings">
            <div className="insight-card-header">
              <div className="header-left">
                <div className="icon-wrapper icon-findings">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="insight-heading">
                    Key Findings & Empirical Achievements
                  </h3>
                  <span className="card-subhead">
                    Validated benchmark metrics
                  </span>
                </div>
              </div>

              {onAskQuestion && (
                <div className="header-actions">
                  <button
                    type="button"
                    className="btn-ask-tag"
                    onClick={() =>
                      onAskQuestion(
                        'What are the primary key findings and quantitative results?'
                      )
                    }
                    title="Ask AI about findings"
                  >
                    <MessageSquareQuote size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              )}
            </div>

            <div className="findings-grid">
              {findings.map((finding, idx) => (
                <div key={idx} className="finding-card">
                  <div className="finding-metric-badge font-serif">
                    {finding.metric}
                  </div>
                  <p className="finding-description">
                    {finding.description}
                  </p>
                  <div className="finding-impact-box">
                    <span className="impact-label">Research Impact:</span>
                    <span className="impact-text">
                      {finding.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limitations */}
        {limitations.length > 0 && showSection('limitations') && (
          <div className="insight-card-item card-limitations">
            <div className="insight-card-header">
              <div className="header-left">
                <div className="icon-wrapper icon-limitations">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="insight-heading">
                    Limitations & Boundary Constraints
                  </h3>
                  <span className="card-subhead">
                    Author-acknowledged caveats & research bottlenecks
                  </span>
                </div>
              </div>

              {onAskQuestion && (
                <div className="header-actions">
                  <button
                    type="button"
                    className="btn-ask-tag"
                    onClick={() =>
                      onAskQuestion(
                        'What limitations did the authors mention in this paper?'
                      )
                    }
                    title="Ask AI about limitations"
                  >
                    <MessageSquareQuote size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              )}
            </div>

            <div className="limitations-list">
              {limitations.map((limitation, idx) => {
                const isHigh = limitation.severity === 'High';

                return (
                  <div
                    key={idx}
                    className={`limitation-card ${
                      isHigh ? 'severity-high' : 'severity-mod'
                    }`}
                  >
                    <div className="limitation-card-top">
                      <h4 className="limitation-title">
                        {limitation.title}
                      </h4>
                      <span
                        className={`badge ${
                          isHigh ? 'badge-amber' : 'badge-muted'
                        }`}
                      >
                        {limitation.severity} Severity
                      </span>
                    </div>

                    <p className="limitation-text">
                      {limitation.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
