"""SQLite database setup and connection management."""
import sqlite3
from pathlib import Path

DB_DIR = Path(__file__).parent / "data"
DB_PATH = str(DB_DIR / "regulatory_intel.db")


def get_connection() -> sqlite3.Connection:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.executescript(SCHEMA)
    # Migrate existing databases: add columns that may not exist yet
    for col, ddl in [
        ("external_url", "ALTER TABLE sources ADD COLUMN external_url TEXT"),
        ("origin", "ALTER TABLE sources ADD COLUMN origin TEXT NOT NULL DEFAULT 'seed'"),
    ]:
        try:
            conn.execute(ddl)
        except Exception:
            pass  # column already exists
    for col, ddl in [
        ("origin", "ALTER TABLE regulations ADD COLUMN origin TEXT NOT NULL DEFAULT 'seed'"),
    ]:
        try:
            conn.execute(ddl)
        except Exception:
            pass
    conn.commit()
    conn.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS sources (
    id                    INTEGER PRIMARY KEY,
    flag                  TEXT NOT NULL,
    country               TEXT NOT NULL,
    source_name           TEXT NOT NULL,
    title                 TEXT NOT NULL,
    language              TEXT NOT NULL,
    doc_type              TEXT NOT NULL,
    discovered            TEXT NOT NULL,
    status                TEXT NOT NULL DEFAULT 'New',
    stage                 TEXT NOT NULL DEFAULT 'Awaiting Extraction',
    started_at            TEXT,
    completed_at          TEXT,
    failure_message       TEXT,
    source_text           TEXT,
    external_url          TEXT,
    origin                TEXT NOT NULL DEFAULT 'seed'
);

CREATE TABLE IF NOT EXISTS regulations (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id             INTEGER NOT NULL REFERENCES sources(id),
    title                 TEXT NOT NULL,
    regulatory_body       TEXT NOT NULL,
    jurisdiction          TEXT NOT NULL,
    topic                 TEXT NOT NULL DEFAULT 'Tobacco & Nicotine',
    summary               TEXT,
    status                TEXT NOT NULL DEFAULT 'Pending',
    created_at            TEXT NOT NULL,
    updated_at            TEXT NOT NULL,
    origin                TEXT NOT NULL DEFAULT 'seed'
);

CREATE TABLE IF NOT EXISTS regulation_fields (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    regulation_id         INTEGER NOT NULL REFERENCES regulations(id),
    source_id             INTEGER NOT NULL REFERENCES sources(id),
    category              TEXT NOT NULL,
    field_name            TEXT NOT NULL,
    extracted_value       TEXT NOT NULL,
    reviewed_value        TEXT,
    confidence            REAL NOT NULL,
    status                TEXT NOT NULL DEFAULT 'Pending',
    comment               TEXT,
    reviewed_at           TEXT
);

CREATE TABLE IF NOT EXISTS evidence (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id             INTEGER NOT NULL REFERENCES sources(id),
    regulation_id         INTEGER NOT NULL REFERENCES regulations(id),
    field_id              INTEGER NOT NULL REFERENCES regulation_fields(id),
    excerpt               TEXT NOT NULL,
    page_number           TEXT,
    section               TEXT,
    source_reference      TEXT,
    immutable             INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS review_decisions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id              INTEGER NOT NULL REFERENCES regulation_fields(id),
    decision              TEXT NOT NULL,
    previous_value        TEXT,
    new_value             TEXT,
    reviewer              TEXT NOT NULL DEFAULT 'Jane Lee',
    comment               TEXT,
    created_at            TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sources_external_url ON sources(external_url) WHERE external_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sources_origin ON sources(origin);
CREATE INDEX IF NOT EXISTS idx_regulations_origin ON regulations(origin);
CREATE INDEX IF NOT EXISTS idx_regulations_source ON regulations(source_id);
CREATE INDEX IF NOT EXISTS idx_fields_regulation ON regulation_fields(regulation_id);
CREATE INDEX IF NOT EXISTS idx_fields_source ON regulation_fields(source_id);
CREATE INDEX IF NOT EXISTS idx_evidence_field ON evidence(field_id);
CREATE INDEX IF NOT EXISTS idx_evidence_regulation ON evidence(regulation_id);
CREATE INDEX IF NOT EXISTS idx_decisions_field ON review_decisions(field_id);
"""
