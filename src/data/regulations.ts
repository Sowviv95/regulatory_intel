import type { RegulationDetail, EvidenceEntry, ReviewSource, RegulationFieldRow } from '../types';

// ---------------------------------------------------------------------------
// Single-document regulation detail (used by RegulationReview)
// ---------------------------------------------------------------------------

export const regulationDetail: RegulationDetail = {
  id: 1,
  jurisdiction: 'Taiwan',
  flag: '\u{1F1F9}\u{1F1FC}',
  sourceName: 'Health Promotion Administration, Ministry of Health and Welfare',
  title: 'Tobacco Hazards Prevention Act \u2014 Amendment 2026 (Enforcement of Electronic Nicotine Delivery Systems)',
  summary: 'This amendment introduces comprehensive regulations governing electronic nicotine delivery systems (ENDS) and heated tobacco products (HTP) in Taiwan. Key provisions include mandatory registration of all ENDS devices, standardised warning labels covering \u226550% of packaging, restrictions on flavoured products, and prohibition of online retail channels. Enforcement penalties are significantly increased for non-compliant distributors.',
  products: ['E-cigarettes', 'Heated Tobacco Products', 'Nicotine Pouches'],
  status: 'Ready for Review',
  sourceType: 'Legislative Amendment',
  proposer: 'Ministry of Health and Welfare',
  sectorImpact: 'High',
  likelihood: 'Confirmed',
  effectiveDate: 'Jan 1, 2027',
  noticeDate: 'Jul 14, 2026',
  commentDeadline: 'Sep 30, 2026',
};

export const sourceText = `\u885B\u751F\u798F\u5229\u90E8
\u5065\u5EB7\u4FC3\u9032\u7F72

\u516C\u6587\u5B57\u865F\uFF1A\u90E8\u6388\u98DF\u5B57\u7B2C1140300421\u865F

\u4E3B\u65E8\uFF1A\u9810\u544A\u300C\u83F8\u5BB3\u9632\u5236\u6CD5\u300D\u4FEE\u6B63\u8349\u6848\uFF0C\u516C\u544A\u5468\u77E5\u3002

\u4F9D\u64DA\uFF1A\u300A\u884C\u653F\u7A0B\u5E8F\u6CD5\u300B\u7B2C154\u689D\u3002

\u8AAA\u660E\uFF1A

\u4E00\u3001\u4FEE\u6B63\u8AAA\u660E
\u672C\u6B21\u4FEE\u6B63\u8349\u6848\u4FC2\u4F9D\u64DA\u4E16\u754C\u885B\u751F\u7D44\u7E54\u83F8\u8349\u63A7\u5236\u6846\u67B6\u516C\u7D04\uFF08WHO FCTC\uFF09\u7B2C9\u300110\u689D\u4E4B\u76F8\u95DC\u5EFA\u8B70\uFF0C\u53CA\u8FD1\u5E74\u96FB\u5B50\u83F8\uFF08ENDS\uFF09\u5E02\u5834\u5FEB\u901F\u64F4\u5F35\u6240\u884D\u751F\u4E4B\u516C\u5171\u885B\u751F\u7591\u616E\uFF0C\u91DD\u5C0D\u96FB\u5B50\u83F8\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\u4E4B\u7BA1\u7406\u898F\u7BC4\u9032\u884C\u5168\u9762\u6AA2\u8A0E\u8207\u4FEE\u6B63\u3002

\u4E8C\u3001\u4FEE\u6B63\u91CD\u9EDE

\uFF08\u4E00\uFF09\u7522\u54C1\u767B\u8A18\u5236\u5EA6
\u6240\u6709\u96FB\u5B50\u83F8\u88DD\u7F6E\uFF08\u542B\u83F8\u5F48\u3001\u83F8\u6DB2\uFF09\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\uFF0C\u9808\u65BC\u672C\u6CD5\u65BD\u884C\u65E5\u8D77\u516D\u500B\u6708\u5167\u5411\u4E3B\u7BA1\u6A5F\u95DC\u5B8C\u6210\u7522\u54C1\u767B\u8A18\uFF0C\u672A\u767B\u8A18\u8005\u4E0D\u5F97\u65BC\u5E02\u5834\u6D41\u901A\u92B7\u552E\u3002
\u7533\u8ACB\u767B\u8A18\u9808\u6AA2\u9644\uFF1A\u7522\u54C1\u6210\u5206\u6E05\u55AE\u3001\u6BD2\u7406\u5B78\u8A55\u4F30\u5831\u544A\u3001\u88FD\u9020\u5DE5\u5EE0\u5BE9\u6838\u6587\u4EF6\u53CA\u6D88\u8CBB\u8005\u5B89\u5168\u6578\u64DA\u3002

\uFF08\u4E8C\uFF09\u5065\u5EB7\u8B66\u8A9E\u6A19\u793A\u898F\u5B9A
\u6240\u6709\u83F8\u8349\u53CA\u5C3C\u53E4\u4E01\u76F8\u95DC\u7522\u54C1\u4E4B\u5305\u88DD\uFF0C\u9808\u4F9D\u672C\u6CD5\u898F\u5B9A\u6A19\u793A\u5065\u5EB7\u8B66\u8A9E\uFF0C\u5176\u9762\u7A4D\u4E0D\u5F97\u5C0F\u65BC\u6B63\u53CD\u9762\u5404\u767E\u5206\u4E4B\u4E94\u5341\uFF0850%\uFF09\uFF0C\u4E26\u61C9\u52A0\u5370\u5168\u5F69\u5716\u5F62\u8B66\u793A\u3002

\uFF08\u4E09\uFF09\u7279\u5B9A\u53E3\u5473\u9650\u5236
\u7981\u6B62\u751F\u7522\u3001\u9032\u53E3\u6216\u8CA9\u552E\u5177\u6709\u7CD6\u679C\u3001\u6C34\u679C\u3001\u8584\u8377\u9187\uFF08\u8584\u8377\u9664\u5916\uFF09\u53CA\u5176\u4ED6\u5438\u5F15\u672A\u6210\u5E74\u4EBA\u4E4B\u7279\u5B9A\u53E3\u5473\u7684\u96FB\u5B50\u83F8\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\u3002

\uFF08\u56DB\uFF09\u901A\u8DEF\u9650\u5236
\u5168\u9762\u7981\u6B62\u96FB\u5B50\u83F8\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\u900F\u904E\u7DB2\u8DEF\u3001\u90F5\u8CFC\u6216\u5176\u4ED6\u975E\u5BE6\u9AD4\u901A\u8DEF\u9032\u884C\u92B7\u552E\u3002\u5BE6\u9AD4\u96F6\u552E\u696D\u8005\u9700\u53D6\u5F97\u7279\u8A31\u57F7\u7167\u65B9\u53EF\u8CA9\u552E\u3002

\uFF08\u4E94\uFF09\u7F70\u5247\u52A0\u91CD
\u9055\u53CD\u672C\u6CD5\u898F\u5B9A\u8005\uFF0C\u8655\u65B0\u53F0\u5E63\u4E8C\u5341\u842C\u5143\u4EE5\u4E0A\u4E8C\u767E\u842C\u5143\u4EE5\u4E0B\u7F70\u946B\uFF1B\u60C5\u7BC0\u91CD\u5927\u8005\u5F97\u5EE2\u6B62\u5176\u71DF\u696D\u57F7\u7167\u3002

\u4E09\u3001\u65BD\u884C\u65E5\u671F
\u672C\u4FEE\u6B63\u6848\u9810\u8A08\u65BC\u4E2D\u83EF\u6C11\u570B116\u5E741\u67081\u65E5\uFF08\u897F\u51432027\u5E741\u67081\u65E5\uFF09\u8D77\u6B63\u5F0F\u65BD\u884C\u3002

\u56DB\u3001\u610F\u898B\u5FB5\u96C6
\u672C\u8349\u6848\u516C\u544A\u671F\u9593\u81EA\u6C11\u570B115\u5E747\u670814\u65E5\u8D77\u81F3115\u5E749\u670830\u65E5\u6B62\uFF0C\u6B61\u8FCE\u793E\u6703\u5404\u754C\u8E34\u8E8D\u63D0\u4F9B\u66F8\u9762\u610F\u898B\u3002

\u885B\u751F\u798F\u5229\u90E8\u90E8\u9577  \u859Bxx
\u4E2D\u83EF\u6C11\u570B\u4E00\u4E00\u4E94\u5E74\u4E03\u6708\u5341\u56DB\u65E5`;

export const evidenceMap: Record<string, EvidenceEntry> = {
  title: {
    text: '\u83F8\u5BB3\u9632\u5236\u6CD5\u300D\u4FEE\u6B63\u8349\u6848\uFF08\u96FB\u5B50\u5C3C\u53E4\u4E01\u50B3\u9001\u7CFB\u7D71\u57F7\u6CD5\uFF09',
    lines: 'Lines 3\u20135',
  },
  summary: {
    text: '\u672C\u6B21\u4FEE\u6B63\u8349\u6848\u4FC2\u4F9D\u64DA\u4E16\u754C\u885B\u751F\u7D44\u7E54\u83F8\u8349\u63A7\u5236\u6846\u67B6\u516C\u7D04\uFF08WHO FCTC\uFF09\u7B2C9\u300110\u689D\u4E4B\u76F8\u95DC\u5EFA\u8B70\uFF0C\u53CA\u8FD1\u5E74\u96FB\u5B50\u83F8\uFF08ENDS\uFF09\u5E02\u5834\u5FEB\u901F\u64F4\u5F35\u6240\u884D\u751F\u4E4B\u516C\u5171\u885B\u751F\u7591\u616E\uFF0C\u91DD\u5C0D\u96FB\u5B50\u83F8\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\u4E4B\u7BA1\u7406\u898F\u7BC4\u9032\u884C\u5168\u9762\u6AA2\u8A0E\u8207\u4FEE\u6B63\u3002',
    lines: 'Lines 12\u201316',
  },
  products: {
    text: '\u6240\u6709\u96FB\u5B50\u83F8\u88DD\u7F6E\uFF08\u542B\u83F8\u5F48\u3001\u83F8\u6DB2\uFF09\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\uFF0C\u9808\u65BC\u672C\u6CD5\u65BD\u884C\u65E5\u8D77\u516D\u500B\u6708\u5167\u5411\u4E3B\u7BA1\u6A5F\u95DC\u5B8C\u6210\u7522\u54C1\u767B\u8A18\u3002',
    lines: 'Lines 19\u201321',
  },
  sectorImpact: {
    text: '\u9055\u53CD\u672C\u6CD5\u898F\u5B9A\u8005\uFF0C\u8655\u65B0\u53F0\u5E63\u4E8C\u5341\u842C\u5143\u4EE5\u4E0A\u4E8C\u767E\u842C\u5143\u4EE5\u4E0B\u7F70\u946B\uFF1B\u60C5\u7BC0\u91CD\u5927\u8005\u5F97\u5EE2\u6B62\u5176\u71DF\u696D\u57F7\u7167\u3002',
    lines: 'Lines 42\u201343',
  },
  effectiveDate: {
    text: '\u672C\u4FEE\u6B63\u6848\u9810\u8A08\u65BC\u4E2D\u83EF\u6C11\u570B116\u5E741\u67081\u65E5\uFF08\u897F\u51432027\u5E741\u67081\u65E5\uFF09\u8D77\u6B63\u5F0F\u65BD\u884C\u3002',
    lines: 'Lines 46\u201347',
  },
  commentDeadline: {
    text: '\u672C\u8349\u6848\u516C\u544A\u671F\u9593\u81EA\u6C11\u570B115\u5E747\u670814\u65E5\u8D77\u81F3115\u5E749\u670830\u65E5\u6B62\uFF0C\u6B61\u8FCE\u793E\u6703\u5404\u754C\u8E34\u8E8D\u63D0\u4F9B\u66F8\u9762\u610F\u898B\u3002',
    lines: 'Lines 50\u201351',
  },
};

// ---------------------------------------------------------------------------
// Review table sources (used by RegulationReviewTable)
// ---------------------------------------------------------------------------

export const reviewSources: ReviewSource[] = [
  {
    id: 1,
    flag: '\u{1F1F9}\u{1F1FC}', country: 'Taiwan',
    title: 'Tobacco Hazards Prevention Act \u2014 Amendment 2026',
    sourceName: 'Health Promotion Administration, MOHW',
    docType: 'Legislative Amendment', date: 'Jul 14, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Taiwan',                                                    evidence: '\u885B\u751F\u798F\u5229\u90E8\u5065\u5EB7\u4FC3\u9032\u7F72 \u2014 Ministry of Health and Welfare, Taiwan',                       confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Health Promotion Administration, MOHW',                     evidence: '\u885B\u751F\u798F\u5229\u90E8\u5065\u5EB7\u4FC3\u9032\u7F72\u516C\u544A \u2014 Health Promotion Administration announcement',           confidence: 97 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Legislative Amendment',                                     evidence: '\u9810\u544A\u300C\u83F8\u5BB3\u9632\u5236\u6CD5\u300D\u4FEE\u6B63\u8349\u6848 \u2014 Amendment draft of the Tobacco Hazards Prevention Act', confidence: 96 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Health and Welfare',                            evidence: '\u885B\u751F\u798F\u5229\u90E8\u90E8\u9577 \u859Bxx \u2014 Minister of Health and Welfare',                              confidence: 98 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Tobacco Hazards Prevention Act Amendment 2026',              evidence: '\u83F8\u5BB3\u9632\u5236\u6CD5\u4FEE\u6B63\u8349\u6848 \u2014 Draft amendment to the Tobacco Hazards Prevention Act',        confidence: 95 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Introduces mandatory ENDS registration, \u226550% warning label coverage, flavour restrictions, and online retail ban with increased penalties.', evidence: '\u672C\u6B21\u4FEE\u6B63\u8349\u6848\u4FC2\u4F9D\u64DAWHO FCTC\u7B2C9\u300110\u689D\u4E4B\u76F8\u95DC\u5EFA\u8B70\uFF0C\u91DD\u5C0D\u96FB\u5B50\u83F8\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\u4E4B\u7BA1\u7406\u898F\u7BC4\u9032\u884C\u5168\u9762\u6AA2\u8A0E\u8207\u4FEE\u6B63\u3002', confidence: 87 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'E-cigarettes, Heated Tobacco Products, Nicotine Pouches',   evidence: '\u6240\u6709\u96FB\u5B50\u83F8\u88DD\u7F6E\uFF08\u542B\u83F8\u5F48\u3001\u83F8\u6DB2\uFF09\u53CA\u52A0\u71B1\u83F8\u8349\u7522\u54C1\uFF0C\u9808\u65BC\u672C\u6CD5\u65BD\u884C\u65E5\u8D77\u516D\u500B\u6708\u5167\u5B8C\u6210\u767B\u8A18\u3002',         confidence: 91 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'High',                                                      evidence: '\u9055\u53CD\u672C\u6CD5\u898F\u5B9A\u8005\uFF0C\u8655\u65B0\u53F0\u5E63\u4E8C\u5341\u842C\u5143\u4EE5\u4E0A\u4E8C\u767E\u842C\u5143\u4EE5\u4E0B\u7F70\u946B\uFF1B\u60C5\u7BC0\u91CD\u5927\u8005\u5F97\u5EE2\u6B62\u5176\u71DF\u696D\u57F7\u7167\u3002',       confidence: 82 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Confirmed',                                                 evidence: '\u672C\u4FEE\u6B63\u6848\u9810\u8A08\u65BC\u4E2D\u83EF\u6C11\u570B116\u5E741\u67081\u65E5\uFF08\u897F\u51432027\u5E741\u67081\u65E5\uFF09\u8D77\u6B63\u5F0F\u65BD\u884C\u3002',                     confidence: 78 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Ready for Review',                                          evidence: 'Draft published for public consultation period.',                                   confidence: 85 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 14, 2026',                                              evidence: '\u6C11\u570B115\u5E747\u670814\u65E5 \u2014 Republic of China year 115, July 14',                           confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Sep 30, 2026',                                              evidence: '\u516C\u544A\u671F\u9593\u81EA\u6C11\u570B115\u5E747\u670814\u65E5\u8D77\u81F3115\u5E749\u670830\u65E5\u6B62\u3002',                                     confidence: 88 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Jan 1, 2027',                                               evidence: '\u672C\u4FEE\u6B63\u6848\u9810\u8A08\u65BC\u4E2D\u83EF\u6C11\u570B116\u5E741\u67081\u65E5\uFF08\u897F\u51432027\u5E741\u67081\u65E5\uFF09\u8D77\u6B63\u5F0F\u65BD\u884C\u3002',                     confidence: 94 },
    ],
  },
  {
    id: 2,
    flag: '\u{1F1F0}\u{1F1F7}', country: 'South Korea',
    title: 'Electronic Cigarette Content Disclosure Rules Update',
    sourceName: 'Ministry of Health and Welfare',
    docType: 'Regulatory Notice', date: 'Jul 13, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'South Korea',                                               evidence: '\uBCF4\uAC74\uBCF5\uC9C0\uBD80 \u2014 Ministry of Health and Welfare, Republic of Korea',                    confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Ministry of Health and Welfare',                            evidence: '\uBCF4\uAC74\uBCF5\uC9C0\uBD80 \uACE0\uC2DC \uC81C2026-142\uD638 \u2014 MOHW Notice No. 2026-142',                           confidence: 96 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Regulatory Notice',                                         evidence: '\uC804\uC790\uB2F4\uBC30 \uC131\uBD84 \uACF5\uAC1C \uADDC\uC815 \uAC1C\uC815\uC548 \u2014 Amendment to e-cigarette content disclosure rules',   confidence: 94 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Korea Disease Control and Prevention Agency',               evidence: '\uC9C8\uBCD1\uAD00\uB9AC\uCCAD\uC7A5 \u2014 Director of KDCA',                                                    confidence: 91 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Electronic Cigarette Content Disclosure Rules 2026',        evidence: '\uC804\uC790\uB2F4\uBC30 \uC131\uBD84 \uACF5\uAC1C\uC5D0 \uAD00\uD55C \uADDC\uC815 \u2014 Regulation on disclosure of e-cigarette contents',  confidence: 93 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Mandates quarterly reporting of all chemical constituents in e-liquids and aerosols; expands ingredient database requirements.', evidence: '\uC804\uC790\uB2F4\uBC30 \uC81C\uC870\uC0AC \uBC0F \uC218\uC785\uC5C5\uC790\uB294 \uBD84\uAE30\uBCC4\uB85C \uC804\uC790\uB2F4\uBC30 \uC131\uBD84\uC744 \uC2DD\uD488\uC758\uC57D\uD488\uC548\uC804\uCC98\uC5D0 \uBCF4\uACE0\uD558\uC5EC\uC57C \uD55C\uB2E4.', confidence: 84 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'E-cigarettes, E-liquids',                                   evidence: '\uC804\uC790\uB2F4\uBC30 \uBC0F \uC804\uC790\uB2F4\uBC30 \uC561\uC0C1 \u2014 Electronic cigarettes and e-liquids',                     confidence: 97 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'High',                                                      evidence: '\uC704\uBC18 \uC2DC \uCD5C\uB300 500\uB9CC\uC6D0 \uACFC\uD0DC\uB8CC \uBD80\uACFC \u2014 Fine up to KRW 5 million for violation',           confidence: 88 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Confirmed',                                                 evidence: '\uC2DC\uD589\uC77C: 2026\uB144 10\uC6D4 1\uC77C \u2014 Enforcement date: October 1, 2026',                       confidence: 95 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Processing',                                                evidence: 'Currently under inter-ministerial review before final issuance.',                    confidence: 79 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 13, 2026',                                              evidence: '\uACF5\uACE0\uC77C: 2026\uB144 7\uC6D4 13\uC77C \u2014 Announcement date: July 13, 2026',                        confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Aug 27, 2026',                                              evidence: '\uC758\uACAC\uC81C\uCD9C \uAE30\uD55C: 2026\uB144 8\uC6D4 27\uC77C \u2014 Deadline for comments: August 27, 2026',            confidence: 97 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Oct 1, 2026',                                               evidence: '\uC2DC\uD589\uC77C: 2026\uB144 10\uC6D4 1\uC77C \u2014 Effective date: October 1, 2026',                         confidence: 95 },
    ],
  },
  {
    id: 3,
    flag: '\u{1F1E9}\u{1F1F0}', country: 'Denmark',
    title: 'Nicotine Pouch Maximum Strength Regulation',
    sourceName: 'Danish Medicines Agency',
    docType: 'Regulatory Guidance', date: 'Jul 11, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Denmark',                                                   evidence: 'L\u00E6gemiddelstyrelsen \u2014 Danish Medicines Agency',                                     confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Danish Medicines Agency (L\u00E6gemiddelstyrelsen)',             evidence: 'Vejledning om nikotinposer \u2014 Guidance on nicotine pouches',                         confidence: 97 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Regulatory Guidance',                                       evidence: 'Regulatorisk vejledning nr. 2026/44 \u2014 Regulatory guidance no. 2026/44',             confidence: 93 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Danish Medicines Agency',                                   evidence: 'Udstedt af L\u00E6gemiddelstyrelsen \u2014 Issued by the Danish Medicines Agency',             confidence: 98 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Nicotine Pouch Maximum Strength Regulation 2026',           evidence: 'Regulering af maksimal nikotinstyrke i nikotinposer',                               confidence: 94 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Caps nicotine concentration in pouches at 20 mg/g; prohibits sale to under-18s via any channel; requires child-resistant packaging.', evidence: 'Maksimal nikotinindhold i nikotinposer fasts\u00E6ttes til 20 mg/g. Salg til personer under 18 \u00E5r forbydes i alle kanaler.', confidence: 89 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'Nicotine Pouches',                                          evidence: 'Nikotinposer \u2014 alle varianter og styrker \u2014 Nicotine pouches, all variants',          confidence: 99 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'Medium',                                                    evidence: 'B\u00F8de op til DKK 50.000 for overtr\u00E6delse \u2014 Fine up to DKK 50,000 for violation',      confidence: 81 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Probable',                                                  evidence: 'Forventet ikrafttr\u00E6den: 1. januar 2027 \u2014 Expected entry into force: January 1, 2027', confidence: 76 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Ready for Review',                                          evidence: 'H\u00F8ringsfrist udl\u00F8bet \u2014 Public consultation period closed',                           confidence: 83 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 11, 2026',                                              evidence: 'Offentliggjort den 11. juli 2026 \u2014 Published July 11, 2026',                         confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Aug 15, 2026',                                              evidence: 'H\u00F8ringsfrist: 15. august 2026 \u2014 Consultation deadline: August 15, 2026',             confidence: 96 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Jan 1, 2027',                                               evidence: 'Ikrafttr\u00E6den: 1. januar 2027 \u2014 Entry into force: January 1, 2027',                   confidence: 90 },
    ],
  },
  {
    id: 4,
    flag: '\u{1F1FB}\u{1F1F3}', country: 'Vietnam',
    title: 'Tobacco Control Law Phase 3 Implementation Decree',
    sourceName: 'Vietnam Tobacco Control Fund',
    docType: 'Implementation Decree', date: 'Jul 12, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Vietnam',                                                   evidence: 'Qu\u1EF9 Ph\u00F2ng ch\u1ED1ng t\u00E1c h\u1EA1i c\u1EE7a thu\u1ED1c l\u00E1 \u2014 Vietnam Tobacco Control Fund',               confidence: 98 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Vietnam Tobacco Control Fund',                              evidence: 'Ngh\u1ECB \u0111\u1ECBnh c\u1EE7a Ch\u00EDnh ph\u1EE7 \u2014 Government decree',                                       confidence: 95 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Implementation Decree',                                     evidence: 'Ngh\u1ECB \u0111\u1ECBnh s\u1ED1 77/2026/N\u0110-CP \u2014 Decree No. 77/2026/ND-CP',                            confidence: 97 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Health Vietnam',                               evidence: 'B\u1ED9 Y t\u1EBF \u0111\u1EC1 xu\u1EA5t \u2014 Proposed by the Ministry of Health',                              confidence: 94 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Tobacco Control Law Phase 3 Implementation Decree',         evidence: 'H\u01B0\u1EDBng d\u1EABn thi h\u00E0nh Lu\u1EADt Ph\u00F2ng ch\u1ED1ng t\u00E1c h\u1EA1i c\u1EE7a thu\u1ED1c l\u00E1 Giai \u0111o\u1EA1n 3',            confidence: 92 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Phase 3 extends graphic health warnings to 75% of packaging, bans tobacco advertising in all digital media, and introduces plain packaging pilot for 3 provinces.', evidence: 'Giai \u0111o\u1EA1n 3 m\u1EDF r\u1ED9ng c\u1EA3nh b\u00E1o s\u1EE9c kh\u1ECFe \u0111\u1ED3 h\u1ECDa l\u00EAn 75% bao b\u00EC, c\u1EA5m qu\u1EA3ng c\u00E1o thu\u1ED1c l\u00E1 tr\u00EAn t\u1EA5t c\u1EA3 ph\u01B0\u01A1ng ti\u1EC7n k\u1EF9 thu\u1EADt s\u1ED1.', confidence: 83 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'Cigarettes, Heated Tobacco Products',                       evidence: 'Thu\u1ED1c l\u00E1 \u0111i\u1EBFu v\u00E0 s\u1EA3n ph\u1EA9m thu\u1ED1c l\u00E1 nung n\u00F3ng \u2014 Cigarettes and heated tobacco products', confidence: 93 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'High',                                                      evidence: 'Ph\u1EA1t ti\u1EC1n t\u1EEB 20 \u0111\u1EBFn 100 tri\u1EC7u \u0111\u1ED3ng \u2014 Fines from VND 20\u2013100 million',               confidence: 86 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Confirmed',                                                 evidence: 'Ngh\u1ECB \u0111\u1ECBnh c\u00F3 hi\u1EC7u l\u1EF1c t\u1EEB ng\u00E0y 01/01/2027 \u2014 Decree effective from January 1, 2027',  confidence: 91 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'New',                                                       evidence: 'M\u1EDBi ban h\u00E0nh \u2014 Newly issued',                                                       confidence: 80 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 12, 2026',                                              evidence: 'Ng\u00E0y ban h\u00E0nh: 12/07/2026 \u2014 Date of issue: July 12, 2026',                          confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'N/A',                                                       evidence: 'Kh\u00F4ng c\u00F3 giai \u0111o\u1EA1n l\u1EA5y \u00FD ki\u1EBFn \u2014 No public consultation phase',                     confidence: 72 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Jan 1, 2027',                                               evidence: 'Hi\u1EC7u l\u1EF1c thi h\u00E0nh t\u1EEB ng\u00E0y 01/01/2027 \u2014 Effective from January 1, 2027',             confidence: 93 },
    ],
  },
  {
    id: 5,
    flag: '\u{1F1EB}\u{1F1EE}', country: 'Finland',
    title: 'E-cigarette Point-of-Sale Display Restrictions',
    sourceName: 'Finnish Institute for Health and Welfare',
    docType: 'Amendment Proposal', date: 'Jul 10, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Finland',                                                   evidence: 'Terveyden ja hyvinvoinnin laitos (THL) \u2014 Finnish Institute for Health and Welfare',  confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Finnish Institute for Health and Welfare (THL)',            evidence: 'THL:n lausunto \u2014 THL statement',                                                     confidence: 96 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Amendment Proposal',                                        evidence: 'Lakimuutosehdotus \u2014 Legislative amendment proposal',                                confidence: 94 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Social Affairs and Health Finland',            evidence: 'Sosiaali- ja terveysministeri\u00F6 \u2014 Ministry of Social Affairs and Health',             confidence: 97 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'E-cigarette Point-of-Sale Display Restrictions 2026',       evidence: 'S\u00E4hk\u00F6savukkeiden myyntipisteess\u00E4 esitt\u00E4misen rajoitukset',                          confidence: 91 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Proposes complete removal of e-cigarette displays from all retail point-of-sale locations, aligned with existing cigarette display ban.', evidence: 'S\u00E4hk\u00F6savukkeet ehdotetaan t\u00E4ysin poistettavaksi myyntipisteist\u00E4, yhdenmukaisesti savukkeiden n\u00E4ytt\u00F6kiellon kanssa.', confidence: 86 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'E-cigarettes',                                              evidence: 'S\u00E4hk\u00F6savukkeet ja t\u00E4ytt\u00F6pakkaukset \u2014 E-cigarettes and refill packs',                confidence: 95 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'Low',                                                       evidence: 'Rikkomusmaksu enint\u00E4\u00E4n 5 000 euroa \u2014 Infringement fine up to \u20AC5,000',              confidence: 79 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Likely',                                                    evidence: 'Hallituksen esitys \u2014 Government bill expected Q4 2026',                             confidence: 74 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Processing',                                                evidence: 'Lausuntokierroksella \u2014 Currently in consultation round',                            confidence: 82 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 10, 2026',                                              evidence: 'Julkaistu 10. hein\u00E4kuuta 2026 \u2014 Published July 10, 2026',                          confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Sep 5, 2026',                                               evidence: 'Lausuntopyynt\u00F6 p\u00E4\u00E4ttyy 5.9.2026 \u2014 Comment request closes September 5, 2026',       confidence: 94 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'TBD',                                                       evidence: 'Voimaantulopaiv\u00E4 vahvistetaan my\u00F6hemmin \u2014 Effective date to be confirmed',         confidence: 61 },
    ],
  },
  {
    id: 6,
    flag: '\u{1F1F5}\u{1F1F1}', country: 'Poland',
    title: 'Heated Tobacco Product Labeling Requirements',
    sourceName: 'Chief Sanitary Inspectorate',
    docType: 'Technical Standard', date: 'Jul 9, 2026',
    fields: [
      { id: 1,  category: 'Metadata',   field: 'Jurisdiction',      value: 'Poland',                                                    evidence: 'G\u0142\u00F3wny Inspektorat Sanitarny \u2014 Chief Sanitary Inspectorate, Poland',               confidence: 99 },
      { id: 2,  category: 'Metadata',   field: 'Source Name',       value: 'Chief Sanitary Inspectorate (GIS)',                         evidence: 'GIS komunikat nr 2026/38 \u2014 GIS Communiqu\u00E9 No. 2026/38',                            confidence: 97 },
      { id: 3,  category: 'Metadata',   field: 'Source Type',       value: 'Technical Standard',                                        evidence: 'Norma techniczna \u2014 Technical standard (PN-EN compliance)',                          confidence: 92 },
      { id: 4,  category: 'Metadata',   field: 'Proposer',          value: 'Ministry of Health Poland',                                 evidence: 'Ministerstwo Zdrowia \u2014 Ministry of Health, Poland',                                 confidence: 96 },
      { id: 5,  category: 'Content',    field: 'Title',             value: 'Heated Tobacco Product Labeling Requirements 2026',         evidence: 'Wymagania dotycz\u0105ce oznakowania podgrzewanych wyrob\u00F3w tytoniowych',               confidence: 93 },
      { id: 6,  category: 'Content',    field: 'Summary',           value: 'Specifies mandatory labeling for HTP packaging including emission data, health warnings in Polish, and QR-code traceability links.', evidence: 'Oznakowanie musi zawiera\u0107 dane dotycz\u0105ce emisji, ostrze\u017Cenia zdrowotne w j\u0119zyku polskim oraz kody QR umo\u017Cliwiaj\u0105ce identyfikowalno\u015B\u0107.', confidence: 88 },
      { id: 7,  category: 'Content',    field: 'Products Impacted', value: 'Heated Tobacco Products',                                   evidence: 'Podgrzewane wyroby tytoniowe \u2014 wszystkie kategorie \u2014 Heated tobacco products, all categories', confidence: 98 },
      { id: 8,  category: 'Assessment', field: 'Sector Impact',     value: 'Medium',                                                    evidence: 'Kara pieni\u0119\u017Cna do 200 000 PLN \u2014 Financial penalty up to PLN 200,000',              confidence: 84 },
      { id: 9,  category: 'Assessment', field: 'Likelihood',        value: 'Probable',                                                  evidence: 'Wej\u015Bcie w \u017Cycie: 1 marca 2027 \u2014 Entry into force: March 1, 2027',                  confidence: 80 },
      { id: 10, category: 'Assessment', field: 'Status',            value: 'Ready for Review',                                          evidence: 'Projekt zako\u0144czy\u0142 faz\u0119 konsultacji \u2014 Consultation phase completed',               confidence: 86 },
      { id: 11, category: 'Dates',      field: 'Notice Date',       value: 'Jul 9, 2026',                                               evidence: 'Data publikacji: 9 lipca 2026 \u2014 Publication date: July 9, 2026',                  confidence: 99 },
      { id: 12, category: 'Dates',      field: 'Comment Deadline',  value: 'Aug 9, 2026',                                               evidence: 'Termin sk\u0142adania uwag: 9 sierpnia 2026 \u2014 Deadline for comments: August 9, 2026',  confidence: 95 },
      { id: 13, category: 'Dates',      field: 'Effective Date',    value: 'Mar 1, 2027',                                               evidence: 'Wej\u015Bcie w \u017Cycie: 1 marca 2027 \u2014 Effective date: March 1, 2027',                   confidence: 91 },
    ],
  },
];
