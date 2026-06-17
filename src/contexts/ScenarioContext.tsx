import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FusionAsset } from '@/data/fusionAssets';
import { usePlant } from '@/contexts/PlantContext';

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
  scenarios: Scenario[];
  activeScenarioId: string;
  comparisonScenarioId: string | null;
  isComparing: boolean;

  createScenario: (name: string, description?: string) => string;
  duplicateScenario: (scenarioId: string, name: string) => string;
  deleteScenario: (scenarioId: string) => void;
  setActiveScenario: (scenarioId: string) => void;
  setComparisonScenario: (scenarioId: string | null) => void;
  toggleCompareMode: () => void;

  modifyAsset: (scenarioId: string, assetId: string, modifications: Partial<FusionAsset>) => void;
  addAsset: (scenarioId: string, asset: FusionAsset) => void;
  resetAsset: (scenarioId: string, assetId: string) => void;
  resetScenario: (scenarioId: string) => void;


  getActiveAssets: () => FusionAsset[];
  getComparisonAssets: () => FusionAsset[] | null;
  getScenario: (scenarioId: string) => Scenario | undefined;
  getAssetDiff: (assetId: string) => { field: string; baseline: unknown; modified: unknown }[];
}

const SCENARIO_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(25, 95%, 53%)',
  'hsl(349, 89%, 60%)',
];

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

const makeBaseline = (baseAssets: FusionAsset[]): Scenario => ({
  id: 'baseline',
  name: 'Baseline',
  description: 'Original asset data',
  createdAt: new Date(),
  assets: JSON.parse(JSON.stringify(baseAssets)),
  color: SCENARIO_COLORS[0],
});

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { baseAssets, plantType } = usePlant();
  const baseAssetsRef = useRef(baseAssets);
  baseAssetsRef.current = baseAssets;

  const [scenarios, setScenarios] = useState<Scenario[]>(() => [makeBaseline(baseAssets)]);
  const [activeScenarioId, setActiveScenarioId] = useState('baseline');
  const [comparisonScenarioId, setComparisonScenarioIdState] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Reset scenarios when the plant type changes so the baseline reflects the current dataset
  useEffect(() => {
    setScenarios([makeBaseline(baseAssets)]);
    setActiveScenarioId('baseline');
    setComparisonScenarioIdState(null);
    setIsComparing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantType]);

  const createScenario = useCallback((name: string, description = '') => {
    const id = `scenario-${Date.now()}`;
    setScenarios(prev => {
      const colorIndex = prev.length % SCENARIO_COLORS.length;
      return [
        ...prev,
        {
          id,
          name,
          description,
          createdAt: new Date(),
          assets: JSON.parse(JSON.stringify(baseAssetsRef.current)),
          color: SCENARIO_COLORS[colorIndex],
        },
      ];
    });
    return id;
  }, []);

  const duplicateScenario = useCallback((scenarioId: string, name: string) => {
    const id = `scenario-${Date.now()}`;
    setScenarios(prev => {
      const source = prev.find(s => s.id === scenarioId);
      if (!source) return prev;
      const colorIndex = prev.length % SCENARIO_COLORS.length;
      return [
        ...prev,
        {
          id,
          name,
          description: `Duplicated from ${source.name}`,
          createdAt: new Date(),
          assets: JSON.parse(JSON.stringify(source.assets)),
          color: SCENARIO_COLORS[colorIndex],
        },
      ];
    });
    return id;
  }, []);

  const deleteScenario = useCallback((scenarioId: string) => {
    if (scenarioId === 'baseline') return;
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    if (activeScenarioId === scenarioId) setActiveScenarioId('baseline');
    if (comparisonScenarioId === scenarioId) setComparisonScenarioIdState(null);
  }, [activeScenarioId, comparisonScenarioId]);

  const setActiveScenario = useCallback((scenarioId: string) => setActiveScenarioId(scenarioId), []);
  const setComparisonScenario = useCallback((scenarioId: string | null) => {
    setComparisonScenarioIdState(scenarioId);
    if (scenarioId) setIsComparing(true);
  }, []);
  const toggleCompareMode = useCallback(() => {
    setIsComparing(prev => {
      if (prev) setComparisonScenarioIdState(null);
      return !prev;
    });
  }, []);

  const modifyAsset = useCallback((scenarioId: string, assetId: string, modifications: Partial<FusionAsset>) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      return {
        ...scenario,
        assets: scenario.assets.map(asset => asset.id === assetId ? { ...asset, ...modifications } : asset),
      };
    }));
  }, []);

  const addAsset = useCallback((scenarioId: string, asset: FusionAsset) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      return { ...scenario, assets: [...scenario.assets, asset] };
    }));
  }, []);



  const resetAsset = useCallback((scenarioId: string, assetId: string) => {
    const baseAsset = baseAssetsRef.current.find(a => a.id === assetId);
    if (!baseAsset) return;
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      return {
        ...scenario,
        assets: scenario.assets.map(asset => asset.id === assetId ? JSON.parse(JSON.stringify(baseAsset)) : asset),
      };
    }));
  }, []);

  const resetScenario = useCallback((scenarioId: string) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== scenarioId) return scenario;
      return { ...scenario, assets: JSON.parse(JSON.stringify(baseAssetsRef.current)) };
    }));
  }, []);

  const getActiveAssets = useCallback(() => {
    const scenario = scenarios.find(s => s.id === activeScenarioId);
    return scenario?.assets ?? baseAssetsRef.current;
  }, [scenarios, activeScenarioId]);

  const getComparisonAssets = useCallback(() => {
    if (!comparisonScenarioId) return null;
    return scenarios.find(s => s.id === comparisonScenarioId)?.assets ?? null;
  }, [scenarios, comparisonScenarioId]);

  const getScenario = useCallback((scenarioId: string) => scenarios.find(s => s.id === scenarioId), [scenarios]);

  const getAssetDiff = useCallback((assetId: string) => {
    const baseAsset = baseAssetsRef.current.find(a => a.id === assetId);
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
        diffs.push({ field, baseline: baseAsset[field], modified: modifiedAsset[field] });
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
    addAsset,
    resetAsset,
    resetScenario,
    getActiveAssets,
    getComparisonAssets,
    getScenario,
    getAssetDiff,
  }), [
    scenarios, activeScenarioId, comparisonScenarioId, isComparing,
    createScenario, duplicateScenario, deleteScenario, setActiveScenario,
    setComparisonScenario, toggleCompareMode, modifyAsset, addAsset, resetAsset, resetScenario,
    getActiveAssets, getComparisonAssets, getScenario, getAssetDiff,
  ]);


  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (context === undefined) throw new Error('useScenario must be used within a ScenarioProvider');
  return context;
};
