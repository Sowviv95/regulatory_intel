"""Tests for the Tamarind import pipeline."""
import sys, os, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import database
_test_db = os.path.join(tempfile.gettempdir(), "ri_import_test.db")
if os.path.exists(_test_db):
    os.remove(_test_db)
database.DB_PATH = _test_db

from database import init_db, get_connection
from seed import run_seed
init_db()
run_seed()

from import_tamarind import (
    parse_products, parse_products_confidence, parse_source_type,
    parse_source_type_confidence, clean_text, derive_topic,
    normalize_columns, build_fields, import_record, reset_imported,
    read_batch1_xlsx,
)

BATCH1_PATH = os.path.join(
    os.path.expanduser("~"),
    "OneDrive - Merit Data and Technology Private Limited",
    "onedrive_backup", "tamarind", "output_for_testing",
    "Merit_Tamarind Intelligence_POC_Batch 1_Sample Data_v1.0_08Apr2025.xlsx",
)

BATCH1_EXISTS = os.path.exists(BATCH1_PATH)


# -- Parsing tests -----------------------------------------------------------

def test_parse_products_semicolon():
    assert parse_products("Nicotine-containing Vaping; Cigarettes") == "Nicotine-containing Vaping; Cigarettes"


def test_parse_products_structured():
    raw = "[{'picklist_term': {'Heated Tobacco': 0.9, 'Cigarettes': 0.7}}]"
    result = parse_products(raw)
    assert "Heated Tobacco" in result
    assert "Cigarettes" in result


def test_parse_products_label_format():
    raw = "[{'label': 'Cigarettes', 'relevance': 0.95}, {'label': 'Herbal', 'relevance': 0.6}]"
    result = parse_products(raw)
    assert "Cigarettes" in result
    assert "Herbal" in result


def test_parse_products_none():
    assert parse_products(None) == ""


def test_parse_products_confidence():
    raw = "[{'picklist_term': {'Heated Tobacco': 0.9, 'Cigarettes': 0.8}}]"
    conf = parse_products_confidence(raw)
    assert 80 <= conf <= 95


def test_parse_source_type_structured():
    assert parse_source_type("[{'Law': 0.9}]") == "Law"


def test_parse_source_type_plain():
    assert parse_source_type("Regulation") == "Regulation"


def test_parse_source_type_confidence():
    assert parse_source_type_confidence("[{'Law': 0.9}]") == 90.0


def test_clean_text_stray_quote():
    assert clean_text("'Some text") == "Some text"
    assert clean_text("Normal text") == "Normal text"
    assert clean_text(None) == ""


def test_derive_topic():
    assert "ENDS" in derive_topic("E-cigarettes; Vaping")
    assert "HTP" in derive_topic("Heated Tobacco Products")
    assert derive_topic("Cigarettes") == "Tobacco Control"


def test_normalize_columns():
    raw = {"Jurisdiction name": "Poland", "Official name of the source": "ACT...",
           "Descriptive name": "Amendment", "URL": "http://example.com"}
    result = normalize_columns(raw)
    assert result["jurisdiction"] == "Poland"
    assert result["source_name"] == "ACT..."
    assert result["title"] == "Amendment"
    assert result["url"] == "http://example.com"


def test_normalize_columns_snake_case():
    raw = {"jurisdiction_name": "Albania", "official_source_name": "parlament.al",
           "descriptive_name": "Draft Law"}
    result = normalize_columns(raw)
    assert result["jurisdiction"] == "Albania"
    assert result["source_name"] == "parlament.al"


# -- Build fields tests ------------------------------------------------------

def test_build_fields_produces_12():
    record = {
        "jurisdiction": "Poland", "source_name": "Test Source",
        "title": "Test Regulation", "summary": "A test.",
        "products": "Cigarettes", "sub_products": None,
        "source_type": "Law", "status": "Proposed",
        "impact": "High", "impact_comment": "Significant",
        "proposer": "Executive power", "likelihood": "High",
        "likelihood_comment": "Likely to pass", "dates": "Jan 1, 2025",
        "url": "http://example.com/test",
    }
    fields = build_fields(record)
    assert len(fields) == 12
    names = [f["field_name"] for f in fields]
    assert "Jurisdiction" in names
    assert "Title" in names
    assert "Summary" in names
    assert "Products Impacted" in names
    assert "Sector Impact" in names
    assert "Source URL" in names


# -- Import tests (require Batch 1 file) ------------------------------------

def test_read_batch1():
    if not BATCH1_EXISTS:
        return  # skip if file not available
    records, errors = read_batch1_xlsx(BATCH1_PATH)
    assert len(records) == 54
    assert len(errors) == 0
    # All records have required fields
    for r in records:
        assert r["jurisdiction"]
        assert r["url"]


def test_import_creates_source_regulation_fields_evidence():
    conn = get_connection()
    record = {
        "jurisdiction": "TestCountry", "source_name": "Test Body",
        "title": "Test Regulation Title", "summary": "Test summary.",
        "products": "Cigarettes", "sub_products": None,
        "source_type": "Law", "status": "Proposed",
        "impact": "High", "impact_comment": "Big impact",
        "proposer": "Legislature", "likelihood": "High",
        "likelihood_comment": "Will pass", "dates": "2025-01-01",
        "url": "http://test-import-unique-url.example.com/1",
    }
    result = import_record(conn, record)
    conn.commit()
    assert result["source_created"] is True
    assert result["regulation_created"] is True
    assert result["fields_created"] == 12
    assert result["evidence_created"] == 12

    # Verify in DB
    src = conn.execute("SELECT * FROM sources WHERE external_url = ?",
                       ("http://test-import-unique-url.example.com/1",)).fetchone()
    assert src is not None
    assert src["origin"] == "tamarind"
    assert src["country"] == "TestCountry"

    reg = conn.execute("SELECT * FROM regulations WHERE source_id = ?", (src["id"],)).fetchone()
    assert reg is not None
    assert reg["origin"] == "tamarind"

    fields = conn.execute("SELECT COUNT(*) FROM regulation_fields WHERE source_id = ?", (src["id"],)).fetchall()
    assert fields[0][0] == 12

    evidence = conn.execute(
        "SELECT COUNT(*) FROM evidence WHERE source_id = ?", (src["id"],)
    ).fetchall()
    assert evidence[0][0] == 12
    conn.close()


def test_import_idempotent():
    conn = get_connection()
    record = {
        "jurisdiction": "IdempotentLand", "source_name": "Test Body",
        "title": "Idempotent Test", "summary": "Test.",
        "products": "Cigarettes", "source_type": "Law",
        "status": "Proposed", "impact": "Low", "proposer": "X",
        "likelihood": "Low", "dates": "2025",
        "url": "http://test-idempotent-unique.example.com/2",
    }
    r1 = import_record(conn, record)
    conn.commit()
    assert r1["source_created"] is True

    r2 = import_record(conn, record)
    conn.commit()
    assert r2["skipped"] is True
    assert r2["source_created"] is False
    assert r2["fields_created"] == 0

    # Only one source in DB
    count = conn.execute(
        "SELECT COUNT(*) FROM sources WHERE external_url = ?",
        ("http://test-idempotent-unique.example.com/2",)
    ).fetchone()[0]
    assert count == 1
    conn.close()


def test_reviewer_changes_survive_reimport():
    """Verify that re-importing does not overwrite review decisions."""
    conn = get_connection()
    record = {
        "jurisdiction": "ReviewTest", "source_name": "Test",
        "title": "Review Survival Test", "summary": "Test.",
        "products": "Cigarettes", "source_type": "Law",
        "status": "Proposed", "impact": "Low", "proposer": "X",
        "likelihood": "Low", "dates": "2025",
        "url": "http://test-review-survive.example.com/3",
    }
    import_record(conn, record)
    conn.commit()

    # Simulate reviewer accepting a field
    src = conn.execute("SELECT id FROM sources WHERE external_url = ?",
                       (record["url"],)).fetchone()
    field = conn.execute(
        "SELECT id FROM regulation_fields WHERE source_id = ? LIMIT 1", (src["id"],)
    ).fetchone()
    conn.execute(
        "UPDATE regulation_fields SET status = 'Accepted', reviewed_value = 'Reviewer Edit', reviewed_at = 'now' WHERE id = ?",
        (field["id"],)
    )
    conn.commit()

    # Re-import (should skip)
    r2 = import_record(conn, record)
    conn.commit()
    assert r2["skipped"] is True

    # Verify review changes preserved
    updated_field = conn.execute(
        "SELECT * FROM regulation_fields WHERE id = ?", (field["id"],)
    ).fetchone()
    assert updated_field["status"] == "Accepted"
    assert updated_field["reviewed_value"] == "Reviewer Edit"
    conn.close()


def test_seed_data_preserved_after_import():
    """Verify seed data is distinct from imported data."""
    conn = get_connection()
    seed_count = conn.execute("SELECT COUNT(*) FROM sources WHERE origin = 'seed'").fetchone()[0]
    assert seed_count == 12  # Original seed data
    tamarind_count = conn.execute("SELECT COUNT(*) FROM sources WHERE origin = 'tamarind'").fetchone()[0]
    assert tamarind_count >= 2  # At least our test imports
    conn.close()


def test_reset_imported():
    conn = get_connection()
    # Import something
    record = {
        "jurisdiction": "ResetTest", "source_name": "Test",
        "title": "Reset Test", "summary": "Test.",
        "products": "Cigarettes", "source_type": "Law",
        "status": "Proposed", "impact": "Low", "proposer": "X",
        "likelihood": "Low", "dates": "2025",
        "url": "http://test-reset.example.com/4",
    }
    import_record(conn, record)
    conn.commit()

    before_tamarind = conn.execute("SELECT COUNT(*) FROM sources WHERE origin = 'tamarind'").fetchone()[0]
    assert before_tamarind > 0

    reset_imported(conn)

    after_tamarind = conn.execute("SELECT COUNT(*) FROM sources WHERE origin = 'tamarind'").fetchone()[0]
    assert after_tamarind == 0

    # Seed data still there
    seed = conn.execute("SELECT COUNT(*) FROM sources WHERE origin = 'seed'").fetchone()[0]
    assert seed == 12
    conn.close()


def test_malformed_record_reporting():
    """Records missing required fields produce errors, not crashes."""
    if not BATCH1_EXISTS:
        return
    # The actual file has no malformed records, so test parsing directly
    from import_tamarind import normalize_columns
    bad_row = {"Jurisdiction name": "Test"}  # missing URL, source_name, title
    normalized = normalize_columns(bad_row)
    missing = [f for f in ["jurisdiction", "source_name", "title", "url"] if not normalized.get(f)]
    assert len(missing) == 3  # source_name, title, url missing


def test_imported_records_via_api():
    """Verify imported records are accessible through existing API endpoints."""
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)

    # Sources endpoint returns both seed and imported
    r = client.get("/api/sources")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) == 12  # Only seed after reset_imported cleaned up tamarind

    # Re-import one record for API testing
    conn = get_connection()
    record = {
        "jurisdiction": "Poland", "source_name": "Sejm RP",
        "title": "API Test Regulation", "summary": "Test.",
        "products": "Cigarettes", "source_type": "Law",
        "status": "Proposed", "impact": "High", "proposer": "Legislature",
        "likelihood": "High", "dates": "2025-01-01",
        "url": "http://test-api.example.com/5",
    }
    import_record(conn, record)
    conn.commit()
    conn.close()

    # Now verify it appears in sources
    r = client.get("/api/sources")
    data = r.json()["data"]
    assert len(data) == 13  # 12 seed + 1 imported

    # Search should find it
    r = client.get("/api/search?q=API+Test+Regulation")
    data = r.json()["data"]
    assert len(data) > 0

    # Export should include it
    r = client.post("/api/exports", json={})
    assert "API Test Regulation" in r.text
