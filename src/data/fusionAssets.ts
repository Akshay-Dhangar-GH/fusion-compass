export interface DegradationHypothesis {
  mechanism: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Unknown';
  description: string;
  knownUnknown: boolean;
}

export interface MonitoringStrategy {
  parameter: string;
  method: string;
  purpose: string;
  uncertaintyReduction: string;
  fallback: string;
}

export interface MaintainabilityInfo {
  accessConstraints: string;
  replacementStrategy: string;
  estimatedDuration: string;
  remoteHandling: boolean;
  supplyChainRealism: 'Proven' | 'Developing' | 'Uncertain';
}

export interface SystemValueImpact {
  availabilityImpact: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  flexibilityImpact: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  outputImpact: string;
  energySystemLinks: string[];
}

export interface EndOfLifeAssumptions {
  wasteClassification: string;
  classificationUncertainty: 'Low' | 'Medium' | 'High';
  coolingPeriod: string;
  handlingRequirements: string;
  disposalComplexity: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface FusionAsset {
  id: string;
  name: string;
  category: 'Plasma-Facing' | 'Magnets' | 'Blanket' | 'Structural' | 'Auxiliary';
  
  // Asset Identity & Design Intent
  functionalRole: string;
  operatingEnvelope: string;
  dutyCycle: string;
  designMargins: string;
  constraints: string[];
  
  // Criticality Matrix Position
  neutronDamageUncertainty: number; // 1-5
  replaceabilityDifficulty: number; // 1-5
  systemValueImpact: number; // 1-5
  
  // Status
  maturityLevel: 'Concept' | 'Design' | 'Prototype' | 'Qualified' | 'Operational';
  confidenceScore: number; // 0-100
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  
  // Detailed sections
  degradationHypotheses: DegradationHypothesis[];
  monitoringStrategy: MonitoringStrategy[];
  maintainability: MaintainabilityInfo;
  systemValue: SystemValueImpact;
  endOfLife: EndOfLifeAssumptions;
  
  // Learning & R&D
  learningPriority: 'Immediate' | 'High' | 'Medium' | 'Low';
  rdInvestmentJustification: string;
  instrumentationPriority: number; // 1-5
}

export const fusionAssets: FusionAsset[] = [
  {
    id: 'blanket-breeding',
    name: 'Breeding Blanket Module',
    category: 'Blanket',
    functionalRole: 'Tritium breeding, neutron multiplication, heat extraction to primary coolant loop',
    operatingEnvelope: '14.1 MeV neutron flux, 300-500°C operating temperature, 2-5 MW/m² heat flux',
    dutyCycle: 'Continuous operation during plasma burn, 70-80% availability target',
    designMargins: '20% thermal margin, 50% structural safety factor on first-of-kind',
    constraints: [
      'Must achieve tritium breeding ratio >1.1',
      'Coolant compatibility with structural materials',
      'Limited in-service inspection access'
    ],
    neutronDamageUncertainty: 5,
    replaceabilityDifficulty: 4,
    systemValueImpact: 5,
    maturityLevel: 'Concept',
    confidenceScore: 35,
    riskLevel: 'Critical',
    degradationHypotheses: [
      {
        mechanism: 'Neutron-induced swelling',
        confidence: 'Medium',
        description: 'Volumetric changes from helium and hydrogen transmutation products',
        knownUnknown: false
      },
      {
        mechanism: 'Thermal fatigue at interfaces',
        confidence: 'High',
        description: 'Cyclic thermal stresses at material boundaries during plasma pulsing',
        knownUnknown: false
      },
      {
        mechanism: 'Lithium burnup and redistribution',
        confidence: 'Low',
        description: 'Changes in breeding performance over operational lifetime',
        knownUnknown: true
      },
      {
        mechanism: 'Coolant-structure interaction',
        confidence: 'Medium',
        description: 'Corrosion and material transport in liquid metal systems',
        knownUnknown: true
      }
    ],
    monitoringStrategy: [
      {
        parameter: 'Tritium production rate',
        method: 'Online tritium accounting system',
        purpose: 'Verify breeding performance and detect degradation',
        uncertaintyReduction: 'Reduces TBR uncertainty from ±30% to ±10%',
        fallback: 'Periodic destructive sampling during maintenance'
      },
      {
        parameter: 'Coolant outlet temperature profile',
        method: 'Distributed fiber optic sensors',
        purpose: 'Detect local hotspots indicating degradation',
        uncertaintyReduction: 'Early warning of thermal degradation',
        fallback: 'Reduced spatial resolution with discrete sensors'
      },
      {
        parameter: 'Structural strain',
        method: 'Embedded strain gauges where accessible',
        purpose: 'Monitor cumulative deformation',
        uncertaintyReduction: 'Validates structural models',
        fallback: 'Post-operation dimensional inspection'
      }
    ],
    maintainability: {
      accessConstraints: 'Requires removal through dedicated maintenance port, high radiation environment',
      replacementStrategy: 'Segment replacement using remote handling, full module exchange',
      estimatedDuration: '4-8 weeks per module including cooling and decontamination',
      remoteHandling: true,
      supplyChainRealism: 'Developing'
    },
    systemValue: {
      availabilityImpact: 'Critical',
      flexibilityImpact: 'Major',
      outputImpact: 'Direct 1:1 relationship with thermal power output',
      energySystemLinks: [
        'Primary heat source for power conversion',
        'Tritium self-sufficiency for fuel cycle',
        'Determines plant capacity factor ceiling'
      ]
    },
    endOfLife: {
      wasteClassification: 'Intermediate Level Waste (ILW) to High Level Waste (HLW)',
      classificationUncertainty: 'High',
      coolingPeriod: '50-100 years estimated',
      handlingRequirements: 'Remote handling, shielded transport, specialized disposal route',
      disposalComplexity: 'Very High'
    },
    learningPriority: 'Immediate',
    rdInvestmentJustification: 'Critical path for fusion economics and fuel self-sufficiency',
    instrumentationPriority: 5
  },
  {
    id: 'divertor',
    name: 'Divertor Assembly',
    category: 'Plasma-Facing',
    functionalRole: 'Exhaust heat and helium ash removal, plasma purity control',
    operatingEnvelope: '10-20 MW/m² peak heat flux, particle flux 10²³-10²⁴ m⁻²s⁻¹',
    dutyCycle: 'Continuous during plasma operation, expected replacement every 1-2 years',
    designMargins: 'Operating at or near material limits, minimal margin',
    constraints: [
      'Most extreme thermal environment in fusion device',
      'Must handle transient events (ELMs, disruptions)',
      'Tungsten surface integrity critical for plasma purity'
    ],
    neutronDamageUncertainty: 4,
    replaceabilityDifficulty: 3,
    systemValueImpact: 5,
    maturityLevel: 'Prototype',
    confidenceScore: 55,
    riskLevel: 'Critical',
    degradationHypotheses: [
      {
        mechanism: 'Surface erosion and redeposition',
        confidence: 'High',
        description: 'Tungsten sputtering and co-deposition with fuel species',
        knownUnknown: false
      },
      {
        mechanism: 'Tungsten recrystallization',
        confidence: 'High',
        description: 'Grain growth reducing mechanical properties above 1300°C',
        knownUnknown: false
      },
      {
        mechanism: 'Helium bubble formation',
        confidence: 'Medium',
        description: 'Sub-surface helium accumulation causing blistering',
        knownUnknown: false
      },
      {
        mechanism: 'Thermal fatigue cracking',
        confidence: 'High',
        description: 'Crack initiation from cyclic thermal loading',
        knownUnknown: false
      }
    ],
    monitoringStrategy: [
      {
        parameter: 'Surface temperature profile',
        method: 'IR thermography, embedded thermocouples',
        purpose: 'Detect hotspots and coolant channel degradation',
        uncertaintyReduction: 'Real-time thermal limit protection',
        fallback: 'Conservative power limits without monitoring'
      },
      {
        parameter: 'Surface morphology',
        method: 'Laser profilometry during maintenance',
        purpose: 'Track erosion rates and surface condition',
        uncertaintyReduction: 'Validates lifetime models',
        fallback: 'End-of-campaign inspection only'
      },
      {
        parameter: 'Coolant flow and pressure',
        method: 'Flow sensors, pressure transducers',
        purpose: 'Detect cooling degradation or leaks',
        uncertaintyReduction: 'Critical safety function',
        fallback: 'None acceptable - safety critical'
      }
    ],
    maintainability: {
      accessConstraints: 'Lower vessel access, activation levels permit limited hands-on during shutdown',
      replacementStrategy: 'Cassette-based replacement design for rapid exchange',
      estimatedDuration: '2-4 weeks for full divertor replacement',
      remoteHandling: true,
      supplyChainRealism: 'Developing'
    },
    systemValue: {
      availabilityImpact: 'Critical',
      flexibilityImpact: 'Critical',
      outputImpact: 'Divertor limits determine maximum plasma power',
      energySystemLinks: [
        'Sets upper bound on fusion power',
        'Maintenance frequency directly impacts availability',
        'Determines operational flexibility envelope'
      ]
    },
    endOfLife: {
      wasteClassification: 'Low Level Waste (LLW) to Intermediate Level Waste (ILW)',
      classificationUncertainty: 'Medium',
      coolingPeriod: '10-50 years depending on activation',
      handlingRequirements: 'Remote handling, activated tungsten management',
      disposalComplexity: 'High'
    },
    learningPriority: 'Immediate',
    rdInvestmentJustification: 'Most life-limiting component, directly sets maintenance schedule',
    instrumentationPriority: 5
  },
  {
    id: 'first-wall',
    name: 'First Wall Panels',
    category: 'Plasma-Facing',
    functionalRole: 'Plasma-material interface, radiation shielding, heat extraction',
    operatingEnvelope: '0.5-2 MW/m² average heat flux, neutron wall loading 1-2 MW/m²',
    dutyCycle: 'Continuous during operation, 5-10 year replacement target',
    designMargins: '30% thermal margin for transients',
    constraints: [
      'Large surface area requiring consistent performance',
      'Must survive off-normal plasma events',
      'Integrated with blanket modules'
    ],
    neutronDamageUncertainty: 4,
    replaceabilityDifficulty: 4,
    systemValueImpact: 4,
    maturityLevel: 'Design',
    confidenceScore: 45,
    riskLevel: 'High',
    degradationHypotheses: [
      {
        mechanism: 'Beryllium erosion',
        confidence: 'High',
        description: 'Sputtering and chemical erosion of armor material',
        knownUnknown: false
      },
      {
        mechanism: 'Thermal stress cracking',
        confidence: 'Medium',
        description: 'Fatigue from thermal cycling and transient events',
        knownUnknown: false
      },
      {
        mechanism: 'Neutron embrittlement',
        confidence: 'Low',
        description: 'Long-term mechanical property degradation',
        knownUnknown: true
      }
    ],
    monitoringStrategy: [
      {
        parameter: 'Surface temperature',
        method: 'IR cameras and thermocouples',
        purpose: 'Thermal protection and degradation detection',
        uncertaintyReduction: 'Enables optimized power ramp-up',
        fallback: 'Conservative thermal limits'
      },
      {
        parameter: 'Erosion depth',
        method: 'Marker tiles, laser profilometry',
        purpose: 'Track material loss rate',
        uncertaintyReduction: 'Validates erosion models',
        fallback: 'Visual inspection during maintenance'
      }
    ],
    maintainability: {
      accessConstraints: 'Integrated with blanket, requires coordinated maintenance',
      replacementStrategy: 'Sector replacement with blanket modules',
      estimatedDuration: '8-12 weeks for sector replacement',
      remoteHandling: true,
      supplyChainRealism: 'Developing'
    },
    systemValue: {
      availabilityImpact: 'Major',
      flexibilityImpact: 'Moderate',
      outputImpact: 'Degradation reduces thermal efficiency marginally',
      energySystemLinks: [
        'Heat extraction to blanket cooling',
        'Plasma purity maintenance',
        'Shielding effectiveness'
      ]
    },
    endOfLife: {
      wasteClassification: 'Intermediate Level Waste (ILW)',
      classificationUncertainty: 'Medium',
      coolingPeriod: '30-80 years',
      handlingRequirements: 'Remote handling, beryllium waste protocols',
      disposalComplexity: 'High'
    },
    learningPriority: 'High',
    rdInvestmentJustification: 'Large quantity component, manufacturing scale-up required',
    instrumentationPriority: 4
  },
  {
    id: 'tf-coils',
    name: 'Toroidal Field Coils',
    category: 'Magnets',
    functionalRole: 'Provide toroidal magnetic field for plasma confinement',
    operatingEnvelope: '11-13 Tesla peak field, 4.5K superconducting operation',
    dutyCycle: 'Continuous steady-state, 30+ year lifetime target',
    designMargins: '20% current margin, 1.5K temperature margin',
    constraints: [
      'Must never quench under normal operation',
      'Replacement essentially impossible post-installation',
      'Nuclear heating to superconductor must be managed'
    ],
    neutronDamageUncertainty: 3,
    replaceabilityDifficulty: 5,
    systemValueImpact: 5,
    maturityLevel: 'Qualified',
    confidenceScore: 75,
    riskLevel: 'High',
    degradationHypotheses: [
      {
        mechanism: 'Radiation-induced resistivity increase',
        confidence: 'Medium',
        description: 'Copper stabilizer degradation affecting quench protection',
        knownUnknown: false
      },
      {
        mechanism: 'Insulation degradation',
        confidence: 'Low',
        description: 'Organic insulation damage from neutron and gamma flux',
        knownUnknown: true
      },
      {
        mechanism: 'Joint resistance increase',
        confidence: 'Medium',
        description: 'Gradual degradation of superconducting joints',
        knownUnknown: false
      }
    ],
    monitoringStrategy: [
      {
        parameter: 'Quench detection signals',
        method: 'Voltage taps, fiber optic sensors',
        purpose: 'Safety protection system',
        uncertaintyReduction: 'Essential safety function',
        fallback: 'None acceptable - safety critical'
      },
      {
        parameter: 'Cryogenic temperature distribution',
        method: 'Distributed temperature sensors',
        purpose: 'Monitor cooling performance and nuclear heating',
        uncertaintyReduction: 'Early warning of cooling issues',
        fallback: 'Reduced resolution with point sensors'
      },
      {
        parameter: 'Joint resistance',
        method: 'Precision voltage measurements',
        purpose: 'Track joint degradation',
        uncertaintyReduction: 'Trend analysis for lifetime prediction',
        fallback: 'Periodic cold testing during long shutdowns'
      }
    ],
    maintainability: {
      accessConstraints: 'Essentially non-replaceable, embedded in machine structure',
      replacementStrategy: 'Design for full plant lifetime, no replacement planned',
      estimatedDuration: 'Not applicable - replacement not feasible',
      remoteHandling: false,
      supplyChainRealism: 'Proven'
    },
    systemValue: {
      availabilityImpact: 'Critical',
      flexibilityImpact: 'Minor',
      outputImpact: 'Magnet failure terminates plant operation',
      energySystemLinks: [
        'Fundamental to plasma confinement',
        'Single point of failure for plant',
        'Cryogenic power consumption affects net output'
      ]
    },
    endOfLife: {
      wasteClassification: 'Low Level Waste (LLW) with material recovery potential',
      classificationUncertainty: 'Low',
      coolingPeriod: 'Minimal after neutron activation decay',
      handlingRequirements: 'Large component handling, superconductor recycling',
      disposalComplexity: 'Medium'
    },
    learningPriority: 'High',
    rdInvestmentJustification: 'Must be right first time - no opportunity for operational learning',
    instrumentationPriority: 5
  },
  {
    id: 'vacuum-vessel',
    name: 'Vacuum Vessel',
    category: 'Structural',
    functionalRole: 'Primary vacuum boundary, structural support, safety containment',
    operatingEnvelope: '10⁻⁶ Pa vacuum, 100-200°C baking temperature, seismic loads',
    dutyCycle: 'Continuous, 40+ year design lifetime',
    designMargins: 'Double containment philosophy, seismic design basis',
    constraints: [
      'Leak-tight boundary for tritium containment',
      'Structural support for in-vessel components',
      'Essentially non-replaceable'
    ],
    neutronDamageUncertainty: 2,
    replaceabilityDifficulty: 5,
    systemValueImpact: 5,
    maturityLevel: 'Qualified',
    confidenceScore: 80,
    riskLevel: 'Medium',
    degradationHypotheses: [
      {
        mechanism: 'Fatigue crack propagation',
        confidence: 'Medium',
        description: 'Crack growth from cyclic mechanical and thermal loads',
        knownUnknown: false
      },
      {
        mechanism: 'Neutron embrittlement',
        confidence: 'Medium',
        description: 'DBTT shift in steel from neutron damage',
        knownUnknown: false
      },
      {
        mechanism: 'Stress corrosion cracking',
        confidence: 'Low',
        description: 'Environment-assisted cracking at welds',
        knownUnknown: true
      }
    ],
    monitoringStrategy: [
      {
        parameter: 'Leak rate',
        method: 'Residual gas analyzers, pressure rise tests',
        purpose: 'Verify primary boundary integrity',
        uncertaintyReduction: 'Essential safety and operational function',
        fallback: 'Helium leak testing during shutdowns'
      },
      {
        parameter: 'Structural strain',
        method: 'Strain gauges at critical locations',
        purpose: 'Monitor fatigue accumulation',
        uncertaintyReduction: 'Validates structural models',
        fallback: 'Visual inspection of accessible areas'
      }
    ],
    maintainability: {
      accessConstraints: 'Partial access through ports, inner surface largely inaccessible',
      replacementStrategy: 'Not replaceable - repair strategies only',
      estimatedDuration: 'N/A',
      remoteHandling: false,
      supplyChainRealism: 'Proven'
    },
    systemValue: {
      availabilityImpact: 'Critical',
      flexibilityImpact: 'Minor',
      outputImpact: 'Vessel failure terminates plant operation',
      energySystemLinks: [
        'Primary safety boundary',
        'Foundation for all in-vessel components',
        'Tritium confinement'
      ]
    },
    endOfLife: {
      wasteClassification: 'Low Level Waste (LLW)',
      classificationUncertainty: 'Low',
      coolingPeriod: '10-30 years',
      handlingRequirements: 'Large component sectioning and disposal',
      disposalComplexity: 'Medium'
    },
    learningPriority: 'Medium',
    rdInvestmentJustification: 'Well-understood technology but scale and integration challenges',
    instrumentationPriority: 3
  },
  {
    id: 'tritium-plant',
    name: 'Tritium Processing Plant',
    category: 'Auxiliary',
    functionalRole: 'Fuel cycle: tritium extraction, purification, storage, and injection',
    operatingEnvelope: 'Gram-scale tritium inventory, continuous processing',
    dutyCycle: 'Continuous operation synchronized with plasma operation',
    designMargins: 'Redundant processing trains, defense-in-depth for containment',
    constraints: [
      'Regulatory limits on tritium inventory',
      'Complex chemistry with multiple process streams',
      'Must achieve high tritium recovery efficiency'
    ],
    neutronDamageUncertainty: 1,
    replaceabilityDifficulty: 2,
    systemValueImpact: 4,
    maturityLevel: 'Prototype',
    confidenceScore: 60,
    riskLevel: 'High',
    degradationHypotheses: [
      {
        mechanism: 'Catalyst poisoning',
        confidence: 'High',
        description: 'Performance degradation of catalytic reactors',
        knownUnknown: false
      },
      {
        mechanism: 'Tritium permeation',
        confidence: 'Medium',
        description: 'Gradual tritium migration through containment boundaries',
        knownUnknown: false
      },
      {
        mechanism: 'Radiolytic degradation',
        confidence: 'Medium',
        description: 'Decomposition of organic materials from tritium beta decay',
        knownUnknown: false
      }
    ],
    monitoringStrategy: [
      {
        parameter: 'Tritium inventory and accountancy',
        method: 'Mass balance, calorimetry, ionization chambers',
        purpose: 'Regulatory compliance and loss detection',
        uncertaintyReduction: 'Essential for licensing',
        fallback: 'None acceptable - regulatory requirement'
      },
      {
        parameter: 'Process efficiency',
        method: 'Stream composition analysis',
        purpose: 'Detect degradation of separation performance',
        uncertaintyReduction: 'Optimize fuel cycle economics',
        fallback: 'Periodic performance testing'
      }
    ],
    maintainability: {
      accessConstraints: 'Glove box operations, controlled area restrictions',
      replacementStrategy: 'Modular component replacement, redundant trains',
      estimatedDuration: 'Component-dependent, weeks to months',
      remoteHandling: false,
      supplyChainRealism: 'Uncertain'
    },
    systemValue: {
      availabilityImpact: 'Major',
      flexibilityImpact: 'Moderate',
      outputImpact: 'Tritium processing limits affect sustained burn capability',
      energySystemLinks: [
        'Fuel self-sufficiency',
        'Determines startup fuel requirements',
        'Links to breeding blanket performance'
      ]
    },
    endOfLife: {
      wasteClassification: 'Low Level Waste (LLW) after tritium removal',
      classificationUncertainty: 'Low',
      coolingPeriod: 'Minimal after tritium decay',
      handlingRequirements: 'Tritium decontamination, conventional chemical waste',
      disposalComplexity: 'Low'
    },
    learningPriority: 'High',
    rdInvestmentJustification: 'Scale-up from laboratory to industrial scale required',
    instrumentationPriority: 4
  }
];

export const getAssetById = (id: string): FusionAsset | undefined => {
  return fusionAssets.find(asset => asset.id === id);
};

export const getAssetsByCategory = (category: FusionAsset['category']): FusionAsset[] => {
  return fusionAssets.filter(asset => asset.category === category);
};

export const getCriticalAssets = (): FusionAsset[] => {
  return fusionAssets.filter(asset => asset.riskLevel === 'Critical');
};
