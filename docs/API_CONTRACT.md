# API Contract -- Regulatory Intelligence PoC

**Status:** Implemented (Sprint 5)
**Date:** 16 July 2026

Note: The schema now includes a `regulations` table between sources and fields, and a dedicated `evidence` table. Field-level review uses `/api/fields/{id}` endpoints. Compatibility routes at `/api/regulations/{id}/review` are retained.

---

All endpoints return JSON. The base URL is `http://localhost:8000`.

## Common Response Patterns

**Success:** `{ "data": ... }` with HTTP 200/201
**Error:** `{ "error": { "code": "...", "message": "..." } }` with appropriate HTTP status
**Pagination:** `{ "data": [...], "total": 42, "page": 1, "page_size": 20 }`

---

## Endpoints

### GET /api/health

**Purpose:** Health check for the backend service.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "database": "connected"
}
```

**Error cases:** 503 if database is unavailable.

---

### GET /api/dashboard

**Purpose:** Return comprehensive aggregated metrics for the dashboard screen. All values are computed from live database data.

**Response:**
```json
{
  "data": {
    "kpis": [
      { "label": "Total Sources", "value": "66", "delta": "54 imported", "up": true, "sub": "Across 8 jurisdictions", "nav": "/sources" }
    ],
    "stats": {
      "totalSources": 66, "newSources": 4, "processingSources": 4,
      "reviewSources": 3, "irrelevantSources": 1, "tamarindSources": 54,
      "totalRegulations": 60, "totalFields": 726,
      "pendingFields": 700, "acceptedFields": 10, "rejectedFields": 3, "flaggedFields": 5,
      "lowConfidenceFields": 42, "reviewRate": 2.5, "evidenceCoverage": 100.0,
      "fieldsWithEvidence": 726
    },
    "jurisdictions": [
      { "country": "Taiwan", "flag": "...", "total": 14, "covered": 1, "pending": 13, "high": 5 }
    ],
    "alerts": [
      { "id": 66, "flag": "...", "country": "Taiwan", "title": "...", "date": "Jul 16, 2026", "impact": "High", "status": "Ready for Review" }
    ],
    "recentActivity": [
      { "decision": "Accepted", "createdAt": "Jul 16, 2026 10:00", "fieldName": "Title", "sourceTitle": "...", "country": "Taiwan", "comment": null }
    ],
    "oldestPending": [
      { "id": 1, "flag": "...", "country": "Taiwan", "title": "...", "discovered": "Jul 14, 2026", "status": "New" }
    ]
  }
}
```

**Error cases:** 500 on database query failure.

---

### GET /api/sources

**Purpose:** List all source documents, optionally filtered.

**Query parameters:**
| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| status    | string | No       | Filter by status (New, Processing, etc.) |
| country   | string | No       | Filter by country name                   |
| page      | int    | No       | Page number (default: 1)                 |
| page_size | int    | No       | Results per page (default: 20)           |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "country": "Taiwan",
      "country_code": "TW",
      "flag_emoji": "...",
      "source_name": "Health Promotion Administration",
      "language": "ZH-TW",
      "doc_type": "Legislative Amendment",
      "discovered_date": "2026-07-14",
      "status": "New",
      "processing_stage": "Awaiting Extraction"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 20
}
```

**Error cases:** 400 for invalid filter values.

---

### GET /api/sources/{id}

**Purpose:** Get a single source document with full text.

**Path parameters:** `id` (integer) -- Source ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "country": "Taiwan",
    "country_code": "TW",
    "flag_emoji": "...",
    "source_name": "Health Promotion Administration",
    "language": "ZH-TW",
    "doc_type": "Legislative Amendment",
    "discovered_date": "2026-07-14",
    "status": "Ready for Review",
    "processing_stage": "Analyst Review",
    "source_text": "..."
  }
}
```

**Error cases:** 404 if source not found.

---

### GET /api/sources/{id}/regulations

**Purpose:** List regulations extracted from a specific source.

**Path parameters:** `id` (integer) -- Source ID

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "source_id": 1,
      "title": "Tobacco Hazards Prevention Act Amendment 2026",
      "jurisdiction": "Taiwan",
      "status": "Ready for Review",
      "sector_impact": "High",
      "effective_date": "2027-01-01"
    }
  ]
}
```

**Error cases:** 404 if source not found.

---

### GET /api/regulations

**Purpose:** List all regulations, optionally filtered. Used by the Intelligence Library.

**Query parameters:**
| Parameter    | Type   | Required | Description                              |
|--------------|--------|----------|------------------------------------------|
| q            | string | No       | Full-text search query                   |
| jurisdiction | string | No       | Filter by jurisdiction                   |
| product      | string | No       | Filter by product type                   |
| status       | string | No       | Filter by status                         |
| impact       | string | No       | Filter by sector impact level            |
| source_type  | string | No       | Filter by source type                    |
| date_from    | date   | No       | Filter by date range start               |
| date_to      | date   | No       | Filter by date range end                 |
| page         | int    | No       | Page number (default: 1)                 |
| page_size    | int    | No       | Results per page (default: 20)           |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "flag_emoji": "...",
      "jurisdiction": "Taiwan",
      "title": "Tobacco Hazards Prevention Act Amendment 2026",
      "products": ["E-cigarettes", "HTP"],
      "status": "Approved",
      "impact": "High",
      "source_type": "Legislative Amendment",
      "date": "2026-07-14"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

**Error cases:** 400 for invalid filter values.

---

### GET /api/regulations/{id}

**Purpose:** Get a single regulation with all extracted fields.

**Path parameters:** `id` (integer) -- Regulation ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "source_id": 1,
    "title": "Tobacco Hazards Prevention Act Amendment 2026",
    "summary": "...",
    "jurisdiction": "Taiwan",
    "flag_emoji": "...",
    "products": ["E-cigarettes", "Heated Tobacco Products"],
    "source_type": "Legislative Amendment",
    "proposer": "Ministry of Health and Welfare",
    "sector_impact": "High",
    "likelihood": "Confirmed",
    "status": "Ready for Review",
    "effective_date": "2027-01-01",
    "notice_date": "2026-07-14",
    "comment_deadline": "2026-09-30",
    "fields": [
      {
        "id": 1,
        "category": "Content",
        "field_name": "Title",
        "value": "Tobacco Hazards Prevention Act Amendment 2026",
        "confidence": 0.95,
        "status": "Pending",
        "evidence": {
          "id": 1,
          "source_text": "...",
          "translated_text": "...",
          "line_reference": "Lines 3-5",
          "confidence": 0.95
        }
      }
    ]
  }
}
```

**Error cases:** 404 if regulation not found.

---

### PATCH /api/regulations/{id}

**Purpose:** Update a regulation's top-level fields (e.g., status, summary edits).

**Path parameters:** `id` (integer) -- Regulation ID

**Request body:**
```json
{
  "status": "Approved",
  "summary": "Updated summary text..."
}
```

Only provided fields are updated. Omitted fields are not changed.

**Response:**
```json
{
  "data": {
    "id": 1,
    "status": "Approved",
    "updated_at": "2026-07-15T10:30:00Z"
  }
}
```

**Error cases:**
- 404 if regulation not found
- 400 if invalid status transition
- 422 if validation fails

---

### POST /api/regulations/{id}/review

**Purpose:** Submit a review decision for a specific field within a regulation.

**Path parameters:** `id` (integer) -- Regulation ID

**Request body:**
```json
{
  "field_id": 6,
  "decision": "Accepted",
  "new_value": null,
  "comment": "Value matches source document."
}
```

For edits:
```json
{
  "field_id": 6,
  "decision": "Edited",
  "new_value": "Updated extracted value",
  "comment": "Corrected translation error."
}
```

**Response:**
```json
{
  "data": {
    "review_id": 42,
    "field_id": 6,
    "decision": "Accepted",
    "field_status": "Accepted",
    "created_at": "2026-07-15T10:35:00Z"
  }
}
```

**Error cases:**
- 404 if regulation or field not found
- 400 if invalid decision value
- 422 if field_id does not belong to the regulation

---

### GET /api/evidence/{id}

**Purpose:** Get a single evidence record with full details.

**Path parameters:** `id` (integer) -- Evidence ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "field_id": 6,
    "source_text": "...",
    "translated_text": "...",
    "line_reference": "Lines 12-16",
    "confidence": 0.87,
    "field": {
      "id": 6,
      "field_name": "Summary",
      "category": "Content",
      "value": "..."
    },
    "regulation": {
      "id": 1,
      "title": "Tobacco Hazards Prevention Act Amendment 2026"
    }
  }
}
```

**Error cases:** 404 if evidence not found.

---

### GET /api/search

**Purpose:** Full-text search across regulations. Supports the same filters as GET /api/regulations but optimised for search relevance.

**Query parameters:**
| Parameter    | Type   | Required | Description                              |
|--------------|--------|----------|------------------------------------------|
| q            | string | Yes      | Search query                             |
| jurisdiction | string | No       | Filter by jurisdiction                   |
| product      | string | No       | Filter by product type                   |
| status       | string | No       | Filter by status                         |
| impact       | string | No       | Filter by sector impact                  |
| page         | int    | No       | Page number (default: 1)                 |
| page_size    | int    | No       | Results per page (default: 20)           |

**Response:** Same shape as GET /api/regulations, with results ordered by relevance.

**Error cases:** 400 if `q` is missing or empty.

---

### POST /api/exports

**Purpose:** Request an export of regulation records matching specified filters.

**Request body:**
```json
{
  "format": "Excel",
  "filters": {
    "jurisdiction": "Taiwan",
    "status": "Approved",
    "impact": "High"
  },
  "record_ids": [1, 3, 6],
  "include_evidence": true
}
```

Either `filters` or `record_ids` may be provided. If `record_ids` is provided, it takes precedence.

**Response:**
```json
{
  "data": {
    "export_id": 7,
    "format": "Excel",
    "record_count": 3,
    "status": "Completed",
    "download_url": "/api/exports/7/download"
  }
}
```

**Error cases:**
- 400 if format is not CSV or Excel
- 400 if no records match the criteria
- 500 if export generation fails

**Download endpoint:** `GET /api/exports/{id}/download` returns the generated file as a binary download with appropriate Content-Type header.
