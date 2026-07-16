// ---------------------------------------------------------------------------
// Shared domain types for the Regulatory Intelligence PoC.
// Derived from docs/DATA_MODEL.md and existing component mock data.
// ---------------------------------------------------------------------------

// -- Enums / union types ----------------------------------------------------

export type SourceStatus = 'New' | 'Processing' | 'Ready for Review' | 'Irrelevant';

export type ProcessingStage =
  | 'Awaiting Extraction'
  | 'Translating'
  | 'AI Extraction'
  | 'Quality Check'
  | 'Analyst Review'
  | 'Discarded';

export type RegulationStatus =
  | 'New'
  | 'Processing'
  | 'Ready for Review'
  | 'Approved'
  | 'Published'
  | 'Irrelevant';

export type SectorImpact = 'Low' | 'Medium' | 'High' | 'Critical';

export type Likelihood = 'Speculative' | 'Likely' | 'Probable' | 'Confirmed';

export type FieldCategory = 'Metadata' | 'Content' | 'Assessment' | 'Dates';

export type FieldStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Flagged';

export type ReviewDecisionType = 'Accepted' | 'Rejected' | 'Edited' | 'Flagged' | 'Reset';

export type ExportFormat = 'CSV' | 'Excel';

// -- Dashboard --------------------------------------------------------------

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  sub: string;
}

export interface JurisdictionCoverage {
  country: string;
  flag: string;
  total: number;
  covered: number;
  pending: number;
  high: number;
}

export interface DashboardAlert {
  id: number;
  flag: string;
  country: string;
  title: string;
  date: string;
  impact: string;
  status: string;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  jurisdictions: JurisdictionCoverage[];
  alerts: DashboardAlert[];
}

// -- Source ------------------------------------------------------------------

export interface Source {
  id: number;
  sourceId: number;
  flag: string;
  country: string;
  source: string;
  title: string;
  language: string;
  docType: string;
  discovered: string;
  status: SourceStatus;
  stage: ProcessingStage;
  regulationCount: number;
  reviewRequiredCount: number;
  startedAt: string | null;
  completedAt: string | null;
  failureMessage: string | null;
}

// -- Regulation (single-document review) ------------------------------------

export interface EvidenceEntry {
  text: string;
  lines: string;
}

export interface RegulationDetail {
  id: number;
  jurisdiction: string;
  flag: string;
  sourceName: string;
  title: string;
  summary: string;
  products: string[];
  status: string;
  sourceType: string;
  proposer: string;
  sectorImpact: string;
  likelihood: string;
  effectiveDate: string;
  noticeDate: string;
  commentDeadline: string;
}

// -- Regulation Review Table ------------------------------------------------

export interface RegulationFieldRow {
  id: number;
  category: string;
  field: string;
  value: string;
  evidence: string;
  confidence: number;
}

export interface ReviewSource {
  id: number;
  flag: string;
  country: string;
  title: string;
  sourceName: string;
  docType: string;
  date: string;
  fields: RegulationFieldRow[];
}

// -- Reviewable field (shared review state) ---------------------------------

export interface ReviewableField {
  id: number;
  regulationId?: number;
  sourceId: number;
  category: string;
  field: string;
  extractedValue: string;
  reviewedValue: string | null;
  evidence: string;
  evidenceSection?: string | null;
  evidenceReference?: string | null;
  confidence: number;
  status: FieldStatus;
  comment: string | null;
  reviewedAt: string | null;
}

// -- Search / Intelligence Library ------------------------------------------

export interface SearchResult {
  id: number;
  flag: string;
  jurisdiction: string;
  title: string;
  products: string[];
  regStatus: string;
  impact: string;
  sourceType: string;
  date: string;
}

export interface SearchableRecord {
  sourceId: number;
  sourceTitle: string;
  sourceName: string;
  flag: string;
  jurisdiction: string;
  docType: string;
  date: string;
  fieldId: number;
  fieldName: string;
  category: string;
  extractedValue: string;
  reviewedValue: string | null;
  finalValue: string;
  evidence: string;
  confidence: number;
  status: FieldStatus;
  comment: string | null;
}

export interface SavedView {
  id: number;
  name: string;
  count: number;
  starred: boolean;
}
