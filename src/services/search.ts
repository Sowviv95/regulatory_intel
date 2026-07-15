import type { SearchableRecord, SavedView, FieldStatus } from '../types';
import { savedViews } from '../data/search';
import { getReviewSources, getFieldsForSource } from './regulations';

// ---------------------------------------------------------------------------
// Build searchable records from live review data
// ---------------------------------------------------------------------------

export function getAllSearchableRecords(): SearchableRecord[] {
  const sources = getReviewSources();
  const records: SearchableRecord[] = [];
  for (const src of sources) {
    const fields = getFieldsForSource(src.id);
    for (const f of fields) {
      records.push({
        sourceId: src.id,
        sourceTitle: src.title,
        sourceName: src.sourceName,
        flag: src.flag,
        jurisdiction: src.country,
        docType: src.docType,
        date: src.date,
        fieldId: f.id,
        fieldName: f.field,
        category: f.category,
        extractedValue: f.extractedValue,
        reviewedValue: f.reviewedValue,
        finalValue: f.reviewedValue ?? f.extractedValue,
        evidence: f.evidence,
        confidence: f.confidence,
        status: f.status,
        comment: f.comment,
      });
    }
  }
  return records;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface SearchFilters {
  q?: string;
  jurisdiction?: string;
  category?: string;
  status?: string;
  confidence?: string;
  source?: string;
  sortBy?: 'jurisdiction' | 'fieldName' | 'confidence' | 'status' | 'date';
  sortDir?: 'asc' | 'desc';
}

export function searchRecords(filters: SearchFilters): SearchableRecord[] {
  let results = getAllSearchableRecords();

  // Text search
  const q = (filters.q ?? '').toLowerCase();
  if (q) {
    results = results.filter(r =>
      r.sourceTitle.toLowerCase().includes(q) ||
      r.sourceName.toLowerCase().includes(q) ||
      r.jurisdiction.toLowerCase().includes(q) ||
      r.fieldName.toLowerCase().includes(q) ||
      r.extractedValue.toLowerCase().includes(q) ||
      (r.reviewedValue?.toLowerCase().includes(q) ?? false) ||
      (r.comment?.toLowerCase().includes(q) ?? false) ||
      r.evidence.toLowerCase().includes(q) ||
      r.docType.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q),
    );
  }

  // Jurisdiction
  if (filters.jurisdiction && filters.jurisdiction !== 'All') {
    results = results.filter(r => r.jurisdiction === filters.jurisdiction);
  }

  // Category (topic)
  if (filters.category && filters.category !== 'All') {
    results = results.filter(r => r.category === filters.category);
  }

  // Review status
  if (filters.status && filters.status !== 'All') {
    results = results.filter(r => r.status === filters.status);
  }

  // Confidence level
  if (filters.confidence && filters.confidence !== 'All') {
    if (filters.confidence === 'High')   results = results.filter(r => r.confidence >= 90);
    if (filters.confidence === 'Medium') results = results.filter(r => r.confidence >= 75 && r.confidence < 90);
    if (filters.confidence === 'Low')    results = results.filter(r => r.confidence < 75);
  }

  // Source
  if (filters.source && filters.source !== 'All') {
    results = results.filter(r => r.sourceTitle === filters.source);
  }

  // Sort
  if (filters.sortBy) {
    const dir = filters.sortDir === 'desc' ? -1 : 1;
    results = [...results].sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (filters.sortBy) {
        case 'confidence': av = a.confidence; bv = b.confidence; break;
        case 'jurisdiction': av = a.jurisdiction; bv = b.jurisdiction; break;
        case 'fieldName': av = a.fieldName; bv = b.fieldName; break;
        case 'status': av = a.status; bv = b.status; break;
        case 'date': av = a.date; bv = b.date; break;
        default: av = ''; bv = '';
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Aggregates for export summary
// ---------------------------------------------------------------------------

export function getExportSummary(records: SearchableRecord[]) {
  return {
    total: records.length,
    accepted: records.filter(r => r.status === 'Accepted').length,
    rejected: records.filter(r => r.status === 'Rejected').length,
    flagged: records.filter(r => r.status === 'Flagged').length,
    pending: records.filter(r => r.status === 'Pending').length,
    missingEvidence: records.filter(r => !r.evidence).length,
    sources: new Set(records.map(r => r.sourceId)).size,
  };
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export function generateCsv(records: SearchableRecord[]): string {
  const headers = [
    'Source ID', 'Source Title', 'Regulatory Body', 'Jurisdiction', 'Document Type', 'Date',
    'Field ID', 'Field Name', 'Category',
    'Extracted Value', 'Reviewed Value', 'Final Value',
    'Review Status', 'Confidence %', 'Reviewer Comment', 'Evidence Reference',
  ];
  const escape = (v: string) => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const rows = records.map(r => [
    String(r.sourceId), escape(r.sourceTitle), escape(r.sourceName), r.jurisdiction, escape(r.docType), r.date,
    String(r.fieldId), r.fieldName, r.category,
    escape(r.extractedValue), escape(r.reviewedValue ?? ''), escape(r.finalValue),
    r.status, String(r.confidence), escape(r.comment ?? ''), escape(r.evidence),
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Filter option helpers
// ---------------------------------------------------------------------------

export function getUniqueJurisdictions(): string[] {
  return [...new Set(getReviewSources().map(s => s.country))].sort();
}

export function getUniqueSourceTitles(): string[] {
  return getReviewSources().map(s => s.title);
}

// ---------------------------------------------------------------------------
// Saved views (UI-only, static)
// ---------------------------------------------------------------------------

export function getSavedViews(): SavedView[] {
  return savedViews;
}
