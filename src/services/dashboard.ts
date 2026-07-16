import type { DashboardData } from '../types';
import { get } from './api';

export async function getDashboardData(): Promise<DashboardData> {
  const res = await get<{ data: DashboardData }>('/api/dashboard');
  return res.data;
}
