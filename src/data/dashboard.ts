import type { DashboardKpi, JurisdictionCoverage, DashboardAlert } from '../types';

export const kpis: DashboardKpi[] = [
  { label: 'Total Regulations', value: '1,243', delta: '+4.2%', up: true, sub: 'Across 6 jurisdictions' },
  { label: 'New This Week', value: '57', delta: '+12.5%', up: true, sub: 'vs. prior week' },
  { label: 'High Impact', value: '84', delta: '+3 this week', up: false, sub: 'Require attention' },
  { label: 'Pending Review', value: '239', delta: '\u22128 since yesterday', up: true, sub: 'In analyst queue' },
];

export const jurisdictions: JurisdictionCoverage[] = [
  { country: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}', total: 187, covered: 142, pending: 18, high: 12 },
  { country: 'Denmark', flag: '\u{1F1E9}\u{1F1F0}', total: 203, covered: 165, pending: 22, high: 8 },
  { country: 'Finland', flag: '\u{1F1EB}\u{1F1EE}', total: 178, covered: 134, pending: 31, high: 15 },
  { country: 'Poland', flag: '\u{1F1F5}\u{1F1F1}', total: 221, covered: 189, pending: 14, high: 9 },
  { country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', total: 256, covered: 208, pending: 27, high: 19 },
  { country: 'Vietnam', flag: '\u{1F1FB}\u{1F1F3}', total: 198, covered: 152, pending: 33, high: 21 },
];

export const alerts: DashboardAlert[] = [
  { id: 1, flag: '\u{1F1F9}\u{1F1FC}', country: 'Taiwan', title: 'Tobacco Hazards Prevention Act Amendment 2026', date: 'Jul 14', impact: 'High', status: 'New' },
  { id: 2, flag: '\u{1F1F0}\u{1F1F7}', country: 'South Korea', title: 'E-cigarette Content Disclosure Rules Update', date: 'Jul 13', impact: 'High', status: 'Processing' },
  { id: 3, flag: '\u{1F1FB}\u{1F1F3}', country: 'Vietnam', title: 'Tobacco Control Law Phase 3 Implementation', date: 'Jul 12', impact: 'Medium', status: 'New' },
  { id: 4, flag: '\u{1F1E9}\u{1F1F0}', country: 'Denmark', title: 'Nicotine Pouch Maximum Strength Regulation', date: 'Jul 11', impact: 'Medium', status: 'Ready for Review' },
  { id: 5, flag: '\u{1F1EB}\u{1F1EE}', country: 'Finland', title: 'E-cigarette Display Restriction Amendment', date: 'Jul 10', impact: 'Low', status: 'Processing' },
  { id: 6, flag: '\u{1F1F5}\u{1F1F1}', country: 'Poland', title: 'Heated Tobacco Product Labeling Requirements', date: 'Jul 9', impact: 'Medium', status: 'Ready for Review' },
];
