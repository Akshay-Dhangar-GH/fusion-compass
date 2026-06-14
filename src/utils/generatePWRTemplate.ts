import XLSX from 'xlsx-js-style';

// Scoring scale options for data validation
const CONFIDENCE_OPTIONS = ['High', 'Medium', 'Low', 'Unknown'];
const KNOWN_UNKNOWN_OPTIONS = ['Known-Known', 'Known-Unknown', 'Unknown-Unknown'];
const MATURITY_OPTIONS = ['Concept', 'Preliminary', 'Detailed', 'Qualified'];
const RELEVANCE_OPTIONS = ['High', 'Medium', 'Low'];
const DUTY_CYCLE_OPTIONS = ['Steady-state', 'Load-follow', 'Cycling'];
const SAFETY_CLASS_OPTIONS = ['Safety Class 1', 'Safety Class 2', 'Safety Class 3', 'Non-safety'];
const ACCESS_OPTIONS = ['Hands-on', 'Limited', 'Remote-only'];
const DURATION_OPTIONS = ['Hours', 'Days', 'Weeks', 'Months', 'Years'];
const SUPPLY_RISK_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const YES_NO_PARTIAL_OPTIONS = ['Yes', 'No', 'Partial'];
const WASTE_CLASS_OPTIONS = ['HLW', 'ILW', 'LLW', 'VLLW', 'Exempt', 'Unknown'];
const TRANSFERABILITY_OPTIONS = ['PWR-only', 'Gen-III/III+', 'Fleet-wide'];
const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];
const MONITORING_MATURITY_OPTIONS = ['Proven', 'Developmental', 'Conceptual'];
const CATEGORY_OPTIONS = ['Reactor Coolant System', 'Primary Containment', 'Reactivity Control', 'Safety Systems', 'Power Conversion', 'Electrical / I&C'];

// Styles
const border = { style: 'thin', color: { rgb: '000000' } };
const fullBorder = { top: border, bottom: border, left: border, right: border };

const headerStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '1e3a5f' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: fullBorder,
};

const mkStyle = (fg: string, white = true) => ({
  font: { bold: true, color: { rgb: white ? 'FFFFFF' : '000000' } },
  fill: { fgColor: { rgb: fg } },
  alignment: { horizontal: 'center' },
  border: fullBorder,
});

const tier1Style = mkStyle('DC2626');
const tier2Style = mkStyle('F59E0B', false);
const tier3Style = mkStyle('16A34A');
const q1Style = mkStyle('B91C1C');
const q2Style = mkStyle('FCD34D', false);
const q3Style = mkStyle('60A5FA', false);
const q4Style = mkStyle('6B7280');

function applyHeaderStyle(ws: XLSX.WorkSheet, headerCount: number) {
  for (let col = 0; col < headerCount; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[cellRef]) ws[cellRef].s = headerStyle;
  }
}

function applyTierStyle(ws: XLSX.WorkSheet, tierColIndex: number, quadrantColIndex: number, rowCount: number) {
  for (let row = 1; row <= rowCount; row++) {
    const tierCellRef = XLSX.utils.encode_cell({ r: row, c: tierColIndex });
    const quadCellRef = XLSX.utils.encode_cell({ r: row, c: quadrantColIndex });
    if (ws[tierCellRef] && ws[tierCellRef].v) {
      const v = String(ws[tierCellRef].v);
      if (v === 'Tier 1') ws[tierCellRef].s = tier1Style;
      else if (v === 'Tier 2') ws[tierCellRef].s = tier2Style;
      else if (v === 'Tier 3') ws[tierCellRef].s = tier3Style;
    }
    if (ws[quadCellRef] && ws[quadCellRef].v) {
      const v = String(ws[quadCellRef].v);
      if (v === 'Q1-Critical') ws[quadCellRef].s = q1Style;
      else if (v === 'Q2-Monitor') ws[quadCellRef].s = q2Style;
      else if (v === 'Q3-Design Focus') ws[quadCellRef].s = q3Style;
      else if (v === 'Q4-Standard') ws[quadCellRef].s = q4Style;
    }
  }
}

// PWR sample asset IDs (Extended 10)
const ASSETS = [
  { id: 'PLP-RPV-001', name: 'Reactor Pressure Vessel', cat: 'Reactor Coolant System', sub: 'Primary Boundary', auth: 'NSSS Vendor', mat: 'Qualified' },
  { id: 'PLP-SG-001',  name: 'Steam Generator',         cat: 'Reactor Coolant System', sub: 'Primary-Secondary HX', auth: 'NSSS Vendor', mat: 'Qualified' },
  { id: 'PLP-RCP-001', name: 'Reactor Coolant Pump',    cat: 'Reactor Coolant System', sub: 'RCS Flow',            auth: 'Pump OEM',     mat: 'Qualified' },
  { id: 'PLP-PRZ-001', name: 'Pressuriser',              cat: 'Reactor Coolant System', sub: 'RCS Pressure Control',auth: 'NSSS Vendor', mat: 'Qualified' },
  { id: 'PLP-MCP-001', name: 'Main Coolant Piping',     cat: 'Reactor Coolant System', sub: 'Primary Loop Piping', auth: 'NSSS Vendor', mat: 'Qualified' },
  { id: 'PLP-CRDM-001',name: 'Control Rod Drive Mech.', cat: 'Reactivity Control',     sub: 'RPV Head Penetrations',auth: 'NSSS Vendor',mat: 'Qualified' },
  { id: 'PLP-TG-001',  name: 'Turbine-Generator',       cat: 'Power Conversion',       sub: 'HP/LP Turbine, Gen',  auth: 'TG OEM',       mat: 'Qualified' },
  { id: 'PLP-COND-001',name: 'Main Condenser',          cat: 'Power Conversion',       sub: 'Steam Cycle Sink',    auth: 'BOP Vendor',   mat: 'Qualified' },
  { id: 'PLP-CONT-001',name: 'Containment Structure',   cat: 'Primary Containment',    sub: 'Reactor Building',    auth: 'Civil EPC',    mat: 'Qualified' },
  { id: 'PLP-EDG-001', name: 'Emergency Diesel Gen.',   cat: 'Safety Systems',         sub: 'Class 1E Power',      auth: 'EDG OEM',      mat: 'Qualified' },
];

function createAssetRegisterSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Asset_Name', 'Category', 'Sub_System', 'Design_Authority', 'Maturity_Phase', 'LTO_Relevance', 'Last_Updated', 'Passport_Owner'];
  const rows = ASSETS.map((a, i) => [a.id, a.name, a.cat, a.sub, a.auth, a.mat, 'High', '2026-01-15', ['J. Smith', 'M. Johnson', 'A. Williams', 'R. Brown', 'S. Davis'][i % 5]]);
  const data = [headers, ...rows, ['', '', '', '', '', '', '', '', '']];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 16 }];
  applyHeaderStyle(ws, headers.length);
  return ws;
}

function createDesignIntentSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Functional_Role', 'Operating_Envelope', 'Duty_Cycle', 'Design_Margin_pct', 'Availability_Impact', 'Flexibility_Impact', 'Output_Impact', 'System_Value_Score', 'Grid_Participation', 'Safety_Classification'];
  const rows = [
    ['PLP-RPV-001', 'Primary pressure boundary, core support', '~155 bar / ~290–325 °C, fast-neutron flux',   'Steady-state', 25, 5, 3, 4, '=AVERAGE(F2:H2)', 'Yes', 'Safety Class 1'],
    ['PLP-SG-001',  'Primary-to-secondary heat transfer',     '~155 bar primary / ~70 bar secondary',         'Steady-state', 20, 5, 4, 5, '=AVERAGE(F3:H3)', 'Yes', 'Safety Class 1'],
    ['PLP-RCP-001', 'Forced RCS coolant circulation',          '~155 bar, ~290 °C, multi-MW seal-less/shaft',  'Steady-state', 20, 5, 3, 4, '=AVERAGE(F4:H4)', 'Yes', 'Safety Class 1'],
    ['PLP-PRZ-001', 'RCS pressure & inventory control',        '~155 bar, electric heaters + spray',           'Steady-state', 25, 5, 3, 3, '=AVERAGE(F5:H5)', 'Partial', 'Safety Class 1'],
    ['PLP-MCP-001', 'RCS loop piping primary boundary',        '~155 bar / ~290–325 °C, SA-508/SA-312',        'Steady-state', 30, 5, 2, 4, '=AVERAGE(F6:H6)', 'No',  'Safety Class 1'],
    ['PLP-CRDM-001','Reactivity control & SCRAM',              'RPV-head mounted, Alloy 600/690 nozzles',      'Cycling',      20, 5, 5, 5, '=AVERAGE(F7:H7)', 'Yes', 'Safety Class 1'],
    ['PLP-TG-001',  'Electrical power generation',             '~70 bar steam, 3000/1500 rpm, GW-class',       'Load-follow',  15, 5, 5, 5, '=AVERAGE(F8:H8)', 'Yes', 'Non-safety'],
    ['PLP-COND-001','Main steam condensation, heat sink',      'Vacuum, sea/river/CT cooling',                 'Steady-state', 20, 4, 3, 4, '=AVERAGE(F9:H9)', 'No',  'Non-safety'],
    ['PLP-CONT-001','Confinement of radiological release',     'Pre/post-stressed concrete or steel-lined',    'Steady-state', 30, 4, 1, 2, '=AVERAGE(F10:H10)', 'No', 'Safety Class 1'],
    ['PLP-EDG-001', 'Class 1E backup power on LOOP',           'Diesel, fast-start <10 s',                     'Cycling',      25, 5, 2, 3, '=AVERAGE(F11:H11)', 'No', 'Safety Class 1'],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 35 }, { wch: 38 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  applyHeaderStyle(ws, headers.length);
  return ws;
}

function createDegradationSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Mechanism_1', 'M1_Confidence', 'M1_Known_Unknown', 'M1_Data_Source', 'Mechanism_2', 'M2_Confidence', 'M2_Known_Unknown', 'Mechanism_3', 'M3_Confidence', 'Overall_Uncertainty', 'Degradation_Uncertainty', 'Cliff_Edge_Risk'];
  const rows = [
    ['PLP-RPV-001', 'Neutron embrittlement (RTNDT shift)', 'High', 'Known-Known', 'Surveillance capsules', 'Cladding underclad cracking', 'Medium', 'Known-Known', 'Thermal ageing', 'Medium', 3, 3, 'Possible'],
    ['PLP-SG-001',  'PWSCC of Alloy 600 tubes',            'High', 'Known-Known', 'ECT inspection',         'Tube wear at supports',         'High',   'Known-Known', 'FAC of secondary side', 'Medium', 4, 4, 'Yes'],
    ['PLP-RCP-001', 'Seal package wear',                   'High', 'Known-Known', 'Vibration / leakage',    'Shaft bearing degradation',     'High',   'Known-Known', 'Thermal cycling fatigue', 'Medium', 3, 3, 'No'],
    ['PLP-PRZ-001', 'Heater sheath cracking',              'Medium','Known-Known','Maintenance records',    'Surge line stratification',     'Medium', 'Known-Unknown', 'Spray nozzle erosion', 'Medium', 3, 3, 'No'],
    ['PLP-MCP-001', 'Thermal fatigue at mixing tees',      'Medium','Known-Unknown','Plant ops data',       'DMW PWSCC (Alloy 82/182)',      'Medium', 'Known-Known', 'FAC (carbon steel)', 'High', 4, 4, 'Possible'],
    ['PLP-CRDM-001','PWSCC of Alloy 600 head penetrations','High','Known-Known','BMI / Davis-Besse events', 'CRDM motor wear',               'Medium', 'Known-Known', 'Latch fatigue', 'Medium', 4, 4, 'Yes'],
    ['PLP-TG-001',  'LP turbine disc SCC',                 'Medium','Known-Known','Industry OPEX',          'Generator stator insulation',    'Medium', 'Known-Known', 'Bearing wear', 'High', 3, 3, 'No'],
    ['PLP-COND-001','Tube fouling/corrosion',              'High', 'Known-Known','Performance monitoring',  'Cooling-side biofouling',        'High',   'Known-Known', 'Vacuum air in-leak', 'High', 2, 2, 'No'],
    ['PLP-CONT-001','Tendon force relaxation (prestress)', 'Medium','Known-Known','Tendon surveillance',    'Liner plate corrosion',          'Low',    'Known-Unknown', 'Concrete ASR', 'Low', 3, 3, 'No'],
    ['PLP-EDG-001', 'Cylinder/turbo wear',                 'High', 'Known-Known','Surveillance test data',  'Lube-oil degradation',           'Medium', 'Known-Known', 'Starting air system', 'Medium', 3, 3, 'No'],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 32 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 14 }];
  applyHeaderStyle(ws, headers.length);
  return ws;
}

function createMonitoringSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Parameter_1', 'P1_Method', 'P1_Frequency', 'P1_Uncertainty_Reduction', 'P1_Decision_Enabled', 'P1_Fallback', 'Parameter_2', 'P2_Method', 'P2_Uncertainty_Reduction', 'VoI_Score', 'Monitoring_Maturity', 'Instrumentation_Gap'];
  const rows = [
    ['PLP-RPV-001', 'Fluence / RTNDT shift', 'Surveillance capsules',     'Per cycle',    'High',   'PTS / LTO case',          'Conservative thermal limits', 'Cladding ISI',         'UT / EVT',              'Medium', 11, 'Proven', 'No'],
    ['PLP-SG-001',  'Tube degradation',      'Eddy current testing',      'Outage',       'High',   'Tube plugging / SGR',     'Operational chemistry margins','Secondary chemistry',  'Online chemistry',      'High',   12, 'Proven', 'No'],
    ['PLP-RCP-001', 'Vibration spectra',     'Online vibration monitoring','Continuous',  'High',   'Bearing/seal replacement','Increased inspection',        'Seal leak-off',        'Flow / leak instr.',    'High',   11, 'Proven', 'No'],
    ['PLP-PRZ-001', 'Heater current draw',   'Trend analysis',            'Continuous',   'Medium', 'Heater bank replacement', 'Redundant heater banks',      'Surge line ΔT',        'Thermocouples',          'Medium',  8, 'Proven', 'No'],
    ['PLP-MCP-001', 'Wall thickness (FAC)',  'UT inspection grid',        'Outage',       'High',   'Pipe repair/replacement', 'Conservative wear allowance', 'DMW PWSCC ISI',        'Phased-array UT',        'High',   11, 'Proven', 'Yes'],
    ['PLP-CRDM-001','RPV head BMI temp/leak','BMI thermography + visual', 'Outage',       'High',   'Head replacement / repair','Conservative replacement',   'Rod drop time',        'SCRAM testing',          'High',   12, 'Proven', 'No'],
    ['PLP-TG-001',  'LP disc bore cracks',   'Phased-array UT',           'Outage',       'High',   'Disc replacement',        'Limit operating speed',       'Generator partial disch.','PD monitoring',        'Medium', 10, 'Proven', 'No'],
    ['PLP-COND-001','Condenser back-pressure','Process instrumentation',  'Continuous',   'Medium', 'Cleaning / plugging',     'Accept performance loss',     'Air in-leak rate',     'Helium leak detection',  'Medium',  7, 'Proven', 'No'],
    ['PLP-CONT-001','Tendon force',          'Tendon surveillance',       '5-yearly',     'High',   'LTO licensing case',      'Conservative ageing curve',   'Leak rate test',       'ILRT / Type A test',     'Medium', 10, 'Proven', 'No'],
    ['PLP-EDG-001', 'Start reliability',     'Monthly surveillance test', 'Monthly',      'High',   'Maintenance scope',       'Increased test frequency',    'Lube-oil analysis',    'Oil sampling',           'Medium', 10, 'Proven', 'No'],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 26 }, { wch: 14 }, { wch: 22 }, { wch: 26 }, { wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
  applyHeaderStyle(ws, headers.length);
  return ws;
}

function createMaintainabilitySheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Access_Method', 'Access_Difficulty', 'Replacement_Duration', 'Duration_Score', 'Remote_Handling_Req', 'RH_Technology_Readiness', 'Supply_Chain_Risk', 'Single_Source', 'Manufacturing_Complexity', 'Replaceability_Score', 'Spares_Strategy', 'Lead_Time_Months'];
  const rows = [
    ['PLP-RPV-001', 'Limited',   5, 'Years',  '=IF(D2="Hours",1,IF(D2="Days",2,IF(D2="Weeks",3,IF(D2="Months",4,5))))', 'Partial', 8, 'Critical', 'Yes', 5, '=AVERAGE(C2,E2,J2)', 'None',          60],
    ['PLP-SG-001',  'Limited',   4, 'Months', '=IF(D3="Hours",1,IF(D3="Days",2,IF(D3="Weeks",3,IF(D3="Months",4,5))))', 'No',      9, 'High',     'No',  4, '=AVERAGE(C3,E3,J3)', 'Make-to-order', 36],
    ['PLP-RCP-001', 'Hands-on',  3, 'Weeks',  '=IF(D4="Hours",1,IF(D4="Days",2,IF(D4="Weeks",3,IF(D4="Months",4,5))))', 'No',      9, 'Medium',   'No',  3, '=AVERAGE(C4,E4,J4)', 'Strategic stock', 18],
    ['PLP-PRZ-001', 'Limited',   3, 'Months', '=IF(D5="Hours",1,IF(D5="Days",2,IF(D5="Weeks",3,IF(D5="Months",4,5))))', 'No',      9, 'Medium',   'No',  3, '=AVERAGE(C5,E5,J5)', 'Make-to-order', 24],
    ['PLP-MCP-001', 'Limited',   4, 'Months', '=IF(D6="Hours",1,IF(D6="Days",2,IF(D6="Weeks",3,IF(D6="Months",4,5))))', 'Partial', 9, 'High',     'No',  4, '=AVERAGE(C6,E6,J6)', 'Strategic stock', 24],
    ['PLP-CRDM-001','Limited',   4, 'Months', '=IF(D7="Hours",1,IF(D7="Days",2,IF(D7="Weeks",3,IF(D7="Months",4,5))))', 'Yes',     8, 'High',     'No',  4, '=AVERAGE(C7,E7,J7)', 'Strategic stock', 30],
    ['PLP-TG-001',  'Hands-on',  3, 'Months', '=IF(D8="Hours",1,IF(D8="Days",2,IF(D8="Weeks",3,IF(D8="Months",4,5))))', 'No',      9, 'High',     'No',  4, '=AVERAGE(C8,E8,J8)', 'Make-to-order', 36],
    ['PLP-COND-001','Hands-on',  2, 'Weeks',  '=IF(D9="Hours",1,IF(D9="Days",2,IF(D9="Weeks",3,IF(D9="Months",4,5))))', 'No',      9, 'Low',      'No',  2, '=AVERAGE(C9,E9,J9)', 'Stock',         12],
    ['PLP-CONT-001','Limited',   5, 'Years',  '=IF(D10="Hours",1,IF(D10="Days",2,IF(D10="Weeks",3,IF(D10="Months",4,5))))','No',   9, 'Critical', 'Yes', 5, '=AVERAGE(C10,E10,J10)', 'None',        0],
    ['PLP-EDG-001', 'Hands-on',  2, 'Weeks',  '=IF(D11="Hours",1,IF(D11="Days",2,IF(D11="Weeks",3,IF(D11="Months",4,5))))','No',   9, 'Medium',   'No',  3, '=AVERAGE(C11,E11,J11)', 'Strategic stock', 18],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 16 }];
  applyHeaderStyle(ws, headers.length);
  return ws;
}

function createCriticalityScoringSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Asset_Name', 'Degradation_Uncertainty', 'Replaceability_Score', 'System_Value_Score', 'VoI_Score', 'Safety_Classification', 'Safety_Weight', 'Criticality_Index', 'Criticality_Tier', 'Matrix_Quadrant'];
  const rows = [
    ['PLP-RPV-001',  'Reactor Pressure Vessel',     3, 5,    4,    11, 'Safety Class 1', '=IF(G2="Safety Class 1",1.5,IF(G2="Safety Class 2",1.2,1))',  '=(C2*0.3+D2*0.3+E2*0.25+(10-F2)*0.15)*H2', 'Tier 1', 'Q3-Design Focus'],
    ['PLP-SG-001',   'Steam Generator',             4, 4.33, 4.67, 12, 'Safety Class 1', '=IF(G3="Safety Class 1",1.5,IF(G3="Safety Class 2",1.2,1))',  '=(C3*0.3+D3*0.3+E3*0.25+(10-F3)*0.15)*H3', 'Tier 1', 'Q1-Critical'],
    ['PLP-RCP-001',  'Reactor Coolant Pump',        3, 3.33, 4,    11, 'Safety Class 1', '=IF(G4="Safety Class 1",1.5,IF(G4="Safety Class 2",1.2,1))',  '=(C4*0.3+D4*0.3+E4*0.25+(10-F4)*0.15)*H4', 'Tier 2', 'Q3-Design Focus'],
    ['PLP-PRZ-001',  'Pressuriser',                 3, 3.67, 3.67,  8, 'Safety Class 1', '=IF(G5="Safety Class 1",1.5,IF(G5="Safety Class 2",1.2,1))',  '=(C5*0.3+D5*0.3+E5*0.25+(10-F5)*0.15)*H5', 'Tier 2', 'Q3-Design Focus'],
    ['PLP-MCP-001',  'Main Coolant Piping',         4, 4.33, 3.67, 11, 'Safety Class 1', '=IF(G6="Safety Class 1",1.5,IF(G6="Safety Class 2",1.2,1))',  '=(C6*0.3+D6*0.3+E6*0.25+(10-F6)*0.15)*H6', 'Tier 1', 'Q1-Critical'],
    ['PLP-CRDM-001', 'Control Rod Drive Mechanism', 4, 4,    5,    12, 'Safety Class 1', '=IF(G7="Safety Class 1",1.5,IF(G7="Safety Class 2",1.2,1))',  '=(C7*0.3+D7*0.3+E7*0.25+(10-F7)*0.15)*H7', 'Tier 1', 'Q1-Critical'],
    ['PLP-TG-001',   'Turbine-Generator',           3, 3.33, 5,    10, 'Non-safety',     '=IF(G8="Safety Class 1",1.5,IF(G8="Safety Class 2",1.2,1))',  '=(C8*0.3+D8*0.3+E8*0.25+(10-F8)*0.15)*H8', 'Tier 3', 'Q4-Standard'],
    ['PLP-COND-001', 'Main Condenser',              2, 2,    3.67,  7, 'Non-safety',     '=IF(G9="Safety Class 1",1.5,IF(G9="Safety Class 2",1.2,1))',  '=(C9*0.3+D9*0.3+E9*0.25+(10-F9)*0.15)*H9', 'Tier 3', 'Q4-Standard'],
    ['PLP-CONT-001', 'Containment Structure',       3, 5,    2.33, 10, 'Safety Class 1', '=IF(G10="Safety Class 1",1.5,IF(G10="Safety Class 2",1.2,1))','=(C10*0.3+D10*0.3+E10*0.25+(10-F10)*0.15)*H10','Tier 2', 'Q3-Design Focus'],
    ['PLP-EDG-001',  'Emergency Diesel Generator',  3, 2.33, 3.33, 10, 'Safety Class 1', '=IF(G11="Safety Class 1",1.5,IF(G11="Safety Class 2",1.2,1))','=(C11*0.3+D11*0.3+E11*0.25+(10-F11)*0.15)*H11','Tier 2', 'Q4-Standard'],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 18 }];
  applyHeaderStyle(ws, headers.length);
  applyTierStyle(ws, 9, 10, rows.length);
  return ws;
}

function createDecisionPostureSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'Criticality_Tier', 'Matrix_Quadrant', 'Instrumentation_Priority', 'RD_Priority', 'Design_Review_Trigger', 'Recommended_Action', 'Action_Owner', 'Target_Date', 'Status'];
  const rows = [
    ['PLP-RPV-001',  'Tier 1', 'Q3-Design Focus','High',     'Medium', 'Within 24 months', 'Update PTS analysis and LTO case for next licensing window', 'Engineering',         '2027-06-30', 'Open'],
    ['PLP-SG-001',   'Tier 1', 'Q1-Critical',   'Mandatory', 'High',   'Immediate',        'Plan SG replacement scope for outage N+2',                  'Outage Director',     '2026-12-31', 'In Progress'],
    ['PLP-RCP-001',  'Tier 2', 'Q3-Design Focus','High',     'Medium', 'Within 12 months', 'Confirm seal package overhaul strategy across loops',       'RCS System Engineer', '2027-03-31', 'Open'],
    ['PLP-PRZ-001',  'Tier 2', 'Q3-Design Focus','Medium',   'Low',    'Within 24 months', 'Heater bank refurbishment plan',                            'NSSS Engineer',       '2027-09-30', 'Open'],
    ['PLP-MCP-001',  'Tier 1', 'Q1-Critical',   'High',      'High',   'Within 6 months',  'Expand FAC inspection grid; review DMW PWSCC ISI scope',    'ISI Programme',       '2026-09-30', 'In Progress'],
    ['PLP-CRDM-001', 'Tier 1', 'Q1-Critical',   'Mandatory', 'High',   'Immediate',        'RPV head replacement decision; mitigate Alloy 600 PWSCC',   'Outage Director',     '2027-06-30', 'Open'],
    ['PLP-TG-001',   'Tier 3', 'Q4-Standard',   'Medium',    'Low',    'Standard cycle',   'Continue LP disc PAUT and generator PD monitoring',         'TG System Engineer',  '2027-12-31', 'Open'],
    ['PLP-COND-001', 'Tier 3', 'Q4-Standard',   'Low',       'Low',    'Standard cycle',   'Maintain cleaning programme and air in-leak tracking',      'BOP Engineer',        '2028-03-31', 'Open'],
    ['PLP-CONT-001', 'Tier 2', 'Q3-Design Focus','Medium',   'Low',    'Within 24 months', 'Tendon surveillance update for LTO submission',             'Civil Programme',     '2028-06-30', 'Open'],
    ['PLP-EDG-001',  'Tier 2', 'Q4-Standard',   'Medium',    'Low',    'Standard cycle',   'Trend start reliability and review surveillance frequency', 'Electrical Engineer', '2027-06-30', 'Open'],
    ['', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 22 }, { wch: 55 }, { wch: 22 }, { wch: 12 }, { wch: 14 }];
  applyHeaderStyle(ws, headers.length);
  applyTierStyle(ws, 1, 2, rows.length);
  return ws;
}

function createLTOLearningSheet(): XLSX.WorkSheet {
  const headers = ['Asset_ID', 'OPEX_Learning_Value', 'Transferability', 'Surveillance_Programme_Link', 'Waste_Classification', 'Waste_Uncertainty', 'Cooling_Period_Years', 'Disposal_Complexity', 'Activation_Level', 'Decom_Cost_Uncertainty', 'End_of_Life_Risk'];
  const rows = [
    ['PLP-RPV-001',  5, 'Fleet-wide',    'Yes', 'HLW', 'Medium', 50, 5, 'High',   'High',   '=AVERAGE(H2,IF(F2="High",5,IF(F2="Medium",3,1)))'],
    ['PLP-SG-001',   5, 'Fleet-wide',    'Yes', 'ILW', 'Medium', 30, 4, 'Medium', 'Medium', '=AVERAGE(H3,IF(F3="High",5,IF(F3="Medium",3,1)))'],
    ['PLP-RCP-001',  4, 'Gen-III/III+',  'Yes', 'LLW', 'Low',    10, 3, 'Medium', 'Low',    '=AVERAGE(H4,IF(F4="High",5,IF(F4="Medium",3,1)))'],
    ['PLP-PRZ-001',  3, 'Fleet-wide',    'Yes', 'LLW', 'Low',    10, 3, 'Medium', 'Low',    '=AVERAGE(H5,IF(F5="High",5,IF(F5="Medium",3,1)))'],
    ['PLP-MCP-001',  4, 'Fleet-wide',    'Yes', 'ILW', 'Medium', 25, 4, 'Medium', 'Medium', '=AVERAGE(H6,IF(F6="High",5,IF(F6="Medium",3,1)))'],
    ['PLP-CRDM-001', 5, 'Fleet-wide',    'Yes', 'ILW', 'Medium', 20, 4, 'Medium', 'Medium', '=AVERAGE(H7,IF(F7="High",5,IF(F7="Medium",3,1)))'],
    ['PLP-TG-001',   3, 'Fleet-wide',    'No',  'VLLW','Low',     5, 2, 'Low',    'Low',    '=AVERAGE(H8,IF(F8="High",5,IF(F8="Medium",3,1)))'],
    ['PLP-COND-001', 2, 'Fleet-wide',    'No',  'Exempt','Low',   2, 1, 'Low',    'Low',    '=AVERAGE(H9,IF(F9="High",5,IF(F9="Medium",3,1)))'],
    ['PLP-CONT-001', 4, 'Fleet-wide',    'Yes', 'LLW', 'Medium', 40, 4, 'Low',    'High',   '=AVERAGE(H10,IF(F10="High",5,IF(F10="Medium",3,1)))'],
    ['PLP-EDG-001',  3, 'Fleet-wide',    'Yes', 'VLLW','Low',     5, 2, 'Low',    'Low',    '=AVERAGE(H11,IF(F11="High",5,IF(F11="Medium",3,1)))'],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 26 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 16 }];
  applyHeaderStyle(ws, headers.length);
  return ws;
}

function createDashboardSheet(): XLSX.WorkSheet {
  const data = [
    ['PWR LIFECYCLE PASSPORT - EXECUTIVE DASHBOARD'],
    [''],
    ['PORTFOLIO SUMMARY METRICS'],
    ['', 'Metric', 'Value', 'Status'],
    ['', 'Total Assets', 10, ''],
    ['', 'Tier 1 Critical Assets', 4, 'Action Required'],
    ['', 'Tier 2 Assets', 4, 'Monitor'],
    ['', 'Tier 3 Assets', 2, 'Standard'],
    ['', 'Assets with Instrumentation Gaps', 1, 'Investment Required'],
    ['', 'Average Criticality Index', 4.6, ''],
    [''],
    ['CRITICALITY DISTRIBUTION'],
    ['', 'Tier', 'Count', 'Percentage'],
    ['', 'Tier 1', 4, '40%'],
    ['', 'Tier 2', 4, '40%'],
    ['', 'Tier 3', 2, '20%'],
    [''],
    ['QUADRANT DISTRIBUTION'],
    ['', 'Quadrant', 'Count', 'Primary Action'],
    ['', 'Q1-Critical', 3, 'Immediate inspection & R&D'],
    ['', 'Q2-Monitor', 0, 'Enhanced monitoring'],
    ['', 'Q3-Design Focus', 4, 'Design margins & ageing case'],
    ['', 'Q4-Standard', 3, 'Maintain current regime'],
    [''],
    ['TOP CRITICAL ASSETS (by Criticality Index)'],
    ['', 'Rank', 'Asset', 'Criticality Index', 'Quadrant', 'Action Status'],
    ['', 1, 'Steam Generator',               6.50, 'Q1-Critical',    'In Progress'],
    ['', 2, 'Control Rod Drive Mechanism',   6.20, 'Q1-Critical',    'Open'],
    ['', 3, 'Main Coolant Piping',           5.95, 'Q1-Critical',    'In Progress'],
    ['', 4, 'Reactor Pressure Vessel',       5.35, 'Q3-Design Focus','Open'],
    ['', 5, 'Reactor Coolant Pump',          4.65, 'Q3-Design Focus','Open'],
    [''],
    ['KEY FORMULAS REFERENCE'],
    ['', 'Criticality Index = (Degradation_Uncertainty×0.3 + Replaceability×0.3 + System_Value×0.25 + (10-VoI)×0.15) × Safety_Weight'],
    ['', 'Tier 1: Index > 5 | Tier 2: Index 3-5 | Tier 3: Index < 3'],
    ['', 'Q1-Critical: High Degradation Uncertainty + High Replaceability Difficulty'],
    ['', 'Q2-Monitor: High Degradation Uncertainty + Low Replaceability Difficulty'],
    ['', 'Q3-Design Focus: Low Degradation Uncertainty + High Replaceability Difficulty'],
    ['', 'Q4-Standard: Low Degradation Uncertainty + Low Replaceability Difficulty'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 4 }, { wch: 32 }, { wch: 30 }, { wch: 20 }, { wch: 18 }, { wch: 16 }];
  if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 16, color: { rgb: '1e3a5f' } }, alignment: { horizontal: 'left' } };
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
  return ws;
}

function createDataValidationSheet(): XLSX.WorkSheet {
  const data = [
    ['DATA VALIDATION REFERENCE - DO NOT MODIFY'],
    [''],
    ['This sheet contains dropdown lists used for data validation across the workbook.'],
    [''],
    ['Category', ...CATEGORY_OPTIONS],
    ['Maturity_Phase', ...MATURITY_OPTIONS],
    ['LTO_Relevance', ...RELEVANCE_OPTIONS],
    ['Confidence', ...CONFIDENCE_OPTIONS],
    ['Known_Unknown', ...KNOWN_UNKNOWN_OPTIONS],
    ['Duty_Cycle', ...DUTY_CYCLE_OPTIONS],
    ['Safety_Classification', ...SAFETY_CLASS_OPTIONS],
    ['Access_Method', ...ACCESS_OPTIONS],
    ['Replacement_Duration', ...DURATION_OPTIONS],
    ['Supply_Chain_Risk', ...SUPPLY_RISK_OPTIONS],
    ['Yes_No', ...YES_NO_OPTIONS],
    ['Yes_No_Partial', ...YES_NO_PARTIAL_OPTIONS],
    ['Waste_Classification', ...WASTE_CLASS_OPTIONS],
    ['Transferability', ...TRANSFERABILITY_OPTIONS],
    ['Status', ...STATUS_OPTIONS],
    ['Monitoring_Maturity', ...MONITORING_MATURITY_OPTIONS],
    [''],
    ['SCORING SCALES'],
    ['', 'Scale', 'Anchors'],
    ['', '1', 'Minimal / Well-characterised / Simple'],
    ['', '2', 'Low'],
    ['', '3', 'Medium / Moderate'],
    ['', '4', 'High'],
    ['', '5', 'Extreme / Limited data / Highly complex'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 45 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: 'B91C1C' } } };
  return ws;
}

export function generatePWRTemplate(): void {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, createAssetRegisterSheet(),       '1. Asset Register');
  XLSX.utils.book_append_sheet(wb, createDesignIntentSheet(),        '2. Design Intent');
  XLSX.utils.book_append_sheet(wb, createDegradationSheet(),         '3. Degradation');
  XLSX.utils.book_append_sheet(wb, createMonitoringSheet(),          '4. Monitoring');
  XLSX.utils.book_append_sheet(wb, createMaintainabilitySheet(),     '5. Maintainability');
  XLSX.utils.book_append_sheet(wb, createCriticalityScoringSheet(),  '6. Criticality Scoring');
  XLSX.utils.book_append_sheet(wb, createDecisionPostureSheet(),     '7. Decision Posture');
  XLSX.utils.book_append_sheet(wb, createLTOLearningSheet(),         '8. LTO / OPEX Learning');
  XLSX.utils.book_append_sheet(wb, createDashboardSheet(),           '9. Dashboard');
  XLSX.utils.book_append_sheet(wb, createDataValidationSheet(),      'REF - Data Validation');
  XLSX.writeFile(wb, 'PWR_Lifecycle_Passport_Template.xlsx');
}
