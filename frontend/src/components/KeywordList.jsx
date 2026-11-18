
import { useState } from 'react';
import { Tag, Search, MessageSquareQuote, Check, Copy } from 'lucide-react';
import './KeywordList.css';

export default function KeywordList({ keywords, onAskQuestion }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTag, setCopiedTag] = useState(null);

  if (!keywords || keywords.length === 0) return null;

  const filteredKeywords = keywords.filter((item) =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyTag = (term) => {
    navigator.clipboard.writeText(term).then(() => {
      setCopiedTag(term);
      setTimeout(() => setCopiedTag(null), 1800);
    });
  };

  return (
    <div className="keywords-container" id="keywords-tags">
      <div className="keywords-header">
        <div>
          <span className="section-eyebrow">Keyword Extraction</span>
          <h2 className="section-title font-serif">
            Extracted Academic Keywords
          </h2>
          <p className="keywords-desc">
            Important terms and concepts identified across the research paper
            using YAKE keyword extraction.
          </p>
        </div>

        <div className="total-keywords-pill">
          <Tag size={14} />
          <span>{keywords.length} Extracted Keywords</span>
        </div>
      </div>

      <div className="keywords-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />

          <input
            type="text"
            className="keyword-search-input"
            placeholder="Search extracted keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="keywords-cloud">
        {filteredKeywords.length > 0 ? (
          filteredKeywords.map((item, idx) => (
            <div
              key={`${item.term}-${idx}`}
              className="keyword-tag-pill"
            >
              <div
                className="tag-main-info"
                onClick={() => handleCopyTag(item.term)}
                title="Click to copy term"
              >
                <span className="tag-term font-serif">
                  {item.term}
                </span>
              </div>

              <div className="tag-quick-actions">
                <button
                  type="button"
                  className="tag-action-btn"
                  onClick={() => handleCopyTag(item.term)}
                  title="Copy keyword"
                >
                  {copiedTag === item.term ? (
                    <Check size={12} className="copy-ok" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>

                {onAskQuestion && (
                  <button
                    type="button"
                    className="tag-action-btn ask-btn"
                    onClick={() =>
                      onAskQuestion(
                        `How does this paper utilize or formulate the concept of "${item.term}"?`
                      )
                    }
                    title="Ask ReLens about this keyword"
                  >
                    <MessageSquareQuote size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="keywords-empty-state">
            <p>
              No keywords match your search query "{searchTerm}".
            </p>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      <div className="keywords-footer-tip">
        <span className="tip-star">✦</span>
        <span>
          Click any keyword to copy it, or use the speech icon to ask
          ReLens how the paper applies that concept.
        </span>
      </div>
    </div>
  );
}
