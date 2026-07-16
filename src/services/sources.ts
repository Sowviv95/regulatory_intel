import type { Source } from '../types';
import { get, patch } from './api';

export async function getSources(filters?: {
  status?: string; country?: string; docType?: string; q?: string;
}): Promise<Source[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'All') params.set('status', filters.status);
  if (filters?.country && filters.country !== 'All') params.set('country', filters.country);
  if (filters?.docType && filters.docType !== 'All') params.set('doc_type', filters.docType);
  if (filters?.q) params.set('q', filters.q);
  const qs = params.toString();
  const res = await get<{ data: Source[] }>(`/api/sources${qs ? '?' + qs : ''}`);
  return res.data;
}

export async function getSourceById(id: number): Promise<Source | undefined> {
  try {
    const res = await get<{ data: Source }>(`/api/sources/${id}`);
    return res.data;
  } catch { return undefined; }
}

export async function updateSourceStatus(id: number, status: string, stage: string): Promise<Source> {
  const res = await patch<{ data: Source }>(`/api/sources/${id}`, { status, stage });
  return res.data;
}

export async function bulkUpdateStatus(ids: number[], status: string, stage: string): Promise<void> {
  await Promise.all(ids.map(id => patch(`/api/sources/${id}`, { status, stage })));
}
