import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import InsightCard from '../components/InsightCard';
import DetailedAnalysis from '../components/DetailedAnalysis';
import KeywordList from '../components/KeywordList';
import ChatPanel from '../components/ChatPanel';
import ExportModal from '../components/ExportModal';
import { MessageSquareQuote, Layers } from 'lucide-react';
import './Dashboard.css';


export default function Dashboard({
  paper,
  samplePapers,
  onSelectPaper,
  onUploadNew,
  chatMessages,
  setChatMessages,
  onAskQuestion,
  isAsking,
  historyPapers = [],
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'insights' | 'detailed' | 'keywords' | 'all' | 'chat'
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Helper to trigger question from any card directly to chat
  const handleAskQuestionFromCard = (questionText) => {
  if (activeTab !== 'chat') {
    setIsChatPanelOpen(true);
  }

  onAskQuestion(questionText);
  };
  return (
    <div className="relens-dashboard-page">
      {/* Top Navigation */}
      <Navbar
        activePaper={paper}
        samplePapers={samplePapers}
        onSelectPaper={onSelectPaper}
        onUploadNew={onUploadNew}
        onToggleChat={() => setIsChatPanelOpen(!isChatPanelOpen)}
        isChatOpen={isChatPanelOpen}
        historyPapers={historyPapers}
      />

      <div className="container dashboard-main-layout">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'chat') {
              setIsChatPanelOpen(false); // In main view, no need for split side panel
            }
          }}
          paper={paper}
          onUploadNew={onUploadNew}
          onExportReport={() => setShowExportModal(true)}
        />

        {/* Center Main Analysis Panel */}
        <main className={`dashboard-content-area ${isChatPanelOpen ? 'with-chat-open' : ''}`}>
          {/* View Mode Pills Strip */}
          <div className="view-mode-pills-bar">
            <div className="view-pills-left">
              <button
                type="button"
                className={`view-pill ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Paper Overview
              </button>
              <button
                type="button"
                className={`view-pill ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                Research Insights
              </button>
              <button
                type="button"
                className={`view-pill ${activeTab === 'detailed' ? 'active' : ''}`}
                onClick={() => setActiveTab('detailed')}
              >
                Detailed Analysis
              </button>
              <button
                type="button"
                className={`view-pill ${activeTab === 'keywords' ? 'active' : ''}`}
                onClick={() => setActiveTab('keywords')}
              >
                Keywords ({paper.keywords?.length || 0})
              </button>
              <button
                type="button"
                className={`view-pill pill-all ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <Layers size={13} />
                <span>Full Document View</span>
              </button>
            </div>

            <div className="view-pills-right">
              <button
                type="button"
                className={`btn btn-sm ${isChatPanelOpen ? 'btn-primary' : 'btn-secondary'} dock-chat-toggle-btn`}
                onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
                title={isChatPanelOpen ? 'Close Side Chat' : 'Open Ask ReLens Side Assistant'}
              >
                <MessageSquareQuote size={14} />
                <span>{isChatPanelOpen ? 'Hide Assistant' : 'Ask ReLens'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Content Views */}
          {activeTab === 'overview' && (
            <div className="view-fade-in">
              <SummaryCard
                paper={paper}
                onOpenChat={(q) => handleAskQuestionFromCard(q)}
              />
              <InsightCard
                paper={paper}
                onAskQuestion={handleAskQuestionFromCard}
              />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="view-fade-in">
              <InsightCard
                paper={paper}
                onAskQuestion={handleAskQuestionFromCard}
              />
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="view-fade-in">
              <DetailedAnalysis
                paper={paper}
                onAskQuestion={handleAskQuestionFromCard}
              />
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="view-fade-in">
              <KeywordList
                keywords={paper.keywords}
                onAskQuestion={handleAskQuestionFromCard}
              />
            </div>
          )}

          {activeTab === 'all' && (
            <div className="view-fade-in">
              <SummaryCard
                paper={paper}
                onOpenChat={(q) => handleAskQuestionFromCard(q)}
              />
              <InsightCard
                paper={paper}
                onAskQuestion={handleAskQuestionFromCard}
              />
              <DetailedAnalysis
                paper={paper}
                onAskQuestion={handleAskQuestionFromCard}
              />
              <KeywordList
                keywords={paper.keywords}
                onAskQuestion={handleAskQuestionFromCard}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="view-fade-in full-chat-view">
              <ChatPanel
                paper={paper}
                messages={chatMessages}
                setMessages={setChatMessages}
                onUploadNew={onUploadNew}
                onAskQuestion={onAskQuestion}
                isAsking={isAsking}
              />
            </div>
          )}
        </main>

        {/* Right Docked Chat Panel (when toggled on split screen) */}
        {isChatPanelOpen && activeTab !== 'chat' && (
          <aside className="dashboard-docked-chat">
            <ChatPanel
              paper={paper}
              messages={chatMessages}
              setMessages={setChatMessages}
              onClose={() => setIsChatPanelOpen(false)}
              isDocked={true}
              onUploadNew={onUploadNew}
              onAskQuestion={onAskQuestion}
              isAsking={isAsking}
            />
          </aside>
        )}
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <ExportModal
          paper={paper}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
