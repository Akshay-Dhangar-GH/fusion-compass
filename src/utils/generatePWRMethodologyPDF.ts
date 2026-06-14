import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Reference { id: string; citation: string; url?: string; }

const REFERENCES: Reference[] = [
  { id: 'ISO55000',  citation: 'ISO 55000:2014 Asset Management — Overview, principles and terminology', url: 'https://www.iso.org/standard/55088.html' },
  { id: 'ISO55001',  citation: 'ISO 55001:2014 Asset Management — Management systems — Requirements',     url: 'https://www.iso.org/standard/55089.html' },
  { id: 'IAEA-SSG-48', citation: 'IAEA SSG-48 Ageing Management and Development of a Programme for Long Term Operation of NPPs', url: 'https://www.iaea.org/publications/11104/' },
  { id: 'IAEA-NS-G-2.12', citation: 'IAEA NS-G-2.12 Ageing Management for Nuclear Power Plants', url: 'https://www.iaea.org/publications/7884/' },
  { id: 'IAEA-SALTO', citation: 'IAEA SALTO Peer Review Guidelines for Long Term Operation', url: 'https://www.iaea.org/topics/operational-safety/salto-missions' },
  { id: 'WENRA-LTO', citation: 'WENRA Safety Reference Levels for Long Term Operation', url: 'https://www.wenra.eu/' },
  { id: 'ONR-SAP',   citation: 'ONR Safety Assessment Principles for Nuclear Facilities (2014, Rev 1)', url: 'https://www.onr.org.uk/saps/' },
  { id: 'ASME-XI',   citation: 'ASME Boiler and Pressure Vessel Code Section XI - Inservice Inspection', url: 'https://www.asme.org/codes-standards' },
  { id: 'ASME-III',  citation: 'ASME Boiler and Pressure Vessel Code Section III - Nuclear Components', url: 'https://www.asme.org/codes-standards' },
  { id: 'EPRI-AMP',  citation: 'EPRI Ageing Management Programme Guideline for Nuclear Power Plants',  url: 'https://www.epri.com/' },
  { id: 'EPRI-MRP',  citation: 'EPRI Materials Reliability Program (MRP) Reports - PWSCC, RPV, Alloy 600/690',  url: 'https://www.epri.com/research/programs/061004' },
  { id: 'NRC-GALL',  citation: 'NUREG-1801 Generic Aging Lessons Learned (GALL) Report', url: 'https://www.nrc.gov/reading-rm/doc-collections/nuregs/staff/sr1801/' },
  { id: 'NRC-LR',    citation: 'NUREG-1800 Standard Review Plan for Review of License Renewal Applications', url: 'https://www.nrc.gov/reading-rm/doc-collections/nuregs/staff/sr1800/' },
  { id: 'IAEA-RPV',  citation: 'IAEA Integrity of Reactor Pressure Vessels in NPPs (TRS-Series)', url: 'https://www.iaea.org/publications/' },
  { id: 'INL-TRL',   citation: 'INL Technology Readiness Level Assessment Guidelines (2022)', url: 'https://inl.gov/trending-topic/technology-readiness-levels/' },
];

export function generatePWRMethodologyPDF(): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const addHeader = (text: string, level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: 16, 2: 13, 3: 11 };
    const colors: Record<number, [number, number, number]> = { 1: [30, 58, 95], 2: [59, 130, 246], 3: [107, 114, 128] };
    if (y > 260) { doc.addPage(); y = margin; }
    doc.setFontSize(sizes[level]);
    doc.setTextColor(...colors[level]);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, y);
    y += level === 1 ? 10 : 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  };

  const addParagraph = (text: string) => {
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, contentWidth);
    if (y + lines.length * 5 > 280) { doc.addPage(); y = margin; }
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3;
  };

  const addTable = (headers: string[], data: string[][], columnWidths?: number[]) => {
    if (y > 220) { doc.addPage(); y = margin; }
    autoTable(doc, {
      startY: y,
      head: [headers],
      body: data,
      margin: { left: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
      columnStyles: columnWidths ? Object.fromEntries(columnWidths.map((w, i) => [i, { cellWidth: w }])) : {},
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  };

  // TITLE
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PWR Lifecycle Passport', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(13);
  doc.text('Methodology & Data Reference Document', pageWidth / 2, 44, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Design-agnostic — APR1000 / EPR / RR-SMR class', pageWidth / 2, 56, { align: 'center' });
  doc.text('Version 1.0 | Consultancy IP Documentation', pageWidth / 2, 66, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  y = 100;
  addParagraph('This document details the methodology, data sources, scoring frameworks and assumptions underlying the PWR Lifecycle Passport (PLP) model. It is design-agnostic across the Gen III/III+ large-PWR fleet (APR1000, EPR) and integral SMR-class PWRs (e.g. RR-SMR), and is structured to support Ageing Management Programmes (AMPs), Long Term Operation (LTO) submissions, and outage-scope optimisation for refuelling and major component replacement.');

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Document generated: ${new Date().toISOString().split('T')[0]}`, margin, 280);

  // TOC
  doc.addPage(); y = margin;
  addHeader('Table of Contents');
  const tocItems = [
    '1. Purpose & Scope',
    '2. Alignment with Standards (IAEA / WENRA / ONR / ASME / EPRI / NRC)',
    '3. Data Model Architecture',
    '4. Scoring Frameworks',
    '5. Asset Data & Assumptions (Extended 10)',
    '6. Degradation Mechanisms',
    '7. Monitoring & Inspection Strategies',
    '8. Criticality Methodology',
    '9. Decision Logic',
    '10. Uncertainty Treatment',
    '11. References',
  ];
  doc.setFontSize(11);
  tocItems.forEach((item) => { doc.text(item, margin, y); y += 7; });

  // 1
  doc.addPage(); y = margin;
  addHeader('1. Purpose & Scope');
  addParagraph('The PWR Lifecycle Passport (PLP) is a structured asset management framework for pressurised water reactors. It provides a systematic approach to capturing, scoring and acting upon asset-level information across operations, refurbishment, outage planning and Long Term Operation. [Ref: ISO55000, IAEA-SSG-48]');
  addHeader('1.1 Design Objectives', 2);
  addParagraph('• Treat each major PWR component as a lifecycle-managed asset with explicit degradation, surveillance and uncertainty tracking');
  addParagraph('• Provide decision support for outage scope, major component replacement (SG, RPV head, RCPs) and LTO licensing');
  addParagraph('• Enable portfolio-level prioritisation of inspection, R&D and refurbishment investment');
  addParagraph('• Provide a credible, design-agnostic basis for regulator engagement across APR1000, EPR and RR-SMR-class plants');
  addHeader('1.2 Scope Boundaries', 2);
  addParagraph('This model covers Class 1 primary boundary components and high-criticality power conversion / safety systems (the "Extended 10"). Balance-of-plant items not explicitly listed follow conventional asset management approaches under the same scoring rules. [Ref: EPRI-AMP, NRC-GALL]');

  // 2
  doc.addPage(); y = margin;
  addHeader('2. Alignment with Standards');
  addTable(
    ['Standard', 'Requirement', 'PLP Implementation'],
    [
      ['ISO 55001',         'Asset information & risk-based prioritisation', 'Passport captures lifecycle data; Criticality Index drives resource allocation'],
      ['IAEA SSG-48',       'Ageing management & LTO programme',             'AMP linkage per asset; LTO learning sheet'],
      ['IAEA NS-G-2.12',    'Ageing management for NPPs',                    'Degradation mechanisms scored with confidence & known/unknown'],
      ['WENRA LTO RLs',     'Long-term operation safety reference levels',   'Tier classification supports LTO case'],
      ['ONR SAPs',          'ALARP demonstration',                            'Uncertainty scoring supports ALARP arguments'],
      ['ASME XI',           'Inservice inspection',                           'Monitoring sheet aligned with ISI categories'],
      ['ASME III',          'Design rules for nuclear components',            'Design margin % tracked per asset'],
      ['NUREG-1801 (GALL)', 'Generic ageing lessons learned',                 'Degradation library calibrated to GALL items'],
      ['NUREG-1800',        'License renewal standard review plan',           'Decision posture aligned to LR/LTO triggers'],
    ],
    [40, 55, 70],
  );
  addParagraph('The PLP framework is designed to be directly traceable to IAEA, WENRA, ONR, ASME, EPRI and NRC ageing-management and LTO guidance. [Ref: IAEA-SSG-48, NRC-LR, EPRI-AMP, ASME-XI]');

  // 3
  doc.addPage(); y = margin;
  addHeader('3. Data Model Architecture');
  addHeader('3.1 Workbook Structure', 2);
  addTable(
    ['Sheet', 'Purpose', 'Key Fields'],
    [
      ['Asset Register',       'Master list of all assets',                 'Asset_ID, Name, Category, Maturity_Phase'],
      ['Design Intent',        'Functional requirements and system value',  'Operating_Envelope, Safety_Classification'],
      ['Degradation',          'Failure modes and uncertainty',             'Mechanisms, Confidence, Known_Unknown'],
      ['Monitoring',           'Inspection / instrumentation and VoI',      'Parameters, Methods, Uncertainty_Reduction'],
      ['Maintainability',      'Access and replacement complexity',         'Access_Method, Duration, Supply_Chain_Risk'],
      ['Criticality Scoring',  'Weighted scoring outputs',                  'Criticality_Index, Tier, Quadrant'],
      ['Decision Posture',     'Action recommendations',                    'Priority, Recommended_Action, Status'],
      ['LTO / OPEX Learning',  'OPEX transfer and end-of-life data',         'Learning_Value, Waste_Classification'],
    ],
    [45, 60, 70],
  );
  addHeader('3.2 Data Relationships', 2);
  addParagraph('Asset_ID is the primary key linking all sheets. Derived fields in Criticality Scoring pull from source sheets using lookup functions. One-row-per-asset ensures tractability and auditability under ISO 55001. [Ref: ISO55001]');

  // 4
  doc.addPage(); y = margin;
  addHeader('4. Scoring Frameworks');
  addHeader('4.1 Numeric Scales (1-5)', 2);
  addTable(
    ['Score', 'Degradation Uncertainty', 'Replaceability', 'System Value Impact'],
    [
      ['1', 'Well-characterised, fleet OPEX',     'Days, hands-on access',          'Minor - local effect only'],
      ['2', 'Good understanding, minor gaps',      'Weeks, limited complexity',      'Moderate - subsystem impact'],
      ['3', 'Moderate understanding',              'Months, planned outage scope',   'Significant - system impact'],
      ['4', 'Limited data / first-of-fleet item',  'Major component replacement',    'Major - plant availability'],
      ['5', 'Novel / no qualified data',           'Not replaceable in practice',    'Critical - plant determining'],
    ],
    [15, 60, 50, 50],
  );
  addHeader('4.2 Confidence Levels', 2);
  addTable(
    ['Level', 'Definition', 'Data Source Examples'],
    [
      ['High',    'Multiple validated fleet sources, operational data', 'EPRI MRP, NUREG-1801 GALL, plant OPEX'],
      ['Medium',  'Some validated data, engineering judgement',         'Vendor qualification, single-plant data'],
      ['Low',     'Limited data, significant extrapolation',            'New design feature, limited OPEX'],
      ['Unknown', 'No credible data available',                          'Novel materials/conditions'],
    ],
    [25, 65, 75],
  );
  addParagraph('Scoring is calibrated to PWR-relevant degradation per EPRI MRP and NRC GALL [Ref: EPRI-MRP, NRC-GALL], and adapts TRL concepts [Ref: INL-TRL] to asset management contexts.');

  // 5
  doc.addPage(); y = margin;
  addHeader('5. Asset Data & Assumptions (Extended 10)');
  addHeader('5.1 Operating Envelope Data', 2);
  addTable(
    ['Asset', 'Parameter', 'Typical Value', 'Source'],
    [
      ['RPV',              'Primary pressure / temperature', '~155 bar / 290-325 °C',         'IAEA-RPV, ASME-III'],
      ['RPV',              'Surveillance fluence (EOL)',     '~5e19 n/cm² (E>1 MeV)',         'IAEA-RPV'],
      ['Steam Generator',  'Tube material',                  'Alloy 600TT / 690TT',           'EPRI-MRP'],
      ['Steam Generator',  'Secondary pressure',             '~70 bar saturated',              'NSSS designer data'],
      ['RCP',              'Flow / power',                   '~5-7 m³/s per loop, multi-MW',  'NSSS designer data'],
      ['Pressuriser',      'Heater bank power',              '~1-2 MW total',                  'NSSS designer data'],
      ['Main Coolant Pipe','Material',                       'SA-508 / SA-312 stainless clad', 'ASME-III'],
      ['CRDM',             'Penetration material',           'Alloy 600 (legacy) / 690',       'EPRI-MRP'],
      ['Turbine-Generator','Speed / rating',                 '1500/3000 rpm, ~1.0-1.7 GWe',    'TG OEM data'],
      ['Containment',      'Design leak rate (Type A)',      '~0.1-0.3 %/day at Pd',           'ASME-XI'],
      ['EDG',              'Start time / rating',            '<10 s to rated, multi-MW',       'IAEA / NRC'],
    ],
    [35, 45, 50, 50],
  );
  addHeader('5.2 Design Margin Assumptions', 2);
  addParagraph('Design margins are taken from ASME III code allowables [Ref: ASME-III] supplemented by fleet OPEX margins:');
  addParagraph('• Primary pressure boundary: ASME III Class 1 allowables, surveillance-derived RTNDT margin for RPV');
  addParagraph('• Steam generator tubes: structural plugging limit per technical specifications, with operational chemistry margins');
  addParagraph('• Containment: pre-stress margin per tendon surveillance trend');

  // 6
  doc.addPage(); y = margin;
  addHeader('6. Degradation Mechanisms');
  addParagraph('Degradation hypotheses are drawn from EPRI MRP guidance, NUREG-1801 GALL, IAEA RPV integrity reports and plant OPEX. The Known-Unknown classification follows decision-science frameworks for uncertainty characterisation. [Ref: EPRI-MRP, NRC-GALL, IAEA-RPV]');
  addHeader('6.1 Primary Boundary', 2);
  addTable(
    ['Mechanism', 'Component', 'Confidence', 'Data Source'],
    [
      ['Neutron embrittlement (RTNDT shift)',   'RPV beltline',          'High',   'Surveillance capsules, IAEA-RPV'],
      ['PWSCC of Alloy 600 (CRDM / BMI)',       'RPV head / BMI',         'High',   'EPRI-MRP, Davis-Besse OPEX'],
      ['Thermal fatigue at mixing tees',         'Main coolant piping',    'Medium', 'Plant OPEX, NRC bulletins'],
      ['DMW PWSCC (Alloy 82/182)',               'Nozzle DMWs',            'High',   'EPRI-MRP'],
      ['FAC (carbon steel)',                     'Secondary piping',        'High',   'EPRI FAC programme'],
    ],
    [55, 35, 25, 60],
  );
  addHeader('6.2 Steam Generator', 2);
  addTable(
    ['Mechanism', 'Component', 'Confidence', 'Data Source'],
    [
      ['Tube ODSCC / IGA at supports',     'SG tubes',                'High',   'EPRI SGMP, ECT data'],
      ['Wear at AVBs / tube supports',     'SG tubes',                'High',   'ECT inspection'],
      ['Secondary-side FAC',               'SG shell / nozzles',       'Medium', 'EPRI FAC programme'],
      ['Fouling / sludge accumulation',    'Tubesheet region',         'High',   'Sludge lancing OPEX'],
    ],
    [55, 35, 25, 60],
  );
  addHeader('6.3 Known-Unknown Classification', 2);
  addParagraph('• Known-Known: Well-characterised mechanism with validated models (e.g., FAC of carbon steel, AVB wear)');
  addParagraph('• Known-Unknown: Mechanism identified but rate/initiation uncertain in specific plant (e.g., thermal fatigue at mixing tees)');
  addParagraph('• Unknown-Unknown: Potential for unidentified failure modes (e.g., new materials/conditions in SMR designs)');

  // 7
  doc.addPage(); y = margin;
  addHeader('7. Monitoring & Inspection Strategies');
  addParagraph('Monitoring scope and frequency are derived from ASME XI inservice inspection rules, EPRI ageing management programme guidance and plant Technical Specifications. Value of Information (VoI) scoring quantifies the decision-enabling value of each measurement. [Ref: ASME-XI, EPRI-AMP]');
  addHeader('7.1 Methods Matrix', 2);
  addTable(
    ['Method', 'Parameters', 'Technology Readiness', 'Fallback'],
    [
      ['Eddy Current Testing (ECT)',     'SG tube wall, ODSCC, wear',     'Proven',        'Tube plugging on schedule'],
      ['Phased-array UT',                 'LP turbine discs, DMW PWSCC',   'Proven',        'Time-based replacement'],
      ['Surveillance capsules',          'RPV RTNDT shift',                'Proven',        'Conservative PTS analysis'],
      ['Tendon surveillance',            'Containment prestress',          'Proven',        'Conservative ageing curve'],
      ['Online vibration monitoring',     'RCP bearings / shaft',           'Proven',        'Periodic vibration walkdowns'],
      ['ILRT / Type A leak test',         'Containment leak rate',          'Proven',        'Reduced ILRT interval'],
      ['Online chemistry monitoring',     'Secondary / primary chemistry',  'Proven',        'Grab-sample chemistry'],
    ],
    [55, 50, 30, 40],
  );
  addHeader('7.2 Value of Information Scoring', 2);
  addParagraph('VoI Score = (Uncertainty_Reduction × 4) + (Decision_Criticality × 4) + (Fallback_Penalty × 2). Maximum score: 40. Scores above 30 indicate high-value inspection / instrumentation investments under the AMP. [Ref: EPRI-AMP]');

  // 8
  doc.addPage(); y = margin;
  addHeader('8. Criticality Methodology');
  addHeader('8.1 Criticality Index Formula', 2);
  addParagraph('Criticality_Index = (Degradation_Uncertainty × 0.30 + Replaceability_Score × 0.30 + System_Value_Score × 0.25 + (10 - VoI_Score/4) × 0.15) × Safety_Weight');
  addHeader('8.2 Weighting Rationale', 2);
  addTable(
    ['Factor', 'Weight', 'Rationale'],
    [
      ['Degradation Uncertainty', '30%', 'Primary driver of LTO and outage risk'],
      ['Replaceability Score',    '30%', 'Consequence severity - access, lead time and outage duration'],
      ['System Value Score',      '25%', 'Operational and commercial impact (capacity factor)'],
      ['Inverse VoI',             '15%', 'Incentivises inspection / instrumentation investment'],
    ],
    [50, 20, 95],
  );
  addHeader('8.3 Safety Weight Multipliers', 2);
  addTable(
    ['Classification',           'Weight', 'Definition'],
    [
      ['Safety Class 1',          '1.5×',   'RCS pressure boundary / reactivity control / containment'],
      ['Safety Class 2',          '1.2×',   'Support functions to Class 1'],
      ['Safety Class 3 / Non-safety','1.0×', 'Standard industrial classification'],
    ],
    [50, 25, 100],
  );
  addParagraph('Safety classification follows IAEA / national regulator nuclear safety classification frameworks [Ref: ONR-SAP, IAEA-NS-G-2.12].');
  addHeader('8.4 Tier Classification', 2);
  addTable(
    ['Tier', 'Index Range', 'Management Approach'],
    [
      ['Tier 1', '≥5.0',       'Immediate action, executive visibility, dedicated outage scope'],
      ['Tier 2', '3.0-4.99',   'Enhanced AMP, scheduled reviews, contingency planning'],
      ['Tier 3', '<3.0',       'Standard ageing management, periodic review'],
    ],
    [25, 30, 110],
  );

  // 9
  doc.addPage(); y = margin;
  addHeader('9. Decision Logic');
  addHeader('9.1 Matrix Quadrant Classification', 2);
  addParagraph('Assets are positioned on a 2×2 matrix using Degradation_Uncertainty (Y-axis) and Replaceability_Score (X-axis), with threshold at 3.0:');
  addTable(
    ['Quadrant',          'Condition',                                                'Strategic Posture'],
    [
      ['Q1 - Critical',     'High uncertainty AND hard to replace',                    'Maximum investment in inspection and R&D; outage planning'],
      ['Q2 - Monitor',      'High uncertainty BUT easier to replace',                  'Focus on early warning, accept replacement'],
      ['Q3 - Design Focus', 'Lower uncertainty BUT hard to replace',                   'Maintain margins, LTO ageing case'],
      ['Q4 - Standard',     'Lower uncertainty AND easier to replace',                 'Standard AMP practices'],
    ],
    [35, 65, 70],
  );
  addHeader('9.2 Action Mapping Rules', 2);
  addTable(
    ['Tier + Quadrant', 'Inspection', 'R&D', 'Design / LTO Review'],
    [
      ['Tier 1 + Q1', 'Mandatory', 'High priority', 'Immediate'],
      ['Tier 1 + Q3', 'High',      'Medium',        'Within 12 months'],
      ['Tier 2 + Q3', 'Medium',    'Medium',        'Within 24 months'],
      ['Tier 3 + any','As-needed', 'Low',           'Standard cycle'],
    ],
    [45, 35, 35, 50],
  );
  addParagraph('Decision logic is auditable and consistent with NRC license renewal and IAEA LTO frameworks [Ref: NRC-LR, IAEA-SALTO, WENRA-LTO].');

  // 10
  doc.addPage(); y = margin;
  addHeader('10. Uncertainty Treatment');
  addHeader('10.1 Uncertainty Sources', 2);
  addTable(
    ['Source', 'Treatment in PLP', 'Mitigation'],
    [
      ['Material property data gaps',         'Degradation_Uncertainty score',     'Targeted R&D, EPRI MRP participation'],
      ['Operating regime variation',          'Known_Unknown classification',       'Instrumentation / inspection investment'],
      ['Supply chain (e.g. SG, RPV head)',    'Supply_Chain_Risk field',            'Strategic spares strategy, long-lead procurement'],
      ['Regulatory LTO pathway uncertainty',  'Action timing in Decision Posture',  'Early regulator engagement'],
      ['Design-specific deviations',          'Plant-specific Asset Register',      'Design-agnostic scoring, plant-specific data'],
    ],
    [55, 55, 55],
  );
  addHeader('10.2 Conservative Assumptions', 2);
  addParagraph('Where data is limited, the PLP applies conservative assumptions consistent with nuclear safety culture:');
  addParagraph('• Degradation rates assumed at upper bound of fleet data (EPRI MRP envelopes)');
  addParagraph('• Outage durations include contingency for unplanned scope discovery');
  addParagraph('• Waste classifications assume upper bound until characterisation confirms otherwise');
  addHeader('10.3 Model Limitations', 2);
  addParagraph('• Operating envelope data uses representative Gen III/III+ values; plant-specific values must be substituted in deployment');
  addParagraph('• SMR-class (e.g., RR-SMR) degradation experience is limited; scoring is informed by analogous large-PWR data and should be recalibrated as OPEX emerges');
  addParagraph('• Scoring weights are based on expert judgement and should be calibrated to plant-specific risk appetite');

  // 11
  doc.addPage(); y = margin;
  addHeader('11. References');
  addParagraph('All data, assumptions, and methodological frameworks in this document are traceable to the following sources:');
  y += 3;
  REFERENCES.forEach((ref) => {
    if (y > 265) { doc.addPage(); y = margin; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`[${ref.id}]`, margin, y);
    doc.setFont('helvetica', 'normal');
    const citation = doc.splitTextToSize(ref.citation, contentWidth - 30);
    doc.text(citation, margin + 30, y);
    y += citation.length * 4;
    if (ref.url) {
      doc.setTextColor(59, 130, 246);
      doc.text(ref.url, margin + 30, y);
      doc.setTextColor(0, 0, 0);
      y += 4;
    }
    y += 3;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`PWR Lifecycle Passport - Methodology Document v1.0`, margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
  }

  doc.save('PLP_Methodology_Reference_Document.pdf');
}
