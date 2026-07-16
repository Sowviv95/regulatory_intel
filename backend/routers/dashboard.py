from fastapi import APIRouter
from database import get_connection

router = APIRouter()

def _get_jurisdictions(conn):
    """Compute jurisdiction coverage from actual data."""
    rows = conn.execute("""
        SELECT s.country, s.flag,
               COUNT(DISTINCT s.id) as total,
               COUNT(DISTINCT CASE WHEN s.status IN ('Ready for Review', 'Processing') THEN s.id END) as covered,
               COUNT(DISTINCT CASE WHEN s.status = 'New' THEN s.id END) as pending,
               COUNT(DISTINCT CASE WHEN rf.field_name = 'Sector Impact' AND rf.extracted_value = 'High' THEN s.id END) as high
        FROM sources s
        LEFT JOIN regulation_fields rf ON rf.source_id = s.id
        GROUP BY s.country, s.flag
        ORDER BY total DESC
    """).fetchall()
    return [{"country": r["country"], "flag": r["flag"], "total": r["total"],
             "covered": r["covered"], "pending": r["pending"], "high": r["high"]} for r in rows]


@router.get("/api/dashboard")
def get_dashboard():
    conn = get_connection()
    total = conn.execute("SELECT COUNT(*) FROM sources").fetchone()[0]
    new_count = conn.execute("SELECT COUNT(*) FROM sources WHERE status = 'New'").fetchone()[0]
    pending = conn.execute("SELECT COUNT(*) FROM sources WHERE status = 'Ready for Review'").fetchone()[0]
    high_impact = conn.execute(
        "SELECT COUNT(DISTINCT source_id) FROM regulation_fields WHERE field_name = 'Sector Impact' AND extracted_value = 'High'"
    ).fetchone()[0]

    jurisdictions = _get_jurisdictions(conn)
    n_jurisdictions = len(jurisdictions)

    kpis = [
        {"label": "Total Regulations", "value": str(total), "delta": "+4.2%", "up": True, "sub": f"Across {n_jurisdictions} jurisdictions"},
        {"label": "New This Week", "value": str(new_count), "delta": "+12.5%", "up": True, "sub": "vs. prior week"},
        {"label": "High Impact", "value": str(high_impact), "delta": "+3 this week", "up": False, "sub": "Require attention"},
        {"label": "Pending Review", "value": str(pending), "delta": "\u22128 since yesterday", "up": True, "sub": "In analyst queue"},
    ]

    # Dynamic alerts from most recent sources
    alert_rows = conn.execute("""
        SELECT s.id, s.flag, s.country, s.title, s.discovered, s.status,
               COALESCE(
                 (SELECT rf.extracted_value FROM regulation_fields rf
                  WHERE rf.source_id = s.id AND rf.field_name = 'Sector Impact' LIMIT 1),
                 'Medium'
               ) as impact
        FROM sources s ORDER BY s.id DESC LIMIT 10
    """).fetchall()
    alerts = [{"id": r["id"], "flag": r["flag"], "country": r["country"],
               "title": r["title"], "date": r["discovered"],
               "impact": r["impact"], "status": r["status"]} for r in alert_rows]
    conn.close()

    return {"data": {"kpis": kpis, "jurisdictions": jurisdictions, "alerts": alerts}}
