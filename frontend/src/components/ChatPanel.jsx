import { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  Copy,
  Check,
  User,
  Bot,
  X,
  ChevronRight,
} from "lucide-react";
import "./ChatPanel.css";

function getFormattedTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPanel({
  paper,
  messages,
  setMessages,
  onClose,
  isDocked = false,
  onUploadNew,
  onAskQuestion,
  isAsking = false,
}) {
  const [inputValue, setInputValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedQuestions = [
    "What is the main contribution of this paper?",
    "Explain the methodology.",
    "What are the key findings?",
    "What limitations did the authors mention?",
    "What datasets and benchmarks were evaluated?",
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAsking]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputValue).trim();

    if (!query || isAsking) return;

    setInputValue("");
    onAskQuestion(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all conversation messages for this paper?")) {
      setMessages([
        {
          id: "welcome-reset",
          sender: "assistant",
          text: `Conversation reset. I am ReLens, ready to answer questions grounded in **${paper.title}**. What would you like to explore?`,
          timestamp: getFormattedTime(),
        },
      ]);
    }
  };

  const handleCopyMessage = (idx, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div
      className={`chat-panel-container ${isDocked ? "is-docked" : "is-inline"}`}
    >
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title-row">
          <div className="chat-avatar-badge">
            <Bot size={20} className="bot-icon" />
          </div>
          <div className="chat-title-group">
            <h3 className="chat-title font-serif">Ask ReLens</h3>
            <span className="chat-context-paper" title={paper.title}>
              Grounded in: <strong>{paper.shortTitle || paper.title}</strong>
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="btn-chat-header-action"
            onClick={handleClearHistory}
            title="Clear Chat History"
          >
            <RotateCcw size={15} />
          </button>

          {onClose && (
            <button
              type="button"
              className="btn-chat-header-action"
              onClick={onClose}
              title="Close Chat Panel"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Questions Quick Bar */}
      <div className="suggested-questions-tray">
        <span className="tray-label">Suggested Academic Questions:</span>
        <div className="suggested-chips-scroll">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="suggested-chip-btn"
              onClick={() => handleSendMessage(q)}
              disabled={isAsking}
            >
              <span>{q}</span>
              <ChevronRight size={12} className="chip-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-area">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id || idx}
              className={`chat-message-row ${isUser ? "user-row" : "assistant-row"}`}
            >
              <div className="message-avatar">
                {isUser ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div className="message-bubble-wrapper">
                <div
                  className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}
                >
                  {isUser ? (
                    <div className="user-text">{msg.text}</div>
                  ) : (
                    <div className="assistant-text">
                      {msg.text.split("\n\n").map((block, bIdx) => {
                        // Check if block has bullet points
                        if (
                          block.includes("\n* ") ||
                          block.startsWith("* ") ||
                          block.startsWith("1. ")
                        ) {
                          return (
                            <div
                              key={bIdx}
                              className="academic-formatted-block"
                            >
                              {block.split("\n").map((line, lIdx) => {
                                if (
                                  line.startsWith("* ") ||
                                  line.startsWith("- ")
                                ) {
                                  return (
                                    <div
                                      key={lIdx}
                                      className="chat-bullet-line"
                                    >
                                      <span className="bullet-dot">•</span>
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: formatMarkdownInline(
                                            line.replace(/^[* -]\s*/, ""),
                                          ),
                                        }}
                                      />
                                    </div>
                                  );
                                }
                                if (/^\d+\.\s*/.test(line)) {
                                  return (
                                    <div
                                      key={lIdx}
                                      className="chat-ordered-line"
                                    >
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: formatMarkdownInline(line),
                                        }}
                                      />
                                    </div>
                                  );
                                }
                                return (
                                  <p
                                    key={lIdx}
                                    dangerouslySetInnerHTML={{
                                      __html: formatMarkdownInline(line),
                                    }}
                                  />
                                );
                              })}
                            </div>
                          );
                        }

                        return (
                          <p
                            key={bIdx}
                            className="chat-paragraph"
                            dangerouslySetInnerHTML={{
                              __html: formatMarkdownInline(block),
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Meta & Action */}
                <div className="message-meta-footer">
                  <span className="message-time">{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      className="btn-copy-response"
                      onClick={() => handleCopyMessage(idx, msg.text)}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} className="copy-ok" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isAsking && (
          <div className="chat-message-row assistant-row">
            <div className="message-avatar">
              <Bot size={15} />
            </div>
            <div className="message-bubble-wrapper">
              <div className="message-bubble assistant-bubble typing-bubble">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
                <span className="typing-label">
                  Analyzing paper text & synthesizing answer...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="chat-input-area">
        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="chat-text-input"
            placeholder="Ask anything about this paper's methodology, findings, or limitations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAsking}
          />

          <button
            type="submit"
            className="btn btn-primary btn-send-message"
            disabled={!inputValue.trim() || isAsking}
            title="Send inquiry"
          >
            <Send size={15} />
          </button>
        </form>

        <div className="chat-input-hint">
          <span>
            Grounded in currently analyzed manuscript • Press Enter to send
          </span>
          {onUploadNew && (
            <button
              type="button"
              className="switch-paper-hint-link"
              onClick={onUploadNew}
            >
              Analyze another paper
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple safe helper to render bold, italics, code, and citations inline
 */
function formatMarkdownInline(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="citation-pill">$1</code>')
    .replace(/\\\( (.*?) \\\)/g, '<code class="math-pill">$1</code>')
    .replace(/\\\[ (.*?) \\\]/g, '<code class="math-pill">$1</code>');
}
