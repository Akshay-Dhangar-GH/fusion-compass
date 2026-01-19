import { useMemo } from 'react';
import { FusionAsset } from '@/data/fusionAssets';

interface MaintenanceStrategy {
  id: string;
  name: string;
  description: string;
  costMultiplier: number;
  downtimeReduction: number;
  failureRiskReduction: number;
  leadTimeImpact: number;
}

export const maintenanceStrategies: MaintenanceStrategy[] = [
  {
    id: 'reactive',
    name: 'Reactive (Run-to-Failure)',
    description: 'Replace only when failure occurs. Lowest upfront cost, highest risk.',
    costMultiplier: 0.3,
    downtimeReduction: 0,
    failureRiskReduction: 0,
    leadTimeImpact: 1.5,
  },
  {
    id: 'preventive',
    name: 'Preventive (Time-Based)',
    description: 'Scheduled replacement at fixed intervals regardless of condition.',
    costMultiplier: 0.6,
    downtimeReduction: 0.4,
    failureRiskReduction: 0.5,
    leadTimeImpact: 1.0,
  },
  {
    id: 'predictive',
    name: 'Predictive (Condition-Based)',
    description: 'Replace based on monitored condition indicators and degradation trends.',
    costMultiplier: 0.8,
    downtimeReduction: 0.7,
    failureRiskReduction: 0.75,
    leadTimeImpact: 0.8,
  },
  {
    id: 'proactive',
    name: 'Proactive (RCM)',
    description: 'Full reliability-centered maintenance with root cause elimination.',
    costMultiplier: 1.0,
    downtimeReduction: 0.85,
    failureRiskReduction: 0.9,
    leadTimeImpact: 0.6,
  },
];

interface StrategyAnalysisParams {
  assets: FusionAsset[];
  selectedAsset: FusionAsset | undefined;
  planningHorizon: number;
  discountRate: number;
  electricityPrice: number;
  plantCapacity: number;
}

export interface StrategyResult {
  strategy: MaintenanceStrategy;
  npv: number;
  annualMaintenanceCost: number;
  expectedDowntime: number;
  expectedFailures: number;
  totalMaintenanceCost: number;
  totalDowntimeCost: number;
  totalReplacementCost: number;
  totalCost: number;
  availabilityGain: number;
  riskReduction: number;
  roi: number;
  savings: number;
}

export interface PortfolioResult {
  name: string;
  fullName: string;
  npv: number;
  maintenanceCost: number;
  downtimeCost: number;
  availability: number;
}

export const useStrategyAnalysis = ({
  assets,
  selectedAsset,
  planningHorizon,
  discountRate,
  electricityPrice,
  plantCapacity,
}: StrategyAnalysisParams) => {
  // Calculate NPV and ROI for each strategy
  const strategyAnalysis = useMemo(() => {
    if (!selectedAsset) return [];

    const baseReplacementCost = selectedAsset.costSchedule.replacementCostMillions;
    const baseAnnualMaintenance = selectedAsset.costSchedule.annualMaintenanceCostMillions;
    const baseDowntime = selectedAsset.costSchedule.downtimeWeeks;
    
    // Revenue loss per week of downtime (simplified)
    const weeklyRevenue = (plantCapacity * 168 * electricityPrice * 0.8) / 1000000; // M$/week
    
    return maintenanceStrategies.map(strategy => {
      const annualMaintenanceCost = baseAnnualMaintenance * (1 + strategy.costMultiplier);
      const expectedDowntime = baseDowntime * (1 - strategy.downtimeReduction);
      const downtimeCostPerEvent = expectedDowntime * weeklyRevenue;
      
      // Calculate expected number of failures over planning horizon
      const baseFailureRate = selectedAsset.riskLevel === 'Critical' ? 0.15 : 
                              selectedAsset.riskLevel === 'High' ? 0.1 :
                              selectedAsset.riskLevel === 'Medium' ? 0.05 : 0.02;
      const adjustedFailureRate = baseFailureRate * (1 - strategy.failureRiskReduction);
      const expectedFailures = adjustedFailureRate * planningHorizon;
      
      // NPV calculation
      let npv = 0;
      let totalMaintenanceCost = 0;
      let totalDowntimeCost = 0;
      let totalReplacementCost = 0;
      
      for (let year = 1; year <= planningHorizon; year++) {
        const discountFactor = Math.pow(1 + discountRate / 100, -year);
        
        // Annual maintenance cost
        const yearMaintenance = annualMaintenanceCost;
        totalMaintenanceCost += yearMaintenance;
        npv += yearMaintenance * discountFactor;
        
        // Expected failure cost in this year
        const yearFailureProb = adjustedFailureRate;
        const expectedFailureCost = yearFailureProb * (baseReplacementCost + downtimeCostPerEvent);
        totalReplacementCost += yearFailureProb * baseReplacementCost;
        totalDowntimeCost += yearFailureProb * downtimeCostPerEvent;
        npv += expectedFailureCost * discountFactor;
      }
      
      return {
        strategy,
        npv,
        annualMaintenanceCost,
        expectedDowntime,
        expectedFailures,
        totalMaintenanceCost,
        totalDowntimeCost,
        totalReplacementCost,
        totalCost: totalMaintenanceCost + totalDowntimeCost + totalReplacementCost,
        availabilityGain: strategy.downtimeReduction * 100,
        riskReduction: strategy.failureRiskReduction * 100,
      };
    });
  }, [selectedAsset, planningHorizon, discountRate, electricityPrice, plantCapacity]);

  // Calculate ROI comparing to reactive baseline
  const reactiveNPV = strategyAnalysis.find(s => s.strategy.id === 'reactive')?.npv || 0;
  const strategyWithROI: StrategyResult[] = strategyAnalysis.map(s => ({
    ...s,
    roi: reactiveNPV > 0 ? ((reactiveNPV - s.npv) / s.npv) * 100 : 0,
    savings: reactiveNPV - s.npv,
  }));

  // Portfolio-wide analysis
  const portfolioAnalysis: PortfolioResult[] = useMemo(() => {
    const strategies = ['reactive', 'preventive', 'predictive', 'proactive'];
    
    return strategies.map(stratId => {
      const strategy = maintenanceStrategies.find(s => s.id === stratId)!;
      
      let totalNPV = 0;
      let totalDowntimeCost = 0;
      let totalMaintenanceCost = 0;
      
      assets.forEach(asset => {
        const baseReplacementCost = asset.costSchedule.replacementCostMillions;
        const baseAnnualMaintenance = asset.costSchedule.annualMaintenanceCostMillions;
        const baseDowntime = asset.costSchedule.downtimeWeeks;
        const weeklyRevenue = (plantCapacity * 168 * electricityPrice * 0.8) / 1000000;
        
        const annualMaintenanceCost = baseAnnualMaintenance * (1 + strategy.costMultiplier);
        const expectedDowntime = baseDowntime * (1 - strategy.downtimeReduction);
        const downtimeCostPerEvent = expectedDowntime * weeklyRevenue;
        
        const baseFailureRate = asset.riskLevel === 'Critical' ? 0.15 : 
                                asset.riskLevel === 'High' ? 0.1 :
                                asset.riskLevel === 'Medium' ? 0.05 : 0.02;
        const adjustedFailureRate = baseFailureRate * (1 - strategy.failureRiskReduction);
        
        for (let year = 1; year <= planningHorizon; year++) {
          const discountFactor = Math.pow(1 + discountRate / 100, -year);
          totalMaintenanceCost += annualMaintenanceCost;
          totalNPV += annualMaintenanceCost * discountFactor;
          
          const expectedFailureCost = adjustedFailureRate * (baseReplacementCost + downtimeCostPerEvent);
          totalDowntimeCost += adjustedFailureRate * downtimeCostPerEvent;
          totalNPV += expectedFailureCost * discountFactor;
        }
      });
      
      return {
        name: strategy.name.split(' ')[0],
        fullName: strategy.name,
        npv: totalNPV,
        maintenanceCost: totalMaintenanceCost,
        downtimeCost: totalDowntimeCost,
        availability: (1 - strategy.downtimeReduction * 0.1) * 100,
      };
    });
  }, [assets, planningHorizon, discountRate, electricityPrice, plantCapacity]);

  return {
    strategyWithROI,
    portfolioAnalysis,
    reactiveNPV,
  };
};
