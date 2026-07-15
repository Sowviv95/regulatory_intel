import type { SearchResult, SavedView } from '../types';

export const allResults: SearchResult[] = [
  { id: 1,  flag: '\u{1F1F9}\u{1F1FC}', jurisdiction: 'Taiwan',      title: 'Tobacco Hazards Prevention Act Amendment 2026',            products: ['E-cigarettes', 'HTP'],              regStatus: 'Approved',   impact: 'High',   sourceType: 'Legislative Amendment', date: 'Jul 14, 2026' },
  { id: 2,  flag: '\u{1F1F0}\u{1F1F7}', jurisdiction: 'South Korea', title: 'Electronic Cigarette Content Disclosure Rules',            products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'High',   sourceType: 'Regulatory Notice',     date: 'Jul 13, 2026' },
  { id: 3,  flag: '\u{1F1FB}\u{1F1F3}', jurisdiction: 'Vietnam',     title: 'Tobacco Control Law Phase 3 Implementation Decree',        products: ['Cigarettes', 'HTP'],                regStatus: 'Approved',   impact: 'High',   sourceType: 'Implementation Decree', date: 'Jul 12, 2026' },
  { id: 4,  flag: '\u{1F1E9}\u{1F1F0}', jurisdiction: 'Denmark',     title: 'Nicotine Pouch Maximum Strength Regulation',               products: ['Nicotine Pouches'],                 regStatus: 'Approved',   impact: 'Medium', sourceType: 'Regulatory Guidance',   date: 'Jul 11, 2026' },
  { id: 5,  flag: '\u{1F1EB}\u{1F1EE}', jurisdiction: 'Finland',     title: 'E-cigarette Point-of-Sale Display Restrictions',           products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'Low',    sourceType: 'Amendment Proposal',    date: 'Jul 10, 2026' },
  { id: 6,  flag: '\u{1F1F5}\u{1F1F1}', jurisdiction: 'Poland',      title: 'Heated Tobacco Product Labeling Requirements',             products: ['HTP'],                              regStatus: 'Approved',   impact: 'Medium', sourceType: 'Technical Standard',    date: 'Jul 9, 2026'  },
  { id: 7,  flag: '\u{1F1F9}\u{1F1FC}', jurisdiction: 'Taiwan',      title: 'Online Tobacco Advertising Prohibition Enforcement',       products: ['Cigarettes', 'E-cigarettes'],        regStatus: 'Published',  impact: 'High',   sourceType: 'Enforcement Notice',    date: 'Jul 7, 2026'  },
  { id: 8,  flag: '\u{1F1F0}\u{1F1F7}', jurisdiction: 'South Korea', title: 'Flavored Tobacco Product Import Restriction',              products: ['Cigarettes', 'E-cigarettes'],        regStatus: 'Published',  impact: 'Medium', sourceType: 'Import Restriction',    date: 'Jul 5, 2026'  },
  { id: 9,  flag: '\u{1F1FB}\u{1F1F3}', jurisdiction: 'Vietnam',     title: 'Tobacco Retailer Licensing Ministerial Circular',          products: ['Cigarettes'],                        regStatus: 'Approved',   impact: 'Low',    sourceType: 'Ministerial Circular',  date: 'Jun 30, 2026' },
  { id: 10, flag: '\u{1F1E9}\u{1F1F0}', jurisdiction: 'Denmark',     title: 'ENDS Device Safety Standards Consultation (Closed)',       products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'Low',    sourceType: 'Public Consultation',   date: 'Jun 28, 2026' },
  { id: 11, flag: '\u{1F1F5}\u{1F1F1}', jurisdiction: 'Poland',      title: 'Nicotine Replacement Product Registration Requirements',   products: ['Nicotine Pouches'],                 regStatus: 'Approved',   impact: 'Medium', sourceType: 'Regulatory Update',     date: 'Jun 25, 2026' },
  { id: 12, flag: '\u{1F1EB}\u{1F1EE}', jurisdiction: 'Finland',     title: 'Flavoured E-liquid Ban \u2014 Valvira Enforcement Notice',      products: ['E-cigarettes'],                     regStatus: 'Published',  impact: 'High',   sourceType: 'Enforcement Notice',    date: 'Jun 20, 2026' },
];

export const savedViews: SavedView[] = [
  { id: 1, name: 'High Impact \u2014 APAC',    count: 14, starred: true  },
  { id: 2, name: 'EU Nicotine Pouches',   count: 8,  starred: true  },
  { id: 3, name: 'E-cigarette Watch',     count: 32, starred: false },
  { id: 4, name: 'Nordic Market',         count: 18, starred: false },
  { id: 5, name: 'Published This Month',  count: 9,  starred: false },
];
