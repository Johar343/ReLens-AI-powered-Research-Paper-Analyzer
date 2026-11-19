import json
import os
import sqlite3
from pathlib import Path


def database_path() -> Path:
    configured = os.getenv("RELENS_DB_PATH")
    return Path(configured) if configured else Path("data") / "relens.db"


def _connect() -> sqlite3.Connection:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with _connect() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analysis_history (
                id TEXT PRIMARY KEY,
                browser_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                title TEXT,
                total_pages INTEGER,
                analysis_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_analysis_history_browser
            ON analysis_history(browser_id, created_at)
            """
        )


def list_history(browser_id: str) -> list[dict]:
    initialize_database()
    with _connect() as connection:
        rows = connection.execute(
            """
            SELECT id, filename, title, total_pages, analysis_json, created_at
            FROM analysis_history
            WHERE browser_id = ?
            ORDER BY created_at DESC
            LIMIT 50
            """,
            (browser_id,),
        ).fetchall()
    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "title": row["title"],
            "totalPages": row["total_pages"],
            "analysis": json.loads(row["analysis_json"]),
            "createdAt": row["created_at"],
        }
        for row in rows
    ]


def save_history(
    record_id: str,
    browser_id: str,
    filename: str,
    title: str | None,
    total_pages: int | None,
    analysis: dict,
) -> None:
    initialize_database()
    with _connect() as connection:
        connection.execute(
            """
            INSERT INTO analysis_history
            (id, browser_id, filename, title, total_pages, analysis_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                browser_id,
                filename,
                title,
                total_pages,
                json.dumps(analysis),
            ),
        )


def delete_history(record_id: str, browser_id: str) -> bool:
    initialize_database()
    with _connect() as connection:
        result = connection.execute(
            "DELETE FROM analysis_history WHERE id = ? AND browser_id = ?",
            (record_id, browser_id),
        )
    return result.rowcount > 0
