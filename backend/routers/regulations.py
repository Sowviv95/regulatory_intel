from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection
from datetime import datetime

router = APIRouter()


def _now() -> str:
    d = datetime.now()
    return f"{d.strftime('%b')} {d.day}, 2026 {d.strftime('%H:%M')}"


def _field_dict(row) -> dict:
    return {
        "id": row["id"], "regulationId": row["regulation_id"], "sourceId": row["source_id"],
        "category": row["category"], "field": row["field_name"],
        "extractedValue": row["extracted_value"], "reviewedValue": row["reviewed_value"],
        "confidence": row["confidence"], "status": row["status"],
        "comment": row["comment"], "reviewedAt": row["reviewed_at"],
    }


def _reg_dict(row) -> dict:
    return {
        "id": row["id"], "sourceId": row["source_id"], "title": row["title"],
        "regulatoryBody": row["regulatory_body"], "jurisdiction": row["jurisdiction"],
        "topic": row["topic"], "summary": row["summary"], "status": row["status"],
        "createdAt": row["created_at"], "updatedAt": row["updated_at"],
    }


@router.get("/api/regulations")
def list_regulations(source_id: int | None = None):
    conn = get_connection()
    if source_id:
        rows = conn.execute("SELECT * FROM regulations WHERE source_id = ? ORDER BY id", (source_id,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM regulations ORDER BY id").fetchall()
    conn.close()
    return {"data": [_reg_dict(r) for r in rows]}


@router.get("/api/regulations/{reg_id}")
def get_regulation(reg_id: int):
    conn = get_connection()
    reg = conn.execute("SELECT * FROM regulations WHERE id = ?", (reg_id,)).fetchone()
    if not reg:
        conn.close(); raise HTTPException(404, f"Regulation {reg_id} not found")
    fields = conn.execute("SELECT * FROM regulation_fields WHERE regulation_id = ? ORDER BY id", (reg_id,)).fetchall()
    source = conn.execute("SELECT * FROM sources WHERE id = ?", (reg["source_id"],)).fetchone()
    # Attach evidence to each field
    field_list = []
    for f in fields:
        fd = _field_dict(f)
        ev = conn.execute("SELECT * FROM evidence WHERE field_id = ?", (f["id"],)).fetchone()
        if ev:
            fd["evidence"] = ev["excerpt"]
            fd["evidenceSection"] = ev["section"]
            fd["evidenceReference"] = ev["source_reference"]
        else:
            fd["evidence"] = ""
            fd["evidenceSection"] = None
            fd["evidenceReference"] = None
        field_list.append(fd)
    conn.close()
    d = _reg_dict(reg)
    d["fields"] = field_list
    d["sourceText"] = source["source_text"] if source else None
    d["sourceName"] = source["source_name"] if source else None
    d["flag"] = source["flag"] if source else None
    d["docType"] = source["doc_type"] if source else None
    d["country"] = source["country"] if source else None
    return {"data": d}


class RegPatch(BaseModel):
    status: str | None = None
    summary: str | None = None


@router.patch("/api/regulations/{reg_id}")
def patch_regulation(reg_id: int, body: RegPatch):
    conn = get_connection()
    reg = conn.execute("SELECT * FROM regulations WHERE id = ?", (reg_id,)).fetchone()
    if not reg:
        conn.close(); raise HTTPException(404)
    updates, params = [], []
    if body.status: updates.append("status = ?"); params.append(body.status)
    if body.summary: updates.append("summary = ?"); params.append(body.summary)
    if updates:
        updates.append("updated_at = ?"); params.append(_now()); params.append(reg_id)
        conn.execute(f"UPDATE regulations SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    updated = conn.execute("SELECT * FROM regulations WHERE id = ?", (reg_id,)).fetchone()
    conn.close()
    return {"data": _reg_dict(updated)}


# -- Field-level endpoints ---------------------------------------------------

@router.get("/api/fields/{field_id}")
def get_field(field_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM regulation_fields WHERE id = ?", (field_id,)).fetchone()
    if not row:
        conn.close(); raise HTTPException(404)
    ev = conn.execute("SELECT * FROM evidence WHERE field_id = ?", (field_id,)).fetchone()
    conn.close()
    d = _field_dict(row)
    if ev:
        d["evidence"] = {"id": ev["id"], "excerpt": ev["excerpt"], "section": ev["section"],
                         "sourceReference": ev["source_reference"], "immutable": bool(ev["immutable"])}
    return {"data": d}


class FieldPatch(BaseModel):
    status: str | None = None
    reviewedValue: str | None = None
    comment: str | None = None


@router.patch("/api/fields/{field_id}")
def patch_field(field_id: int, body: FieldPatch):
    conn = get_connection()
    row = conn.execute("SELECT * FROM regulation_fields WHERE id = ?", (field_id,)).fetchone()
    if not row:
        conn.close(); raise HTTPException(404)
    ts = _now()
    updates, params = [], []
    if body.status is not None:
        updates += ["status = ?", "reviewed_at = ?"]; params += [body.status, ts]
    if body.reviewedValue is not None:
        updates.append("reviewed_value = ?"); params.append(body.reviewedValue)
        if body.status is None:
            updates += ["status = ?", "reviewed_at = ?"]; params += ["Accepted", ts]
    if body.comment is not None:
        updates.append("comment = ?"); params.append(body.comment)
        if "reviewed_at = ?" not in updates:
            updates.append("reviewed_at = ?"); params.append(ts)
    if updates:
        decision = body.status or ("Edited" if body.reviewedValue else "Comment")
        conn.execute(
            "INSERT INTO review_decisions (field_id,decision,previous_value,new_value,comment,created_at) VALUES (?,?,?,?,?,?)",
            (field_id, decision, row["reviewed_value"] or row["extracted_value"], body.reviewedValue, body.comment, ts),
        )
        params.append(field_id)
        conn.execute(f"UPDATE regulation_fields SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    updated = conn.execute("SELECT * FROM regulation_fields WHERE id = ?", (field_id,)).fetchone()
    conn.close()
    return {"data": _field_dict(updated)}


class ReviewBody(BaseModel):
    fieldId: int
    decision: str
    newValue: str | None = None
    comment: str | None = None


@router.post("/api/fields/{field_id}/review")
def review_field(field_id: int, body: ReviewBody):
    conn = get_connection()
    row = conn.execute("SELECT * FROM regulation_fields WHERE id = ?", (field_id,)).fetchone()
    if not row:
        conn.close(); raise HTTPException(404, f"Field {field_id} not found")
    ts = _now()
    status_map = {"Accepted": "Accepted", "Rejected": "Rejected", "Flagged": "Flagged",
                  "Edited": "Accepted", "Reset": "Pending", "Comment": None}
    new_status = status_map.get(body.decision, body.decision)

    updates, params = [], []
    if new_status is not None:
        updates += ["status = ?", "reviewed_at = ?"]; params += [new_status, ts]
    if body.newValue is not None:
        updates.append("reviewed_value = ?"); params.append(body.newValue)
    if body.comment is not None:
        updates.append("comment = ?"); params.append(body.comment)
    if body.decision == "Reset":
        updates = ["status = 'Pending'", "reviewed_value = NULL", "comment = NULL", "reviewed_at = NULL"]
        params = []

    conn.execute(
        "INSERT INTO review_decisions (field_id,decision,previous_value,new_value,comment,created_at) VALUES (?,?,?,?,?,?)",
        (field_id, body.decision, row["reviewed_value"] or row["extracted_value"], body.newValue, body.comment, ts),
    )
    params.append(field_id)
    conn.execute(f"UPDATE regulation_fields SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    updated = conn.execute("SELECT * FROM regulation_fields WHERE id = ?", (field_id,)).fetchone()
    conn.close()
    return {"data": _field_dict(updated)}


# -- Compatibility routes (used by current frontend) -------------------------

@router.post("/api/regulations/{reg_id}/review")
def review_field_compat(reg_id: int, body: ReviewBody):
    """Compatibility: accepts reg_id in URL but routes to field-level review."""
    return review_field(body.fieldId, body)


@router.post("/api/regulations/{reg_id}/review/accept-all")
def accept_all_fields(reg_id: int):
    conn = get_connection()
    ts = _now()
    conn.execute(
        "UPDATE regulation_fields SET status = 'Accepted', reviewed_at = ? WHERE regulation_id = ? AND status = 'Pending'",
        (ts, reg_id),
    )
    conn.commit()
    rows = conn.execute("SELECT * FROM regulation_fields WHERE regulation_id = ? ORDER BY id", (reg_id,)).fetchall()
    conn.close()
    return {"data": [_field_dict(r) for r in rows]}
