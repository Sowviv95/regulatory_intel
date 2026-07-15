import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Check, Flag, Edit2, ChevronLeft, ChevronRight, ChevronDown, Send, RotateCcw, Search, X } from 'lucide-react';
import { K } from './kiaa-tokens';

type FieldStatus = 'Pending' | 'Accepted' | 'Flagged';

interface FieldRow {
  id: number;
  category: string;
  field: string;
  value: string;
  evidence: string;
  confidence: number;
  status: FieldStatus;
}

interface Source {
  id: number;
  flag: string;
  country: string;
  title: string;
  sourceName: string;
  docType: string;
  date: string;
  fields: Omit<FieldRow, 'status'>[];
}

const sources: Source[] = [
  {
    id: 1,
    flag: '🇹🇼', country: 'Taiwan',
    title: 'Tobacco Hazards Prevention Act — Amendment 2026',
    sourceName: 'Health Promotion Administration, MOHW',
    docType: 'Legislative Amendment', date: 'Jul 14, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Taiwan',                                                    evidence: '衛生福利部健康促進署 — Ministry of Health and Welfare, Taiwan',                       confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Health Promotion Administration, MOHW',                     evidence: '衛生福利部健康促進署公告 — Health Promotion Administration announcement',           confidence: 97 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Legislative Amendment',                                     evidence: '預告「菸害防制法」修正草案 — Amendment draft of the Tobacco Hazards Prevention Act', confidence: 96 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Health and Welfare',                            evidence: '衛生福利部部長 薛xx — Minister of Health and Welfare',                              confidence: 98 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Tobacco Hazards Prevention Act Amendment 2026',              evidence: '菸害防制法修正草案 — Draft amendment to the Tobacco Hazards Prevention Act',        confidence: 95 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Introduces mandatory ENDS registration, ≥50% warning label coverage, flavour restrictions, and online retail ban with increased penalties.', evidence: '本次修正草案係依據WHO FCTC第9、10條之相關建議，針對電子煙及加熱菸草產品之管理規範進行全面檢討與修正。', confidence: 87 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'E-cigarettes, Heated Tobacco Products, Nicotine Pouches',   evidence: '所有電子煙裝置（含煙彈、煙液）及加熱菸草產品，須於本法施行日起六個月內完成登記。',         confidence: 91 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'High',                                                      evidence: '違反本法規定者，處新台幣二十萬元以上二百萬元以下罰鍰；情節重大者得廢止其營業執照。',       confidence: 82 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Confirmed',                                                 evidence: '本修正案預計於中華民國116年1月1日（西元2027年1月1日）起正式施行。',                     confidence: 78 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Ready for Review',                                          evidence: 'Draft published for public consultation period.',                                   confidence: 85 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 14, 2026',                                              evidence: '民國115年7月14日 — Republic of China year 115, July 14',                           confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Sep 30, 2026',                                              evidence: '公告期間自民國115年7月14日起至115年9月30日止。',                                     confidence: 88 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Jan 1, 2027',                                               evidence: '本修正案預計於中華民國116年1月1日（西元2027年1月1日）起正式施行。',                     confidence: 94 },
    ],
  },
  {
    id: 2,
    flag: '🇰🇷', country: 'South Korea',
    title: 'Electronic Cigarette Content Disclosure Rules Update',
    sourceName: 'Ministry of Health and Welfare',
    docType: 'Regulatory Notice', date: 'Jul 13, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'South Korea',                                               evidence: '보건복지부 — Ministry of Health and Welfare, Republic of Korea',                    confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Ministry of Health and Welfare',                            evidence: '보건복지부 고시 제2026-142호 — MOHW Notice No. 2026-142',                           confidence: 96 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Regulatory Notice',                                         evidence: '전자담배 성분 공개 규정 개정안 — Amendment to e-cigarette content disclosure rules',   confidence: 94 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Korea Disease Control and Prevention Agency',               evidence: '질병관리청장 — Director of KDCA',                                                    confidence: 91 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Electronic Cigarette Content Disclosure Rules 2026',        evidence: '전자담배 성분 공개에 관한 규정 — Regulation on disclosure of e-cigarette contents',  confidence: 93 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Mandates quarterly reporting of all chemical constituents in e-liquids and aerosols; expands ingredient database requirements.', evidence: '전자담배 제조사 및 수입업자는 분기별로 전자담배 성분을 식품의약품안전처에 보고하여야 한다.', confidence: 84 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'E-cigarettes, E-liquids',                                   evidence: '전자담배 및 전자담배 액상 — Electronic cigarettes and e-liquids',                     confidence: 97 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'High',                                                      evidence: '위반 시 최대 500만원 과태료 부과 — Fine up to KRW 5 million for violation',           confidence: 88 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Confirmed',                                                 evidence: '시행일: 2026년 10월 1일 — Enforcement date: October 1, 2026',                       confidence: 95 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Processing',                                                evidence: 'Currently under inter-ministerial review before final issuance.',                    confidence: 79 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 13, 2026',                                              evidence: '공고일: 2026년 7월 13일 — Announcement date: July 13, 2026',                        confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Aug 27, 2026',                                              evidence: '의견제출 기한: 2026년 8월 27일 — Deadline for comments: August 27, 2026',            confidence: 97 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Oct 1, 2026',                                               evidence: '시행일: 2026년 10월 1일 — Effective date: October 1, 2026',                         confidence: 95 },
    ],
  },
  {
    id: 3,
    flag: '🇩🇰', country: 'Denmark',
    title: 'Nicotine Pouch Maximum Strength Regulation',
    sourceName: 'Danish Medicines Agency',
    docType: 'Regulatory Guidance', date: 'Jul 11, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Denmark',                                                   evidence: 'Lægemiddelstyrelsen — Danish Medicines Agency',                                     confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Danish Medicines Agency (Lægemiddelstyrelsen)',             evidence: 'Vejledning om nikotinposer — Guidance on nicotine pouches',                         confidence: 97 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Regulatory Guidance',                                       evidence: 'Regulatorisk vejledning nr. 2026/44 — Regulatory guidance no. 2026/44',             confidence: 93 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Danish Medicines Agency',                                   evidence: 'Udstedt af Lægemiddelstyrelsen — Issued by the Danish Medicines Agency',             confidence: 98 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Nicotine Pouch Maximum Strength Regulation 2026',           evidence: 'Regulering af maksimal nikotinstyrke i nikotinposer',                               confidence: 94 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Caps nicotine concentration in pouches at 20 mg/g; prohibits sale to under-18s via any channel; requires child-resistant packaging.', evidence: 'Maksimal nikotinindhold i nikotinposer fastsættes til 20 mg/g. Salg til personer under 18 år forbydes i alle kanaler.', confidence: 89 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'Nicotine Pouches',                                          evidence: 'Nikotinposer — alle varianter og styrker — Nicotine pouches, all variants',          confidence: 99 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'Medium',                                                    evidence: 'Bøde op til DKK 50.000 for overtrædelse — Fine up to DKK 50,000 for violation',      confidence: 81 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Probable',                                                  evidence: 'Forventet ikrafttræden: 1. januar 2027 — Expected entry into force: January 1, 2027', confidence: 76 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Ready for Review',                                          evidence: 'Høringsfrist udløbet — Public consultation period closed',                           confidence: 83 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 11, 2026',                                              evidence: 'Offentliggjort den 11. juli 2026 — Published July 11, 2026',                         confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Aug 15, 2026',                                              evidence: 'Høringsfrist: 15. august 2026 — Consultation deadline: August 15, 2026',             confidence: 96 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Jan 1, 2027',                                               evidence: 'Ikrafttræden: 1. januar 2027 — Entry into force: January 1, 2027',                   confidence: 90 },
    ],
  },
  {
    id: 4,
    flag: '🇻🇳', country: 'Vietnam',
    title: 'Tobacco Control Law Phase 3 Implementation Decree',
    sourceName: 'Vietnam Tobacco Control Fund',
    docType: 'Implementation Decree', date: 'Jul 12, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Vietnam',                                                   evidence: 'Quỹ Phòng chống tác hại của thuốc lá — Vietnam Tobacco Control Fund',               confidence: 98 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Vietnam Tobacco Control Fund',                              evidence: 'Nghị định của Chính phủ — Government decree',                                       confidence: 95 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Implementation Decree',                                     evidence: 'Nghị định số 77/2026/NĐ-CP — Decree No. 77/2026/ND-CP',                            confidence: 97 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Health Vietnam',                               evidence: 'Bộ Y tế đề xuất — Proposed by the Ministry of Health',                              confidence: 94 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Tobacco Control Law Phase 3 Implementation Decree',         evidence: 'Hướng dẫn thi hành Luật Phòng chống tác hại của thuốc lá Giai đoạn 3',            confidence: 92 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Phase 3 extends graphic health warnings to 75% of packaging, bans tobacco advertising in all digital media, and introduces plain packaging pilot for 3 provinces.', evidence: 'Giai đoạn 3 mở rộng cảnh báo sức khỏe đồ họa lên 75% bao bì, cấm quảng cáo thuốc lá trên tất cả phương tiện kỹ thuật số.', confidence: 83 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'Cigarettes, Heated Tobacco Products',                       evidence: 'Thuốc lá điếu và sản phẩm thuốc lá nung nóng — Cigarettes and heated tobacco products', confidence: 93 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'High',                                                      evidence: 'Phạt tiền từ 20 đến 100 triệu đồng — Fines from VND 20–100 million',               confidence: 86 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Confirmed',                                                 evidence: 'Nghị định có hiệu lực từ ngày 01/01/2027 — Decree effective from January 1, 2027',  confidence: 91 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'New',                                                       evidence: 'Mới ban hành — Newly issued',                                                       confidence: 80 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 12, 2026',                                              evidence: 'Ngày ban hành: 12/07/2026 — Date of issue: July 12, 2026',                          confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'N/A',                                                       evidence: 'Không có giai đoạn lấy ý kiến — No public consultation phase',                     confidence: 72 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Jan 1, 2027',                                               evidence: 'Hiệu lực thi hành từ ngày 01/01/2027 — Effective from January 1, 2027',             confidence: 93 },
    ],
  },
  {
    id: 5,
    flag: '🇫🇮', country: 'Finland',
    title: 'E-cigarette Point-of-Sale Display Restrictions',
    sourceName: 'Finnish Institute for Health and Welfare',
    docType: 'Amendment Proposal', date: 'Jul 10, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Finland',                                                   evidence: 'Terveyden ja hyvinvoinnin laitos (THL) — Finnish Institute for Health and Welfare',  confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Finnish Institute for Health and Welfare (THL)',            evidence: 'THL:n lausunto — THL statement',                                                     confidence: 96 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Amendment Proposal',                                        evidence: 'Lakimuutosehdotus — Legislative amendment proposal',                                confidence: 94 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Social Affairs and Health Finland',            evidence: 'Sosiaali- ja terveysministeriö — Ministry of Social Affairs and Health',             confidence: 97 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'E-cigarette Point-of-Sale Display Restrictions 2026',       evidence: 'Sähkösavukkeiden myyntipisteessä esittämisen rajoitukset',                          confidence: 91 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Proposes complete removal of e-cigarette displays from all retail point-of-sale locations, aligned with existing cigarette display ban.', evidence: 'Sähkösavukkeet ehdotetaan täysin poistettavaksi myyntipisteistä, yhdenmukaisesti savukkeiden näyttökiellon kanssa.', confidence: 86 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'E-cigarettes',                                              evidence: 'Sähkösavukkeet ja täyttöpakkaukset — E-cigarettes and refill packs',                confidence: 95 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'Low',                                                       evidence: 'Rikkomusmaksu enintään 5 000 euroa — Infringement fine up to €5,000',              confidence: 79 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Likely',                                                    evidence: 'Hallituksen esitys — Government bill expected Q4 2026',                             confidence: 74 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Processing',                                                evidence: 'Lausuntokierroksella — Currently in consultation round',                            confidence: 82 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 10, 2026',                                              evidence: 'Julkaistu 10. heinäkuuta 2026 — Published July 10, 2026',                          confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Sep 5, 2026',                                               evidence: 'Lausuntopyyntö päättyy 5.9.2026 — Comment request closes September 5, 2026',       confidence: 94 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'TBD',                                                       evidence: 'Voimaantulopäivä vahvistetaan myöhemmin — Effective date to be confirmed',         confidence: 61 },
    ],
  },
  {
    id: 6,
    flag: '🇵🇱', country: 'Poland',
    title: 'Heated Tobacco Product Labeling Requirements',
    sourceName: 'Chief Sanitary Inspectorate',
    docType: 'Technical Standard', date: 'Jul 9, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Poland',                                                    evidence: 'Główny Inspektorat Sanitarny — Chief Sanitary Inspectorate, Poland',               confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Chief Sanitary Inspectorate (GIS)',                         evidence: 'GIS komunikat nr 2026/38 — GIS Communiqué No. 2026/38',                            confidence: 97 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Technical Standard',                                        evidence: 'Norma techniczna — Technical standard (PN-EN compliance)',                          confidence: 92 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Health Poland',                                 evidence: 'Ministerstwo Zdrowia — Ministry of Health, Poland',                                 confidence: 96 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Heated Tobacco Product Labeling Requirements 2026',         evidence: 'Wymagania dotyczące oznakowania podgrzewanych wyrobów tytoniowych',               confidence: 93 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Specifies mandatory labeling for HTP packaging including emission data, health warnings in Polish, and QR-code traceability links.', evidence: 'Oznakowanie musi zawierać dane dotyczące emisji, ostrzeżenia zdrowotne w języku polskim oraz kody QR umożliwiające identyfikowalność.', confidence: 88 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'Heated Tobacco Products',                                   evidence: 'Podgrzewane wyroby tytoniowe — wszystkie kategorie — Heated tobacco products, all categories', confidence: 98 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'Medium',                                                    evidence: 'Kara pieniężna do 200 000 PLN — Financial penalty up to PLN 200,000',              confidence: 84 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Probable',                                                  evidence: 'Wejście w życie: 1 marca 2027 — Entry into force: March 1, 2027',                  confidence: 80 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Ready for Review',                                          evidence: 'Projekt zakończył fazę konsultacji — Consultation phase completed',               confidence: 86 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 9, 2026',                                               evidence: 'Data publikacji: 9 lipca 2026 — Publication date: July 9, 2026',                  confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Aug 9, 2026',                                               evidence: 'Termin składania uwag: 9 sierpnia 2026 — Deadline for comments: August 9, 2026',  confidence: 95 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Mar 1, 2027',                                               evidence: 'Wejście w życie: 1 marca 2027 — Effective date: March 1, 2027',                   confidence: 91 },
    ],
  },
];

const categories = ['All', 'Metadata', 'Content', 'Assessment', 'Dates'];
const statuses = ['All Statuses', 'Pending', 'Accepted', 'Flagged'];

function ConfidenceDot({ pct }: { pct: number }) {
  const color = pct >= 90 ? K.accent : pct >= 80 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color }}>{pct}%</span>
    </div>
  );
}

function StatusChip({ status }: { status: FieldStatus }) {
  const map: Record<FieldStatus, { bg: string; text: string; border: string }> = {
    Pending:  { bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.18)' },
    Accepted: { bg: 'rgba(22,163,74,0.08)',   text: '#16a34a', border: 'rgba(22,163,74,0.18)'   },
    Flagged:  { bg: 'rgba(245,158,11,0.10)',  text: '#d97706', border: 'rgba(245,158,11,0.22)'  },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {status === 'Flagged'  && <Flag  size={9} />}
      {status === 'Accepted' && <Check size={9} />}
      {status}
    </span>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Metadata:   { bg: 'rgba(99,102,241,0.08)',  text: '#4f46e5' },
    Content:    { bg: 'rgba(22,163,74,0.08)',   text: '#16a34a' },
    Assessment: { bg: 'rgba(245,158,11,0.08)', text: '#d97706' },
    Dates:      { bg: 'rgba(59,130,246,0.08)',  text: '#2563eb' },
  };
  const c = colors[cat] ?? { bg: 'rgba(107,114,128,0.08)', text: '#6b7280' };
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>{cat}</span>
  );
}

function FilterSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
        {value} <ChevronDown size={11} style={{ color: K.textFaint }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 3px)', left: 0, zIndex: 100, background: '#fff', border: `1px solid ${K.border}`, borderRadius: '7px', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: '140px', overflow: 'hidden' }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', background: value === o ? K.accentSubtle : 'transparent', color: value === o ? K.accentText : K.textSecondary, fontSize: '12px', fontWeight: value === o ? 600 : 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function SourceSearch({ selected, onSelect }: { selected: Source; onSelect: (s: Source) => void }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const matches = sources.filter(s =>
    !query ||
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.country.toLowerCase().includes(query.toLowerCase()) ||
    s.sourceName.toLowerCase().includes(query.toLowerCase()) ||
    s.docType.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 0 }}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px',
          background: '#fff', border: `1px solid ${K.inputBorder}`, borderRadius: '8px',
          cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left',
          boxShadow: open ? `0 0 0 2px ${K.accentBorder}` : 'none',
          transition: 'box-shadow 0.15s',
        }}
      >
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{selected.flag}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: K.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.title}</div>
          <div style={{ fontSize: '11px', color: K.textMuted }}>{selected.sourceName} · {selected.docType} · {selected.date}</div>
        </div>
        <ChevronDown size={14} style={{ color: K.textFaint, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {/* Search input */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${K.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={13} style={{ color: K.textFaint, flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, country, source or type…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: K.textPrimary, fontFamily: 'inherit', background: 'transparent' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: K.textFaint, display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Results */}
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {matches.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: K.textFaint, fontSize: '12px' }}>No matching sources</div>
            ) : (
              matches.map(s => {
                const isActive = s.id === selected.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { onSelect(s); setOpen(false); setQuery(''); }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%',
                      padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: isActive ? K.accentSubtle : 'transparent',
                      borderLeft: `3px solid ${isActive ? K.accent : 'transparent'}`,
                      textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1.3 }}>{s.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: isActive ? 600 : 500, color: isActive ? K.accentText : K.textPrimary, lineHeight: 1.35 }}>{s.title}</div>
                      <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '2px' }}>{s.country} · {s.docType} · {s.date}</div>
                      <div style={{ fontSize: '11px', color: K.textFaint }}>{s.sourceName}</div>
                    </div>
                    {isActive && <Check size={13} style={{ color: K.accent, flexShrink: 0, marginTop: '2px' }} />}
                  </button>
                );
              })
            )}
          </div>

          <div style={{ padding: '8px 14px', borderTop: `1px solid ${K.border}`, background: '#fafafa' }}>
            <span style={{ fontSize: '11px', color: K.textFaint }}>{matches.length} of {sources.length} sources</span>
          </div>
        </div>
      )}
    </div>
  );
}

function buildRows(source: Source): FieldRow[] {
  return source.fields.map(f => ({ ...f, status: 'Pending' as FieldStatus }));
}

export function RegulationReviewTable({ initialSourceId }: { initialSourceId?: number }) {
  const startSource = initialSourceId
    ? (sources.find(s => s.id === initialSourceId) ?? sources[0])
    : sources[0];

  const [selectedSource, setSelectedSource] = useState<Source>(startSource);
  const [fields, setFields]                 = useState<FieldRow[]>(() => buildRows(startSource));
  const [catFilter, setCatFilter]           = useState('All');
  const [statusFilter, setStatusFilter]     = useState('All Statuses');

  useLayoutEffect(() => {
    if (!initialSourceId) return;
    const match = sources.find(s => s.id === initialSourceId);
    if (match && match.id !== selectedSource.id) {
      setSelectedSource(match);
      setFields(buildRows(match));
      setCatFilter('All');
      setStatusFilter('All Statuses');
    }
  }, [initialSourceId]);
  const [editingId, setEditingId]           = useState<number | null>(null);
  const [editValue, setEditValue]           = useState('');

  const handleSelectSource = (s: Source) => {
    setSelectedSource(s);
    setFields(buildRows(s));
    setCatFilter('All');
    setStatusFilter('All Statuses');
    setEditingId(null);
  };

  const currentIdx = sources.findIndex(s => s.id === selectedSource.id);
  const goTo = (idx: number) => { if (idx >= 0 && idx < sources.length) handleSelectSource(sources[idx]); };

  const accept    = (id: number) => setFields(f => f.map(r => r.id === id ? { ...r, status: 'Accepted' } : r));
  const flag      = (id: number) => setFields(f => f.map(r => r.id === id ? { ...r, status: 'Flagged'  } : r));
  const reset     = (id: number) => setFields(f => f.map(r => r.id === id ? { ...r, status: 'Pending'  } : r));
  const acceptAll = ()           => setFields(f => f.map(r => ({ ...r, status: 'Accepted' })));

  const startEdit = (row: FieldRow) => { setEditingId(row.id); setEditValue(row.value); };
  const saveEdit  = (id: number)    => { setFields(f => f.map(r => r.id === id ? { ...r, value: editValue, status: 'Accepted' } : r)); setEditingId(null); };

  const visible = fields.filter(r => {
    const matchCat    = catFilter    === 'All'          || r.category === catFilter;
    const matchStatus = statusFilter === 'All Statuses' || r.status   === statusFilter;
    return matchCat && matchStatus;
  });

  const total    = fields.length;
  const accepted = fields.filter(r => r.status === 'Accepted').length;
  const flagged  = fields.filter(r => r.status === 'Flagged').length;
  const rate     = total > 0 ? Math.round((accepted / total) * 100) : 0;

  const thStyle: React.CSSProperties = {
    padding: '9px 14px', fontSize: '11px', fontWeight: 600, color: K.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left',
    borderBottom: `1px solid ${K.border}`, background: '#fafafa', whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '11px 14px', fontSize: '12px', color: K.textSecondary,
    borderBottom: `1px solid ${K.borderSubtle}`, verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '24px', background: K.pageBg, minHeight: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Source selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: K.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Source</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0}
            style={{ padding: '7px 10px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#fff', color: currentIdx === 0 ? K.textFaint : K.textSecondary, cursor: currentIdx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, fontFamily: 'inherit' }}
          ><ChevronLeft size={14} /></button>
          <div style={{ flex: 1 }}>
            <SourceSearch selected={selectedSource} onSelect={handleSelectSource} />
          </div>
          <button
            onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === sources.length - 1}
            style={{ padding: '7px 10px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#fff', color: currentIdx === sources.length - 1 ? K.textFaint : K.textSecondary, cursor: currentIdx === sources.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, fontFamily: 'inherit' }}
          ><ChevronRight size={14} /></button>
          <span style={{ fontSize: '11px', color: K.textFaint, flexShrink: 0, whiteSpace: 'nowrap' }}>{currentIdx + 1} / {sources.length}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Fields', value: String(total),    color: K.textPrimary },
          { label: 'Accepted',     value: String(accepted), color: K.accent      },
          { label: 'Flagged',      value: String(flagged),  color: '#d97706'     },
          { label: 'Review Rate',  value: `${rate}%`,       color: rate === 100 ? K.accent : K.textPrimary },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '9px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '11px', color: K.textMuted, marginTop: '5px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: K.textMuted, fontWeight: 500 }}>Filter:</span>
          <FilterSelect value={catFilter}    options={categories} onChange={setCatFilter} />
          <FilterSelect value={statusFilter} options={statuses}   onChange={setStatusFilter} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: K.textFaint }}>Showing {visible.length} of {total}</span>
          <button onClick={acceptAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: K.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Check size={12} /> Accept All
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: K.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Send size={12} /> Publish
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${K.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Field</th>
              <th style={{ ...thStyle, minWidth: '220px' }}>Extracted Value</th>
              <th style={{ ...thStyle, minWidth: '260px' }}>Source Evidence</th>
              <th style={thStyle}>Confidence</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => {
              const isEditing = editingId === row.id;
              const rowBg = row.status === 'Accepted' ? 'rgba(22,163,74,0.02)' : row.status === 'Flagged' ? 'rgba(245,158,11,0.03)' : i % 2 === 0 ? '#fff' : '#fafafa';
              return (
                <tr key={row.id} style={{ background: rowBg, transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = K.cardBgHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
                >
                  <td style={tdStyle}><CategoryBadge cat={row.category} /></td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: K.textPrimary, whiteSpace: 'nowrap' }}>{row.field}</td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                          style={{ flex: 1, padding: '4px 8px', fontSize: '12px', border: `1px solid ${K.accentBorder}`, borderRadius: '5px', fontFamily: 'inherit', background: K.inputBg, color: K.textPrimary, outline: 'none' }} />
                        <button onClick={() => saveEdit(row.id)} style={{ padding: '3px 8px', background: K.accent, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '3px 6px', background: '#fff', border: `1px solid ${K.border}`, borderRadius: '4px', color: K.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>×</button>
                      </div>
                    ) : (
                      <span style={{ color: K.textPrimary, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row.value}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: K.textFaint, fontSize: '11px', lineHeight: 1.5 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{row.evidence}</span>
                  </td>
                  <td style={tdStyle}><ConfidenceDot pct={row.confidence} /></td>
                  <td style={tdStyle}><StatusChip status={row.status} /></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      {row.status !== 'Accepted' ? (
                        <button onClick={() => accept(row.id)} title="Accept"
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid rgba(22,163,74,0.25)`, background: 'rgba(22,163,74,0.08)', color: K.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={13} />
                        </button>
                      ) : (
                        <button onClick={() => reset(row.id)} title="Reset"
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textFaint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RotateCcw size={12} />
                        </button>
                      )}
                      {row.status !== 'Flagged' ? (
                        <button onClick={() => flag(row.id)} title="Flag"
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid rgba(245,158,11,0.25)`, background: 'rgba(245,158,11,0.08)', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Flag size={12} />
                        </button>
                      ) : (
                        <button onClick={() => reset(row.id)} title="Unflag"
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textFaint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RotateCcw size={12} />
                        </button>
                      )}
                      <button onClick={() => startEdit(row)} title="Edit value"
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${K.border}`, background: '#f8fafc', color: K.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
