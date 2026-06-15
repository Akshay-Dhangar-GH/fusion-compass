import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FusionAsset, fusionAssets } from '@/data/fusionAssets';
import { pwrAssets } from '@/data/pwrAssets';
import { projectAssets } from '@/data/projectAssets';

export type PlantType = 'fusion' | 'pwr' | 'project';

export interface PlantTerminology {
  shortName: string;            // "Fusion" / "PWR"
  longName: string;             // "Fusion Power Plant" / "Pressurised Water Reactor"
  productName: string;          // "Fusion Lifecycle Passport" / "PWR Lifecycle Passport"
  acronym: string;              // "FLP" / "PLP"
  productTagline: string;
  dashboardHeroTitle: string;
  dashboardHeroSubtitle: string;
  componentNoun: string;        // "fusion components" / "PWR components"
  uncertaintyAxisShort: string; // "Neutron Unc." / "Degradation Unc."
  uncertaintyAxisLong: string;  // "Neutron Damage Uncertainty" / "Degradation Uncertainty"
  matrixXAxisLabel: string;
  matrixTitle: string;
  decisionPoints: { title: string; status: string; timeline: string }[];
  systemImpacts: { level: 'critical' | 'warning' | 'nominal'; title: string; description: string }[];
  // Delivery model
  deliveryIntro: string;
  forcingFunctionTitle: string;
  forcingFunctionBody: string;
  forcingFunctionBullets: string[];
}

const FUSION_TERMS: PlantTerminology = {
  shortName: 'Fusion',
  longName: 'Fusion Power Plant',
  productName: 'Fusion Lifecycle Passport',
  productTagline: 'First-of-a-kind fusion asset management',
  dashboardHeroTitle: 'Fusion Lifecycle Passport',
  dashboardHeroSubtitle:
    'Comprehensive asset management framework for first-of-a-kind fusion power plants. This dashboard provides decision-support for lifecycle planning, risk prioritization, and R&D investment justification aligned with ISO 55000 principles.',
  componentNoun: 'fusion components',
  uncertaintyAxisShort: 'Neutron Unc.',
  uncertaintyAxisLong: 'Neutron Damage Uncertainty',
  matrixXAxisLabel: 'Lower Neutron Uncertainty → Higher Neutron Uncertainty',
  matrixTitle: 'Fusion Asset Criticality Matrix',
  decisionPoints: [
    { title: 'Blanket Design Selection', status: 'Active', timeline: 'Q2 2025' },
    { title: 'Divertor Material Qualification', status: 'Pending', timeline: 'Q4 2025' },
    { title: 'Remote Handling Strategy', status: 'Review', timeline: 'Q1 2026' },
  ],
  systemImpacts: [
    { level: 'critical', title: 'Grid Availability Target', description: 'Current component reliability estimates suggest 65–75% capacity factor achievable' },
    { level: 'warning', title: 'Maintenance Windows', description: 'Divertor replacement frequency may limit operational flexibility' },
    { level: 'nominal', title: 'Fuel Self-Sufficiency', description: 'Tritium breeding strategy aligned with long-term fuel security' },
  ],
  acronym: 'FLP',
  deliveryIntro: 'Implementation framework for deploying the Fusion Lifecycle Passport in client engagements',
  forcingFunctionTitle: 'Why Fusion is a Forcing Function for Better Nuclear Asset Management',
  forcingFunctionBody:
    'The extreme uncertainty inherent in fusion FOAK programmes demands an asset management approach that is more rigorous, more explicit about unknowns, and more decision-focused than traditional nuclear practice. The disciplines developed for fusion directly transfer to improving asset management across SMRs, life extensions, and the broader nuclear fleet.',
  forcingFunctionBullets: [
    'Uncertainty-explicit thinking',
    'Value of information mindset',
    'Design-stage AM integration',
  ],
};

const PWR_TERMS: PlantTerminology = {
  shortName: 'PWR',
  longName: 'Pressurised Water Reactor',
  productName: 'PWR Lifecycle Passport',
  productTagline: 'Design-agnostic PWR asset management (APR1000 / EPR / RR-SMR class)',
  dashboardHeroTitle: 'PWR Lifecycle Passport',
  dashboardHeroSubtitle:
    'Design-agnostic asset management framework for pressurised water reactors. Applicable across large Gen III/III+ plants (APR1000, EPR) and SMRs (RR-SMR). Provides decision-support for life extension, refurbishment and refuelling-outage planning aligned with ISO 55000 principles.',
  componentNoun: 'PWR components',
  uncertaintyAxisShort: 'Degradation Unc.',
  uncertaintyAxisLong: 'Degradation Uncertainty',
  matrixXAxisLabel: 'Lower Degradation Uncertainty → Higher Degradation Uncertainty',
  matrixTitle: 'PWR Asset Criticality Matrix',
  decisionPoints: [
    { title: 'Steam Generator Replacement Window', status: 'Active', timeline: 'Outage N+2' },
    { title: 'Reactor Vessel Head Replacement', status: 'Pending', timeline: 'Outage N+4' },
    { title: 'Long-Term Operation Licence Submission', status: 'Review', timeline: '2027' },
  ],
  systemImpacts: [
    { level: 'critical', title: 'Capacity Factor Target', description: 'Outage scope on SG and turbine determines achievable >90% capacity factor' },
    { level: 'warning', title: 'Forced Outage Risk', description: 'PWSCC indications on DMWs and CRDM nozzles drive unplanned outage probability' },
    { level: 'nominal', title: 'Long-Term Operation Case', description: 'RPV embrittlement trend supports licensing beyond 60 years' },
  ],
  acronym: 'PLP',
  deliveryIntro: 'Implementation framework for deploying the PWR Lifecycle Passport in client engagements',
  forcingFunctionTitle: 'Why Disciplined Asset Management is Critical for the PWR Fleet',
  forcingFunctionBody:
    'Long-term operation, life extension and refurbishment decisions for PWRs hinge on managing well-characterised but consequential degradation mechanisms — RPV embrittlement, PWSCC, steam generator tube wall thinning, FAC and concrete ageing. A structured, uncertainty-explicit lifecycle passport approach turns scattered surveillance, ISI and ageing-management evidence into defensible decisions for outage scope, component replacement and LTO licensing across APR1000, EPR and SMR-class plants.',
  forcingFunctionBullets: [
    'Ageing-management discipline',
    'Outage-scope optimisation',
    'Defensible LTO licensing case',
  ],
};

interface PlantContextType {
  plantType: PlantType;
  setPlantType: (p: PlantType) => void;
  baseAssets: FusionAsset[];
  terminology: PlantTerminology;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PlantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plantType, setPlantTypeState] = useState<PlantType>('fusion');

  const setPlantType = useCallback((p: PlantType) => setPlantTypeState(p), []);

  const value = useMemo<PlantContextType>(
    () => ({
      plantType,
      setPlantType,
      baseAssets: plantType === 'fusion' ? fusionAssets : pwrAssets,
      terminology: plantType === 'fusion' ? FUSION_TERMS : PWR_TERMS,
    }),
    [plantType, setPlantType],
  );

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};

export const usePlant = () => {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error('usePlant must be used within a PlantProvider');
  return ctx;
};
