import * as XLSX from 'xlsx';

// Scoring scale options for data validation
const CONFIDENCE_OPTIONS = ['High', 'Medium', 'Low', 'Unknown'];
const KNOWN_UNKNOWN_OPTIONS = ['Known-Known', 'Known-Unknown', 'Unknown-Unknown'];
const MATURITY_OPTIONS = ['Concept', 'Preliminary', 'Detailed', 'Qualified'];
const RELEVANCE_OPTIONS = ['High', 'Medium', 'Low'];
const DUTY_CYCLE_OPTIONS = ['Steady-state', 'Pulsed', 'Variable'];
const SAFETY_CLASS_OPTIONS = ['SIC-1', 'SIC-2', 'SIC-3', 'Non-nuclear'];
const ACCESS_OPTIONS = ['Hands-on', 'Limited', 'Remote-only'];
const DURATION_OPTIONS = ['Hours', 'Days', 'Weeks', 'Months', 'Years'];
const SUPPLY_RISK_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const YES_NO_PARTIAL_OPTIONS = ['Yes', 'No', 'Partial'];
const WASTE_CLASS_OPTIONS = ['ILW', 'LLW', 'VLLW', 'Exempt', 'Unknown'];
const TRANSFERABILITY_OPTIONS = ['Fusion-only', 'SMR-applicable', 'Fleet-wide'];
const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];
const MONITORING_MATURITY_OPTIONS = ['Proven', 'Developmental', 'Conceptual'];
const CATEGORY_OPTIONS = ['Plasma-Facing', 'Magnets', 'Tritium', 'Balance of Plant', 'Vacuum Systems', 'Heating Systems'];

// Sample data for demonstration
const sampleAssets = [
  { id: 'FLP-BB-001', name: 'Breeding Blanket Module', category: 'Plasma-Facing', subsystem: 'First Wall Assembly' },
  { id: 'FLP-DV-001', name: 'Divertor Assembly', category: 'Plasma-Facing', subsystem: 'Lower Divertor' },
  { id: 'FLP-TF-001', name: 'Toroidal Field Coil', category: 'Magnets', subsystem: 'TF Coil System' },
  { id: 'FLP-VV-001', name: 'Vacuum Vessel', category: 'Vacuum Systems', subsystem: 'Primary Vessel' },
  { id: 'FLP-TP-001', name: 'Tritium Processing Plant', category: 'Tritium', subsystem: 'Fuel Cycle' },
  { id: 'FLP-FW-001', name: 'First Wall Panel', category: 'Plasma-Facing', subsystem: 'First Wall Assembly' },
];

function createAssetRegisterSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Asset_Name', 'Category', 'Sub_System', 'Design_Authority',
    'Maturity_Phase', 'FOAK_Relevance', 'Last_Updated', 'Passport_Owner'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Breeding Blanket Module', 'Plasma-Facing', 'First Wall Assembly', 'Design Authority A', 'Preliminary', 'High', '2024-01-15', 'J. Smith'],
    ['FLP-DV-001', 'Divertor Assembly', 'Plasma-Facing', 'Lower Divertor', 'Design Authority B', 'Concept', 'High', '2024-01-15', 'M. Johnson'],
    ['FLP-TF-001', 'Toroidal Field Coil', 'Magnets', 'TF Coil System', 'Design Authority C', 'Detailed', 'Medium', '2024-01-15', 'A. Williams'],
    ['FLP-VV-001', 'Vacuum Vessel', 'Vacuum Systems', 'Primary Vessel', 'Design Authority A', 'Detailed', 'Medium', '2024-01-15', 'R. Brown'],
    ['FLP-TP-001', 'Tritium Processing Plant', 'Tritium', 'Fuel Cycle', 'Design Authority D', 'Preliminary', 'High', '2024-01-15', 'S. Davis'],
    ['FLP-FW-001', 'First Wall Panel', 'Plasma-Facing', 'First Wall Assembly', 'Design Authority A', 'Concept', 'High', '2024-01-15', 'J. Smith'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 20 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 16 }
  ];
  
  return ws;
}

function createDesignIntentSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Functional_Role', 'Operating_Envelope', 'Duty_Cycle', 'Design_Margin_pct',
    'Availability_Impact', 'Flexibility_Impact', 'Output_Impact', 'System_Value_Score',
    'Grid_Participation', 'Safety_Classification'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Tritium breeding and neutron shielding', '300-500°C, 14 MeV neutrons', 'Pulsed', 20, 5, 4, 5, '=AVERAGE(F2:H2)', 'Yes', 'SIC-1'],
    ['FLP-DV-001', 'Plasma exhaust and heat removal', '1000-2000°C peak, 10-20 MW/m²', 'Pulsed', 15, 5, 5, 5, '=AVERAGE(F3:H3)', 'Yes', 'SIC-1'],
    ['FLP-TF-001', 'Plasma confinement magnetic field', '4K operating, 12T field', 'Steady-state', 25, 5, 3, 5, '=AVERAGE(F4:H4)', 'Partial', 'SIC-2'],
    ['FLP-VV-001', 'Primary vacuum boundary', 'UHV, 200°C bakeout', 'Steady-state', 30, 5, 2, 4, '=AVERAGE(F5:H5)', 'No', 'SIC-1'],
    ['FLP-TP-001', 'Tritium recovery and processing', 'Cryogenic to 400°C', 'Variable', 25, 4, 4, 4, '=AVERAGE(F6:H6)', 'Partial', 'SIC-1'],
    ['FLP-FW-001', 'Plasma-facing heat shield', '500-800°C, 1-2 MW/m²', 'Pulsed', 15, 4, 3, 4, '=AVERAGE(F7:H7)', 'Yes', 'SIC-2'],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 35 }, { wch: 30 }, { wch: 12 }, { wch: 16 },
    { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }
  ];
  
  return ws;
}

function createDegradationSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Mechanism_1', 'M1_Confidence', 'M1_Known_Unknown', 'M1_Data_Source',
    'Mechanism_2', 'M2_Confidence', 'M2_Known_Unknown',
    'Mechanism_3', 'M3_Confidence', 'Overall_Uncertainty', 'Neutron_Damage_Uncertainty', 'Cliff_Edge_Risk'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Neutron embrittlement', 'Low', 'Known-Unknown', 'Lab', 'Thermal fatigue', 'Medium', 'Known-Known', 'Lithium corrosion', 'Low', 4, 5, 'Yes'],
    ['FLP-DV-001', 'Erosion/redeposition', 'Medium', 'Known-Unknown', 'Simulation', 'Thermal shock', 'Medium', 'Known-Known', 'Neutron damage', 'Low', 4, 4, 'Possible'],
    ['FLP-TF-001', 'Radiation-induced resistivity', 'Medium', 'Known-Unknown', 'Lab', 'Fatigue cycling', 'High', 'Known-Known', 'Quench damage', 'Medium', 3, 3, 'Possible'],
    ['FLP-VV-001', 'Irradiation embrittlement', 'Medium', 'Known-Known', 'Simulation', 'Thermal cycling', 'High', 'Known-Known', 'Corrosion', 'High', 2, 2, 'No'],
    ['FLP-TP-001', 'Tritium permeation', 'Medium', 'Known-Unknown', 'Lab', 'Catalyst degradation', 'Medium', 'Known-Known', 'Valve wear', 'High', 3, 2, 'No'],
    ['FLP-FW-001', 'Plasma erosion', 'Low', 'Known-Unknown', 'Simulation', 'Thermal fatigue', 'Medium', 'Known-Known', 'Neutron swelling', 'Low', 4, 4, 'Possible'],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    { wch: 18 }, { wch: 14 }, { wch: 16 },
    { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 14 }
  ];
  
  return ws;
}

function createMonitoringSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Parameter_1', 'P1_Method', 'P1_Frequency', 'P1_Uncertainty_Reduction',
    'P1_Decision_Enabled', 'P1_Fallback', 'Parameter_2', 'P2_Method', 'P2_Uncertainty_Reduction',
    'VoI_Score', 'Monitoring_Maturity', 'Instrumentation_Gap'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Neutron fluence', 'Activation foils', 'Campaign', 'Medium', 'Replacement timing', 'Conservative schedule', 'Temperature', 'Thermocouple', 'High', 8, 'Developmental', 'Yes'],
    ['FLP-DV-001', 'Surface temperature', 'IR camera', 'Continuous', 'High', 'Power limit', 'Reduce power', 'Erosion depth', 'Laser profilometry', 'High', 12, 'Developmental', 'Yes'],
    ['FLP-TF-001', 'Quench detection', 'Voltage taps', 'Continuous', 'High', 'Emergency discharge', 'Immediate shutdown', 'Temperature', 'Cryogenic sensors', 'High', 12, 'Proven', 'No'],
    ['FLP-VV-001', 'Leak rate', 'He leak detection', 'Daily', 'High', 'Outage planning', 'Shutdown for repair', 'Strain', 'Strain gauges', 'Medium', 10, 'Proven', 'No'],
    ['FLP-TP-001', 'Tritium inventory', 'Calorimetry', 'Continuous', 'High', 'Safety limits', 'Process isolation', 'Purity', 'Mass spectrometry', 'High', 12, 'Proven', 'No'],
    ['FLP-FW-001', 'Surface condition', 'Visual inspection', 'Outage', 'Low', 'Replacement decision', 'Scheduled replacement', 'Temperature', 'Thermocouple', 'Medium', 5, 'Conceptual', 'Yes'],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 22 },
    { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 22 },
    { wch: 10 }, { wch: 18 }, { wch: 18 }
  ];
  
  return ws;
}

function createMaintainabilitySheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Access_Method', 'Access_Difficulty', 'Replacement_Duration', 'Duration_Score',
    'Remote_Handling_Req', 'RH_Technology_Readiness', 'Supply_Chain_Risk', 'Single_Source',
    'Manufacturing_Complexity', 'Replaceability_Score', 'Spares_Strategy', 'Lead_Time_Months'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Remote-only', 5, 'Months', '=IF(D2="Hours",1,IF(D2="Days",2,IF(D2="Weeks",3,IF(D2="Months",4,5))))', 'Yes', 5, 'Critical', 'Yes', 5, '=AVERAGE(C2,E2,J2)', 'Make-to-order', 24],
    ['FLP-DV-001', 'Remote-only', 5, 'Weeks', '=IF(D3="Hours",1,IF(D3="Days",2,IF(D3="Weeks",3,IF(D3="Months",4,5))))', 'Yes', 6, 'High', 'Yes', 4, '=AVERAGE(C3,E3,J3)', 'Stock', 18],
    ['FLP-TF-001', 'Remote-only', 5, 'Years', '=IF(D4="Hours",1,IF(D4="Days",2,IF(D4="Weeks",3,IF(D4="Months",4,5))))', 'Yes', 4, 'Critical', 'Yes', 5, '=AVERAGE(C4,E4,J4)', 'None', 36],
    ['FLP-VV-001', 'Limited', 4, 'Years', '=IF(D5="Hours",1,IF(D5="Days",2,IF(D5="Weeks",3,IF(D5="Months",4,5))))', 'Partial', 7, 'High', 'No', 5, '=AVERAGE(C5,E5,J5)', 'None', 48],
    ['FLP-TP-001', 'Hands-on', 2, 'Weeks', '=IF(D6="Hours",1,IF(D6="Days",2,IF(D6="Weeks",3,IF(D6="Months",4,5))))', 'No', 9, 'Medium', 'No', 3, '=AVERAGE(C6,E6,J6)', 'Stock', 12],
    ['FLP-FW-001', 'Remote-only', 4, 'Days', '=IF(D7="Hours",1,IF(D7="Days",2,IF(D7="Weeks",3,IF(D7="Months",4,5))))', 'Yes', 6, 'High', 'Yes', 4, '=AVERAGE(C7,E7,J7)', 'Stock', 18],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 14 },
    { wch: 18 }, { wch: 22 }, { wch: 16 }, { wch: 14 },
    { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 16 }
  ];
  
  return ws;
}

function createCriticalityScoringSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Asset_Name', 'Neutron_Damage_Uncertainty', 'Replaceability_Score',
    'System_Value_Score', 'VoI_Score', 'Safety_Classification', 'Safety_Weight',
    'Criticality_Index', 'Criticality_Tier', 'Matrix_Quadrant'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Breeding Blanket Module', 5, 5, 4.67, 8, 'SIC-1', '=IF(G2="SIC-1",1.5,IF(G2="SIC-2",1.2,1))', '=(C2*0.3+D2*0.3+E2*0.25+(10-F2)*0.15)*H2', '=IF(I2>4,"Tier 1",IF(I2>2.5,"Tier 2","Tier 3"))', '=IF(AND(C2>3,D2>3),"Q1-Critical",IF(AND(C2>3,D2<=3),"Q2-Monitor",IF(AND(C2<=3,D2>3),"Q3-Design Focus","Q4-Standard")))'],
    ['FLP-DV-001', 'Divertor Assembly', 4, 4, 5, 12, 'SIC-1', '=IF(G3="SIC-1",1.5,IF(G3="SIC-2",1.2,1))', '=(C3*0.3+D3*0.3+E3*0.25+(10-F3)*0.15)*H3', '=IF(I3>4,"Tier 1",IF(I3>2.5,"Tier 2","Tier 3"))', '=IF(AND(C3>3,D3>3),"Q1-Critical",IF(AND(C3>3,D3<=3),"Q2-Monitor",IF(AND(C3<=3,D3>3),"Q3-Design Focus","Q4-Standard")))'],
    ['FLP-TF-001', 'Toroidal Field Coil', 3, 5, 4.33, 12, 'SIC-2', '=IF(G4="SIC-1",1.5,IF(G4="SIC-2",1.2,1))', '=(C4*0.3+D4*0.3+E4*0.25+(10-F4)*0.15)*H4', '=IF(I4>4,"Tier 1",IF(I4>2.5,"Tier 2","Tier 3"))', '=IF(AND(C4>3,D4>3),"Q1-Critical",IF(AND(C4>3,D4<=3),"Q2-Monitor",IF(AND(C4<=3,D4>3),"Q3-Design Focus","Q4-Standard")))'],
    ['FLP-VV-001', 'Vacuum Vessel', 2, 4.67, 3.67, 10, 'SIC-1', '=IF(G5="SIC-1",1.5,IF(G5="SIC-2",1.2,1))', '=(C5*0.3+D5*0.3+E5*0.25+(10-F5)*0.15)*H5', '=IF(I5>4,"Tier 1",IF(I5>2.5,"Tier 2","Tier 3"))', '=IF(AND(C5>3,D5>3),"Q1-Critical",IF(AND(C5>3,D5<=3),"Q2-Monitor",IF(AND(C5<=3,D5>3),"Q3-Design Focus","Q4-Standard")))'],
    ['FLP-TP-001', 'Tritium Processing Plant', 2, 2.67, 4, 12, 'SIC-1', '=IF(G6="SIC-1",1.5,IF(G6="SIC-2",1.2,1))', '=(C6*0.3+D6*0.3+E6*0.25+(10-F6)*0.15)*H6', '=IF(I6>4,"Tier 1",IF(I6>2.5,"Tier 2","Tier 3"))', '=IF(AND(C6>3,D6>3),"Q1-Critical",IF(AND(C6>3,D6<=3),"Q2-Monitor",IF(AND(C6<=3,D6>3),"Q3-Design Focus","Q4-Standard")))'],
    ['FLP-FW-001', 'First Wall Panel', 4, 3.33, 3.67, 5, 'SIC-2', '=IF(G7="SIC-1",1.5,IF(G7="SIC-2",1.2,1))', '=(C7*0.3+D7*0.3+E7*0.25+(10-F7)*0.15)*H7', '=IF(I7>4,"Tier 1",IF(I7>2.5,"Tier 2","Tier 3"))', '=IF(AND(C7>3,D7>3),"Q1-Critical",IF(AND(C7>3,D7<=3),"Q2-Monitor",IF(AND(C7<=3,D7>3),"Q3-Design Focus","Q4-Standard")))'],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 28 }, { wch: 24 }, { wch: 18 },
    { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 14 },
    { wch: 16 }, { wch: 14 }, { wch: 16 }
  ];
  
  return ws;
}

function createDecisionPostureSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Criticality_Tier', 'Matrix_Quadrant', 'Instrumentation_Priority',
    'RD_Priority', 'Design_Review_Trigger', 'Recommended_Action', 'Action_Owner',
    'Target_Date', 'Status'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 'Tier 1', 'Q1-Critical', 'Mandatory', 'High', 'Immediate', 'Develop in-situ neutron fluence monitoring capability', 'Asset Manager', '2024-06-30', 'In Progress'],
    ['FLP-DV-001', 'Tier 1', 'Q1-Critical', 'High', 'High', 'Immediate', 'Validate erosion monitoring system for FOAK conditions', 'Design Authority', '2024-09-30', 'Open'],
    ['FLP-TF-001', 'Tier 2', 'Q3-Design Focus', 'High', 'Medium', 'Within 12 months', 'Review quench protection system margins', 'Systems Engineer', '2024-12-31', 'Open'],
    ['FLP-VV-001', 'Tier 2', 'Q3-Design Focus', 'Medium', 'Low', 'Within 12 months', 'Complete irradiation qualification programme', 'Materials Lead', '2025-03-31', 'Open'],
    ['FLP-TP-001', 'Tier 3', 'Q4-Standard', 'As-needed', 'Low', 'Standard cycle', 'Maintain current monitoring regime', 'Operations', '2025-06-30', 'Open'],
    ['FLP-FW-001', 'Tier 2', 'Q1-Critical', 'High', 'High', 'Within 6 months', 'Develop real-time surface condition monitoring', 'Instrumentation Lead', '2024-08-31', 'Open'],
    ['', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 22 },
    { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }
  ];
  
  return ws;
}

function createFOAKLearningSheet(): XLSX.WorkSheet {
  const headers = [
    'Asset_ID', 'Learning_Value', 'Transferability', 'Test_Programme_Link',
    'Waste_Classification', 'Waste_Uncertainty', 'Cooling_Period_Years',
    'Disposal_Complexity', 'Activation_Level', 'Decom_Cost_Uncertainty', 'End_of_Life_Risk'
  ];
  
  const data = [
    headers,
    ['FLP-BB-001', 5, 'Fusion-only', 'Yes', 'ILW', 'High', 50, 5, 'High', 'High', '=AVERAGE(H2,IF(F2="High",5,IF(F2="Medium",3,1)))'],
    ['FLP-DV-001', 5, 'Fusion-only', 'Yes', 'ILW', 'High', 30, 4, 'High', 'High', '=AVERAGE(H3,IF(F3="High",5,IF(F3="Medium",3,1)))'],
    ['FLP-TF-001', 4, 'SMR-applicable', 'Yes', 'LLW', 'Medium', 10, 3, 'Medium', 'Medium', '=AVERAGE(H4,IF(F4="High",5,IF(F4="Medium",3,1)))'],
    ['FLP-VV-001', 3, 'Fleet-wide', 'No', 'ILW', 'Medium', 40, 4, 'High', 'Medium', '=AVERAGE(H5,IF(F5="High",5,IF(F5="Medium",3,1)))'],
    ['FLP-TP-001', 4, 'Fleet-wide', 'Yes', 'LLW', 'Low', 5, 2, 'Low', 'Low', '=AVERAGE(H6,IF(F6="High",5,IF(F6="Medium",3,1)))'],
    ['FLP-FW-001', 5, 'Fusion-only', 'Yes', 'LLW', 'Medium', 20, 3, 'Medium', 'Medium', '=AVERAGE(H7,IF(F7="High",5,IF(F7="Medium",3,1)))'],
    ['', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 },
    { wch: 18 }, { wch: 16 }, { wch: 18 },
    { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 16 }
  ];
  
  return ws;
}

function createDashboardSheet(): XLSX.WorkSheet {
  const data = [
    ['FUSION LIFECYCLE PASSPORT - EXECUTIVE DASHBOARD'],
    [''],
    ['PORTFOLIO SUMMARY METRICS'],
    ['', 'Metric', 'Value', 'Status'],
    ['', 'Total Assets', 6, ''],
    ['', 'Tier 1 Critical Assets', 2, 'Action Required'],
    ['', 'Tier 2 Assets', 3, 'Monitor'],
    ['', 'Tier 3 Assets', 1, 'Standard'],
    ['', 'Assets with Instrumentation Gaps', 3, 'Investment Required'],
    ['', 'Average Criticality Index', 4.2, ''],
    [''],
    ['CRITICALITY DISTRIBUTION'],
    ['', 'Tier', 'Count', 'Percentage'],
    ['', 'Tier 1', 2, '33%'],
    ['', 'Tier 2', 3, '50%'],
    ['', 'Tier 3', 1, '17%'],
    [''],
    ['QUADRANT DISTRIBUTION'],
    ['', 'Quadrant', 'Count', 'Primary Action'],
    ['', 'Q1-Critical', 3, 'Immediate instrumentation & R&D'],
    ['', 'Q2-Monitor', 0, 'Enhanced monitoring'],
    ['', 'Q3-Design Focus', 2, 'Design review & margins'],
    ['', 'Q4-Standard', 1, 'Maintain current regime'],
    [''],
    ['TOP CRITICAL ASSETS (by Criticality Index)'],
    ['', 'Rank', 'Asset', 'Criticality Index', 'Quadrant', 'Action Status'],
    ['', 1, 'Breeding Blanket Module', 6.38, 'Q1-Critical', 'In Progress'],
    ['', 2, 'Divertor Assembly', 5.18, 'Q1-Critical', 'Open'],
    ['', 3, 'First Wall Panel', 4.52, 'Q1-Critical', 'Open'],
    ['', 4, 'Toroidal Field Coil', 3.64, 'Q3-Design Focus', 'Open'],
    ['', 5, 'Vacuum Vessel', 3.60, 'Q3-Design Focus', 'Open'],
    [''],
    ['OPEN ACTIONS SUMMARY'],
    ['', 'Owner', 'Open Actions', 'Overdue'],
    ['', 'Asset Manager', 0, 0],
    ['', 'Design Authority', 1, 0],
    ['', 'Systems Engineer', 1, 0],
    ['', 'Materials Lead', 1, 0],
    ['', 'Instrumentation Lead', 1, 0],
    [''],
    ['KEY FORMULAS REFERENCE'],
    ['', 'Criticality Index = (Neutron_Uncertainty×0.3 + Replaceability×0.3 + System_Value×0.25 + (10-VoI)×0.15) × Safety_Weight'],
    ['', 'Tier 1: Index > 4 | Tier 2: Index 2.5-4 | Tier 3: Index < 2.5'],
    ['', 'Q1-Critical: High Uncertainty + High Replaceability Difficulty'],
    ['', 'Q2-Monitor: High Uncertainty + Low Replaceability Difficulty'],
    ['', 'Q3-Design Focus: Low Uncertainty + High Replaceability Difficulty'],
    ['', 'Q4-Standard: Low Uncertainty + Low Replaceability Difficulty'],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 4 }, { wch: 30 }, { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 16 }
  ];
  
  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
  ];
  
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
    ['FOAK_Relevance', ...RELEVANCE_OPTIONS],
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
    ['', '5', 'Extreme / No data / Highly complex'],
    [''],
    ['TRL SCALE'],
    ['', 'TRL', 'Description'],
    ['', '1', 'Basic principles observed'],
    ['', '2', 'Technology concept formulated'],
    ['', '3', 'Experimental proof of concept'],
    ['', '4', 'Technology validated in lab'],
    ['', '5', 'Technology validated in relevant environment'],
    ['', '6', 'Technology demonstrated in relevant environment'],
    ['', '7', 'System prototype demonstration'],
    ['', '8', 'System complete and qualified'],
    ['', '9', 'Actual system proven in operational environment'],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
  ];
  
  return ws;
}

export function generateFLPTemplate(): void {
  const wb = XLSX.utils.book_new();
  
  // Add all sheets
  XLSX.utils.book_append_sheet(wb, createAssetRegisterSheet(), '1. Asset Register');
  XLSX.utils.book_append_sheet(wb, createDesignIntentSheet(), '2. Design Intent');
  XLSX.utils.book_append_sheet(wb, createDegradationSheet(), '3. Degradation');
  XLSX.utils.book_append_sheet(wb, createMonitoringSheet(), '4. Monitoring');
  XLSX.utils.book_append_sheet(wb, createMaintainabilitySheet(), '5. Maintainability');
  XLSX.utils.book_append_sheet(wb, createCriticalityScoringSheet(), '6. Criticality Scoring');
  XLSX.utils.book_append_sheet(wb, createDecisionPostureSheet(), '7. Decision Posture');
  XLSX.utils.book_append_sheet(wb, createFOAKLearningSheet(), '8. FOAK Learning');
  XLSX.utils.book_append_sheet(wb, createDashboardSheet(), '9. Dashboard');
  XLSX.utils.book_append_sheet(wb, createDataValidationSheet(), 'REF - Data Validation');
  
  // Generate and download the file
  XLSX.writeFile(wb, 'Fusion_Lifecycle_Passport_Template.xlsx');
}

export function generateFLPTemplateAsBlob(): Blob {
  const wb = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(wb, createAssetRegisterSheet(), '1. Asset Register');
  XLSX.utils.book_append_sheet(wb, createDesignIntentSheet(), '2. Design Intent');
  XLSX.utils.book_append_sheet(wb, createDegradationSheet(), '3. Degradation');
  XLSX.utils.book_append_sheet(wb, createMonitoringSheet(), '4. Monitoring');
  XLSX.utils.book_append_sheet(wb, createMaintainabilitySheet(), '5. Maintainability');
  XLSX.utils.book_append_sheet(wb, createCriticalityScoringSheet(), '6. Criticality Scoring');
  XLSX.utils.book_append_sheet(wb, createDecisionPostureSheet(), '7. Decision Posture');
  XLSX.utils.book_append_sheet(wb, createFOAKLearningSheet(), '8. FOAK Learning');
  XLSX.utils.book_append_sheet(wb, createDashboardSheet(), '9. Dashboard');
  XLSX.utils.book_append_sheet(wb, createDataValidationSheet(), 'REF - Data Validation');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
