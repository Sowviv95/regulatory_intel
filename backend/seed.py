"""Seed the database with demo data matching the frontend mock dataset."""
from database import get_connection, init_db

# Source text for Taiwan regulation (source 1)
TAIWAN_SOURCE_TEXT = """\u885b\u751f\u798f\u5229\u90e8
\u5065\u5eb7\u4fc3\u9032\u7f72

\u516c\u6587\u5b57\u865f\uff1a\u90e8\u6388\u98df\u5b57\u7b2c1140300421\u865f

\u4e3b\u65e8\uff1a\u9810\u544a\u300c\u83f8\u5bb3\u9632\u5236\u6cd5\u300d\u4fee\u6b63\u8349\u6848\uff0c\u516c\u544a\u5468\u77e5\u3002

\u4f9d\u64da\uff1a\u300a\u884c\u653f\u7a0b\u5e8f\u6cd5\u300b\u7b2c154\u689d\u3002

\u8aaa\u660e\uff1a

\u4e00\u3001\u4fee\u6b63\u8aaa\u660e
\u672c\u6b21\u4fee\u6b63\u8349\u6848\u4fc2\u4f9d\u64da\u4e16\u754c\u885b\u751f\u7d44\u7e54\u83f8\u8349\u63a7\u5236\u6846\u67b6\u516c\u7d04\uff08WHO FCTC\uff09\u7b2c9\u300110\u689d\u4e4b\u76f8\u95dc\u5efa\u8b70\uff0c\u53ca\u8fd1\u5e74\u96fb\u5b50\u83f8\uff08ENDS\uff09\u5e02\u5834\u5feb\u901f\u64f4\u5f35\u6240\u884d\u751f\u4e4b\u516c\u5171\u885b\u751f\u7591\u616e\uff0c\u91dd\u5c0d\u96fb\u5b50\u83f8\u53ca\u52a0\u71b1\u83f8\u8349\u7522\u54c1\u4e4b\u7ba1\u7406\u898f\u7bc4\u9032\u884c\u5168\u9762\u6aa2\u8a0e\u8207\u4fee\u6b63\u3002

\u4e8c\u3001\u4fee\u6b63\u91cd\u9ede

\uff08\u4e00\uff09\u7522\u54c1\u767b\u8a18\u5236\u5ea6
\u6240\u6709\u96fb\u5b50\u83f8\u88dd\u7f6e\uff08\u542b\u83f8\u5f48\u3001\u83f8\u6db2\uff09\u53ca\u52a0\u71b1\u83f8\u8349\u7522\u54c1\uff0c\u9808\u65bc\u672c\u6cd5\u65bd\u884c\u65e5\u8d77\u516d\u500b\u6708\u5167\u5411\u4e3b\u7ba1\u6a5f\u95dc\u5b8c\u6210\u7522\u54c1\u767b\u8a18\uff0c\u672a\u767b\u8a18\u8005\u4e0d\u5f97\u65bc\u5e02\u5834\u6d41\u901a\u92b7\u552e\u3002
\u7533\u8acb\u767b\u8a18\u9808\u6aa2\u9644\uff1a\u7522\u54c1\u6210\u5206\u6e05\u55ae\u3001\u6bd2\u7406\u5b78\u8a55\u4f30\u5831\u544a\u3001\u88fd\u9020\u5de5\u5ee0\u5be9\u6838\u6587\u4ef6\u53ca\u6d88\u8cbb\u8005\u5b89\u5168\u6578\u64da\u3002

\uff08\u4e8c\uff09\u5065\u5eb7\u8b66\u8a9e\u6a19\u793a\u898f\u5b9a
\u6240\u6709\u83f8\u8349\u53ca\u5c3c\u53e4\u4e01\u76f8\u95dc\u7522\u54c1\u4e4b\u5305\u88dd\uff0c\u9808\u4f9d\u672c\u6cd5\u898f\u5b9a\u6a19\u793a\u5065\u5eb7\u8b66\u8a9e\uff0c\u5176\u9762\u7a4d\u4e0d\u5f97\u5c0f\u65bc\u6b63\u53cd\u9762\u5404\u767e\u5206\u4e4b\u4e94\u5341\uff0850%\uff09\uff0c\u4e26\u61c9\u52a0\u5370\u5168\u5f69\u5716\u5f62\u8b66\u793a\u3002

\uff08\u4e09\uff09\u7279\u5b9a\u53e3\u5473\u9650\u5236
\u7981\u6b62\u751f\u7522\u3001\u9032\u53e3\u6216\u8ca9\u552e\u5177\u6709\u7cd6\u679c\u3001\u6c34\u679c\u3001\u8584\u8377\u9187\uff08\u8584\u8377\u9664\u5916\uff09\u53ca\u5176\u4ed6\u5438\u5f15\u672a\u6210\u5e74\u4eba\u4e4b\u7279\u5b9a\u53e3\u5473\u7684\u96fb\u5b50\u83f8\u53ca\u52a0\u71b1\u83f8\u8349\u7522\u54c1\u3002

\uff08\u56db\uff09\u901a\u8def\u9650\u5236
\u5168\u9762\u7981\u6b62\u96fb\u5b50\u83f8\u53ca\u52a0\u71b1\u83f8\u8349\u7522\u54c1\u900f\u904e\u7db2\u8def\u3001\u90f5\u8cfc\u6216\u5176\u4ed6\u975e\u5be6\u9ad4\u901a\u8def\u9032\u884c\u92b7\u552e\u3002\u5be6\u9ad4\u96f6\u552e\u696d\u8005\u9700\u53d6\u5f97\u7279\u8a31\u57f7\u7167\u65b9\u53ef\u8ca9\u552e\u3002

\uff08\u4e94\uff09\u7f70\u5247\u52a0\u91cd
\u9055\u53cd\u672c\u6cd5\u898f\u5b9a\u8005\uff0c\u8655\u65b0\u53f0\u5e63\u4e8c\u5341\u842c\u5143\u4ee5\u4e0a\u4e8c\u767e\u842c\u5143\u4ee5\u4e0b\u7f70\u946b\uff1b\u60c5\u7bc0\u91cd\u5927\u8005\u5f97\u5ee2\u6b62\u5176\u71df\u696d\u57f7\u7167\u3002

\u4e09\u3001\u65bd\u884c\u65e5\u671f
\u672c\u4fee\u6b63\u6848\u9810\u8a08\u65bc\u4e2d\u83ef\u6c11\u570b116\u5e741\u67081\u65e5\uff08\u897f\u51432027\u5e741\u67081\u65e5\uff09\u8d77\u6b63\u5f0f\u65bd\u884c\u3002

\u56db\u3001\u610f\u898b\u5fb5\u96c6
\u672c\u8349\u6848\u516c\u544a\u671f\u9593\u81ea\u6c11\u570b115\u5e747\u670814\u65e5\u8d77\u81f3115\u5e749\u670830\u65e5\u6b62\uff0c\u6b61\u8fce\u793e\u6703\u5404\u754c\u8e34\u8e8d\u63d0\u4f9b\u66f8\u9762\u610f\u898b\u3002

\u885b\u751f\u798f\u5229\u90e8\u90e8\u9577  \u859bxx
\u4e2d\u83ef\u6c11\u570b\u4e00\u4e00\u4e94\u5e74\u4e03\u6708\u5341\u56db\u65e5"""

SOURCES = [
    (1, "\U0001f1f9\U0001f1fc", "Taiwan", "Health Promotion Administration", "Tobacco Hazards Prevention Act Amendment 2026", "ZH-TW", "Legislative Amendment", "Jul 14, 2026", "New", "Awaiting Extraction", None, None, None, TAIWAN_SOURCE_TEXT),
    (2, "\U0001f1f0\U0001f1f7", "South Korea", "Ministry of Health and Welfare", "E-cigarette Content Disclosure Rules Update", "KO", "Regulatory Notice", "Jul 13, 2026", "Processing", "AI Extraction", "Jul 13, 2026 10:22", None, None, None),
    (3, "\U0001f1fb\U0001f1f3", "Vietnam", "Vietnam Tobacco Control Fund", "Tobacco Control Law Phase 3 Implementation Decree", "VI", "Implementation Decree", "Jul 12, 2026", "New", "Awaiting Extraction", None, None, None, None),
    (4, "\U0001f1e9\U0001f1f0", "Denmark", "Danish Medicines Agency", "Nicotine Pouch Maximum Strength Regulation", "DA", "Regulatory Guidance", "Jul 11, 2026", "Ready for Review", "Analyst Review", "Jul 11, 2026 08:45", "Jul 11, 2026 09:12", None, None),
    (5, "\U0001f1eb\U0001f1ee", "Finland", "Finnish Institute for Health", "E-cigarette Point-of-Sale Display Restrictions", "FI", "Amendment Proposal", "Jul 10, 2026", "Processing", "Translating", "Jul 10, 2026 14:05", None, None, None),
    (6, "\U0001f1f5\U0001f1f1", "Poland", "Chief Sanitary Inspectorate", "Heated Tobacco Product Labeling Requirements", "PL", "Technical Standard", "Jul 9, 2026", "Ready for Review", "Analyst Review", "Jul 9, 2026 11:30", "Jul 9, 2026 12:01", None, None),
    (7, "\U0001f1f9\U0001f1fc", "Taiwan", "Food and Drug Administration", "Cosmetic Product Safety Standards (Not Tobacco)", "ZH-TW", "Product Registration", "Jul 8, 2026", "Irrelevant", "Discarded", "Jul 8, 2026 09:00", None, None, None),
    (8, "\U0001f1f0\U0001f1f7", "South Korea", "Korea Customs Service", "Tobacco Import Restriction Notice Q3 2026", "KO", "Import Restriction Notice", "Jul 7, 2026", "Processing", "Quality Check", "Jul 7, 2026 08:10", None, None, None),
    (9, "\U0001f1fb\U0001f1f3", "Vietnam", "Ministry of Health", "Tobacco Retailer Licensing Ministerial Circular", "VI", "Ministerial Circular", "Jul 6, 2026", "New", "Awaiting Extraction", None, None, None, None),
    (10, "\U0001f1e9\U0001f1f0", "Denmark", "Danish Health Authority", "ENDS Device Safety Standards Consultation", "DA", "Public Consultation", "Jul 5, 2026", "Ready for Review", "Analyst Review", "Jul 5, 2026 07:30", "Jul 5, 2026 08:15", None, None),
    (11, "\U0001f1f5\U0001f1f1", "Poland", "Office for Registration of MP", "Nicotine Replacement Product Registration Update", "PL", "Regulatory Update", "Jul 4, 2026", "Processing", "AI Extraction", "Jul 4, 2026 13:45", None, None, None),
    (12, "\U0001f1eb\U0001f1ee", "Finland", "Valvira \u2013 National Supervisory", "Flavoured E-liquid Ban Enforcement Notice", "FI", "Enforcement Notice", "Jul 3, 2026", "New", "Awaiting Extraction", None, None, None, None),
]

# Regulations: one per source for sources 1-6
# (source_id, title, regulatory_body, jurisdiction, topic, summary, status)
REGULATIONS = [
    (1, "Tobacco Hazards Prevention Act Amendment 2026", "Health Promotion Administration, MOHW", "Taiwan", "ENDS Regulation", "Introduces mandatory ENDS registration, \u226550% warning label coverage, flavour restrictions, and online retail ban with increased penalties.", "Pending"),
    (2, "Electronic Cigarette Content Disclosure Rules 2026", "Ministry of Health and Welfare", "South Korea", "E-cigarette Disclosure", "Mandates quarterly reporting of all chemical constituents in e-liquids and aerosols; expands ingredient database requirements.", "Pending"),
    (3, "Nicotine Pouch Maximum Strength Regulation 2026", "Danish Medicines Agency", "Denmark", "Nicotine Pouches", "Caps nicotine concentration in pouches at 20 mg/g; prohibits sale to under-18s via any channel; requires child-resistant packaging.", "Pending"),
    (4, "Tobacco Control Law Phase 3 Implementation Decree", "Vietnam Tobacco Control Fund", "Vietnam", "Tobacco Control", "Phase 3 extends graphic health warnings to 75% of packaging, bans tobacco advertising in all digital media, and introduces plain packaging pilot for 3 provinces.", "Pending"),
    (5, "E-cigarette Point-of-Sale Display Restrictions 2026", "Finnish Institute for Health and Welfare", "Finland", "E-cigarette Display", "Proposes complete removal of e-cigarette displays from all retail point-of-sale locations, aligned with existing cigarette display ban.", "Pending"),
    (6, "Heated Tobacco Product Labeling Requirements 2026", "Chief Sanitary Inspectorate", "Poland", "HTP Labeling", "Specifies mandatory labeling for HTP packaging including emission data, health warnings in Polish, and QR-code traceability links.", "Pending"),
]

# Map regulation index (0-based) to source_id for field assignment
REG_SOURCE_MAP = {1: 1, 2: 2, 3: 4, 4: 3, 5: 5, 6: 6}  # reg_id -> source_id

# Fields: (category, field_name, extracted_value, evidence_excerpt, confidence, evidence_section)
FIELDS_BY_REG = {
    1: [
        ("Metadata", "Jurisdiction", "Taiwan", "\u885b\u751f\u798f\u5229\u90e8\u5065\u5eb7\u4fc3\u9032\u7f72 \u2014 Ministry of Health and Welfare, Taiwan", 99, "Header"),
        ("Metadata", "Source Name", "Health Promotion Administration, MOHW", "\u885b\u751f\u798f\u5229\u90e8\u5065\u5eb7\u4fc3\u9032\u7f72\u516c\u544a \u2014 Health Promotion Administration announcement", 97, "Header"),
        ("Metadata", "Source Type", "Legislative Amendment", "\u9810\u544a\u300c\u83f8\u5bb3\u9632\u5236\u6cd5\u300d\u4fee\u6b63\u8349\u6848 \u2014 Amendment draft", 96, "Subject"),
        ("Metadata", "Proposer", "Ministry of Health and Welfare", "\u885b\u751f\u798f\u5229\u90e8\u90e8\u9577 \u859bxx \u2014 Minister of Health and Welfare", 98, "Signature"),
        ("Content", "Title", "Tobacco Hazards Prevention Act Amendment 2026", "\u83f8\u5bb3\u9632\u5236\u6cd5\u4fee\u6b63\u8349\u6848 \u2014 Draft amendment", 95, "Subject, Lines 3\u20135"),
        ("Content", "Summary", "Introduces mandatory ENDS registration, \u226550% warning label coverage, flavour restrictions, and online retail ban with increased penalties.", "\u672c\u6b21\u4fee\u6b63\u8349\u6848\u4fc2\u4f9d\u64daWHO FCTC\u7b2c9\u300110\u689d\u4e4b\u76f8\u95dc\u5efa\u8b70...", 87, "Section 1, Lines 12\u201316"),
        ("Content", "Products Impacted", "E-cigarettes, Heated Tobacco Products, Nicotine Pouches", "\u6240\u6709\u96fb\u5b50\u83f8\u88dd\u7f6e\uff08\u542b\u83f8\u5f48\u3001\u83f8\u6db2\uff09\u53ca\u52a0\u71b1\u83f8\u8349\u7522\u54c1...", 91, "Section 2.1, Lines 19\u201321"),
        ("Assessment", "Sector Impact", "High", "\u9055\u53cd\u672c\u6cd5\u898f\u5b9a\u8005\uff0c\u8655\u65b0\u53f0\u5e63\u4e8c\u5341\u842c\u5143\u4ee5\u4e0a\u4e8c\u767e\u842c\u5143\u4ee5\u4e0b\u7f70\u946b...", 82, "Section 2.5, Lines 42\u201343"),
        ("Assessment", "Likelihood", "Confirmed", "\u672c\u4fee\u6b63\u6848\u9810\u8a08\u65bc\u4e2d\u83ef\u6c11\u570b116\u5e741\u67081\u65e5\uff08\u897f\u51432027\u5e741\u67081\u65e5\uff09\u8d77\u6b63\u5f0f\u65bd\u884c\u3002", 78, "Section 3, Lines 46\u201347"),
        ("Assessment", "Status", "Ready for Review", "Draft published for public consultation period.", 85, "Section 4"),
        ("Dates", "Notice Date", "Jul 14, 2026", "\u6c11\u570b115\u5e747\u670814\u65e5 \u2014 Republic of China year 115, July 14", 99, "Date Line"),
        ("Dates", "Comment Deadline", "Sep 30, 2026", "\u516c\u544a\u671f\u9593\u81ea\u6c11\u570b115\u5e747\u670814\u65e5\u8d77\u81f3115\u5e749\u670830\u65e5\u6b62\u3002", 88, "Section 4, Lines 50\u201351"),
        ("Dates", "Effective Date", "Jan 1, 2027", "\u672c\u4fee\u6b63\u6848\u9810\u8a08\u65bc\u4e2d\u83ef\u6c11\u570b116\u5e741\u67081\u65e5\uff08\u897f\u51432027\u5e741\u67081\u65e5\uff09\u8d77\u6b63\u5f0f\u65bd\u884c\u3002", 94, "Section 3, Lines 46\u201347"),
    ],
    2: [
        ("Metadata", "Jurisdiction", "South Korea", "\ubcf4\uac74\ubcf5\uc9c0\ubd80 \u2014 Ministry of Health and Welfare, Republic of Korea", 99, "Header"),
        ("Metadata", "Source Name", "Ministry of Health and Welfare", "\ubcf4\uac74\ubcf5\uc9c0\ubd80 \uace0\uc2dc \uc81c2026-142\ud638 \u2014 MOHW Notice No. 2026-142", 96, "Header"),
        ("Metadata", "Source Type", "Regulatory Notice", "\uc804\uc790\ub2f4\ubc30 \uc131\ubd84 \uacf5\uac1c \uaddc\uc815 \uac1c\uc815\uc548", 94, "Title"),
        ("Metadata", "Proposer", "Korea Disease Control and Prevention Agency", "\uc9c8\ubcd1\uad00\ub9ac\uccad\uc7a5 \u2014 Director of KDCA", 91, "Authority"),
        ("Content", "Title", "Electronic Cigarette Content Disclosure Rules 2026", "\uc804\uc790\ub2f4\ubc30 \uc131\ubd84 \uacf5\uac1c\uc5d0 \uad00\ud55c \uaddc\uc815", 93, "Title"),
        ("Content", "Summary", "Mandates quarterly reporting of all chemical constituents in e-liquids and aerosols; expands ingredient database requirements.", "\uc804\uc790\ub2f4\ubc30 \uc81c\uc870\uc0ac \ubc0f \uc218\uc785\uc5c5\uc790\ub294 \ubd84\uae30\ubcc4\ub85c... \ubcf4\uace0\ud558\uc5ec\uc57c \ud55c\ub2e4.", 84, "Article 3"),
        ("Content", "Products Impacted", "E-cigarettes, E-liquids", "\uc804\uc790\ub2f4\ubc30 \ubc0f \uc804\uc790\ub2f4\ubc30 \uc561\uc0c1", 97, "Scope"),
        ("Assessment", "Sector Impact", "High", "\uc704\ubc18 \uc2dc \ucd5c\ub300 500\ub9cc\uc6d0 \uacfc\ud0dc\ub8cc \ubd80\uacfc", 88, "Penalties"),
        ("Assessment", "Likelihood", "Confirmed", "\uc2dc\ud589\uc77c: 2026\ub144 10\uc6d4 1\uc77c", 95, "Enforcement"),
        ("Assessment", "Status", "Processing", "Currently under inter-ministerial review.", 79, "Status Note"),
        ("Dates", "Notice Date", "Jul 13, 2026", "\uacf5\uace0\uc77c: 2026\ub144 7\uc6d4 13\uc77c", 99, "Date"),
        ("Dates", "Comment Deadline", "Aug 27, 2026", "\uc758\uacac\uc81c\ucd9c \uae30\ud55c: 2026\ub144 8\uc6d4 27\uc77c", 97, "Comments"),
        ("Dates", "Effective Date", "Oct 1, 2026", "\uc2dc\ud589\uc77c: 2026\ub144 10\uc6d4 1\uc77c", 95, "Enforcement"),
    ],
    3: [
        ("Metadata", "Jurisdiction", "Denmark", "L\u00e6gemiddelstyrelsen \u2014 Danish Medicines Agency", 99, "Header"),
        ("Metadata", "Source Name", "Danish Medicines Agency (L\u00e6gemiddelstyrelsen)", "Vejledning om nikotinposer", 97, "Header"),
        ("Metadata", "Source Type", "Regulatory Guidance", "Regulatorisk vejledning nr. 2026/44", 93, "Reference"),
        ("Metadata", "Proposer", "Danish Medicines Agency", "Udstedt af L\u00e6gemiddelstyrelsen", 98, "Authority"),
        ("Content", "Title", "Nicotine Pouch Maximum Strength Regulation 2026", "Regulering af maksimal nikotinstyrke i nikotinposer", 94, "Title"),
        ("Content", "Summary", "Caps nicotine concentration in pouches at 20 mg/g; prohibits sale to under-18s; requires child-resistant packaging.", "Maksimal nikotinindhold fasts\u00e6ttes til 20 mg/g. Salg til personer under 18 \u00e5r forbydes.", 89, "Article 1\u20133"),
        ("Content", "Products Impacted", "Nicotine Pouches", "Nikotinposer \u2014 alle varianter og styrker", 99, "Scope"),
        ("Assessment", "Sector Impact", "Medium", "B\u00f8de op til DKK 50.000 for overtr\u00e6delse", 81, "Penalties"),
        ("Assessment", "Likelihood", "Probable", "Forventet ikrafttr\u00e6den: 1. januar 2027", 76, "Timeline"),
        ("Assessment", "Status", "Ready for Review", "H\u00f8ringsfrist udl\u00f8bet", 83, "Status"),
        ("Dates", "Notice Date", "Jul 11, 2026", "Offentliggjort den 11. juli 2026", 99, "Publication"),
        ("Dates", "Comment Deadline", "Aug 15, 2026", "H\u00f8ringsfrist: 15. august 2026", 96, "Comments"),
        ("Dates", "Effective Date", "Jan 1, 2027", "Ikrafttr\u00e6den: 1. januar 2027", 90, "Enforcement"),
    ],
    4: [
        ("Metadata", "Jurisdiction", "Vietnam", "Qu\u1ef9 Ph\u00f2ng ch\u1ed1ng t\u00e1c h\u1ea1i c\u1ee7a thu\u1ed1c l\u00e1", 98, "Header"),
        ("Metadata", "Source Name", "Vietnam Tobacco Control Fund", "Ngh\u1ecb \u0111\u1ecbnh c\u1ee7a Ch\u00ednh ph\u1ee7", 95, "Header"),
        ("Metadata", "Source Type", "Implementation Decree", "Ngh\u1ecb \u0111\u1ecbnh s\u1ed1 77/2026/N\u0110-CP", 97, "Reference"),
        ("Metadata", "Proposer", "Ministry of Health Vietnam", "B\u1ed9 Y t\u1ebf \u0111\u1ec1 xu\u1ea5t", 94, "Authority"),
        ("Content", "Title", "Tobacco Control Law Phase 3 Implementation Decree", "H\u01b0\u1edbng d\u1eabn thi h\u00e0nh Lu\u1eadt Ph\u00f2ng ch\u1ed1ng... Giai \u0111o\u1ea1n 3", 92, "Title"),
        ("Content", "Summary", "Phase 3 extends graphic health warnings to 75% of packaging, bans tobacco advertising in all digital media.", "Giai \u0111o\u1ea1n 3 m\u1edf r\u1ed9ng c\u1ea3nh b\u00e1o s\u1ee9c kh\u1ecfe l\u00ean 75% bao b\u00ec...", 83, "Article 2\u20134"),
        ("Content", "Products Impacted", "Cigarettes, Heated Tobacco Products", "Thu\u1ed1c l\u00e1 \u0111i\u1ebfu v\u00e0 s\u1ea3n ph\u1ea9m thu\u1ed1c l\u00e1 nung n\u00f3ng", 93, "Scope"),
        ("Assessment", "Sector Impact", "High", "Ph\u1ea1t ti\u1ec1n t\u1eeb 20 \u0111\u1ebfn 100 tri\u1ec7u \u0111\u1ed3ng", 86, "Penalties"),
        ("Assessment", "Likelihood", "Confirmed", "Ngh\u1ecb \u0111\u1ecbnh c\u00f3 hi\u1ec7u l\u1ef1c t\u1eeb ng\u00e0y 01/01/2027", 91, "Enforcement"),
        ("Assessment", "Status", "New", "M\u1edbi ban h\u00e0nh \u2014 Newly issued", 80, "Status"),
        ("Dates", "Notice Date", "Jul 12, 2026", "Ng\u00e0y ban h\u00e0nh: 12/07/2026", 99, "Date"),
        ("Dates", "Comment Deadline", "N/A", "Kh\u00f4ng c\u00f3 giai \u0111o\u1ea1n l\u1ea5y \u00fd ki\u1ebfn", 72, "Comments"),
        ("Dates", "Effective Date", "Jan 1, 2027", "Hi\u1ec7u l\u1ef1c thi h\u00e0nh t\u1eeb ng\u00e0y 01/01/2027", 93, "Enforcement"),
    ],
    5: [
        ("Metadata", "Jurisdiction", "Finland", "Terveyden ja hyvinvoinnin laitos (THL)", 99, "Header"),
        ("Metadata", "Source Name", "Finnish Institute for Health and Welfare (THL)", "THL:n lausunto", 96, "Header"),
        ("Metadata", "Source Type", "Amendment Proposal", "Lakimuutosehdotus", 94, "Reference"),
        ("Metadata", "Proposer", "Ministry of Social Affairs and Health Finland", "Sosiaali- ja terveysministeri\u00f6", 97, "Authority"),
        ("Content", "Title", "E-cigarette Point-of-Sale Display Restrictions 2026", "S\u00e4hk\u00f6savukkeiden myyntipisteess\u00e4 esitt\u00e4misen rajoitukset", 91, "Title"),
        ("Content", "Summary", "Proposes complete removal of e-cigarette displays from all retail point-of-sale locations.", "S\u00e4hk\u00f6savukkeet ehdotetaan t\u00e4ysin poistettavaksi myyntipisteist\u00e4...", 86, "Section 1"),
        ("Content", "Products Impacted", "E-cigarettes", "S\u00e4hk\u00f6savukkeet ja t\u00e4ytt\u00f6pakkaukset", 95, "Scope"),
        ("Assessment", "Sector Impact", "Low", "Rikkomusmaksu enint\u00e4\u00e4n 5 000 euroa", 79, "Penalties"),
        ("Assessment", "Likelihood", "Likely", "Hallituksen esitys \u2014 Government bill expected Q4 2026", 74, "Timeline"),
        ("Assessment", "Status", "Processing", "Lausuntokierroksella", 82, "Status"),
        ("Dates", "Notice Date", "Jul 10, 2026", "Julkaistu 10. hein\u00e4kuuta 2026", 99, "Publication"),
        ("Dates", "Comment Deadline", "Sep 5, 2026", "Lausuntopyynt\u00f6 p\u00e4\u00e4ttyy 5.9.2026", 94, "Comments"),
        ("Dates", "Effective Date", "TBD", "Voimaantulop\u00e4iv\u00e4 vahvistetaan my\u00f6hemmin", 61, "Timeline"),
    ],
    6: [
        ("Metadata", "Jurisdiction", "Poland", "G\u0142\u00f3wny Inspektorat Sanitarny", 99, "Header"),
        ("Metadata", "Source Name", "Chief Sanitary Inspectorate (GIS)", "GIS komunikat nr 2026/38", 97, "Reference"),
        ("Metadata", "Source Type", "Technical Standard", "Norma techniczna (PN-EN compliance)", 92, "Reference"),
        ("Metadata", "Proposer", "Ministry of Health Poland", "Ministerstwo Zdrowia", 96, "Authority"),
        ("Content", "Title", "Heated Tobacco Product Labeling Requirements 2026", "Wymagania dotycz\u0105ce oznakowania podgrzewanych wyrob\u00f3w tytoniowych", 93, "Title"),
        ("Content", "Summary", "Specifies mandatory labeling for HTP packaging including emission data, health warnings in Polish, and QR-code traceability links.", "Oznakowanie musi zawiera\u0107 dane dotycz\u0105ce emisji, ostrze\u017cenia zdrowotne w j\u0119zyku polskim...", 88, "Article 1\u20134"),
        ("Content", "Products Impacted", "Heated Tobacco Products", "Podgrzewane wyroby tytoniowe \u2014 wszystkie kategorie", 98, "Scope"),
        ("Assessment", "Sector Impact", "Medium", "Kara pieni\u0119\u017cna do 200 000 PLN", 84, "Penalties"),
        ("Assessment", "Likelihood", "Probable", "Wej\u015bcie w \u017cycie: 1 marca 2027", 80, "Timeline"),
        ("Assessment", "Status", "Ready for Review", "Projekt zako\u0144czy\u0142 faz\u0119 konsultacji", 86, "Status"),
        ("Dates", "Notice Date", "Jul 9, 2026", "Data publikacji: 9 lipca 2026", 99, "Publication"),
        ("Dates", "Comment Deadline", "Aug 9, 2026", "Termin sk\u0142adania uwag: 9 sierpnia 2026", 95, "Comments"),
        ("Dates", "Effective Date", "Mar 1, 2027", "Wej\u015bcie w \u017cycie: 1 marca 2027", 91, "Enforcement"),
    ],
}

TS = "Jul 15, 2026 00:00"


def run_seed():
    init_db()
    conn = get_connection()
    c = conn.cursor()

    if c.execute("SELECT COUNT(*) FROM sources").fetchone()[0] > 0:
        print("Database already seeded, skipping.")
        conn.close()
        return

    # Sources
    c.executemany(
        "INSERT INTO sources (id,flag,country,source_name,title,language,doc_type,discovered,status,stage,started_at,completed_at,failure_message,source_text) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        SOURCES,
    )

    # Regulations
    for reg_id, (src_id, title, body, jurisdiction, topic, summary, status) in enumerate(REGULATIONS, 1):
        c.execute(
            "INSERT INTO regulations (id,source_id,title,regulatory_body,jurisdiction,topic,summary,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (reg_id, src_id, title, body, jurisdiction, topic, summary, status, TS, TS),
        )

    # Fields and evidence
    for reg_id, fields in FIELDS_BY_REG.items():
        source_id = REG_SOURCE_MAP[reg_id]
        for cat, field_name, value, evidence_excerpt, confidence, section in fields:
            c.execute(
                "INSERT INTO regulation_fields (regulation_id,source_id,category,field_name,extracted_value,confidence) VALUES (?,?,?,?,?,?)",
                (reg_id, source_id, cat, field_name, value, confidence),
            )
            field_id = c.lastrowid
            c.execute(
                "INSERT INTO evidence (source_id,regulation_id,field_id,excerpt,section,source_reference,immutable) VALUES (?,?,?,?,?,?,1)",
                (source_id, reg_id, field_id, evidence_excerpt, section, f"Source #{source_id}"),
            )

    conn.commit()
    conn.close()
    n_fields = sum(len(v) for v in FIELDS_BY_REG.values())
    print(f"Seeded {len(SOURCES)} sources, {len(REGULATIONS)} regulations, {n_fields} fields, {n_fields} evidence records.")


if __name__ == "__main__":
    run_seed()
