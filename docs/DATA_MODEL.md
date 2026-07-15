# Data Model -- Regulatory Intelligence PoC

**Status:** Conceptual draft
**Date:** 15 July 2026
**Sprint:** 0

---

This document defines the initial conceptual entities for the Regulatory Intelligence PoC. No database has been created yet. These entities are derived from the existing UI screens and mock data.

## Entity Relationship Overview

```
Source (1) ----< (many) Regulation
Regulation (1) ----< (many) RegulatoryField
RegulatoryField (1) ----< (many) Evidence
RegulatoryField (1) ----< (many) ReviewDecision
Regulation (1) ----< (many) ReviewComment
ExportJob (standalone, references filter criteria)
```

---

## 1. Source

**Purpose:** Represents a regulatory source document discovered from a government or institutional publisher.

| Field            | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| id               | integer   | Primary key                                      |
| country          | string    | Jurisdiction country name                        |
| country_code     | string    | ISO country code (e.g., TW, KR, DK)             |
| flag_emoji       | string    | Country flag emoji for display                   |
| source_name      | string    | Publishing body (e.g., "Health Promotion Administration") |
| language         | string    | Original document language code (e.g., ZH-TW, KO) |
| doc_type         | string    | Document type classification                     |
| discovered_date  | date      | Date the document was first discovered           |
| status           | string    | Processing status (see below)                    |
| processing_stage | string    | Current pipeline stage (see below)               |
| source_text      | text      | Full original document text (if available)       |
| created_at       | timestamp | Record creation time                             |
| updated_at       | timestamp | Last update time                                 |

**Status values:** `New`, `Processing`, `Ready for Review`, `Irrelevant`

**Processing stage values:** `Awaiting Extraction`, `Translating`, `AI Extraction`, `Quality Check`, `Analyst Review`, `Discarded`

---

## 2. Regulation

**Purpose:** Represents a regulatory item extracted from a source document. A single source may yield one or more regulations.

| Field            | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| id               | integer   | Primary key                                      |
| source_id        | integer   | Foreign key to Source                             |
| title            | string    | Regulation title (English)                       |
| summary          | text      | Summary of the regulation                        |
| jurisdiction     | string    | Country or jurisdiction name                     |
| products         | string[]  | List of impacted product types                   |
| source_type      | string    | Type of regulatory instrument                    |
| proposer         | string    | Proposing body or authority                      |
| sector_impact    | string    | Impact level (see below)                         |
| likelihood       | string    | Likelihood of enactment                          |
| status           | string    | Review status (see below)                        |
| effective_date   | date      | Expected or confirmed effective date             |
| notice_date      | date      | Date the regulation was published/announced      |
| comment_deadline | date      | Public comment deadline (if applicable)          |
| created_at       | timestamp | Record creation time                             |
| updated_at       | timestamp | Last update time                                 |

**Sector impact values:** `Low`, `Medium`, `High`, `Critical`

**Likelihood values:** `Speculative`, `Likely`, `Probable`, `Confirmed`

**Status values:** `New`, `Processing`, `Ready for Review`, `Approved`, `Published`, `Irrelevant`

---

## 3. RegulatoryField

**Purpose:** Represents a single extracted data field for a regulation, with its value, category, and review status.

| Field         | Type      | Description                                      |
|---------------|-----------|--------------------------------------------------|
| id            | integer   | Primary key                                      |
| regulation_id | integer   | Foreign key to Regulation                        |
| category      | string    | Field category (see below)                       |
| field_name    | string    | Field label (e.g., "Title", "Summary", "Sector Impact") |
| value         | text      | Extracted or analyst-edited value                |
| confidence    | float     | Extraction confidence score (0.0 to 1.0)        |
| status        | string    | Field review status (see below)                  |
| created_at    | timestamp | Record creation time                             |
| updated_at    | timestamp | Last update time                                 |

**Category values:** `Metadata`, `Content`, `Assessment`, `Dates`

**Status values:** `Pending`, `Accepted`, `Flagged`

---

## 4. Evidence

**Purpose:** Links an extracted field to the specific source text that supports it. Evidence records are immutable once imported.

| Field            | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| id               | integer   | Primary key                                      |
| field_id         | integer   | Foreign key to RegulatoryField                   |
| source_text      | text      | Excerpt from original document                   |
| translated_text  | text      | English translation of the excerpt (if applicable) |
| line_reference   | string    | Line range in source document (e.g., "Lines 12-16") |
| confidence       | float     | Extraction confidence for this evidence link     |
| created_at       | timestamp | Record creation time                             |

**Note:** Evidence records are created during Tamarind output import and are not edited by analysts. They serve as the audit trail for traceability.

---

## 5. ReviewDecision

**Purpose:** Records an analyst's decision on a specific extracted field. Decisions are additive (not overwrites) to maintain audit history.

| Field         | Type      | Description                                      |
|---------------|-----------|--------------------------------------------------|
| id            | integer   | Primary key                                      |
| field_id      | integer   | Foreign key to RegulatoryField                   |
| decision      | string    | Decision type (see below)                        |
| previous_value| text      | Field value before edit (if edited)              |
| new_value     | text      | Field value after edit (if edited)               |
| reviewer      | string    | Name or identifier of the reviewer               |
| comment       | text      | Optional reviewer comment                        |
| created_at    | timestamp | Decision timestamp                               |

**Decision values:** `Accepted`, `Flagged`, `Edited`, `Reset`

---

## 6. ReviewComment

**Purpose:** Free-form comments attached to a regulation by analysts during the review process.

| Field          | Type      | Description                                      |
|----------------|-----------|--------------------------------------------------|
| id             | integer   | Primary key                                      |
| regulation_id  | integer   | Foreign key to Regulation                        |
| author         | string    | Comment author name                              |
| content        | text      | Comment text                                     |
| created_at     | timestamp | Comment timestamp                                |

**Note:** The current UI does not have a comment panel, but this entity is included to support the review workflow. **Assumption:** Comments will be added in a future sprint if needed.

---

## 7. ExportJob

**Purpose:** Tracks export requests initiated by analysts from the Intelligence Library.

| Field          | Type      | Description                                      |
|----------------|-----------|--------------------------------------------------|
| id             | integer   | Primary key                                      |
| format         | string    | Export format (see below)                        |
| filter_criteria| json      | Serialised filter state at time of export        |
| record_count   | integer   | Number of records included in the export         |
| status         | string    | Job status (see below)                           |
| file_path      | string    | Path to generated export file (if completed)     |
| requested_by   | string    | Requesting user                                  |
| created_at     | timestamp | Request timestamp                                |
| completed_at   | timestamp | Completion timestamp (if applicable)             |

**Format values:** `CSV`, `Excel`

**Status values:** `Pending`, `Processing`, `Completed`, `Failed`
