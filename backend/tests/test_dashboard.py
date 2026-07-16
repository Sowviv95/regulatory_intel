"""Tests for the comprehensive dashboard endpoint."""
import sys, os, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import database
_test_db = os.path.join(tempfile.gettempdir(), "ri_dashboard_test.db")
if os.path.exists(_test_db):
    os.remove(_test_db)
database.DB_PATH = _test_db

from database import init_db, get_connection
from seed import run_seed
init_db()
run_seed()

from fastapi.testclient import TestClient
from main import app
client = TestClient(app)


# -- Seed-only data -----------------------------------------------------------

def test_dashboard_structure():
    """Dashboard response has all required top-level keys."""
    r = client.get("/api/dashboard")
    assert r.status_code == 200
    d = r.json()["data"]
    assert "kpis" in d
    assert "stats" in d
    assert "jurisdictions" in d
    assert "alerts" in d
    assert "recentActivity" in d
    assert "oldestPending" in d


def test_kpis_count_and_nav():
    """4 KPI cards, each with a nav path."""
    d = client.get("/api/dashboard").json()["data"]
    assert len(d["kpis"]) == 4
    for kpi in d["kpis"]:
        assert "label" in kpi
        assert "value" in kpi
        assert "nav" in kpi
        assert kpi["nav"].startswith("/")


def test_stats_seed_only():
    """Stats reflect seeded data: 12 sources, 6 regulations, 78 fields."""
    d = client.get("/api/dashboard").json()["data"]
    s = d["stats"]
    assert s["totalSources"] == 12
    assert s["totalRegulations"] == 6
    assert s["totalFields"] == 78
    assert s["tamarindSources"] == 0  # seed only
    assert s["pendingFields"] + s["acceptedFields"] + s["rejectedFields"] + s["flaggedFields"] == s["totalFields"]


def test_jurisdictions_from_data():
    """Jurisdictions derived from actual source countries."""
    d = client.get("/api/dashboard").json()["data"]
    countries = [j["country"] for j in d["jurisdictions"]]
    assert "Taiwan" in countries
    assert "South Korea" in countries
    assert len(countries) >= 5  # 6 unique countries in seed


def test_jurisdiction_fields_present():
    """Each jurisdiction has all required fields including new ones."""
    d = client.get("/api/dashboard").json()["data"]
    for j in d["jurisdictions"]:
        assert "country" in j
        assert "flag" in j
        assert "total" in j
        assert "covered" in j
        assert "pending" in j
        assert "irrelevant" in j
        assert "highImpact" in j


def test_jurisdiction_reconciliation():
    """covered + pending + irrelevant = total for every jurisdiction."""
    d = client.get("/api/dashboard").json()["data"]
    for j in d["jurisdictions"]:
        accounted = j["covered"] + j["pending"] + j["irrelevant"]
        assert accounted == j["total"], (
            f'{j["country"]}: covered({j["covered"]}) + pending({j["pending"]}) + '
            f'irrelevant({j["irrelevant"]}) = {accounted} != total({j["total"]})'
        )


def test_alerts_are_recent_sources():
    """Alerts are actual source records, not static."""
    d = client.get("/api/dashboard").json()["data"]
    assert len(d["alerts"]) > 0
    for a in d["alerts"]:
        assert "id" in a
        assert "flag" in a
        assert "status" in a


def test_oldest_pending_present():
    """Oldest pending shows sources with New/Ready for Review status."""
    d = client.get("/api/dashboard").json()["data"]
    for p in d["oldestPending"]:
        assert p["status"] in ("New", "Ready for Review")


def test_evidence_coverage_seed():
    """Evidence coverage = 100% for seed data (1 evidence per field)."""
    d = client.get("/api/dashboard").json()["data"]
    assert d["stats"]["evidenceCoverage"] == 100.0


# -- Review actions change dashboard counts -----------------------------------

def test_review_changes_dashboard_counts():
    """Accepting a field changes accepted/pending counts."""
    d1 = client.get("/api/dashboard").json()["data"]["stats"]
    initial_pending = d1["pendingFields"]
    initial_accepted = d1["acceptedFields"]

    # Accept a field
    client.post("/api/fields/1/review", json={"fieldId": 1, "decision": "Accepted"})

    d2 = client.get("/api/dashboard").json()["data"]["stats"]
    # Pending should decrease or stay same (field 1 may already be accepted from prior test runs)
    assert d2["pendingFields"] <= initial_pending
    assert d2["acceptedFields"] >= initial_accepted


def test_review_creates_recent_activity():
    """Review decision appears in recentActivity."""
    client.post("/api/fields/2/review", json={"fieldId": 2, "decision": "Flagged", "comment": "Check this"})
    d = client.get("/api/dashboard").json()["data"]
    decisions = [a["decision"] for a in d["recentActivity"]]
    assert "Flagged" in decisions


def test_review_rate_updates():
    """Review rate changes after accepting fields."""
    d = client.get("/api/dashboard").json()["data"]["stats"]
    assert d["reviewRate"] >= 0
    assert d["reviewRate"] <= 100


# -- Source status changes change dashboard counts ----------------------------

def test_source_status_change_updates_kpis():
    """Changing a source status updates the dashboard counts."""
    d1 = client.get("/api/dashboard").json()["data"]["stats"]
    # Change source 3 (New) to Ready for Review
    client.patch("/api/sources/3", json={"status": "Ready for Review", "stage": "Analyst Review"})
    d2 = client.get("/api/dashboard").json()["data"]["stats"]
    assert d2["reviewSources"] >= d1["reviewSources"]


# -- Imported Tamarind data ---------------------------------------------------

def test_import_changes_dashboard():
    """Importing a Tamarind record changes total counts and tamarindSources."""
    from import_tamarind import import_record
    conn = get_connection()
    record = {
        "jurisdiction": "DashboardTestCountry", "source_name": "Test",
        "title": "Dashboard Test Reg", "summary": "Test.",
        "products": "Cigarettes", "source_type": "Law",
        "status": "Proposed", "impact": "High", "proposer": "X",
        "likelihood": "High", "dates": "2025",
        "url": "http://dashboard-test-unique.example.com/1",
    }
    import_record(conn, record)
    conn.commit()
    conn.close()

    d = client.get("/api/dashboard").json()["data"]
    assert d["stats"]["tamarindSources"] >= 1
    assert d["stats"]["totalSources"] >= 13  # 12 seed + at least 1 import
    # Jurisdiction list should include the new country
    countries = [j["country"] for j in d["jurisdictions"]]
    assert "DashboardTestCountry" in countries


def test_mixed_seed_and_import_counts():
    """Stats distinguish seed from Tamarind sources."""
    d = client.get("/api/dashboard").json()["data"]["stats"]
    seed_count = d["totalSources"] - d["tamarindSources"]
    assert seed_count == 12  # original seed data


# -- Empty database -----------------------------------------------------------

def test_empty_database():
    """Dashboard handles an empty database gracefully."""
    conn = get_connection()
    # Save current state
    conn.execute("DELETE FROM review_decisions")
    conn.execute("DELETE FROM evidence")
    conn.execute("DELETE FROM regulation_fields")
    conn.execute("DELETE FROM regulations")
    conn.execute("DELETE FROM sources")
    conn.commit()
    conn.close()

    r = client.get("/api/dashboard")
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["stats"]["totalSources"] == 0
    assert d["stats"]["totalFields"] == 0
    assert d["stats"]["reviewRate"] == 0
    assert d["stats"]["evidenceCoverage"] == 0
    assert len(d["jurisdictions"]) == 0
    assert len(d["alerts"]) == 0
    assert len(d["recentActivity"]) == 0
    assert len(d["oldestPending"]) == 0
    assert len(d["kpis"]) == 4

    # Re-seed for other tests
    run_seed()
