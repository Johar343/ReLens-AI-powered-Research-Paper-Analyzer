
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import './AnalysisProgressModal.css';

export default function AnalysisProgressModal({ paperTitle }) {
  return (
    <div className="analysis-modal-backdrop">
      <div className="analysis-modal-dialog">
        <div className="modal-header">
          <div className="modal-icon-badge">
            <Sparkles size={22} className="modal-sparkle" />
          </div>
          <div>
            <span className="modal-kicker">ReLens Processing Pipeline</span>
            <h3 className="modal-title font-serif">
              Processing PDF
            </h3>
          </div>
        </div>

        <div className="analyzing-paper-name">
          <FileText size={16} className="paper-name-icon" />
          <span className="paper-name-text">
            {paperTitle || 'Academic Research Paper.pdf'}
          </span>
        </div>

        <div className="analysis-status-card">
          <Loader2 size={18} className="step-icon-spinner" />
          <div className="step-text-col">
            <div className="step-name">Simplifying the paper</div>
            <div className="step-desc">
              ReLens is processing the PDF and preparing its research summary.
            </div>
          </div>
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
