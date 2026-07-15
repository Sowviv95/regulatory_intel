import type { Source, SourceStatus, ProcessingStage } from '../types';
import { sources as initialSources } from '../data/sources';

// ---------------------------------------------------------------------------
// In-memory mutable store.  Persists across navigations within a session.
// Will be replaced by API calls in Sprint 5.
// ---------------------------------------------------------------------------

let rows: Source[] = initialSources.map(s => ({ ...s }));

function now(): string {
  const d = new Date();
  const mon = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${mon} ${day}, 2026 ${h}:${m}`;
}

// -- Reads ------------------------------------------------------------------

export function getSources(): Source[] {
  return rows;
}

export function getSourceById(id: number): Source | undefined {
  return rows.find(r => r.id === id);
}

export interface SourceFilters {
  q?: string;
  status?: SourceStatus | 'All';
  country?: string;
  docType?: string;
  sortBy?: 'discovered' | 'country' | 'source' | 'status';
  sortDir?: 'asc' | 'desc';
}

export function getFilteredSources(filters: SourceFilters): Source[] {
  let result = rows;

  // Text search
  const q = (filters.q ?? '').toLowerCase();
  if (q) {
    result = result.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.source.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.docType.toLowerCase().includes(q) ||
      r.language.toLowerCase().includes(q),
    );
  }

  // Status filter
  if (filters.status && filters.status !== 'All') {
    result = result.filter(r => r.status === filters.status);
  }

  // Country filter
  if (filters.country && filters.country !== 'All') {
    result = result.filter(r => r.country === filters.country);
  }

  // DocType filter
  if (filters.docType && filters.docType !== 'All') {
    result = result.filter(r => r.docType === filters.docType);
  }

  // Sort
  if (filters.sortBy) {
    const dir = filters.sortDir === 'desc' ? -1 : 1;
    result = [...result].sort((a, b) => {
      const av = a[filters.sortBy!];
      const bv = b[filters.sortBy!];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  return result;
}

export function getSourceCountsByStatus(): Record<SourceStatus, number> {
  const counts: Record<SourceStatus, number> = {
    'New': 0,
    'Processing': 0,
    'Ready for Review': 0,
    'Irrelevant': 0,
  };
  for (const r of rows) counts[r.status]++;
  return counts;
}

export function getUniqueCountries(): string[] {
  return [...new Set(rows.map(r => r.country))].sort();
}

export function getUniqueDocTypes(): string[] {
  return [...new Set(rows.map(r => r.docType))].sort();
}

// -- Writes -----------------------------------------------------------------

export function updateSourceStatus(
  id: number,
  status: SourceStatus,
  stage: ProcessingStage,
): void {
  rows = rows.map(r => {
    if (r.id !== id) return r;
    const updated = { ...r, status, stage };
    if (status === 'Processing' && !r.startedAt) updated.startedAt = now();
    if (status === 'Ready for Review') updated.completedAt = now();
    if (status === 'Irrelevant') updated.failureMessage = null;
    return updated;
  });
}

export function updateAllNewToProcessing(): void {
  const ts = now();
  rows = rows.map(r =>
    r.status === 'New'
      ? { ...r, status: 'Processing' as SourceStatus, stage: 'Translating' as ProcessingStage, startedAt: r.startedAt ?? ts }
      : r,
  );
}

export function bulkUpdateStatus(
  ids: number[],
  status: SourceStatus,
  stage: ProcessingStage,
): void {
  const idSet = new Set(ids);
  const ts = now();
  rows = rows.map(r => {
    if (!idSet.has(r.id)) return r;
    const updated = { ...r, status, stage };
    if (status === 'Processing' && !r.startedAt) updated.startedAt = ts;
    if (status === 'Ready for Review') updated.completedAt = ts;
    return updated;
  });
}

export function resetSources(): void {
  rows = initialSources.map(s => ({ ...s }));
}
