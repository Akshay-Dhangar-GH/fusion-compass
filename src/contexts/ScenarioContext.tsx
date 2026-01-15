import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FusionAsset, fusionAssets as baseAssets } from '@/data/fusionAssets';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  assets: FusionAsset[];
  color: string;
}

export interface ScenarioModification {
  assetId: string;
  field: keyof FusionAsset | string;
  value: unknown;
}

interface ScenarioContextType {
  // Scenarios
  scenarios: Scenario[];
  activeScenarioId: string;
  comparisonScenarioId: string | null;
  isComparing: boolean;
  
  // Actions
  createScenario: (name: string, description?: string) => string;
  duplicateScenario: (scenarioId: string, name: string) => string;
  deleteScenario: (scenarioId: string) => void;
  setActiveScenario: (scenarioId: string) => void;
  setComparisonScenario: (scenarioId: string | null) => void;
  toggleCompareMode: () => void;
  
  // Modifications
  modifyAsset: (scenarioId: string, assetId: string, modifications: Partial<FusionAsset>) => void;
  resetAsset: (scenarioId: string, assetId: string) => void;
  resetScenario: (scenarioId: string) => void;
  
  // Getters
  getActiveAssets: () => FusionAsset[];
  getComparisonAssets: () => FusionAsset[] | null;
  getScenario: (scenarioId: string) => Scenario | undefined;
  getAssetDiff: (assetId: string) => { field: string; baseline: unknown; modified: unknown }[];
}

const SCENARIO_COLORS = [
  'hsl(221, 83%, 53%)', // Blue (baseline)
  'hsl(142, 71%, 45%)', // Green
  'hsl(262, 83%, 58%)', // Purple
  'hsl(25, 95%, 53%)',  // Orange
  'hsl(349, 89%, 60%)', // Pink
];

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'baseline',
      name: 'Baseline',
      description: 'Original asset data from FLP model',
      createdAt: new Date(),
      assets: JSON.parse(JSON.stringify(baseAssets)),
      color: SCENARIO_COLORS[0],
    },
  ]);
  
  const [activeScenarioId, setActiveScenarioId] = useState('baseline');
  const [comparisonScenarioId, setComparisonScenarioIdState] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const createScenario = useCallback((name: string, description = '') => {
    const id = `scenario-${Date.now()}`;
    const colorIndex = scenarios.length % SCENARIO_COLORS.length;
    
    setScenarios(prev => [
      ...prev,
      {
        id,
        name,
        description,
        createdAt: new Date(),
        assets: JSON.parse(JSON.stringify(baseAssets)),
        color: SCENARIO_COLORS[colorIndex],
      },
    ]);
    
    return id;
  }, [scenarios.length]);

  const duplicateScenario = useCallback((scenarioId: string, name: string) => {
    const source = scenarios.find(s => s.id === scenarioId);
    if (!source) return '';
    
    const id = `scenario-${Date.now()}`;
    const colorIndex = scenarios.length % SCENARIO_COLORS.length;
    
    setScenarios(prev => [
      ...prev,
      {
        id,
        name,
        description: `Duplicated from ${source.name}`,
        createdAt: new Date(),
        assets: JSON.parse(JSON.stringify(source.assets)),
        color: SCENARIO_COLORS[colorIndex],
      },
    ]);
    
    return id;
  }, [scenarios]);

  const deleteScenario = useCallback((scenarioId: string) => {
    if (scenarioId === 'baseline') return; // Can't delete baseline
    
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId('baseline');
    }
    if (comparisonScenarioId === scenarioId) {
      setComparisonScenarioIdState(null);
    }
  }, [activeScenarioId, comparisonScenarioId]);

  const setActiveScenario = useCallback((scenarioId: string) => {
    setActiveScenarioId(scenarioId);
  }, []);

  const setComparisonScenario = useCallback((scenarioId: string | null) => {
    setComparisonScenarioIdState(scenarioId);
    if (scenarioId) {
      setIsComparing(true);
    }
  }, []);

  const toggleCompareMode = useCallback(() => {
    setIsComparing(prev => {
      if (prev) {
        setComparisonScenarioIdState(null);
      }
      return !prev;
    });
  }, []);

  const modifyAsset = useCallback((scenarioId: string, assetId: string, modifications: Partial<FusionAsset>) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      
      return {
        ...scenario,
        assets: scenario.assets.map(asset => {
          if (asset.id !== assetId) return asset;
          return { ...asset, ...modifications };
        }),
      };
    }));
  }, []);

  const resetAsset = useCallback((scenarioId: string, assetId: string) => {
    const baseAsset = baseAssets.find(a => a.id === assetId);
    if (!baseAsset) return;
    
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      
      return {
        ...scenario,
        assets: scenario.assets.map(asset => {
          if (asset.id !== assetId) return asset;
          return JSON.parse(JSON.stringify(baseAsset));
        }),
      };
    }));
  }, []);

  const resetScenario = useCallback((scenarioId: string) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      
      return {
        ...scenario,
        assets: JSON.parse(JSON.stringify(baseAssets)),
      };
    }));
  }, []);

  const getActiveAssets = useCallback(() => {
    const scenario = scenarios.find(s => s.id === activeScenarioId);
    return scenario?.assets ?? baseAssets;
  }, [scenarios, activeScenarioId]);

  const getComparisonAssets = useCallback(() => {
    if (!comparisonScenarioId) return null;
    const scenario = scenarios.find(s => s.id === comparisonScenarioId);
    return scenario?.assets ?? null;
  }, [scenarios, comparisonScenarioId]);

  const getScenario = useCallback((scenarioId: string) => {
    return scenarios.find(s => s.id === scenarioId);
  }, [scenarios]);

  const getAssetDiff = useCallback((assetId: string) => {
    const baseAsset = baseAssets.find(a => a.id === assetId);
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const modifiedAsset = activeScenario?.assets.find(a => a.id === assetId);
    
    if (!baseAsset || !modifiedAsset) return [];
    
    const diffs: { field: string; baseline: unknown; modified: unknown }[] = [];
    
    const compareFields: (keyof FusionAsset)[] = [
      'neutronDamageUncertainty',
      'replaceabilityDifficulty',
      'systemValueImpact',
      'maturityLevel',
      'confidenceScore',
      'riskLevel',
      'learningPriority',
      'instrumentationPriority',
    ];
    
    compareFields.forEach(field => {
      if (baseAsset[field] !== modifiedAsset[field]) {
        diffs.push({
          field,
          baseline: baseAsset[field],
          modified: modifiedAsset[field],
        });
      }
    });
    
    return diffs;
  }, [scenarios, activeScenarioId]);

  const value = useMemo(() => ({
    scenarios,
    activeScenarioId,
    comparisonScenarioId,
    isComparing,
    createScenario,
    duplicateScenario,
    deleteScenario,
    setActiveScenario,
    setComparisonScenario,
    toggleCompareMode,
    modifyAsset,
    resetAsset,
    resetScenario,
    getActiveAssets,
    getComparisonAssets,
    getScenario,
    getAssetDiff,
  }), [
    scenarios,
    activeScenarioId,
    comparisonScenarioId,
    isComparing,
    createScenario,
    duplicateScenario,
    deleteScenario,
    setActiveScenario,
    setComparisonScenario,
    toggleCompareMode,
    modifyAsset,
    resetAsset,
    resetScenario,
    getActiveAssets,
    getComparisonAssets,
    getScenario,
    getAssetDiff,
  ]);

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
