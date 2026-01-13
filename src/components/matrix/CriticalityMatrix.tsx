import { fusionAssets, FusionAsset } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Info, AlertTriangle, Target, Layers } from 'lucide-react';

interface CriticalityMatrixProps {
  onSelectAsset: (assetId: string) => void;
}

export const CriticalityMatrix = ({ onSelectAsset }: CriticalityMatrixProps) => {
  const [hoveredAsset, setHoveredAsset] = useState<FusionAsset | null>(null);
  const [thirdDimension, setThirdDimension] = useState<'systemValue' | 'regulatory' | 'learning'>('systemValue');

  const getAssetPosition = (asset: FusionAsset) => {
    // Convert 1-5 scale to grid position (invert Y for visual)
    const x = asset.neutronDamageUncertainty;
    const y = 6 - asset.replaceabilityDifficulty; // Invert for display
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
    return 24 + (value * 8); // 32px to 64px
  };

  // Decision rules based on matrix position
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fusion Asset Criticality Matrix</h2>
          <p className="text-muted-foreground mt-1">
            Prioritisation tool for instrumentation, inspection, design maturity, and R&D investment
          </p>
        </div>
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

                {/* Assets */}
                <div className="relative h-96">
                  {fusionAssets.map((asset) => {
                    const { x, y } = getAssetPosition(asset);
                    const size = getAssetSize(asset);
                    const left = ((x - 0.5) / 5) * 100;
                    const top = ((y - 0.5) / 5) * 100;

                    return (
                      <div
                        key={asset.id}
                        className={cn(
                          'absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:z-20',
                          getAssetColor(asset),
                          hoveredAsset?.id === asset.id && 'ring-4 ring-primary ring-offset-2'
                        )}
                        style={{
                          width: size,
                          height: size,
                          left: `calc(${left}% - ${size / 2}px)`,
                          top: `calc(${top}% - ${size / 2}px)`,
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
                    <p className="font-semibold">{hoveredAsset.neutronDamageUncertainty}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Replaceability</p>
                    <p className="font-semibold">{hoveredAsset.replaceabilityDifficulty}/5</p>
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
