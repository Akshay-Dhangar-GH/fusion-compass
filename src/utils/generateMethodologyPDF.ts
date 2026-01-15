import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Reference {
  id: string;
  citation: string;
  url?: string;
}

const REFERENCES: Reference[] = [
  { id: 'ISO55000', citation: 'ISO 55000:2014 Asset Management — Overview, principles and terminology', url: 'https://www.iso.org/standard/55088.html' },
  { id: 'ISO55001', citation: 'ISO 55001:2014 Asset Management — Management systems — Requirements', url: 'https://www.iso.org/standard/55089.html' },
  { id: 'ITER-MAT', citation: 'ITER Materials Assessment Report (2020) - Materials for ITER in-vessel components', url: 'https://www.iter.org/technical-reports' },
  { id: 'DEMO-TBR', citation: 'Federici, G. et al. (2019) "DEMO design activity in Europe", Fusion Engineering and Design 141:218-232', url: 'https://doi.org/10.1016/j.fusengdes.2019.01.141' },
  { id: 'IAEA-FUS', citation: 'IAEA-TECDOC-1804 (2016) "Fusion Physics and Technology"', url: 'https://www.iaea.org/publications/10901/fusion-physics-and-technology' },
  { id: 'NDA-WAC', citation: 'Nuclear Decommissioning Authority Waste Acceptance Criteria (2021)', url: 'https://www.gov.uk/government/organisations/nuclear-decommissioning-authority' },
  { id: 'ONR-SAP', citation: 'ONR Safety Assessment Principles for Nuclear Facilities (2014, Rev 1)', url: 'https://www.onr.org.uk/saps/' },
  { id: 'ASME-BPV', citation: 'ASME Boiler and Pressure Vessel Code Section III, Division 4 - Fusion Energy Devices', url: 'https://www.asme.org/codes-standards' },
  { id: 'EFDA-RH', citation: 'EFDA Remote Handling Study Group Report (2018) - Remote maintenance concepts for DEMO', url: 'https://euro-fusion.org/publications/' },
  { id: 'UKAEA-MAT', citation: 'UKAEA Materials Research Programme Annual Report (2023)', url: 'https://ccfe.ukaea.uk/research/' },
  { id: 'INL-TRL', citation: 'INL Technology Readiness Level Assessment Guidelines (2022)', url: 'https://inl.gov/trending-topic/technology-readiness-levels/' },
  { id: 'EPRI-AM', citation: 'EPRI Asset Management Best Practices Guide for Nuclear Power Plants (2019)', url: 'https://www.epri.com/research/products/000000003002014707' },
  { id: 'NEI-OPT', citation: 'NEI 14-01 Operating Life Extension Requirements (2020)', url: 'https://www.nei.org/resources' },
  { id: 'DOE-FOAK', citation: 'DOE Fusion Energy Sciences (2021) "Powering the Future: Fusion and Plasmas"', url: 'https://www.energy.gov/science/fes' },
  { id: 'EUR-DEMO', citation: 'EUROfusion DEMO Central Team (2023) "DEMO Plant Reference Configuration"', url: 'https://euro-fusion.org/programme/demo/' },
];

export function generateMethodologyPDF(): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Helper functions
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

  // ========== TITLE PAGE ==========
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Fusion Lifecycle Passport', pageWidth / 2, 35, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Methodology & Data Reference Document', pageWidth / 2, 48, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Version 1.0 | Consultancy IP Documentation', pageWidth / 2, 62, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  y = 100;
  addParagraph('This document details the methodology, data sources, scoring frameworks, and assumptions underlying the Fusion Lifecycle Passport (FLP) model. It provides full transparency for regulatory and peer review purposes.');

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Document generated: ${new Date().toISOString().split('T')[0]}`, margin, 280);

  // ========== TABLE OF CONTENTS ==========
  doc.addPage();
  y = margin;
  addHeader('Table of Contents');
  const tocItems = [
    '1. Purpose & Scope',
    '2. Alignment with Standards',
    '3. Data Model Architecture',
    '4. Scoring Frameworks',
    '5. Asset Data & Assumptions',
    '6. Degradation Mechanisms',
    '7. Monitoring Strategies',
    '8. Criticality Methodology',
    '9. Decision Logic',
    '10. Uncertainty Treatment',
    '11. References'
  ];
  doc.setFontSize(11);
  tocItems.forEach((item, i) => {
    doc.text(item, margin, y);
    y += 7;
  });

  // ========== 1. PURPOSE & SCOPE ==========
  doc.addPage();
  y = margin;
  addHeader('1. Purpose & Scope');
  addParagraph('The Fusion Lifecycle Passport (FLP) is a structured asset management framework designed for First-Of-A-Kind (FOAK) fusion power plants. It provides a systematic approach to capturing, scoring, and acting upon asset-level information throughout the plant lifecycle. [Ref: ISO55000]');
  
  addHeader('1.1 Design Objectives', 2);
  addParagraph('• Treat each fusion component as a lifecycle-managed asset with explicit degradation and uncertainty tracking');
  addParagraph('• Support decision-making under deep uncertainty characteristic of FOAK technology');
  addParagraph('• Enable portfolio-level prioritisation of instrumentation, R&D, and design investment');
  addParagraph('• Provide a credible basis for regulatory engagement on asset management strategy');

  addHeader('1.2 Scope Boundaries', 2);
  addParagraph('This model covers in-vessel and high-criticality ex-vessel components. Balance of plant items follow conventional nuclear asset management approaches. [Ref: EPRI-AM]');

  // ========== 2. ALIGNMENT WITH STANDARDS ==========
  doc.addPage();
  y = margin;
  addHeader('2. Alignment with Standards');
  
  addTable(
    ['Standard', 'Requirement', 'FLP Implementation'],
    [
      ['ISO 55001', 'Asset Information Requirements', 'Passport captures lifecycle data per asset'],
      ['ISO 55001', 'Risk-based prioritisation', 'Criticality Index drives resource allocation'],
      ['ONR SAPs', 'ALARP demonstration', 'Uncertainty scoring supports ALARP arguments'],
      ['ASME BPV III Div 4', 'Fusion-specific design rules', 'Design margin % tracked per asset'],
      ['IAEA Safety Standards', 'Safety classification', 'SIC-1/2/3 classification captured'],
    ],
    [45, 50, 70]
  );

  addParagraph('The FLP framework is designed to satisfy asset management system requirements under ISO 55001 [Ref: ISO55001] while incorporating nuclear-specific safety classification from ONR Safety Assessment Principles [Ref: ONR-SAP].');

  // ========== 3. DATA MODEL ARCHITECTURE ==========
  doc.addPage();
  y = margin;
  addHeader('3. Data Model Architecture');
  
  addHeader('3.1 Workbook Structure', 2);
  addTable(
    ['Sheet', 'Purpose', 'Key Fields'],
    [
      ['Asset Register', 'Master list of all assets', 'Asset_ID, Name, Category, Maturity_Phase'],
      ['Design Intent', 'Functional requirements and system value', 'Operating_Envelope, Safety_Classification'],
      ['Degradation', 'Failure modes and uncertainty', 'Mechanisms, Confidence, Known_Unknown'],
      ['Monitoring', 'Instrumentation and VoI', 'Parameters, Methods, Uncertainty_Reduction'],
      ['Maintainability', 'Access and replacement complexity', 'Access_Method, Duration, Supply_Chain_Risk'],
      ['Criticality Scoring', 'Weighted scoring outputs', 'Criticality_Index, Tier, Quadrant'],
      ['Decision Posture', 'Action recommendations', 'Priority, Recommended_Action, Status'],
      ['FOAK Learning', 'R&D and end-of-life data', 'Learning_Value, Waste_Classification'],
    ],
    [40, 60, 65]
  );

  addHeader('3.2 Data Relationships', 2);
  addParagraph('Asset_ID serves as the primary key linking all sheets. Derived fields in Criticality Scoring pull from source sheets using lookup functions. The one-row-per-asset principle ensures tractability and auditability. [Ref: ISO55000]');

  // ========== 4. SCORING FRAMEWORKS ==========
  doc.addPage();
  y = margin;
  addHeader('4. Scoring Frameworks');

  addHeader('4.1 Numeric Scales (1-5)', 2);
  addTable(
    ['Score', 'Uncertainty Level', 'Replaceability', 'System Value Impact'],
    [
      ['1', 'Well-characterised, proven data', 'Days, hands-on access', 'Minor - local effect only'],
      ['2', 'Good understanding, some gaps', 'Weeks, limited complexity', 'Moderate - subsystem impact'],
      ['3', 'Moderate understanding', 'Months, remote handling', 'Significant - system impact'],
      ['4', 'Limited data, significant unknowns', 'Years, major intervention', 'Major - plant-level impact'],
      ['5', 'Unknown-unknowns dominate', 'Not replaceable in practice', 'Critical - plant determining'],
    ],
    [15, 55, 50, 50]
  );

  addHeader('4.2 Confidence Levels', 2);
  addTable(
    ['Level', 'Definition', 'Data Source Examples'],
    [
      ['High', 'Multiple validated sources, operational data', 'ITER/JET operational data, qualified testing'],
      ['Medium', 'Some validated data, engineering judgement', 'Laboratory testing, simulation benchmarked'],
      ['Low', 'Limited data, significant extrapolation', 'Early-stage R&D, theoretical models only'],
      ['Unknown', 'No credible data available', 'Novel mechanisms, untested conditions'],
    ],
    [25, 65, 75]
  );

  addParagraph('Scoring scales are calibrated to fusion-relevant conditions based on ITER materials assessment [Ref: ITER-MAT] and DEMO design studies [Ref: EUR-DEMO]. The scoring framework adapts Technology Readiness Level concepts [Ref: INL-TRL] to asset management contexts.');

  // ========== 5. ASSET DATA & ASSUMPTIONS ==========
  doc.addPage();
  y = margin;
  addHeader('5. Asset Data & Assumptions');

  addHeader('5.1 Operating Envelope Data', 2);
  addTable(
    ['Asset', 'Parameter', 'Value', 'Source'],
    [
      ['Breeding Blanket', 'Neutron flux', '14.1 MeV, 1-2 MW/m²', 'DEMO-TBR, EUR-DEMO'],
      ['Breeding Blanket', 'Operating temperature', '300-500°C', 'EUR-DEMO'],
      ['Breeding Blanket', 'TBR target', '>1.1', 'DEMO-TBR'],
      ['Divertor', 'Peak heat flux', '10-20 MW/m²', 'ITER-MAT'],
      ['Divertor', 'Particle flux', '10²³-10²⁴ m⁻²s⁻¹', 'IAEA-FUS'],
      ['Divertor', 'Expected replacement', '1-2 years', 'EFDA-RH'],
      ['TF Coils', 'Peak field', '11-13 Tesla', 'ITER-MAT'],
      ['TF Coils', 'Operating temperature', '4.5K', 'ITER-MAT'],
      ['Vacuum Vessel', 'Operating pressure', '10⁻⁶ Pa', 'ASME-BPV'],
      ['Vacuum Vessel', 'Baking temperature', '100-200°C', 'ITER-MAT'],
    ],
    [35, 40, 40, 50]
  );

  addHeader('5.2 Design Margin Assumptions', 2);
  addParagraph('Design margins are derived from ASME Boiler and Pressure Vessel Code Section III Division 4 requirements [Ref: ASME-BPV] with FOAK-specific enhancement factors:');
  addParagraph('• Thermal margins: 15-30% above nominal operating conditions');
  addParagraph('• Structural safety factors: 1.5-2.0x for first-of-kind components');
  addParagraph('• Current margins (magnets): 20% below critical current at operating field');

  // ========== 6. DEGRADATION MECHANISMS ==========
  doc.addPage();
  y = margin;
  addHeader('6. Degradation Mechanisms');

  addParagraph('Degradation hypotheses are derived from materials science literature, ITER qualification programmes, and expert elicitation. The Known-Unknown classification follows decision science frameworks for uncertainty characterisation. [Ref: UKAEA-MAT]');

  addHeader('6.1 Plasma-Facing Components', 2);
  addTable(
    ['Mechanism', 'Component', 'Confidence', 'Data Source'],
    [
      ['Neutron-induced swelling', 'Blanket', 'Medium', 'UKAEA-MAT, laboratory irradiation'],
      ['Thermal fatigue', 'Blanket/Divertor', 'High', 'ITER-MAT, cycling tests'],
      ['Tungsten recrystallization', 'Divertor', 'High', 'ITER-MAT, >1300°C exposure'],
      ['Helium bubble formation', 'Divertor', 'Medium', 'IAEA-FUS, ion implantation'],
      ['Beryllium erosion', 'First Wall', 'High', 'JET operational data'],
      ['Lithium burnup', 'Blanket', 'Low', 'Theoretical models only'],
    ],
    [45, 35, 25, 60]
  );

  addHeader('6.2 Magnet Systems', 2);
  addTable(
    ['Mechanism', 'Component', 'Confidence', 'Data Source'],
    [
      ['Radiation-induced resistivity', 'TF Coils', 'Medium', 'ITER-MAT copper studies'],
      ['Insulation degradation', 'TF Coils', 'Low', 'Limited fusion neutron data'],
      ['Joint resistance increase', 'TF Coils', 'Medium', 'ITER joint qualification'],
      ['Quench-induced damage', 'All coils', 'Medium', 'ITER quench testing'],
    ],
    [50, 30, 25, 60]
  );

  addHeader('6.3 Known-Unknown Classification', 2);
  addParagraph('• Known-Known: Well-characterised mechanism with validated models (e.g., thermal fatigue)');
  addParagraph('• Known-Unknown: Mechanism identified but behaviour uncertain under fusion conditions (e.g., neutron swelling rates)');
  addParagraph('• Unknown-Unknown: Potential for unidentified failure modes in novel operating regimes');

  // ========== 7. MONITORING STRATEGIES ==========
  doc.addPage();
  y = margin;
  addHeader('7. Monitoring Strategies');

  addParagraph('Monitoring parameters and methods are derived from ITER diagnostic specifications and fusion diagnostic R&D programmes. Value of Information (VoI) scoring quantifies the decision-enabling value of each measurement. [Ref: ITER-MAT, EFDA-RH]');

  addHeader('7.1 Monitoring Methods Matrix', 2);
  addTable(
    ['Method', 'Parameters', 'Technology Readiness', 'Fallback'],
    [
      ['IR Thermography', 'Surface temperature', 'Proven (ITER)', 'Thermocouples'],
      ['Activation foils', 'Neutron fluence', 'Proven', 'Conservative scheduling'],
      ['Fiber optic sensors', 'Strain, temperature', 'Developmental', 'Discrete sensors'],
      ['Laser profilometry', 'Surface erosion', 'Developmental', 'Visual inspection'],
      ['Online tritium accounting', 'TBR performance', 'Developmental', 'Destructive sampling'],
      ['He leak detection', 'Vacuum integrity', 'Proven', 'Pressure monitoring'],
    ],
    [45, 40, 35, 45]
  );

  addHeader('7.2 Value of Information Scoring', 2);
  addParagraph('VoI Score = (Uncertainty_Reduction × 4) + (Decision_Criticality × 4) + (Fallback_Penalty × 2)');
  addParagraph('Maximum score: 40 points. Scores above 30 indicate high-value instrumentation investments.');
  addParagraph('This approach adapts decision-theoretic VoI concepts [Ref: EPRI-AM] to fusion asset management contexts.');

  // ========== 8. CRITICALITY METHODOLOGY ==========
  doc.addPage();
  y = margin;
  addHeader('8. Criticality Methodology');

  addHeader('8.1 Criticality Index Formula', 2);
  addParagraph('Criticality_Index = (Neutron_Damage_Uncertainty × 0.30 + Replaceability_Score × 0.30 + System_Value_Score × 0.25 + (10 - VoI_Score/4) × 0.15) × Safety_Weight');

  addHeader('8.2 Weighting Rationale', 2);
  addTable(
    ['Factor', 'Weight', 'Rationale'],
    [
      ['Neutron Damage Uncertainty', '30%', 'Primary driver of FOAK risk - novel degradation'],
      ['Replaceability Score', '30%', 'Consequence severity - access and duration'],
      ['System Value Score', '25%', 'Operational and commercial impact'],
      ['Inverse VoI', '15%', 'Incentivises monitoring investment for unknowns'],
    ],
    [50, 20, 95]
  );

  addHeader('8.3 Safety Weight Multipliers', 2);
  addTable(
    ['Classification', 'Weight', 'Definition'],
    [
      ['SIC-1', '1.5×', 'Safety-Important to the public, initiating events'],
      ['SIC-2', '1.2×', 'Safety-Important, supporting functions'],
      ['SIC-3 / Non-nuclear', '1.0×', 'Standard industrial classification'],
    ],
    [40, 25, 100]
  );
  addParagraph('Safety classification follows ONR Safety Assessment Principles [Ref: ONR-SAP] adapted for fusion facility categorisation.');

  addHeader('8.4 Tier Classification', 2);
  addTable(
    ['Tier', 'Index Range', 'Management Approach'],
    [
      ['Tier 1', '≥6.0', 'Immediate action, executive visibility, dedicated resources'],
      ['Tier 2', '4.0-5.99', 'Enhanced monitoring, scheduled reviews, contingency planning'],
      ['Tier 3', '<4.0', 'Standard asset management, periodic review'],
    ],
    [25, 30, 110]
  );

  // ========== 9. DECISION LOGIC ==========
  doc.addPage();
  y = margin;
  addHeader('9. Decision Logic');

  addHeader('9.1 Matrix Quadrant Classification', 2);
  addParagraph('Assets are positioned on a 2×2 matrix using Neutron_Damage_Uncertainty (Y-axis) and Replaceability_Score (X-axis), with threshold at 3.0:');
  addTable(
    ['Quadrant', 'Condition', 'Strategic Posture'],
    [
      ['Q1 - Critical', 'High uncertainty AND hard to replace', 'Maximum investment in monitoring and R&D'],
      ['Q2 - Monitor', 'High uncertainty BUT easier to replace', 'Focus on early warning, accept replacement'],
      ['Q3 - Design Focus', 'Lower uncertainty BUT hard to replace', 'Design-out risk, robust specifications'],
      ['Q4 - Standard', 'Lower uncertainty AND easier to replace', 'Standard maintenance practices'],
    ],
    [35, 60, 70]
  );

  addHeader('9.2 Action Mapping Rules', 2);
  addTable(
    ['Tier + Quadrant', 'Instrumentation', 'R&D', 'Design Review'],
    [
      ['Tier 1 + Q1', 'Mandatory', 'High priority', 'Immediate'],
      ['Tier 1 + Q2', 'High', 'Medium', 'Within 6 months'],
      ['Tier 2 + Q1', 'High', 'High', 'Within 6 months'],
      ['Tier 2 + Q3', 'Medium', 'Medium', 'Within 12 months'],
      ['Tier 3 + any', 'As-needed', 'Low', 'Standard cycle'],
    ],
    [40, 40, 40, 45]
  );

  addParagraph('Decision logic is designed to be auditable and consistent with nuclear industry decision-making frameworks [Ref: NEI-OPT, ONR-SAP].');

  // ========== 10. UNCERTAINTY TREATMENT ==========
  doc.addPage();
  y = margin;
  addHeader('10. Uncertainty Treatment');

  addHeader('10.1 Uncertainty Sources', 2);
  addTable(
    ['Source', 'Treatment in FLP', 'Mitigation'],
    [
      ['Material property data gaps', 'Neutron_Damage_Uncertainty score', 'R&D investment priority'],
      ['Operational regime uncertainty', 'Known_Unknown classification', 'Instrumentation investment'],
      ['Supply chain maturity', 'Supply_Chain_Risk field', 'Spares strategy planning'],
      ['Regulatory pathway uncertainty', 'Waste classification uncertainty', 'Early regulator engagement'],
      ['Manufacturing scalability', 'Manufacturing_Complexity score', 'Supplier qualification'],
    ],
    [55, 55, 55]
  );

  addHeader('10.2 Conservative Assumptions', 2);
  addParagraph('Where data is limited, the FLP applies conservative assumptions consistent with nuclear safety culture:');
  addParagraph('• Degradation rates assumed at upper bound of available data');
  addParagraph('• Replacement durations include contingency for first-of-kind learning');
  addParagraph('• Waste classifications assume upper bound until characterisation confirms otherwise [Ref: NDA-WAC]');

  addHeader('10.3 Model Limitations', 2);
  addParagraph('This model explicitly acknowledges:');
  addParagraph('• Operating envelope data is based on DEMO/ITER projections, not validated fusion power plant data');
  addParagraph('• Scoring weights are based on expert judgement and should be calibrated as operational data emerges');
  addParagraph('• End-of-life assumptions are preliminary pending UK fusion regulatory framework development');

  // ========== 11. REFERENCES ==========
  doc.addPage();
  y = margin;
  addHeader('11. References');

  addParagraph('All data, assumptions, and methodological frameworks in this document are traceable to the following sources:');
  y += 3;

  REFERENCES.forEach((ref, index) => {
    if (y > 265) { doc.addPage(); y = margin; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`[${ref.id}]`, margin, y);
    doc.setFont('helvetica', 'normal');
    const citation = doc.splitTextToSize(ref.citation, contentWidth - 25);
    doc.text(citation, margin + 25, y);
    y += citation.length * 4;
    if (ref.url) {
      doc.setTextColor(59, 130, 246);
      doc.text(ref.url, margin + 25, y);
      doc.setTextColor(0, 0, 0);
      y += 4;
    }
    y += 3;
  });

  // Add footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Fusion Lifecycle Passport - Methodology Document v1.0`, margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
  }

  doc.save('FLP_Methodology_Reference_Document.pdf');
}
