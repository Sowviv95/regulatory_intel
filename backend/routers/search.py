from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from database import get_connection
import io, csv

router = APIRouter()

SEARCH_SQL = """
    SELECT f.*, s.id as src_id, s.flag, s.country, s.source_name, s.title as src_title,
           s.doc_type, s.discovered,
           r.id as reg_id, r.title as reg_title, r.regulatory_body, r.jurisdiction as reg_jurisdiction,
           r.topic, r.summary as reg_summary,
           e.id as ev_id, e.excerpt as ev_excerpt, e.section as ev_section,
           e.source_reference as ev_ref, e.immutable as ev_immutable
    FROM regulation_fields f
    JOIN regulations r ON f.regulation_id = r.id
    JOIN sources s ON f.source_id = s.id
    LEFT JOIN evidence e ON e.field_id = f.id
"""


def _search_record(r) -> dict:
    extracted = r["extracted_value"]
    reviewed = r["reviewed_value"]
    return {
        "sourceId": r["src_id"], "sourceTitle": r["src_title"], "sourceName": r["source_name"],
        "flag": r["flag"], "jurisdiction": r["country"], "docType": r["doc_type"], "date": r["discovered"],
        "regulationId": r["reg_id"], "regulationTitle": r["reg_title"],
        "fieldId": r["id"], "fieldName": r["field_name"], "category": r["category"],
        "extractedValue": extracted, "reviewedValue": reviewed,
        "finalValue": reviewed if reviewed else extracted,
        "evidence": r["ev_excerpt"] or "", "evidenceSection": r["ev_section"],
        "confidence": r["confidence"], "status": r["status"], "comment": r["comment"],
    }


@router.get("/api/search")
def search(q: str | None = None, jurisdiction: str | None = None,
           category: str | None = None, status: str | None = None,
           confidence: str | None = None, source: str | None = None):
    conn = get_connection()
    sql = SEARCH_SQL + " WHERE 1=1"
    params: list = []
    if q:
        sql += """ AND (s.title LIKE ? OR s.source_name LIKE ? OR s.country LIKE ?
                   OR f.field_name LIKE ? OR f.extracted_value LIKE ?
                   OR f.reviewed_value LIKE ? OR f.comment LIKE ?
                   OR e.excerpt LIKE ? OR f.category LIKE ? OR s.doc_type LIKE ?
                   OR r.title LIKE ? OR r.regulatory_body LIKE ?)"""
        params.extend([f"%{q}%"] * 12)
    if jurisdiction and jurisdiction != "All":
        sql += " AND s.country = ?"; params.append(jurisdiction)
    if category and category != "All":
        sql += " AND f.category = ?"; params.append(category)
    if status and status != "All":
        sql += " AND f.status = ?"; params.append(status)
    if confidence and confidence != "All":
        if confidence == "High": sql += " AND f.confidence >= 90"
        elif confidence == "Medium": sql += " AND f.confidence >= 75 AND f.confidence < 90"
        elif confidence == "Low": sql += " AND f.confidence < 75"
    if source and source != "All":
        sql += " AND s.title = ?"; params.append(source)
    sql += " ORDER BY s.id, f.id"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return {"data": [_search_record(r) for r in rows]}


@router.get("/api/evidence/{field_id}")
def get_evidence(field_id: int):
    conn = get_connection()
    ev = conn.execute("SELECT * FROM evidence WHERE field_id = ?", (field_id,)).fetchone()
    if not ev:
        conn.close(); raise HTTPException(404, f"Evidence for field {field_id} not found")
    field = conn.execute("SELECT * FROM regulation_fields WHERE id = ?", (field_id,)).fetchone()
    source = conn.execute("SELECT * FROM sources WHERE id = ?", (ev["source_id"],)).fetchone()
    conn.close()
    return {"data": {
        "id": ev["id"], "fieldId": field_id,
        "excerpt": ev["excerpt"], "section": ev["section"],
        "sourceReference": ev["source_reference"], "immutable": bool(ev["immutable"]),
        "pageNumber": ev["page_number"],
        "field": {
            "id": field["id"], "fieldName": field["field_name"], "category": field["category"],
            "extractedValue": field["extracted_value"], "reviewedValue": field["reviewed_value"],
            "confidence": field["confidence"], "status": field["status"],
        } if field else None,
        "source": {
            "id": source["id"], "title": source["title"], "sourceName": source["source_name"],
            "flag": source["flag"], "jurisdiction": source["country"], "docType": source["doc_type"],
        } if source else None,
    }}


class ExportRequest(BaseModel):
    fieldIds: list[int] | None = None
    filters: dict | None = None


@router.post("/api/exports")
def export_csv(body: ExportRequest):
    conn = get_connection()
    if body.fieldIds:
        placeholders = ",".join(["?"] * len(body.fieldIds))
        sql = SEARCH_SQL + f" WHERE f.id IN ({placeholders}) ORDER BY s.id, f.id"
        rows = conn.execute(sql, body.fieldIds).fetchall()
    else:
        rows = conn.execute(SEARCH_SQL + " ORDER BY s.id, f.id").fetchall()
    conn.close()

    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow([
        "Source ID", "Source Title", "Regulatory Body", "Jurisdiction", "Document Type", "Date",
        "Regulation ID", "Regulation Title",
        "Field ID", "Field Name", "Category",
        "Extracted Value", "Reviewed Value", "Final Value",
        "Review Status", "Confidence %", "Reviewer Comment",
        "Evidence Excerpt", "Evidence Section", "Evidence Reference",
    ])
    for r in rows:
        extracted = r["extracted_value"]; reviewed = r["reviewed_value"]
        writer.writerow([
            r["src_id"], r["src_title"], r["source_name"], r["country"], r["doc_type"], r["discovered"],
            r["reg_id"], r["reg_title"],
            r["id"], r["field_name"], r["category"],
            extracted, reviewed or "", reviewed if reviewed else extracted,
            r["status"], r["confidence"], r["comment"] or "",
            r["ev_excerpt"] or "", r["ev_section"] or "", r["ev_ref"] or "",
        ])

    output.seek(0)
    return StreamingResponse(output, media_type="text/csv; charset=utf-8",
                             headers={"Content-Disposition": "attachment; filename=regulatory-intelligence-export.csv"})
