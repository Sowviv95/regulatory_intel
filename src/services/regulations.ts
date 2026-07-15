import type { EvidenceEntry, ReviewSource, ReviewableField, FieldStatus } from '../types';
import { sourceText, evidenceMap, reviewSources } from '../data/regulations';

// ---------------------------------------------------------------------------
// Source text & evidence (immutable)
// ---------------------------------------------------------------------------

export function getSourceText(_sourceId?: number): string {
  return sourceText;
}

export function getEvidenceMap(_sourceId?: number): Record<string, EvidenceEntry> {
  return evidenceMap;
}

// ---------------------------------------------------------------------------
// Review sources (immutable catalogue)
// ---------------------------------------------------------------------------

export function getReviewSources(): ReviewSource[] {
  return reviewSources;
}

export function getReviewSourceById(id: number): ReviewSource | undefined {
  return reviewSources.find(s => s.id === id);
}

// ---------------------------------------------------------------------------
// Shared mutable review state
// Keyed by sourceId.  Persists across navigations within a session.
// Both RegulationReview and RegulationReviewTable read/write this store.
// ---------------------------------------------------------------------------

const reviewStore: Map<number, ReviewableField[]> = new Map();

function now(): string {
  const d = new Date();
  const mon = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${mon} ${day}, 2026 ${h}:${m}`;
}

function initFieldsForSource(source: ReviewSource): ReviewableField[] {
  return source.fields.map(f => ({
    id: f.id,
    sourceId: source.id,
    category: f.category,
    field: f.field,
    extractedValue: f.value,
    reviewedValue: null,
    evidence: f.evidence,
    confidence: f.confidence,
    status: 'Pending' as FieldStatus,
    comment: null,
    reviewedAt: null,
  }));
}

export function getFieldsForSource(sourceId: number): ReviewableField[] {
  if (!reviewStore.has(sourceId)) {
    const source = getReviewSourceById(sourceId);
    if (!source) return [];
    reviewStore.set(sourceId, initFieldsForSource(source));
  }
  return reviewStore.get(sourceId)!;
}

function updateField(sourceId: number, fieldId: number, updater: (f: ReviewableField) => ReviewableField): void {
  const fields = getFieldsForSource(sourceId);
  reviewStore.set(sourceId, fields.map(f => f.id === fieldId ? updater(f) : f));
}

export function acceptField(sourceId: number, fieldId: number): void {
  updateField(sourceId, fieldId, f => ({ ...f, status: 'Accepted', reviewedAt: now() }));
}

export function rejectField(sourceId: number, fieldId: number): void {
  updateField(sourceId, fieldId, f => ({ ...f, status: 'Rejected', reviewedAt: now() }));
}

export function flagField(sourceId: number, fieldId: number): void {
  updateField(sourceId, fieldId, f => ({ ...f, status: 'Flagged', reviewedAt: now() }));
}

export function resetField(sourceId: number, fieldId: number): void {
  updateField(sourceId, fieldId, f => ({
    ...f,
    status: 'Pending',
    reviewedValue: null,
    comment: null,
    reviewedAt: null,
  }));
}

export function editFieldValue(sourceId: number, fieldId: number, newValue: string): void {
  updateField(sourceId, fieldId, f => ({
    ...f,
    reviewedValue: newValue,
    status: 'Accepted',
    reviewedAt: now(),
  }));
}

export function addFieldComment(sourceId: number, fieldId: number, comment: string): void {
  updateField(sourceId, fieldId, f => ({ ...f, comment, reviewedAt: now() }));
}

export function acceptAllFields(sourceId: number): void {
  const fields = getFieldsForSource(sourceId);
  const ts = now();
  reviewStore.set(sourceId, fields.map(f =>
    f.status === 'Pending' ? { ...f, status: 'Accepted' as FieldStatus, reviewedAt: ts } : f,
  ));
}

// ---------------------------------------------------------------------------
// Aggregate queries (for cross-screen consistency)
// ---------------------------------------------------------------------------

export function getReviewStats(sourceId: number): { total: number; accepted: number; rejected: number; flagged: number; pending: number } {
  const fields = getFieldsForSource(sourceId);
  return {
    total: fields.length,
    accepted: fields.filter(f => f.status === 'Accepted').length,
    rejected: fields.filter(f => f.status === 'Rejected').length,
    flagged: fields.filter(f => f.status === 'Flagged').length,
    pending: fields.filter(f => f.status === 'Pending').length,
  };
}

export function isSourceFullyReviewed(sourceId: number): boolean {
  const fields = getFieldsForSource(sourceId);
  return fields.length > 0 && fields.every(f => f.status !== 'Pending');
}
