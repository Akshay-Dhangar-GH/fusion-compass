import { useScenario } from '@/contexts/ScenarioContext';
import { FusionAsset } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { AlertTriangle, Target, Layers, ArrowRight } from 'lucide-react';
import { ScenarioHeader } from '@/components/analytics/ScenarioHeader';

interface CriticalityMatrixProps {
  onSelectAsset: (assetId: string) => void;
}

export const CriticalityMatrix = ({ onSelectAsset }: CriticalityMatrixProps) => {
  const { 
    getActiveAssets, 
    getComparisonAssets, 
    getScenario, 
    activeScenarioId, 
    comparisonScenarioId 
  } = useScenario();
  
  const assets = getActiveAssets();
  const comparisonAssets = getComparisonAssets();
  
  const [localCompareMode, setLocalCompareMode] = useState(false);
  const [hoveredAsset, setHoveredAsset] = useState<FusionAsset | null>(null);
  const [thirdDimension, setThirdDimension] = useState<'systemValue' | 'regulatory' | 'learning'>('systemValue');

  const activeScenario = getScenario(activeScenarioId);
  const comparisonScenario = comparisonScenarioId ? getScenario(comparisonScenarioId) : null;
  const effectiveCompareMode = localCompareMode && comparisonAssets && comparisonScenarioId;

  const getAssetPosition = (asset: FusionAsset) => {
    const x = asset.neutronDamageUncertainty;
    const y = 6 - asset.replaceabilityDifficulty;
    return { x, y };
  };

  const getThirdDimensionValue = (asset: FusionAsset) => {
    switch (thirdDimension) {
      case 'systemValue':
        return asset.systemValueImpact;
      case 'regulatory':
        return asset.endOfLife.classificationUncertainty === 'High' ? 5 : 
               asset.endOfLife.classificationUncertainty === 'Medium' ? 3 : 1;
      case 'learning':
        return asset.instrumentationPriority;
    }
  };

  const getAssetColor = (asset: FusionAsset) => {
    const value = getThirdDimensionValue(asset);
    if (value >= 4) return 'bg-status-critical';
    if (value >= 3) return 'bg-status-warning';
    return 'bg-status-nominal';
  };

  const getAssetSize = (asset: FusionAsset) => {
    const value = getThirdDimensionValue(asset);
    return 24 + (value * 8);
  };

  const getDecisionRule = (x: number, y: number) => {
    const replaceability = 6 - y;
    if (x >= 4 && replaceability >= 4) {
      return { zone: 'critical', label: 'Immediate R&D Priority', color: 'bg-status-critical/20' };
    }
    if (x >= 3 && replaceability >= 3) {
      return { zone: 'high', label: 'Enhanced Monitoring', color: 'bg-status-warning/20' };
    }
    if (x >= 4 || replaceability >= 4) {
      return { zone: 'medium', label: 'Targeted Investment', color: 'bg-status-caution/20' };
    }
    return { zone: 'low', label: 'Standard Management', color: 'bg-status-nominal/10' };
  };

  // Calculate movement vectors for comparison mode
  const assetMovements = useMemo(() => {
    if (!effectiveCompareMode || !comparisonAssets) return {};
    
    const movements: Record<string, { 
      from: { x: number; y: number }; 
      to: { x: number; y: number };
      deltaX: number;
      deltaY: number;
      hasChange: boolean;
    }> = {};
    
    assets.forEach(activeAsset => {
      const compAsset = comparisonAssets.find(a => a.id === activeAsset.id);
      if (!compAsset) return;
      
      const activePos = getAssetPosition(activeAsset);
      const compPos = getAssetPosition(compAsset);
      
      movements[activeAsset.id] = {
        from: compPos,
        to: activePos,
        deltaX: activePos.x - compPos.x,
        deltaY: activePos.y - compPos.y,
        hasChange: activePos.x !== compPos.x || activePos.y !== compPos.y,
      };
    });
    
    return movements;
  }, [assets, comparisonAssets, effectiveCompareMode]);

  // Summary of changes
  const changeSummary = useMemo(() => {
    if (!effectiveCompareMode) return null;
    
    const movements = Object.values(assetMovements);
    const changedAssets = movements.filter(m => m.hasChange);
    const movedHigher = changedAssets.filter(m => m.deltaX > 0 || m.deltaY < 0).length;
    const movedLower = changedAssets.filter(m => m.deltaX < 0 || m.deltaY > 0).length;
    
    return {
      total: changedAssets.length,
      movedHigher,
      movedLower,
    };
  }, [assetMovements, effectiveCompareMode]);

  // Get hovered asset's comparison data
  const hoveredComparison = useMemo(() => {
    if (!hoveredAsset || !effectiveCompareMode || !comparisonAssets) return null;
    return comparisonAssets.find(a => a.id === hoveredAsset.id);
  }, [hoveredAsset, comparisonAssets, effectiveCompareMode]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flp-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Fusion Asset Criticality Matrix</h2>
            <p className="text-muted-foreground mt-1">
              Prioritisation tool for instrumentation, inspection, design maturity, and R&D investment
            </p>
          </div>
        </div>
        
        {/* Scenario Header */}
        <ScenarioHeader
          showCompareToggle={true}
          localCompareMode={localCompareMode}
          onLocalCompareModeChange={setLocalCompareMode}
        />
        
        {effectiveCompareMode && changeSummary && (
          <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Comparison Mode:</span>{' '}
                Showing asset positions in{' '}
                <span className="font-medium" style={{ color: activeScenario?.color }}>
                  {activeScenario?.name}
                </span>{' '}
                vs{' '}
                <span className="font-medium" style={{ color: comparisonScenario?.color }}>
                  {comparisonScenario?.name}
                </span>
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">
                  {changeSummary.total} assets moved
                </span>
                {changeSummary.movedHigher > 0 && (
                  <span className="text-destructive">↑ {changeSummary.movedHigher} higher risk</span>
                )}
                {changeSummary.movedLower > 0 && (
                  <span className="text-status-nominal">↓ {changeSummary.movedLower} lower risk</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Third Dimension Selector */}
      <div className="flp-card p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Third Dimension:</span>
          <div className="flex gap-2">
            {[
              { id: 'systemValue', label: 'System Value Impact', icon: Target },
              { id: 'regulatory', label: 'Regulatory Sensitivity', icon: AlertTriangle },
              { id: 'learning', label: 'Learning Value', icon: Layers },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setThirdDimension(option.id as typeof thirdDimension)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    thirdDimension === option.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matrix */}
        <div className="lg:col-span-2 flp-card p-6">
          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
              <span className="text-sm font-medium text-muted-foreground">
                ← Easier to Replace | Harder to Replace →
              </span>
            </div>

            {/* Matrix Grid */}
            <div className="ml-8">
              {/* X-axis label */}
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Lower Neutron Uncertainty → Higher Neutron Uncertainty
                </span>
              </div>

              {/* Grid */}
              <div className="relative bg-muted/30 rounded-xl p-4">
                {/* Background zones */}
                <div className="grid grid-cols-5 gap-1 absolute inset-4">
                  {[5, 4, 3, 2, 1].map((y) =>
                    [1, 2, 3, 4, 5].map((x) => {
                      const rule = getDecisionRule(x, y);
                      return (
                        <div
                          key={`${x}-${y}`}
                          className={cn('rounded-lg', rule.color)}
                        />
                      );
                    })
                  )}
                </div>

                {/* Movement arrows for comparison mode */}
                {effectiveCompareMode && (
                  <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] pointer-events-none z-10">
                    {assets.map((asset) => {
                      const movement = assetMovements[asset.id];
                      if (!movement?.hasChange) return null;
                      
                      const fromLeft = ((movement.from.x - 0.5) / 5) * 100;
                      const fromTop = ((movement.from.y - 0.5) / 5) * 100;
                      const toLeft = ((movement.to.x - 0.5) / 5) * 100;
                      const toTop = ((movement.to.y - 0.5) / 5) * 100;
                      
                      return (
                        <line
                          key={`arrow-${asset.id}`}
                          x1={`${fromLeft}%`}
                          y1={`${fromTop}%`}
                          x2={`${toLeft}%`}
                          y2={`${toTop}%`}
                          stroke={activeScenario?.color || 'hsl(var(--primary))'}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          markerEnd="url(#arrowhead)"
                          opacity={0.7}
                        />
                      );
                    })}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill={activeScenario?.color || 'hsl(var(--primary))'}
                        />
                      </marker>
                    </defs>
                  </svg>
                )}

                {/* Ghost positions from comparison scenario */}
                {effectiveCompareMode && comparisonAssets?.map((asset) => {
                  const movement = assetMovements[asset.id];
                  if (!movement?.hasChange) return null;
                  
                  const { x, y } = movement.from;
                  const size = getAssetSize(asset) * 0.8;
                  const left = ((x - 0.5) / 5) * 100;
                  const top = ((y - 0.5) / 5) * 100;

                  return (
                    <div
                      key={`ghost-${asset.id}`}
                      className="absolute rounded-full flex items-center justify-center border-2 border-dashed opacity-40"
                      style={{
                        width: size,
                        height: size,
                        left: `calc(${left}% - ${size / 2}px)`,
                        top: `calc(${top}% - ${size / 2}px)`,
                        borderColor: comparisonScenario?.color,
                        backgroundColor: 'transparent',
                      }}
                    >
                      <span 
                        className="font-bold text-xs text-center px-1 leading-tight"
                        style={{ color: comparisonScenario?.color }}
                      >
                        {asset.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}

                {/* Assets */}
                <div className="relative h-96">
                  {assets.map((asset) => {
                    const { x, y } = getAssetPosition(asset);
                    const size = getAssetSize(asset);
                    const left = ((x - 0.5) / 5) * 100;
                    const top = ((y - 0.5) / 5) * 100;
                    const movement = assetMovements[asset.id];
                    const hasMovement = effectiveCompareMode && movement?.hasChange;

                    return (
                      <div
                        key={asset.id}
                        className={cn(
                          'absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:z-20',
                          getAssetColor(asset),
                          hoveredAsset?.id === asset.id && 'ring-4 ring-primary ring-offset-2',
                          hasMovement && 'ring-2 ring-offset-1'
                        )}
                        style={{
                          width: size,
                          height: size,
                          left: `calc(${left}% - ${size / 2}px)`,
                          top: `calc(${top}% - ${size / 2}px)`,
                          ...(hasMovement && { ringColor: activeScenario?.color }),
                        }}
                        onMouseEnter={() => setHoveredAsset(asset)}
                        onMouseLeave={() => setHoveredAsset(null)}
                        onClick={() => onSelectAsset(asset.id)}
                      >
                        <span className="text-white font-bold text-xs text-center px-1 leading-tight">
                          {asset.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Axis ticks */}
                <div className="flex justify-between mt-2 px-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-xs text-muted-foreground">{n}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <div className="flex items-center gap-1 -rotate-90 origin-right translate-x-8">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-xs text-muted-foreground w-16 text-center">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend & Info Panel */}
        <div className="space-y-4">
          {/* Hover Info */}
          <div className="flp-card p-6">
            <h4 className="font-semibold text-foreground mb-4">
              {hoveredAsset ? hoveredAsset.name : 'Asset Details'}
            </h4>
            {hoveredAsset ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                  <p className="text-sm text-foreground">{hoveredAsset.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Neutron Unc.</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{hoveredAsset.neutronDamageUncertainty}/5</p>
                      {hoveredComparison && hoveredAsset.neutronDamageUncertainty !== hoveredComparison.neutronDamageUncertainty && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          was {hoveredComparison.neutronDamageUncertainty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Replaceability</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{hoveredAsset.replaceabilityDifficulty}/5</p>
                      {hoveredComparison && hoveredAsset.replaceabilityDifficulty !== hoveredComparison.replaceabilityDifficulty && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          was {hoveredComparison.replaceabilityDifficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {thirdDimension === 'systemValue' ? 'System Value' :
                     thirdDimension === 'regulatory' ? 'Regulatory Sensitivity' :
                     'Learning Value'}
                  </p>
                  <p className="font-semibold">{getThirdDimensionValue(hoveredAsset)}/5</p>
                </div>
                <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                  {hoveredAsset.rdInvestmentJustification}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Hover over an asset to see details
              </p>
            )}
          </div>

          {/* Comparison Legend (when in compare mode) */}
          {effectiveCompareMode && (
            <div className="flp-card p-6">
              <h4 className="font-semibold text-foreground mb-4">Comparison Legend</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: activeScenario?.color }}
                  />
                  <span className="text-sm">{activeScenario?.name} (solid)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-dashed"
                    style={{ borderColor: comparisonScenario?.color }}
                  />
                  <span className="text-sm">{comparisonScenario?.name} (dashed)</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="24" height="12">
                    <line
                      x1="0"
                      y1="6"
                      x2="24"
                      y2="6"
                      stroke={activeScenario?.color}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  </svg>
                  <span className="text-sm">Movement arrow</span>
                </div>
              </div>
            </div>
          )}

          {/* Decision Rules */}
          <div className="flp-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Decision Rules</h4>
            <div className="space-y-3">
              {[
                { color: 'bg-status-critical/20', border: 'border-status-critical', label: 'Immediate R&D Priority', desc: 'High uncertainty + difficult replacement' },
                { color: 'bg-status-warning/20', border: 'border-status-warning', label: 'Enhanced Monitoring', desc: 'Moderate risk, proactive attention' },
                { color: 'bg-status-caution/20', border: 'border-status-caution', label: 'Targeted Investment', desc: 'Single high-risk factor' },
                { color: 'bg-status-nominal/10', border: 'border-status-nominal', label: 'Standard Management', desc: 'Lower overall lifecycle risk' },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn('w-4 h-4 rounded border-2 shrink-0 mt-0.5', rule.color, rule.border)} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size Legend */}
          <div className="flp-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Size = Third Dimension</h4>
            <div className="flex items-end justify-center gap-4">
              {[1, 3, 5].map((value) => (
                <div key={value} className="flex flex-col items-center gap-2">
                  <div 
                    className="rounded-full bg-muted"
                    style={{ width: 24 + value * 8, height: 24 + value * 8 }}
                  />
                  <span className="text-xs text-muted-foreground">{value}/5</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
