import type { RegulationDetail, EvidenceEntry, ReviewSource, RegulationFieldRow, FieldStatus } from '../types';
import { regulationDetail, sourceText, evidenceMap, reviewSources } from '../data/regulations';

// -- Single-regulation detail -----------------------------------------------

export function getRegulationDetail(id: number): RegulationDetail | undefined {
  // Currently only one detailed regulation exists.  Return it when id matches.
  if (id === regulationDetail.id) return regulationDetail;
  return undefined;
}

export function getSourceText(): string {
  return sourceText;
}

export function getEvidenceMap(): Record<string, EvidenceEntry> {
  return evidenceMap;
}

// -- Review-table sources ---------------------------------------------------

export function getReviewSources(): ReviewSource[] {
  return reviewSources;
}

export function getReviewSourceById(id: number): ReviewSource | undefined {
  return reviewSources.find(s => s.id === id);
}

export function buildFieldRows(source: ReviewSource): (RegulationFieldRow & { status: FieldStatus })[] {
  return source.fields.map(f => ({ ...f, status: 'Pending' as FieldStatus }));
}
