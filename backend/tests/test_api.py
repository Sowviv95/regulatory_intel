"""Tests for the Regulatory Intelligence API."""
import sys, os, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import database
_test_db = os.path.join(tempfile.gettempdir(), "ri_test_v2.db")
if os.path.exists(_test_db):
    os.remove(_test_db)
database.DB_PATH = _test_db

from database import init_db
from seed import run_seed
init_db()
run_seed()

from fastapi.testclient import TestClient
from main import app
client = TestClient(app)


# -- Health ------------------------------------------------------------------

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# -- Dashboard ---------------------------------------------------------------

def test_dashboard():
    r = client.get("/api/dashboard")
    assert r.status_code == 200
    d = r.json()["data"]
    assert len(d["kpis"]) == 4
    assert "stats" in d
    assert d["stats"]["totalSources"] == 12
    assert len(d["jurisdictions"]) >= 5
    assert len(d["alerts"]) >= 6


# -- Sources -----------------------------------------------------------------

def test_list_sources():
    r = client.get("/api/sources")
    assert r.status_code == 200
    assert len(r.json()["data"]) == 12


def test_list_sources_filter():
    r = client.get("/api/sources?status=New")
    data = r.json()["data"]
    assert all(s["status"] == "New" for s in data)


def test_get_source():
    r = client.get("/api/sources/1")
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["country"] == "Taiwan"
    assert d["sourceText"] is not None  # Taiwan has source text


def test_get_source_not_found():
    assert client.get("/api/sources/999").status_code == 404


def test_patch_source():
    r = client.patch("/api/sources/1", json={"status": "Processing", "stage": "Translating"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Processing"
    assert r.json()["data"]["startedAt"] is not None


def test_source_regulation_count():
    r = client.get("/api/sources/1")
    assert r.json()["data"]["regulationCount"] == 1


# -- Source -> Regulations ---------------------------------------------------

def test_source_regulations():
    r = client.get("/api/sources/1/regulations")
    assert r.status_code == 200
    regs = r.json()["data"]
    assert len(regs) == 1
    assert regs[0]["jurisdiction"] == "Taiwan"
    assert "regulatoryBody" in regs[0]
    assert "topic" in regs[0]


# -- Regulations -------------------------------------------------------------

def test_list_regulations():
    r = client.get("/api/regulations")
    assert r.status_code == 200
    assert len(r.json()["data"]) == 6  # 6 regulations


def test_get_regulation_with_fields():
    r = client.get("/api/regulations/1")
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["title"] == "Tobacco Hazards Prevention Act Amendment 2026"
    assert len(d["fields"]) == 13
    assert d["sourceText"] is not None
    # Each field should have evidence
    for f in d["fields"]:
        assert "evidence" in f
        assert f["evidence"]  # not empty
        assert "evidenceSection" in f


def test_get_regulation_not_found():
    assert client.get("/api/regulations/999").status_code == 404


def test_patch_regulation():
    r = client.patch("/api/regulations/1", json={"status": "In Review"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "In Review"


# -- Fields ------------------------------------------------------------------

def test_get_field():
    r = client.get("/api/fields/1")
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["field"] == "Jurisdiction"
    assert "evidence" in d  # evidence object
    assert d["evidence"]["excerpt"]
    assert d["evidence"]["immutable"] is True


def test_patch_field_accept():
    r = client.patch("/api/fields/1", json={"status": "Accepted"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Accepted"


def test_patch_field_edit():
    r = client.patch("/api/fields/2", json={"reviewedValue": "New Value", "comment": "Fixed"})
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["reviewedValue"] == "New Value"
    assert d["status"] == "Accepted"


def test_field_review_flag():
    r = client.post("/api/fields/3/review", json={"fieldId": 3, "decision": "Flagged", "comment": "Needs review"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Flagged"


def test_field_review_reject():
    r = client.post("/api/fields/4/review", json={"fieldId": 4, "decision": "Rejected"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Rejected"


def test_field_review_edit():
    r = client.post("/api/fields/5/review", json={"fieldId": 5, "decision": "Edited", "newValue": "Updated"})
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["reviewedValue"] == "Updated"
    assert d["status"] == "Accepted"


def test_field_review_reset():
    client.post("/api/fields/6/review", json={"fieldId": 6, "decision": "Accepted"})
    r = client.post("/api/fields/6/review", json={"fieldId": 6, "decision": "Reset"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Pending"


def test_accept_all():
    r = client.post("/api/regulations/3/review/accept-all")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) == 13
    assert all(f["status"] == "Accepted" for f in data)


# -- Compatibility route -----------------------------------------------------

def test_review_compat_route():
    r = client.post("/api/regulations/1/review", json={"fieldId": 7, "decision": "Accepted"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Accepted"


# -- Evidence ----------------------------------------------------------------

def test_evidence_immutable():
    r = client.get("/api/evidence/1")
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["immutable"] is True
    assert d["excerpt"]
    assert d["source"]["jurisdiction"] == "Taiwan"


def test_evidence_not_found():
    assert client.get("/api/evidence/9999").status_code == 404


def test_evidence_cannot_be_modified():
    """Evidence table has no write endpoints — verify no PUT/PATCH/DELETE exists."""
    r = client.patch("/api/evidence/1", json={"excerpt": "tampered"})
    assert r.status_code in (404, 405)
    r = client.put("/api/evidence/1", json={"excerpt": "tampered"})
    assert r.status_code in (404, 405)
    r = client.delete("/api/evidence/1")
    assert r.status_code in (404, 405)


# -- Search ------------------------------------------------------------------

def test_search():
    r = client.get("/api/search?q=Taiwan")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) > 0
    # Verify record structure
    rec = data[0]
    assert "regulationId" in rec
    assert "evidence" in rec


def test_search_filter_status():
    r = client.get("/api/search?status=Accepted")
    for rec in r.json()["data"]:
        assert rec["status"] == "Accepted"


def test_search_filter_confidence():
    r = client.get("/api/search?confidence=High")
    for rec in r.json()["data"]:
        assert rec["confidence"] >= 90


# -- Export ------------------------------------------------------------------

def test_export_all():
    r = client.post("/api/exports", json={})
    assert r.status_code == 200
    assert "Source ID" in r.text
    assert "Regulation ID" in r.text  # new column
    assert "Evidence Excerpt" in r.text  # new column


def test_export_selected():
    r = client.post("/api/exports", json={"fieldIds": [1, 2]})
    assert r.status_code == 200
    lines = r.text.strip().split("\n")
    assert len(lines) == 3  # header + 2


# -- Relationships -----------------------------------------------------------

def test_source_to_regulation_to_field_to_evidence():
    """Verify the full chain: source -> regulation -> field -> evidence."""
    # Get source
    src = client.get("/api/sources/1").json()["data"]
    assert src["country"] == "Taiwan"
    # Get regulations for source
    regs = client.get("/api/sources/1/regulations").json()["data"]
    assert len(regs) >= 1
    reg_id = regs[0]["id"]
    # Get regulation with fields
    reg = client.get(f"/api/regulations/{reg_id}").json()["data"]
    assert len(reg["fields"]) == 13
    field_id = reg["fields"][0]["id"]
    # Get evidence for field
    ev = client.get(f"/api/evidence/{field_id}").json()["data"]
    assert ev["excerpt"]
    assert ev["immutable"] is True
    assert ev["source"]["id"] == 1


# -- Persistence across connections ------------------------------------------

def test_persistence_across_restart():
    """Verify review changes survive a new database connection."""
    import database as db
    # Accept a field via the API
    client.post("/api/fields/10/review", json={"fieldId": 10, "decision": "Accepted"})
    # Open a brand new connection (simulates restart)
    conn = db.get_connection()
    row = conn.execute("SELECT status FROM regulation_fields WHERE id = 10").fetchone()
    conn.close()
    assert row["status"] == "Accepted"


# -- Source status transitions -----------------------------------------------

def test_source_new_to_ready():
    """PATCH source directly from New to Ready for Review sets completed_at."""
    r = client.patch("/api/sources/1", json={"status": "Ready for Review", "stage": "Analyst Review"})
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["status"] == "Ready for Review"
    assert d["stage"] == "Analyst Review"
    assert d["completedAt"] is not None


def test_source_new_to_irrelevant():
    """PATCH source from New to Irrelevant."""
    # Reset to New first
    client.patch("/api/sources/2", json={"status": "New", "stage": "Awaiting Extraction"})
    r = client.patch("/api/sources/2", json={"status": "Irrelevant", "stage": "Discarded"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "Irrelevant"


def test_source_restore_to_new():
    """PATCH source back to New from Irrelevant."""
    client.patch("/api/sources/2", json={"status": "Irrelevant", "stage": "Discarded"})
    r = client.patch("/api/sources/2", json={"status": "New", "stage": "Awaiting Extraction"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "New"


def test_source_patch_not_found():
    """PATCH non-existent source returns 404."""
    r = client.patch("/api/sources/9999", json={"status": "Ready for Review"})
    assert r.status_code == 404


# -- Search / Intelligence Library filters -----------------------------------

def test_search_no_filters():
    """GET /api/search with no filters returns all records."""
    r = client.get("/api/search")
    assert r.status_code == 200
    data = r.json()["data"]
    # Seed data: 12 sources × ~10-13 fields each
    assert len(data) > 0
    # Every record must have required keys
    assert all("jurisdiction" in d and "fieldName" in d for d in data)


def test_search_filter_jurisdiction():
    """Jurisdiction filter returns only matching records."""
    r = client.get("/api/search?jurisdiction=Taiwan")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) > 0
    assert all(d["jurisdiction"] == "Taiwan" for d in data)


def test_search_filter_category():
    """Category filter returns only matching records."""
    r = client.get("/api/search?category=Assessment")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) > 0
    assert all(d["category"] == "Assessment" for d in data)


def test_search_filter_status():
    """Status filter returns only matching records."""
    r = client.get("/api/search?status=Pending")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) > 0
    assert all(d["status"] == "Pending" for d in data)


def test_search_filter_confidence():
    """Confidence=Low returns only records with confidence < 75."""
    r = client.get("/api/search?confidence=Low")
    assert r.status_code == 200
    data = r.json()["data"]
    # May have 0 low-confidence in seed data
    for d in data:
        assert d["confidence"] < 75


def test_search_filter_combined():
    """Combined filters apply AND logic."""
    r = client.get("/api/search?jurisdiction=Taiwan&category=Metadata")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) > 0
    assert all(d["jurisdiction"] == "Taiwan" and d["category"] == "Metadata" for d in data)


def test_search_text_query():
    """Text search matches across multiple fields."""
    r = client.get("/api/search?q=tobacco")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) > 0


def test_search_no_results():
    """Non-matching filter returns empty list, not error."""
    r = client.get("/api/search?jurisdiction=Atlantis")
    assert r.status_code == 200
    assert r.json()["data"] == []
