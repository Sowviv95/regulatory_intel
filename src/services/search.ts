import type { SearchResult, SavedView } from '../types';
import { allResults, savedViews } from '../data/search';

export interface SearchFilters {
  q?: string;
  jurisdiction?: string;
  product?: string;
  regStatus?: string;
  sourceType?: string;
  impact?: string;
  dateRange?: string;
}

export function searchRegulations(filters: SearchFilters): SearchResult[] {
  return allResults.filter(r => {
    const q = (filters.q ?? '').toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.jurisdiction.toLowerCase().includes(q);
    const matchJ = !filters.jurisdiction || filters.jurisdiction === 'All' || r.jurisdiction === filters.jurisdiction;
    const matchP = !filters.product || filters.product === 'All' || r.products.some(p => p.toLowerCase().includes(filters.product!.toLowerCase()));
    const matchS = !filters.regStatus || filters.regStatus === 'All' || r.regStatus === filters.regStatus;
    const matchT = !filters.sourceType || filters.sourceType === 'All' || r.sourceType === filters.sourceType;
    const matchI = !filters.impact || filters.impact === 'All' || r.impact === filters.impact;
    return matchQ && matchJ && matchP && matchS && matchT && matchI;
  });
}

export function getSavedViews(): SavedView[] {
  return savedViews;
}
