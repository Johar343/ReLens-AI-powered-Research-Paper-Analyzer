CREATE TABLE IF NOT EXISTS analysis_history (
    id TEXT PRIMARY KEY,
    browser_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    title TEXT,
    total_pages INTEGER,
    analysis_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analysis_history_browser
ON analysis_history(browser_id, created_at);