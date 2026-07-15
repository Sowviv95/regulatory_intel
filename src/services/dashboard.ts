import type { DashboardData } from '../types';
import { kpis, jurisdictions, alerts } from '../data/dashboard';

export function getDashboardData(): DashboardData {
  return { kpis, jurisdictions, alerts };
}
