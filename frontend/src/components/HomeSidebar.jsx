import {
  UploadCloud,
  Users,
  BookOpen,
  Layers,
  ShieldCheck,
  ArrowRight,
  FileText,
} from "lucide-react";
import "./HomeSidebar.css";

export default function HomeSidebar({
  activeTab,
  setActiveTab,
  onSelectSample,
  samplePapers,
}) {
  const navItems = [
    {
      id: "upload",
      label: "Upload & Analyze",
      icon: UploadCloud,
      badge: "PDF",
    },
    { id: "about", label: "About & Team WiS", icon: Users, isHighlight: true },
  ];

  return (
    <aside className="home-sidebar">
      {/* Navigation Group */}
      <div className="home-sidebar-section">
        <span className="home-sidebar-label">Navigation</span>
        <nav className="home-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`home-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="home-link-left">
                  <Icon
                    size={16}
                    className={`home-link-icon ${item.isHighlight ? "icon-highlight" : ""}`}
                  />
                  <span className="home-link-label">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="home-pill-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Project Specs Card */}

      <div className="home-workflow-card">
        <span className="workflow-kicker">HOW RELENS WORKS</span>
        <h4 className="workflow-heading">From paper to insights.</h4>

        <div className="workflow-steps">
          <div className="workflow-step">
            <span className="workflow-number">01</span>
            <div>
              <h5>Extract</h5>
              <p>Read and process your research paper.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span className="workflow-number">02</span>
            <div>
              <h5>Organise</h5>
              <p>Identify sections and key information.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span className="workflow-number">03</span>
            <div>
              <h5>Summarise</h5>
              <p>Understand the paper's main ideas.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span className="workflow-number">04</span>
            <div>
              <h5>Ask</h5>
              <p>Explore the paper with ReLens AI.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Sample Paper */}
      {samplePapers && samplePapers.length > 0 && (
        <div className="home-quick-sample-box">
          <span className="quick-sample-title">Quick Demo</span>
          <p className="quick-sample-desc">
            Test ReLens instantly with the 2017 Transformer foundation paper.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-quick-demo"
            onClick={() => onSelectSample(samplePapers[0])}
          >
            <FileText size={13} />
            <span>Launch Attention Paper</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </aside>
  );
}
