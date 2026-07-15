import type { Source, SourceStatus, ProcessingStage } from '../types';
import { sources as initialSources } from '../data/sources';

// In-memory mutable copy so status changes persist across navigations
// within the same session.  Will be replaced by API calls in Sprint 5.
let rows: Source[] = initialSources.map(s => ({ ...s }));

export function getSources(): Source[] {
  return rows;
}

export function getSourceById(id: number): Source | undefined {
  return rows.find(r => r.id === id);
}

export function updateSourceStatus(
  id: number,
  status: SourceStatus,
  stage: ProcessingStage,
): void {
  rows = rows.map(r => (r.id === id ? { ...r, status, stage } : r));
}

export function updateAllNewToProcessing(): void {
  rows = rows.map(r =>
    r.status === 'New' ? { ...r, status: 'Processing' as SourceStatus, stage: 'Translating' as ProcessingStage } : r,
  );
}

export function resetSources(): void {
  rows = initialSources.map(s => ({ ...s }));
}
