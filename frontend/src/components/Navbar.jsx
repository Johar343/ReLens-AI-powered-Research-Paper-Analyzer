import { useState } from "react";
import {
  BookOpen,
  Upload,
  ChevronDown,
  Check,
  FileText,
  MessageSquareQuote,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar({
  activePaper,
  onSelectPaper,
  onUploadNew,
  samplePapers,
  onToggleChat,
  isChatOpen,
  historyPapers = [],
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      className={`relens-navbar ${!activePaper ? "navbar-home" : "navbar-dashboard"}`}
    >
      <div className="container navbar-inner">
        {/* Brand with User's Monogram Logo beside the Name */}
        <div
          className="navbar-brand"
          onClick={onUploadNew}
          role="button"
          tabIndex={0}
          title="ReLens"
        >
          <img
            src="/relens-logo.png"
            alt="ReLens Monogram Logo"
            className="navbar-brand-logo"
          />
          <span className="brand-name font-serif">ReLens</span>
        </div>

        {/* Center: Active Paper Context Badge */}
        {activePaper && (
          <div className="navbar-paper-pill" title={activePaper.title}>
            <div className="pulse-dot" />
            <BookOpen size={14} className="paper-pill-icon" />
            <span className="paper-pill-text">
              Active:{" "}
              <strong>{activePaper.shortTitle || activePaper.title}</strong>
            </span>
          </div>
        )}

        {/* Right Navigation & Actions */}
        <div className="navbar-actions">
          {activePaper && (
            <div className="sample-selector-wrapper">
              <button
                type="button"
                className="btn btn-secondary btn-sm sample-select-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <FileText size={14} />
                <span>Switch Paper</span>
                <ChevronDown
                  size={14}
                  className={`chevron-arrow ${dropdownOpen ? "rotated" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="dropdown-overlay"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="sample-dropdown-menu">
                    {historyPapers.length > 0 && (
                      <>
                        <div className="dropdown-header">
                          <span>Previously Analyzed Papers</span>
                        </div>

                        {historyPapers.map((savedPaper) => (
                          <button
                            key={savedPaper.id}
                            type="button"
                            className={`dropdown-item ${
                              activePaper?.id === savedPaper.id ? "active" : ""
                            }`}
                            onClick={() => {
                              onSelectPaper(savedPaper);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className="dropdown-item-content">
                              <span className="item-title">
                                {savedPaper.shortTitle || savedPaper.title}
                              </span>
                              <span className="item-meta">
                                {savedPaper.fileName || "Uploaded paper"}
                              </span>
                            </div>

                            {activePaper?.id === savedPaper.id && (
                              <Check size={16} className="item-check" />
                            )}
                          </button>
                        ))}
                      </>
                    )}
                    <div className="dropdown-header">
                      <span>Curated Research Papers</span>
                    </div>
                    {samplePapers.map((paper) => {
                      const isSelected = activePaper?.id === paper.id;
                      return (
                        <button
                          key={paper.id}
                          type="button"
                          className={`dropdown-item ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            onSelectPaper(paper);
                            setDropdownOpen(false);
                          }}
                        >
                          <div className="dropdown-item-content">
                            <span className="item-title">
                              {paper.shortTitle || paper.title}
                            </span>
                            <span className="item-meta">
                              {paper.publication.venue.split("(")[0]} ·{" "}
                              {paper.publication.year}
                            </span>
                          </div>
                          {isSelected && (
                            <Check size={16} className="item-check" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activePaper && onToggleChat && (
            <button
              type="button"
              className={`btn btn-sm ${isChatOpen ? "btn-primary" : "btn-secondary"} chat-toggle-btn`}
              onClick={onToggleChat}
              title={
                isChatOpen
                  ? "Hide Ask ReLens Panel"
                  : "Open Ask ReLens Interactive Assistant"
              }
            >
              <MessageSquareQuote size={15} />
              <span>Ask ReLens</span>
              <span className="chat-badge-dot">AI</span>
            </button>
          )}

          {activePaper && (
            <button
              type="button"
              className="btn btn-secondary btn-sm upload-new-btn"
              onClick={onUploadNew}
              title="Upload another research paper"
            >
              <Upload size={14} />
              <span>Upload PDF</span>
            </button>
          )}

          {/* Right Corner: Developed by Team WiS. */}
          <div className="nav-dev-credit">
            <span>Developed by Team WiS.</span>
          </div>
        </div>
      </div>
    </header>
  );
}
