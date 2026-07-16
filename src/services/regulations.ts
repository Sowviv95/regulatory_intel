import type { ReviewableField, ReviewSource, EvidenceEntry } from '../types';
import { get, post } from './api';
import { reviewSources } from '../data/regulations';

// Review sources catalogue (static — used for source selector UI and prev/next)
export function getReviewSources(): ReviewSource[] {
  return reviewSources;
}

export function getReviewSourceById(id: number): ReviewSource | undefined {
  return reviewSources.find(s => s.id === id);
}

// ---------------------------------------------------------------------------
// Regulation detail from API (includes fields, source text, evidence)
// ---------------------------------------------------------------------------

export interface RegulationResponse {
  id: number;
  sourceId: number;
  title: string;
  regulatoryBody: string;
  jurisdiction: string;
  topic: string;
  summary: string | null;
  status: string;
  fields: ReviewableField[];
  sourceText: string | null;
  sourceName: string | null;
  flag: string | null;
  docType: string | null;
  country: string | null;
}

export async function getRegulationById(regId: number): Promise<RegulationResponse | null> {
  try {
    const res = await get<{ data: RegulationResponse }>(`/api/regulations/${regId}`);
    return res.data;
  } catch { return null; }
}

// Compatibility: get fields for a source (finds regulation by source_id)
export async function getFieldsForSource(sourceId: number): Promise<ReviewableField[]> {
  // First get the regulation(s) for this source
  const regsRes = await get<{ data: { id: number }[] }>(`/api/sources/${sourceId}/regulations`);
  if (!regsRes.data.length) return [];
  // Get fields from the first regulation
  const regId = regsRes.data[0].id;
  const regRes = await get<{ data: { fields: ReviewableField[] } }>(`/api/regulations/${regId}`);
  return regRes.data.fields;
}

// Evidence from API
export async function getEvidenceForField(fieldId: number): Promise<{
  excerpt: string; section: string | null; sourceReference: string | null; immutable: boolean;
} | null> {
  try {
    const res = await get<{ data: { excerpt: string; section: string | null; sourceReference: string | null; immutable: boolean } }>(`/api/evidence/${fieldId}`);
    return res.data;
  } catch { return null; }
}

// Source text from API
export async function getSourceTextForSource(sourceId: number): Promise<string | null> {
  try {
    const res = await get<{ data: { sourceText: string | null } }>(`/api/sources/${sourceId}`);
    return res.data.sourceText;
  } catch { return null; }
}

// Keep static evidence map for highlight ranges (source-text specific, not from DB)
export function getHighlightRanges(): Record<string, [number, number]> {
  return {
    Title: [2, 4], Summary: [11, 15], 'Products Impacted': [18, 20],
    'Sector Impact': [41, 42], Likelihood: [45, 46], 'Comment Deadline': [49, 50],
    'Effective Date': [45, 46],
  };
}

// ---------------------------------------------------------------------------
// Field-level review actions (now via /api/fields endpoints)
// ---------------------------------------------------------------------------

export async function acceptField(_sourceId: number, fieldId: number): Promise<ReviewableField> {
  const res = await post<{ data: ReviewableField }>(`/api/fields/${fieldId}/review`, {
    fieldId, decision: 'Accepted',
  });
  return res.data;
}

export async function rejectField(_sourceId: number, fieldId: number): Promise<ReviewableField> {
  const res = await post<{ data: ReviewableField }>(`/api/fields/${fieldId}/review`, {
    fieldId, decision: 'Rejected',
  });
  return res.data;
}

export async function flagField(_sourceId: number, fieldId: number): Promise<ReviewableField> {
  const res = await post<{ data: ReviewableField }>(`/api/fields/${fieldId}/review`, {
    fieldId, decision: 'Flagged',
  });
  return res.data;
}

export async function resetField(_sourceId: number, fieldId: number): Promise<ReviewableField> {
  const res = await post<{ data: ReviewableField }>(`/api/fields/${fieldId}/review`, {
    fieldId, decision: 'Reset',
  });
  return res.data;
}

export async function editFieldValue(_sourceId: number, fieldId: number, newValue: string): Promise<ReviewableField> {
  const res = await post<{ data: ReviewableField }>(`/api/fields/${fieldId}/review`, {
    fieldId, decision: 'Edited', newValue,
  });
  return res.data;
}

export async function addFieldComment(_sourceId: number, fieldId: number, comment: string): Promise<ReviewableField> {
  const res = await post<{ data: ReviewableField }>(`/api/fields/${fieldId}/review`, {
    fieldId, decision: 'Comment', comment,
  });
  return res.data;
}

export async function acceptAllFields(sourceId: number): Promise<ReviewableField[]> {
  // Find the regulation for this source, then accept all
  const regsRes = await get<{ data: { id: number }[] }>(`/api/sources/${sourceId}/regulations`);
  if (!regsRes.data.length) return [];
  const regId = regsRes.data[0].id;
  const res = await post<{ data: ReviewableField[] }>(`/api/regulations/${regId}/review/accept-all`, {});
  return res.data;
}

export function getReviewStats(fields: ReviewableField[]) {
  return {
    total: fields.length,
    accepted: fields.filter(f => f.status === 'Accepted').length,
    rejected: fields.filter(f => f.status === 'Rejected').length,
    flagged: fields.filter(f => f.status === 'Flagged').length,
    pending: fields.filter(f => f.status === 'Pending').length,
  };
}
