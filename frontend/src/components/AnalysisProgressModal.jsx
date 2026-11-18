
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import './AnalysisProgressModal.css';

export default function AnalysisProgressModal({ paperTitle }) {
  const steps = [
    {
      title: 'Parsing PDF Document',
      desc: 'Extracting text and page information',
    },
    {
      title: 'Identifying Research Sections',
      desc: 'Detecting abstracts, methodology, results and conclusions',
    },
    {
      title: 'Generating Research Summaries',
      desc: 'Summarizing the paper and its individual sections',
    },
    {
      title: 'Extracting Academic Keywords',
      desc: 'Identifying important terms using YAKE',
    },
  ];

  return (
    <div className="analysis-modal-backdrop">
      <div className="analysis-modal-dialog">
        <div className="modal-top-accent" />

        <div className="modal-header">
          <div className="modal-icon-badge">
            <Sparkles size={22} className="modal-sparkle" />
          </div>
          <div>
            <span className="modal-kicker">ReLens Processing Pipeline</span>
            <h3 className="modal-title font-serif">
              Analyzing Academic Paper
            </h3>
          </div>
        </div>

        <div className="analyzing-paper-name">
          <FileText size={16} className="paper-name-icon" />
          <span className="paper-name-text">
            {paperTitle || 'Academic Research Paper.pdf'}
          </span>
        </div>

        <div className="analysis-steps-list">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`step-row ${idx === 0 ? 'step-active' : 'step-pending'}`}
            >
              <div className="step-indicator">
                {idx === 0 ? (
                  <Loader2 size={18} className="step-icon-spinner" />
                ) : (
                  <div className="step-dot" />
                )}
              </div>

              <div className="step-text-col">
                <div className="step-name">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer-note">
          <span>
            Processing your paper. This may take a little while...
          </span>
        </div>
      </div>
    </div>
  );
}
