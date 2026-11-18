import { useState } from 'react';
import Navbar from '../components/Navbar';
import HomeSidebar from '../components/HomeSidebar';
import UploadZone from '../components/UploadZone';
import AboutView from '../components/AboutView';
import { BookOpen, ArrowRight, Layers, FileText } from 'lucide-react';
import './Home.css';

export default function Home({ onUpload, onSelectSample, samplePapers, isAnalyzing }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'about' | 'samples'

  return (
    <div className="relens-home-page">
      <Navbar />

      <div className="container home-main-layout">
        {/* Left Sidebar on Homepage */}
        <HomeSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectSample={onSelectSample}
          samplePapers={samplePapers}
        />

        {/* Right Content Area */}
        <main className="home-content-area">
          {activeTab === 'upload' && (
            <UploadZone
              onUpload={onUpload}
              onSelectSample={onSelectSample}
              samplePapers={samplePapers}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'about' && (
            <AboutView
              onSelectSample={onSelectSample}
              samplePapers={samplePapers}
              onGoToUpload={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'samples' && (
            <div className="home-samples-showcase">
              <div className="showcase-header">
                <span className="showcase-kicker">Foundation Literature</span>
                <h2 className="showcase-title font-serif">Curated Academic Papers</h2>
                <p className="showcase-desc">
                  Select any peer-reviewed research paper below to explore full section-by-section summaries, extracted methodology formulas, benchmark datasets, and interactive Q&A.
                </p>
              </div>

              <div className="showcase-grid">
                {samplePapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="showcase-card"
                    onClick={() => onSelectSample(paper)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="showcase-card-top">
                      <span className="badge badge-sage">{paper.publication.field}</span>
                      <span className="showcase-pages">{paper.meta.totalPages} pages</span>
                    </div>

                    <h3 className="showcase-card-title font-serif">{paper.title}</h3>
                    
                    <p className="showcase-card-overview">{paper.quickOverview}</p>

                    <div className="showcase-meta-row">
                      <div className="showcase-authors">
                        <strong>Authors:</strong> {paper.authors.slice(0, 3).map((a) => a.name).join(', ')}
                        {paper.authors.length > 3 ? ' et al.' : ''}
                      </div>
                      <div className="showcase-venue">
                        <BookOpen size={13} />
                        <span>{paper.publication.venue.split('(')[0]} · {paper.publication.year}</span>
                      </div>
                    </div>

                    <div className="showcase-card-footer">
                      <span className="showcase-action-text">Analyze Paper</span>
                      <ArrowRight size={14} className="showcase-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="relens-footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <span className="footer-brand font-serif">ReLens</span>
            <span className="footer-copy">
              AI-Powered Academic Research Paper Analysis • Developed by Team WiS.
            </span>
          </div>
          <div className="footer-right">
            <span className="footer-specs">FastAPI Ready • Modular Frontend Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
