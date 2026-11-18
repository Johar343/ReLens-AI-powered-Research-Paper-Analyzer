import { BookOpen, Target, FileText, Tag, MessageSquareQuote, Download, ArrowLeft } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  activeTab,
  setActiveTab,
  paper,
  onUploadNew,
  onExportReport,
}) {
  const navItems = [
    { id: 'overview', label: 'Paper Overview', icon: BookOpen },
    { id: 'insights', label: 'Research Insights', icon: Target },
    { id: 'detailed', label: 'Detailed Analysis', icon: FileText, badge: `${paper?.sectionSummaries?.length || 0} secs` },
    { id: 'keywords', label: 'Keywords & Tags', icon: Tag, badge: `${paper?.keywords?.length || 0}` },
    { id: 'chat', label: 'Ask ReLens', icon: MessageSquareQuote, isAI: true },
  ];

  return (
    <aside className="relens-sidebar">
      {/* Back / Clear Action */}
      <div className="sidebar-top-action">
        <button
          type="button"
          className="btn-back-upload"
          onClick={onUploadNew}
          title="Upload or analyze another paper"
        >
          <ArrowLeft size={15} />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="sidebar-nav-group">
        <span className="sidebar-group-label">Document Sections</span>
        <nav className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="link-left">
                  <Icon size={16} className={`link-icon ${item.isAI ? 'icon-ai' : ''}`} />
                  <span className="link-label">{item.label}</span>
                </div>

                {item.badge && <span className="sidebar-pill-badge">{item.badge}</span>}
                {item.isAI && <span className="sidebar-ai-pill">AI Assistant</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Document Specification Box */}
      {paper && (
        <div className="sidebar-specs-card">
          <div className="specs-card-header">
            <span className="specs-title">Document Specs</span>
            <span className="badge badge-sage">Indexed</span>
          </div>

          <div className="specs-list">
            <div className="spec-row">
              <span className="spec-label">Pages:</span>
              <span className="spec-value">{paper.meta.totalPages} pages</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Read Time:</span>
              <span className="spec-value">~{paper.meta.readingTimeMinutes} mins</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Exhibits:</span>
              <span className="spec-value">{paper.meta.figuresCount} figs, {paper.meta.tablesCount} tables</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">File Size:</span>
              <span className="spec-value">{paper.meta.fileSize}</span>
            </div>
          </div>
        </div>
      )}

      {/* Export Action */}
      <div className="sidebar-footer-actions">
        {onExportReport && (
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-sidebar-export"
            onClick={onExportReport}
          >
            <Download size={14} />
            <span>Export Summary</span>
          </button>
        )}
      </div>
    </aside>
  );
}
