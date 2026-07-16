"""Dashboard endpoint -- all metrics derived from live database data."""
from fastapi import APIRouter
from database import get_connection

router = APIRouter()


@router.get("/api/dashboard")
def get_dashboard():
    conn = get_connection()

    # ── Source counts by status ──────────────────────────────────────────
    status_rows = conn.execute(
        "SELECT status, COUNT(*) as c FROM sources GROUP BY status"
    ).fetchall()
    source_by_status = {r["status"]: r["c"] for r in status_rows}
    total_sources = sum(source_by_status.values())
    new_sources = source_by_status.get("New", 0)
    processing_sources = source_by_status.get("Processing", 0)
    review_sources = source_by_status.get("Ready for Review", 0)
    irrelevant_sources = source_by_status.get("Irrelevant", 0)

    # ── Origin counts ────────────────────────────────────────────────────
    origin_rows = conn.execute(
        "SELECT origin, COUNT(*) as c FROM sources GROUP BY origin"
    ).fetchall()
    source_by_origin = {r["origin"]: r["c"] for r in origin_rows}
    tamarind_sources = source_by_origin.get("tamarind", 0)

    # ── Regulation and field counts ──────────────────────────────────────
    total_regulations = conn.execute("SELECT COUNT(*) FROM regulations").fetchone()[0]
    total_fields = conn.execute("SELECT COUNT(*) FROM regulation_fields").fetchone()[0]

    field_status_rows = conn.execute(
        "SELECT status, COUNT(*) as c FROM regulation_fields GROUP BY status"
    ).fetchall()
    field_by_status = {r["status"]: r["c"] for r in field_status_rows}
    pending_fields = field_by_status.get("Pending", 0)
    accepted_fields = field_by_status.get("Accepted", 0)
    rejected_fields = field_by_status.get("Rejected", 0)
    flagged_fields = field_by_status.get("Flagged", 0)

    reviewed_fields = accepted_fields + rejected_fields + flagged_fields
    review_rate = round((reviewed_fields / total_fields * 100), 1) if total_fields > 0 else 0

    # ── Low-confidence fields (<75) ──────────────────────────────────────
    low_conf_fields = conn.execute(
        "SELECT COUNT(*) FROM regulation_fields WHERE confidence < 75"
    ).fetchone()[0]

    # ── High-impact sources ──────────────────────────────────────────────
    high_impact = conn.execute(
        "SELECT COUNT(DISTINCT source_id) FROM regulation_fields "
        "WHERE field_name = 'Sector Impact' AND extracted_value = 'High'"
    ).fetchone()[0]

    # ── Evidence coverage ────────────────────────────────────────────────
    fields_with_evidence = conn.execute(
        "SELECT COUNT(DISTINCT field_id) FROM evidence"
    ).fetchone()[0]
    evidence_coverage = round((fields_with_evidence / total_fields * 100), 1) if total_fields > 0 else 0

    # ── Jurisdictions ────────────────────────────────────────────────────
    jur_rows = conn.execute("""
        SELECT s.country, s.flag,
               COUNT(DISTINCT s.id) as total,
               COUNT(DISTINCT CASE WHEN s.status IN ('Ready for Review','Processing') THEN s.id END) as covered,
               COUNT(DISTINCT CASE WHEN s.status = 'New' THEN s.id END) as pending,
               COUNT(DISTINCT CASE WHEN s.status = 'Irrelevant' THEN s.id END) as irrelevant,
               COUNT(DISTINCT CASE WHEN rf.field_name = 'Sector Impact'
                                     AND rf.extracted_value = 'High' THEN s.id END) as high_impact
        FROM sources s
        LEFT JOIN regulation_fields rf ON rf.source_id = s.id
        GROUP BY s.country, s.flag
        ORDER BY total DESC
    """).fetchall()
    jurisdictions = [
        {"country": r["country"], "flag": r["flag"], "total": r["total"],
         "covered": r["covered"], "pending": r["pending"],
         "irrelevant": r["irrelevant"],
         "highImpact": r["high_impact"]}
        for r in jur_rows
    ]

    # ── Recent activity (latest sources + latest review decisions) ───────
    alert_rows = conn.execute("""
        SELECT s.id, s.flag, s.country, s.title, s.discovered, s.status,
               COALESCE(
                 (SELECT rf.extracted_value FROM regulation_fields rf
                  WHERE rf.source_id = s.id AND rf.field_name = 'Sector Impact' LIMIT 1),
                 'Medium'
               ) as impact
        FROM sources s ORDER BY s.id DESC LIMIT 10
    """).fetchall()
    alerts = [
        {"id": r["id"], "flag": r["flag"], "country": r["country"],
         "title": r["title"], "date": r["discovered"],
         "impact": r["impact"], "status": r["status"]}
        for r in alert_rows
    ]

    # ── Recent review decisions ──────────────────────────────────────────
    activity_rows = conn.execute("""
        SELECT rd.decision, rd.created_at, rd.comment,
               rf.field_name, s.title as source_title, s.country
        FROM review_decisions rd
        JOIN regulation_fields rf ON rf.id = rd.field_id
        JOIN sources s ON s.id = rf.source_id
        ORDER BY rd.id DESC LIMIT 10
    """).fetchall()
    recent_activity = [
        {"decision": r["decision"], "createdAt": r["created_at"],
         "fieldName": r["field_name"], "sourceTitle": r["source_title"],
         "country": r["country"], "comment": r["comment"]}
        for r in activity_rows
    ]

    # ── Oldest pending sources ───────────────────────────────────────────
    oldest_rows = conn.execute("""
        SELECT s.id, s.flag, s.country, s.title, s.discovered, s.status
        FROM sources s
        WHERE s.status IN ('New', 'Ready for Review')
        ORDER BY s.id ASC LIMIT 5
    """).fetchall()
    oldest_pending = [
        {"id": r["id"], "flag": r["flag"], "country": r["country"],
         "title": r["title"], "discovered": r["discovered"], "status": r["status"]}
        for r in oldest_rows
    ]

    conn.close()

    # ── Build KPI cards ──────────────────────────────────────────────────
    n_jur = len(jurisdictions)
    kpis = [
        {"label": "Total Sources", "value": str(total_sources),
         "delta": f"{tamarind_sources} imported", "up": True,
         "sub": f"Across {n_jur} jurisdictions",
         "nav": "/sources"},
        {"label": "Ready for Review", "value": str(review_sources),
         "delta": f"{new_sources} to process", "up": new_sources > 0,
         "sub": "In analyst queue",
         "nav": "/sources?status=Ready for Review"},
        {"label": "High Impact", "value": str(high_impact),
         "delta": f"{low_conf_fields} low-confidence", "up": False,
         "sub": "Require attention",
         "nav": "/search?confidence=High"},
        {"label": "Review Progress", "value": f"{review_rate}%",
         "delta": f"{reviewed_fields}/{total_fields} fields", "up": review_rate > 0,
         "sub": f"{pending_fields} pending",
         "nav": "/search?status=Pending"},
    ]

    # ── Summary stats block ──────────────────────────────────────────────
    stats = {
        "totalSources": total_sources,
        "newSources": new_sources,
        "processingSources": processing_sources,
        "reviewSources": review_sources,
        "irrelevantSources": irrelevant_sources,
        "tamarindSources": tamarind_sources,
        "totalRegulations": total_regulations,
        "totalFields": total_fields,
        "pendingFields": pending_fields,
        "acceptedFields": accepted_fields,
        "rejectedFields": rejected_fields,
        "flaggedFields": flagged_fields,
        "lowConfidenceFields": low_conf_fields,
        "reviewRate": review_rate,
        "evidenceCoverage": evidence_coverage,
        "fieldsWithEvidence": fields_with_evidence,
    }

    return {"data": {
        "kpis": kpis,
        "stats": stats,
        "jurisdictions": jurisdictions,
        "alerts": alerts,
        "recentActivity": recent_activity,
        "oldestPending": oldest_pending,
    }}
