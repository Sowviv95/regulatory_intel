from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection
from datetime import datetime

router = APIRouter()


def _now() -> str:
    d = datetime.now()
    return f"{d.strftime('%b')} {d.day}, 2026 {d.strftime('%H:%M')}"


def _source_dict(row) -> dict:
    return {
        "id": row["id"], "flag": row["flag"], "country": row["country"],
        "source": row["source_name"], "title": row["title"], "language": row["language"],
        "docType": row["doc_type"], "discovered": row["discovered"],
        "status": row["status"], "stage": row["stage"],
        "startedAt": row["started_at"], "completedAt": row["completed_at"],
        "failureMessage": row["failure_message"], "sourceText": row["source_text"],
    }


def _reg_dict(row) -> dict:
    return {
        "id": row["id"], "sourceId": row["source_id"], "title": row["title"],
        "regulatoryBody": row["regulatory_body"], "jurisdiction": row["jurisdiction"],
        "topic": row["topic"], "summary": row["summary"], "status": row["status"],
        "createdAt": row["created_at"], "updatedAt": row["updated_at"],
    }


@router.get("/api/sources")
def list_sources(status: str | None = None, country: str | None = None,
                 doc_type: str | None = None, q: str | None = None):
    conn = get_connection()
    sql = "SELECT * FROM sources WHERE 1=1"
    params: list = []
    if status and status != "All":
        sql += " AND status = ?"; params.append(status)
    if country and country != "All":
        sql += " AND country = ?"; params.append(country)
    if doc_type and doc_type != "All":
        sql += " AND doc_type = ?"; params.append(doc_type)
    if q:
        sql += " AND (title LIKE ? OR source_name LIKE ? OR country LIKE ? OR doc_type LIKE ? OR language LIKE ?)"
        params.extend([f"%{q}%"] * 5)
    sql += " ORDER BY id"
    rows = conn.execute(sql, params).fetchall()

    # Attach regulation/field counts
    results = []
    for r in rows:
        d = _source_dict(r)
        reg_count = conn.execute("SELECT COUNT(*) FROM regulations WHERE source_id = ?", (r["id"],)).fetchone()[0]
        review_count = conn.execute(
            "SELECT COUNT(*) FROM regulation_fields WHERE source_id = ? AND status = 'Pending'", (r["id"],)
        ).fetchone()[0]
        d["regulationCount"] = reg_count
        d["reviewRequiredCount"] = review_count
        results.append(d)
    conn.close()
    return {"data": results}


@router.get("/api/sources/{source_id}")
def get_source(source_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM sources WHERE id = ?", (source_id,)).fetchone()
    if not row:
        conn.close(); raise HTTPException(404, f"Source {source_id} not found")
    d = _source_dict(row)
    d["regulationCount"] = conn.execute("SELECT COUNT(*) FROM regulations WHERE source_id = ?", (source_id,)).fetchone()[0]
    d["reviewRequiredCount"] = conn.execute("SELECT COUNT(*) FROM regulation_fields WHERE source_id = ? AND status = 'Pending'", (source_id,)).fetchone()[0]
    conn.close()
    return {"data": d}


class SourcePatch(BaseModel):
    status: str | None = None
    stage: str | None = None


@router.patch("/api/sources/{source_id}")
def patch_source(source_id: int, body: SourcePatch):
    conn = get_connection()
    row = conn.execute("SELECT * FROM sources WHERE id = ?", (source_id,)).fetchone()
    if not row:
        conn.close(); raise HTTPException(404, f"Source {source_id} not found")
    updates, params = [], []
    if body.status is not None:
        updates.append("status = ?"); params.append(body.status)
        if body.status == "Processing" and not row["started_at"]:
            updates.append("started_at = ?"); params.append(_now())
        if body.status == "Ready for Review":
            updates.append("completed_at = ?"); params.append(_now())
    if body.stage is not None:
        updates.append("stage = ?"); params.append(body.stage)
    if updates:
        params.append(source_id)
        conn.execute(f"UPDATE sources SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    updated = conn.execute("SELECT * FROM sources WHERE id = ?", (source_id,)).fetchone()
    d = _source_dict(updated)
    d["regulationCount"] = conn.execute("SELECT COUNT(*) FROM regulations WHERE source_id = ?", (source_id,)).fetchone()[0]
    d["reviewRequiredCount"] = conn.execute("SELECT COUNT(*) FROM regulation_fields WHERE source_id = ? AND status = 'Pending'", (source_id,)).fetchone()[0]
    conn.close()
    return {"data": d}


@router.get("/api/sources/{source_id}/regulations")
def get_source_regulations(source_id: int):
    """Returns regulation records for a source (not raw fields)."""
    conn = get_connection()
    src = conn.execute("SELECT id FROM sources WHERE id = ?", (source_id,)).fetchone()
    if not src:
        conn.close(); raise HTTPException(404, f"Source {source_id} not found")
    rows = conn.execute("SELECT * FROM regulations WHERE source_id = ? ORDER BY id", (source_id,)).fetchall()
    conn.close()
    return {"data": [_reg_dict(r) for r in rows]}
