import type { SearchableRecord, SavedView } from '../types';
import { get, downloadFile } from './api';
import { savedViews } from '../data/search';

export async function searchRecords(filters: {
  q?: string; jurisdiction?: string; category?: string;
  status?: string; confidence?: string; source?: string;
}): Promise<SearchableRecord[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.jurisdiction && filters.jurisdiction !== 'All') params.set('jurisdiction', filters.jurisdiction);
  if (filters.category && filters.category !== 'All') params.set('category', filters.category);
  if (filters.status && filters.status !== 'All') params.set('status', filters.status);
  if (filters.confidence && filters.confidence !== 'All') params.set('confidence', filters.confidence);
  if (filters.source && filters.source !== 'All') params.set('source', filters.source);
  const qs = params.toString();
  const res = await get<{ data: SearchableRecord[] }>(`/api/search${qs ? '?' + qs : ''}`);
  return res.data;
}

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

export function getUniqueJurisdictions(records: SearchableRecord[]): string[] {
  return [...new Set(records.map(r => r.jurisdiction))].sort();
}

export function getUniqueSourceTitles(records: SearchableRecord[]): string[] {
  return [...new Set(records.map(r => r.sourceTitle))].sort();
}

export function getSavedViews(): SavedView[] {
  return savedViews;
}
