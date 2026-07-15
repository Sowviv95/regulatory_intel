import type { DashboardData } from '../types';
import { kpis as staticKpis, jurisdictions, alerts } from '../data/dashboard';
import { getSources } from './sources';

export function getDashboardData(): DashboardData {
  const sources = getSources();
  const pendingReview = sources.filter(s => s.status === 'Ready for Review').length;
  const newCount = sources.filter(s => s.status === 'New').length;

  // Override the Pending Review and New This Week KPIs with live source counts
  const kpis = staticKpis.map(k => {
    if (k.label === 'Pending Review') return { ...k, value: String(pendingReview) };
    if (k.label === 'New This Week') return { ...k, value: String(newCount) };
    return k;
  });

  return { kpis, jurisdictions, alerts };
}
