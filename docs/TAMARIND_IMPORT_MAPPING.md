# Tamarind Import Mapping

**Status:** Complete
**Date:** 16 July 2026
**Sprint:** 6

---

## 1. Files Inspected

### Primary Import Source

| File | Location | Rows | Description |
|------|----------|------|-------------|
| `Merit_Tamarind Intelligence_POC_Batch 1_Sample Data_v1.0_08Apr2025.xlsx` | `tamarind/output_for_testing/` | 54 | Consolidated, QC'd structured output -- **primary import target** |

### Other Files (inspected but not imported directly)

| File | Type | Notes |
|------|------|-------|
| `Denmark_2025_Structured_Output.xlsx` | Structured output | 165 rows, Denmark only, no URL column. Subset included in Batch 1. |
| `Albania_Structured_Output_5_PDFs.xlsx` | Structured output | 5 rows, Albania only. Different column naming (snake_case). Not in Batch 1. |
| `Moldova_Structured_Output_Final.xlsx` | Structured output | 10 rows, Moldova only. Same snake_case schema as Albania. Not in Batch 1. |
| `sample_output.xlsx` | Mixed | Sheet1: 3 rows (UK, US, EU), Sheet2: transposed summary. Not in Batch 1. |
| `denmark_2025.xlsx` | Input (scraped text) | 165 raw documents with full content text. No structured extraction fields. |
| `moldova_input.xlsx` | Input (scraped text) | 100 URLs with title and content. |
| `vietnam_keywords.xlsx` | Keywords | 23 search keywords in Vietnamese. Not importable. |
| `URL_inventory.xlsx` | Tracking | Scraping inventory with URL counts per country. Metadata only. |
| `DATA POINT.docx` | Reference | Data point definitions. Empty paragraphs. |
| `Tamarind_QC_report.xlsx` | QC metrics | Model performance comparison (gpt-4o vs gpt-4o-mini). Not importable. |
| `output_for_testing/poland_output.xlsx` | Raw LLM output | 4 rows with LLM cost metadata. Poland data in Batch 1. |
| `output_for_testing/poland_output_QC_complete.xlsx` | QC'd LLM output | Same as above with QC report sheet. |
| `output_for_testing/Denmark_output_comparision.xlsx` | Comparison | Multi-prompt comparison. Analysis artifact. |
| `output_for_testing/*_LLM_as_judge*.xlsx` | QC | LLM-as-judge evaluation reports for Albania, UAE, Denmark, Finland. |
| `tamarind_estimate/*.xlsx` | Estimation | Cost estimation and scoping documents. |

### Import Decision

**Only `Merit_Tamarind Intelligence_POC_Batch 1_Sample Data_v1.0_08Apr2025.xlsx` (sheet "Batch 1 Data") will be imported.** This is the consolidated, QC-validated output representing the actual Tamarind PoC deliverable. The other structured outputs (Albania, Moldova) use a different schema and were not included in the final Batch 1 delivery.

---

## 2. Batch 1 Data Schema

Sheet: **Batch 1 Data** (54 rows, 15 columns)

| Column | Example Value | Nullable |
|--------|---------------|----------|
| `Jurisdiction name` | "Poland" | No |
| `Official name of the source` | "ACT of February 20, 2025..." | No |
| `Descriptive name` | "Amendment to the Excise Duty Act..." | No |
| `Summary of the source` | "The act introduces changes..." | No |
| `Tobacco Products impacted` | `[{'picklist_term': {'Nicotine-containing Vaping': 0.9, ...}}]` | No |
| `Sub-Product impacted` | `[{'Consumable': 0.8}, {'Device': 0.9}]` | 7 nulls |
| `Impact on sector` | "High" / "Medium" / "Low" / "Unclear" | No |
| `Comment: impact on sector` | Free text explanation | No |
| `Status` | "Proposed" / "Adopted but not in force" / "Adopted and in force" | No |
| `Type of Source` | `[{'Law': 0.9}]` or plain text "Law" | No |
| `Who proposed it?` | "Unclear" / "Executive power" / "Legislature" | No |
| `Likelihood of passing` | "High" / "Medium" / "Low" / "Unclear" | No |
| `Comment: likelihood of passing` | Free text or "'..." (with stray quote) | No |
| `Relevant dates and descripition` | Free text with embedded dates | No |
| `URL` | Full URL string | No (all 54 have URLs) |

### Jurisdictions in Batch 1

| Jurisdiction | Count |
|-------------|-------|
| Poland | 4 |
| Denmark | 9 |
| United Arab Emirates | 15 |
| Taiwan | 13 |
| South Korea | 13 |

---

## 3. Field Format Observations

### Tobacco Products Impacted

Two formats found:

**Format A (structured):** Used by Poland, UAE, some Taiwan/SK records
```python
[{'picklist_term': {'Nicotine-containing Vaping': 0.9, 'Heated Tobacco': 0.8}}]
```

**Format B (semicolon-delimited):** Used by Denmark records
```
"Nicotine-containing Vaping; Cigarettes"
```

### Sub-Product Impacted

Similar mixed formats, 7 records are null.

### Type of Source

**Format A (structured):** `[{'Law': 0.9}]`
**Format B (plain text):** `"Regulation"`, `"Law"`

### Impact on Sector / Likelihood of Passing

Sometimes plain text ("High"), sometimes a dict:
```python
{'High': 'Explanation text here...'}
```
The Batch 1 data normalises these to plain text with separate comment columns.

### Relevant Dates

Free text with inconsistent date formats. Examples:
- "Release Date: 05/03/2025"
- "The act is set to apply from July 1, 2025, for..."
- "Effective Date: 2012-05-24"

No structured date fields exist.

---

## 4. Mapping to Database Schema

### Source: `sources` table

Each Tamarind record becomes one source. The URL is the stable import key.

| Tamarind Column | DB Column | Transform |
|----------------|-----------|-----------|
| `URL` | `id` (auto) | Auto-increment; URL stored for dedup |
| `Jurisdiction name` | `country` | Direct |
| `Jurisdiction name` | `flag` | Lookup from country-to-flag map |
| `Official name of the source` | `source_name` | Direct |
| `Descriptive name` | `title` | Direct |
| (inferred from jurisdiction) | `language` | Map: Taiwan->ZH-TW, SK->KO, UAE->AR, Denmark->DA, Poland->PL |
| `Type of Source` | `doc_type` | Parse structured format, extract label |
| (not in Tamarind) | `discovered` | Use file date or import date |
| `Status` | `status` | Map to app status (see below) |
| (derived) | `stage` | "Analyst Review" (all imported = Ready for Review) |
| `URL` | (new column: `external_url`) | Preserved for dedup and traceability |

**New column needed:** `external_url TEXT` on `sources` table, and `origin TEXT DEFAULT 'seed'` to distinguish demo seed data from imported Tamarind data.

### Status Mapping (Tamarind -> App)

| Tamarind Status | App Status | App Stage |
|----------------|------------|-----------|
| "Proposed" | "Ready for Review" | "Analyst Review" |
| "Adopted but not in force" | "Ready for Review" | "Analyst Review" |
| "Adopted and in force" | "Ready for Review" | "Analyst Review" |
| (any other) | "Ready for Review" | "Analyst Review" |

All Tamarind records have completed extraction and are ready for analyst review.

### Regulation: `regulations` table

Each Tamarind record becomes one regulation linked to its source.

| Tamarind Column | DB Column | Transform |
|----------------|-----------|-----------|
| `Descriptive name` | `title` | Direct |
| `Official name of the source` | `regulatory_body` | Direct |
| `Jurisdiction name` | `jurisdiction` | Direct |
| (derived from products) | `topic` | Derive from Tobacco Products Impacted |
| `Summary of the source` | `summary` | Direct |
| "Pending" | `status` | Default "Pending" for review |

### Regulation Fields: `regulation_fields` table

Each Tamarind record produces **12 fields** mapped from its columns:

| Field Name | Category | Tamarind Column | Confidence Source |
|-----------|----------|-----------------|-------------------|
| Jurisdiction | Metadata | `Jurisdiction name` | 99 (direct match) |
| Source Name | Metadata | `Official name of the source` | 97 |
| Source Type | Metadata | `Type of Source` | Parse relevance or default 90 |
| Proposer | Metadata | `Who proposed it?` | 90 |
| Title | Content | `Descriptive name` | 95 |
| Summary | Content | `Summary of the source` | 85 |
| Products Impacted | Content | `Tobacco Products impacted` | Parse relevance scores |
| Sector Impact | Assessment | `Impact on sector` | Parse or default 80 |
| Likelihood | Assessment | `Likelihood of passing` | Parse or default 75 |
| Status | Assessment | `Status` | 85 |
| Dates | Dates | `Relevant dates and descripition` | 80 |
| Source URL | Metadata | `URL` | 99 |

### Evidence: `evidence` table

Each field gets one evidence record. Evidence is derived from the Tamarind extraction context:

| DB Column | Source |
|-----------|--------|
| `excerpt` | The Tamarind column value itself serves as the evidence (extracted from source document) |
| `section` | Derived from field category/name |
| `source_reference` | URL from `URL` column |
| `page_number` | NULL (not available in Batch 1) |
| `immutable` | 1 (always) |

**Note:** The Tamarind Batch 1 output does not include separate evidence excerpts or source text passages. The extracted values themselves serve as the evidence of extraction. For fields like "Summary" and "Products Impacted", the impact/likelihood comment columns provide additional context that can be stored as evidence excerpts.

---

## 5. Stable Import Keys

| Entity | Import Key | Uniqueness |
|--------|-----------|------------|
| Source | `external_url` | Unique per source; URL is the document identifier |
| Regulation | `source_id` + `title` | One regulation per source in Batch 1 |
| Field | `regulation_id` + `field_name` | Unique per regulation |
| Evidence | `field_id` | One evidence record per field |

---

## 6. Deduplication Rules

1. **Source dedup:** Match on `external_url`. If a source with the same URL exists, skip insert (or update non-review fields if `--update` flag is set).
2. **Regulation dedup:** Match on `source_id` + regulation `title`. Skip if exists.
3. **Field dedup:** Match on `regulation_id` + `field_name`. Skip if exists and has been reviewed (`status != 'Pending'` or `reviewed_value IS NOT NULL`).
4. **Evidence dedup:** Match on `field_id`. Skip if exists (evidence is immutable).

---

## 7. Null/Default Handling

| Field | Default When Null |
|-------|-------------------|
| `Sub-Product impacted` | Empty string |
| `flag` | Lookup from jurisdiction, fallback to flag emoji for country |
| `language` | Infer from jurisdiction |
| `discovered` | Import date |
| `confidence` | Field-specific defaults (see field mapping table) |
| `Comment: impact on sector` | Empty string |
| `Comment: likelihood of passing` | Empty string |

---

## 8. Evidence Traceability

- Every imported field links to one evidence record
- Evidence excerpt = the relevant Tamarind column value (the extraction result itself)
- For assessment fields (Sector Impact, Likelihood), the comment column provides the evidence text
- `source_reference` = the source URL
- Evidence records are immutable after creation
- No page numbers available in Batch 1 (page_number = NULL)

---

## 9. Assumptions

1. **One regulation per source:** Each row in Batch 1 represents one regulatory document yielding one regulation. This matches the current 1:1 source-to-regulation pattern in the demo data.
2. **URL uniqueness:** Each URL identifies a unique regulatory source document.
3. **No source text:** Batch 1 does not include original document text. The `source_text` column will be NULL for imported records (unlike the Taiwan demo source which has full Chinese text).
4. **Confidence scores:** The Batch 1 data includes relevance scores in the products/type fields but not explicit confidence percentages for each extracted field. Default confidence values are assigned per field type.
5. **Dates:** The "Relevant dates and descripition" column is free text and cannot be reliably parsed into structured date fields. It will be stored as a single "Dates" field value.
6. **Products parsing:** The mixed format (dict vs semicolon) requires a parser that handles both formats and extracts product labels.

---

## 10. Unresolved Ambiguities

1. **Albania and Moldova data:** These files (15 total records) use a different schema (snake_case columns) and were not included in Batch 1. They could be imported separately with a schema adapter, but this is deferred unless requested.
2. **Denmark Structured Output (165 rows):** Much larger dataset but overlaps with the 9 Denmark records in Batch 1. No URL column makes dedup with Batch 1 uncertain. Deferred.
3. **Stray quotes:** Some `Comment: likelihood of passing` values start with a single quote `'`. These will be stripped during import.

---

## 11. Records That Cannot Safely Be Imported

None. All 54 records in Batch 1 have complete required fields (jurisdiction, source name, title, summary, products, status, URL).

---

## 12. Schema Changes Required

Add two columns to `sources` table:
```sql
ALTER TABLE sources ADD COLUMN external_url TEXT;
ALTER TABLE sources ADD COLUMN origin TEXT NOT NULL DEFAULT 'seed';
```

Add one column to `regulations` table:
```sql
ALTER TABLE regulations ADD COLUMN origin TEXT NOT NULL DEFAULT 'seed';
```

These columns enable:
- Deduplication on re-import (external_url)
- Distinguishing demo seed data from imported Tamarind data (origin = 'seed' vs 'tamarind')
