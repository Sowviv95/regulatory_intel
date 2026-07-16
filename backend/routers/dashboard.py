from fastapi import APIRouter
from database import get_connection

router = APIRouter()

JURISDICTIONS = [
    {"country": "Taiwan", "flag": "\U0001f1f9\U0001f1fc", "total": 187, "covered": 142, "pending": 18, "high": 12},
    {"country": "Denmark", "flag": "\U0001f1e9\U0001f1f0", "total": 203, "covered": 165, "pending": 22, "high": 8},
    {"country": "Finland", "flag": "\U0001f1eb\U0001f1ee", "total": 178, "covered": 134, "pending": 31, "high": 15},
    {"country": "Poland", "flag": "\U0001f1f5\U0001f1f1", "total": 221, "covered": 189, "pending": 14, "high": 9},
    {"country": "South Korea", "flag": "\U0001f1f0\U0001f1f7", "total": 256, "covered": 208, "pending": 27, "high": 19},
    {"country": "Vietnam", "flag": "\U0001f1fb\U0001f1f3", "total": 198, "covered": 152, "pending": 33, "high": 21},
]


@router.get("/api/dashboard")
def get_dashboard():
    conn = get_connection()
    total = conn.execute("SELECT COUNT(*) FROM sources").fetchone()[0]
    new_count = conn.execute("SELECT COUNT(*) FROM sources WHERE status = 'New'").fetchone()[0]
    pending = conn.execute("SELECT COUNT(*) FROM sources WHERE status = 'Ready for Review'").fetchone()[0]
    high_impact = conn.execute(
        "SELECT COUNT(DISTINCT source_id) FROM regulation_fields WHERE field_name = 'Sector Impact' AND extracted_value = 'High'"
    ).fetchone()[0]
    conn.close()

    kpis = [
        {"label": "Total Regulations", "value": str(total), "delta": "+4.2%", "up": True, "sub": "Across 6 jurisdictions"},
        {"label": "New This Week", "value": str(new_count), "delta": "+12.5%", "up": True, "sub": "vs. prior week"},
        {"label": "High Impact", "value": str(high_impact), "delta": "+3 this week", "up": False, "sub": "Require attention"},
        {"label": "Pending Review", "value": str(pending), "delta": "\u22128 since yesterday", "up": True, "sub": "In analyst queue"},
    ]

    alerts_rows = conn if False else []  # Alerts are static for now
    alerts = [
        {"id": 1, "flag": "\U0001f1f9\U0001f1fc", "country": "Taiwan", "title": "Tobacco Hazards Prevention Act Amendment 2026", "date": "Jul 14", "impact": "High", "status": "New"},
        {"id": 2, "flag": "\U0001f1f0\U0001f1f7", "country": "South Korea", "title": "E-cigarette Content Disclosure Rules Update", "date": "Jul 13", "impact": "High", "status": "Processing"},
        {"id": 3, "flag": "\U0001f1fb\U0001f1f3", "country": "Vietnam", "title": "Tobacco Control Law Phase 3 Implementation", "date": "Jul 12", "impact": "Medium", "status": "New"},
        {"id": 4, "flag": "\U0001f1e9\U0001f1f0", "country": "Denmark", "title": "Nicotine Pouch Maximum Strength Regulation", "date": "Jul 11", "impact": "Medium", "status": "Ready for Review"},
        {"id": 5, "flag": "\U0001f1eb\U0001f1ee", "country": "Finland", "title": "E-cigarette Display Restriction Amendment", "date": "Jul 10", "impact": "Low", "status": "Processing"},
        {"id": 6, "flag": "\U0001f1f5\U0001f1f1", "country": "Poland", "title": "Heated Tobacco Product Labeling Requirements", "date": "Jul 9", "impact": "Medium", "status": "Ready for Review"},
    ]

    return {"data": {"kpis": kpis, "jurisdictions": JURISDICTIONS, "alerts": alerts}}
