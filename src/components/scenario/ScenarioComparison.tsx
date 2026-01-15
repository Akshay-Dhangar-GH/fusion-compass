import { useMemo } from 'react';
import { useScenario } from '@/contexts/ScenarioContext';
import { FusionAsset } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const ScenarioComparison = () => {
  const { 
    scenarios,
    activeScenarioId, 
    comparisonScenarioId, 
    getActiveAssets, 
    getComparisonAssets,
    getScenario,
  } = useScenario();

  const activeScenario = getScenario(activeScenarioId);
  const comparisonScenario = comparisonScenarioId ? getScenario(comparisonScenarioId) : null;
  const activeAssets = getActiveAssets();
  const comparisonAssets = getComparisonAssets();

  const comparison = useMemo(() => {
    if (!comparisonAssets) return null;

    const assetComparisons = activeAssets.map(activeAsset => {
      const compAsset = comparisonAssets.find(a => a.id === activeAsset.id);
      if (!compAsset) return null;

      const changes: {
        field: string;
        activeValue: unknown;
        compValue: unknown;
        direction: 'up' | 'down' | 'same';
        impact: 'positive' | 'negative' | 'neutral';
      }[] = [];

      // Compare key metrics
      const metrics: { field: keyof FusionAsset; label: string; higherIsBetter?: boolean }[] = [
        { field: 'neutronDamageUncertainty', label: 'Neutron Uncertainty' },
        { field: 'replaceabilityDifficulty', label: 'Replaceability' },
        { field: 'systemValueImpact', label: 'System Value Impact' },
        { field: 'confidenceScore', label: 'Confidence', higherIsBetter: true },
        { field: 'instrumentationPriority', label: 'Instrumentation Priority' },
      ];

      metrics.forEach(({ field, label, higherIsBetter }) => {
        const activeVal = activeAsset[field] as number;
        const compVal = compAsset[field] as number;
        
        if (activeVal !== compVal) {
          const direction = activeVal > compVal ? 'up' : activeVal < compVal ? 'down' : 'same';
          let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
          
          if (higherIsBetter) {
            impact = direction === 'up' ? 'positive' : 'negative';
          } else {
            impact = direction === 'down' ? 'positive' : 'negative';
          }

          changes.push({
            field: label,
            activeValue: activeVal,
            compValue: compVal,
            direction,
            impact,
          });
        }
      });

      // Compare categorical values
      if (activeAsset.riskLevel !== compAsset.riskLevel) {
        const riskOrder = ['Low', 'Medium', 'High', 'Critical'];
        const activeIdx = riskOrder.indexOf(activeAsset.riskLevel);
        const compIdx = riskOrder.indexOf(compAsset.riskLevel);
        
        changes.push({
          field: 'Risk Level',
          activeValue: activeAsset.riskLevel,
          compValue: compAsset.riskLevel,
          direction: activeIdx > compIdx ? 'up' : 'down',
          impact: activeIdx > compIdx ? 'negative' : 'positive',
        });
      }

      if (activeAsset.maturityLevel !== compAsset.maturityLevel) {
        const maturityOrder = ['Concept', 'Design', 'Prototype', 'Qualified', 'Operational'];
        const activeIdx = maturityOrder.indexOf(activeAsset.maturityLevel);
        const compIdx = maturityOrder.indexOf(compAsset.maturityLevel);
        
        changes.push({
          field: 'Maturity',
          activeValue: activeAsset.maturityLevel,
          compValue: compAsset.maturityLevel,
          direction: activeIdx > compIdx ? 'up' : 'down',
          impact: activeIdx > compIdx ? 'positive' : 'negative',
        });
      }

      return {
        asset: activeAsset,
        changes,
      };
    }).filter(Boolean);

    // Calculate summary metrics
    const totalChanges = assetComparisons.reduce((sum, a) => sum + (a?.changes.length ?? 0), 0);
    const positiveChanges = assetComparisons.reduce((sum, a) => 
      sum + (a?.changes.filter(c => c.impact === 'positive').length ?? 0), 0);
    const negativeChanges = assetComparisons.reduce((sum, a) => 
      sum + (a?.changes.filter(c => c.impact === 'negative').length ?? 0), 0);

    // Calculate aggregate scores
    const calcScore = (assets: FusionAsset[]) => {
      const avgConfidence = assets.reduce((s, a) => s + a.confidenceScore, 0) / assets.length;
      const criticalCount = assets.filter(a => a.riskLevel === 'Critical').length;
      const avgCriticality = assets.reduce((s, a) => 
        s + a.neutronDamageUncertainty + a.replaceabilityDifficulty + a.systemValueImpact, 0) / assets.length;
      
      return { avgConfidence, criticalCount, avgCriticality };
    };

    const activeScore = calcScore(activeAssets);
    const compScore = calcScore(comparisonAssets);

    return {
      assetComparisons,
      summary: {
        totalChanges,
        positiveChanges,
        negativeChanges,
        activeScore,
        compScore,
      },
    };
  }, [activeAssets, comparisonAssets]);

  if (!comparisonScenario || !comparison) {
    return (
      <div className="flp-card p-8 text-center">
        <p className="text-muted-foreground">
          Select a second scenario to compare
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Comparison Header */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="p-4 rounded-lg border-2"
          style={{ borderColor: activeScenario?.color }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: activeScenario?.color }}
            />
            <h3 className="font-semibold">{activeScenario?.name}</h3>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">A</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <p className="text-xl font-bold">{Math.round(comparison.summary.activeScore.avgConfidence)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Assets</p>
              <p className="text-xl font-bold">{comparison.summary.activeScore.criticalCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Criticality</p>
              <p className="text-xl font-bold">{comparison.summary.activeScore.avgCriticality.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div 
          className="p-4 rounded-lg border-2"
          style={{ borderColor: comparisonScenario.color }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: comparisonScenario.color }}
            />
            <h3 className="font-semibold">{comparisonScenario.name}</h3>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">B</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <p className="text-xl font-bold">{Math.round(comparison.summary.compScore.avgConfidence)}%</p>
              <DeltaIndicator 
                delta={comparison.summary.compScore.avgConfidence - comparison.summary.activeScore.avgConfidence}
                higherIsBetter
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Assets</p>
              <p className="text-xl font-bold">{comparison.summary.compScore.criticalCount}</p>
              <DeltaIndicator 
                delta={comparison.summary.compScore.criticalCount - comparison.summary.activeScore.criticalCount}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Criticality</p>
              <p className="text-xl font-bold">{comparison.summary.compScore.avgCriticality.toFixed(1)}</p>
              <DeltaIndicator 
                delta={comparison.summary.compScore.avgCriticality - comparison.summary.activeScore.avgCriticality}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flp-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-status-nominal" />
            <span className="font-medium">Improvements</span>
          </div>
          <p className="text-3xl font-bold text-status-nominal">{comparison.summary.positiveChanges}</p>
          <p className="text-xs text-muted-foreground">changes that reduce risk</p>
        </div>
        
        <div className="flp-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-status-critical" />
            <span className="font-medium">Concerns</span>
          </div>
          <p className="text-3xl font-bold text-status-critical">{comparison.summary.negativeChanges}</p>
          <p className="text-xs text-muted-foreground">changes that increase risk</p>
        </div>
        
        <div className="flp-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Total Changes</span>
          </div>
          <p className="text-3xl font-bold">{comparison.summary.totalChanges}</p>
          <p className="text-xs text-muted-foreground">parameters modified</p>
        </div>
      </div>

      {/* Detailed Asset Changes */}
      <div className="flp-card p-4">
        <h4 className="font-semibold mb-4">Asset-by-Asset Changes</h4>
        <div className="space-y-3">
          {comparison.assetComparisons
            .filter(a => a && a.changes.length > 0)
            .map(comp => {
              if (!comp) return null;
              
              return (
                <div key={comp.asset.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comp.asset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {comp.changes.length} change{comp.changes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comp.changes.map((change, i) => (
                      <div 
                        key={i}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs',
                          change.impact === 'positive' && 'bg-status-nominal/10 text-status-nominal',
                          change.impact === 'negative' && 'bg-status-critical/10 text-status-critical',
                          change.impact === 'neutral' && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {change.direction === 'up' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : change.direction === 'down' ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        <span className="font-medium">{change.field}:</span>
                        <span>{String(change.activeValue)}</span>
                        <span>→</span>
                        <span>{String(change.compValue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

const DeltaIndicator = ({ 
  delta, 
  higherIsBetter = false 
}: { 
  delta: number; 
  higherIsBetter?: boolean;
}) => {
  if (Math.abs(delta) < 0.01) return null;

  const isPositive = higherIsBetter ? delta > 0 : delta < 0;
  
  return (
    <div className={cn(
      'flex items-center gap-1 text-xs',
      isPositive ? 'text-status-nominal' : 'text-status-critical'
    )}>
      {delta > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      <span>{delta > 0 ? '+' : ''}{typeof delta === 'number' ? (Number.isInteger(delta) ? delta : delta.toFixed(1)) : delta}</span>
    </div>
  );
};
