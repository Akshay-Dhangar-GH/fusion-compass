import { useState, useMemo } from 'react';
import { useScenario } from '@/contexts/ScenarioContext';
import { FusionAsset } from '@/data/fusionAssets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Wand2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useStrategyAnalysis, maintenanceStrategies } from '@/hooks/useStrategyAnalysis';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WhatIfBuilderProps {
  planningHorizon: number;
  discountRate: number;
  electricityPrice: number;
  plantCapacity: number;
}

interface ParameterAdjustment {
  id: string;
  assetIds: string[];
  parameter: 'replacementCost' | 'maintenanceCost' | 'downtime' | 'all';
  changePercent: number;
  enabled: boolean;
}

const PARAMETER_LABELS = {
  replacementCost: 'Replacement Cost',
  maintenanceCost: 'Maintenance Cost',
  downtime: 'Downtime Duration',
  all: 'All Cost Parameters',
};

export const WhatIfBuilder = ({
  planningHorizon,
  discountRate,
  electricityPrice,
  plantCapacity,
}: WhatIfBuilderProps) => {
  const {
    scenarios,
    activeScenarioId,
    getActiveAssets,
    createScenario,
    duplicateScenario,
    modifyAsset,
    setActiveScenario,
  } = useScenario();

  const assets = getActiveAssets();
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const [adjustments, setAdjustments] = useState<ParameterAdjustment[]>([
    {
      id: 'adj-1',
      assetIds: [],
      parameter: 'replacementCost',
      changePercent: 0,
      enabled: true,
    },
  ]);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [previewMode, setPreviewMode] = useState(true);

  // Apply adjustments to get modified assets
  const modifiedAssets = useMemo(() => {
    return assets.map(asset => {
      const applicableAdjustments = adjustments.filter(
        adj => adj.enabled && (adj.assetIds.length === 0 || adj.assetIds.includes(asset.id))
      );

      if (applicableAdjustments.length === 0) return asset;

      let modifiedCostSchedule = { ...asset.costSchedule };

      applicableAdjustments.forEach(adj => {
        const multiplier = 1 + adj.changePercent / 100;

        if (adj.parameter === 'replacementCost' || adj.parameter === 'all') {
          modifiedCostSchedule.replacementCostMillions *= multiplier;
        }
        if (adj.parameter === 'maintenanceCost' || adj.parameter === 'all') {
          modifiedCostSchedule.annualMaintenanceCostMillions *= multiplier;
        }
        if (adj.parameter === 'downtime' || adj.parameter === 'all') {
          modifiedCostSchedule.downtimeWeeks *= multiplier;
        }
      });

      return {
        ...asset,
        costSchedule: modifiedCostSchedule,
      };
    });
  }, [assets, adjustments]);

  // Calculate baseline analysis
  const baselineAnalysis = useStrategyAnalysis({
    assets,
    selectedAsset: assets[0],
    planningHorizon,
    discountRate,
    electricityPrice,
    plantCapacity,
  });

  // Calculate what-if analysis
  const whatIfAnalysis = useStrategyAnalysis({
    assets: modifiedAssets,
    selectedAsset: modifiedAssets[0],
    planningHorizon,
    discountRate,
    electricityPrice,
    plantCapacity,
  });

  // Comparison data for chart
  const comparisonData = useMemo(() => {
    return maintenanceStrategies.map(strategy => {
      const baseline = baselineAnalysis.portfolioAnalysis.find(p => p.name === strategy.name.split(' ')[0]);
      const whatIf = whatIfAnalysis.portfolioAnalysis.find(p => p.name === strategy.name.split(' ')[0]);

      return {
        name: strategy.name.split(' ')[0],
        baseline: baseline?.npv || 0,
        whatIf: whatIf?.npv || 0,
        delta: (whatIf?.npv || 0) - (baseline?.npv || 0),
        deltaPercent: baseline?.npv ? (((whatIf?.npv || 0) - baseline.npv) / baseline.npv) * 100 : 0,
      };
    });
  }, [baselineAnalysis.portfolioAnalysis, whatIfAnalysis.portfolioAnalysis]);

  const totalBaselineNPV = baselineAnalysis.portfolioAnalysis.find(p => p.name === 'Proactive')?.npv || 0;
  const totalWhatIfNPV = whatIfAnalysis.portfolioAnalysis.find(p => p.name === 'Proactive')?.npv || 0;
  const totalDelta = totalWhatIfNPV - totalBaselineNPV;
  const totalDeltaPercent = totalBaselineNPV ? (totalDelta / totalBaselineNPV) * 100 : 0;

  const addAdjustment = () => {
    setAdjustments(prev => [
      ...prev,
      {
        id: `adj-${Date.now()}`,
        assetIds: [],
        parameter: 'replacementCost',
        changePercent: 0,
        enabled: true,
      },
    ]);
  };

  const removeAdjustment = (id: string) => {
    setAdjustments(prev => prev.filter(adj => adj.id !== id));
  };

  const updateAdjustment = (id: string, updates: Partial<ParameterAdjustment>) => {
    setAdjustments(prev =>
      prev.map(adj => (adj.id === id ? { ...adj, ...updates } : adj))
    );
  };

  const resetAll = () => {
    setAdjustments([
      {
        id: 'adj-1',
        assetIds: [],
        parameter: 'replacementCost',
        changePercent: 0,
        enabled: true,
      },
    ]);
  };

  const handleSaveScenario = () => {
    if (!newScenarioName.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }

    // Create new scenario
    const newId = createScenario(newScenarioName, `What-if scenario with ${adjustments.filter(a => a.enabled).length} adjustments`);

    // Apply modifications to the new scenario
    modifiedAssets.forEach(modAsset => {
      const originalAsset = assets.find(a => a.id === modAsset.id);
      if (originalAsset && JSON.stringify(originalAsset.costSchedule) !== JSON.stringify(modAsset.costSchedule)) {
        modifyAsset(newId, modAsset.id, { costSchedule: modAsset.costSchedule });
      }
    });

    toast.success(`Scenario "${newScenarioName}" saved successfully`);
    setSaveDialogOpen(false);
    setNewScenarioName('');
    setActiveScenario(newId);
  };

  const applyPreset = (preset: 'optimistic' | 'pessimistic' | 'costReduction') => {
    switch (preset) {
      case 'optimistic':
        setAdjustments([
          { id: 'adj-1', assetIds: [], parameter: 'replacementCost', changePercent: -15, enabled: true },
          { id: 'adj-2', assetIds: [], parameter: 'maintenanceCost', changePercent: -10, enabled: true },
          { id: 'adj-3', assetIds: [], parameter: 'downtime', changePercent: -20, enabled: true },
        ]);
        break;
      case 'pessimistic':
        setAdjustments([
          { id: 'adj-1', assetIds: [], parameter: 'replacementCost', changePercent: 25, enabled: true },
          { id: 'adj-2', assetIds: [], parameter: 'maintenanceCost', changePercent: 15, enabled: true },
          { id: 'adj-3', assetIds: [], parameter: 'downtime', changePercent: 30, enabled: true },
        ]);
        break;
      case 'costReduction':
        setAdjustments([
          { id: 'adj-1', assetIds: [], parameter: 'all', changePercent: -20, enabled: true },
        ]);
        break;
    }
  };

  const hasChanges = adjustments.some(adj => adj.enabled && adj.changePercent !== 0);

  return (
    <div className="space-y-4">
      {/* Header with presets */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              What-If Scenario Builder
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Presets:</span>
              <Button variant="outline" size="sm" onClick={() => applyPreset('optimistic')}>
                Optimistic
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('pessimistic')}>
                Pessimistic
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('costReduction')}>
                Cost Reduction
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust multiple cost parameters across assets to explore different scenarios. 
            Changes are previewed in real-time and can be saved as new scenarios for comparison.
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
                <span className="text-sm">Live Preview</span>
              </div>
              <Badge variant={hasChanges ? 'default' : 'secondary'}>
                {adjustments.filter(a => a.enabled && a.changePercent !== 0).length} active adjustments
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetAll}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={!hasChanges}>
                    <Save className="w-4 h-4 mr-1" />
                    Save as Scenario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save What-If Scenario</DialogTitle>
                    <DialogDescription>
                      Save your adjustments as a new scenario for comparison with the baseline.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="Scenario name (e.g., 'Optimistic 2025')"
                      value={newScenarioName}
                      onChange={e => setNewScenarioName(e.target.value)}
                    />
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium mb-2">Adjustments to save:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {adjustments.filter(a => a.enabled && a.changePercent !== 0).map(adj => (
                          <li key={adj.id} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-status-nominal" />
                            {PARAMETER_LABELS[adj.parameter]}: {adj.changePercent > 0 ? '+' : ''}{adj.changePercent}%
                            {adj.assetIds.length > 0 && (
                              <span className="text-xs">({adj.assetIds.length} assets)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveScenario}>
                      Save Scenario
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {/* Adjustments Panel */}
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Parameter Adjustments</CardTitle>
              <Button variant="outline" size="sm" onClick={addAdjustment}>
                <Plus className="w-4 h-4 mr-1" />
                Add Adjustment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adjustments.map((adjustment, idx) => (
                <div
                  key={adjustment.id}
                  className={cn(
                    'p-4 border rounded-lg transition-opacity',
                    !adjustment.enabled && 'opacity-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={adjustment.enabled}
                        onCheckedChange={checked => updateAdjustment(adjustment.id, { enabled: checked })}
                      />
                      <span className="font-medium text-sm">Adjustment {idx + 1}</span>
                    </div>
                    {adjustments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdjustment(adjustment.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Parameter</label>
                      <Select
                        value={adjustment.parameter}
                        onValueChange={value =>
                          updateAdjustment(adjustment.id, { parameter: value as ParameterAdjustment['parameter'] })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PARAMETER_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground">Change</label>
                        <span
                          className={cn(
                            'text-xs font-mono px-2 py-0.5 rounded',
                            adjustment.changePercent > 0
                              ? 'bg-destructive/10 text-destructive'
                              : adjustment.changePercent < 0
                              ? 'bg-status-nominal/10 text-status-nominal'
                              : 'bg-muted'
                          )}
                        >
                          {adjustment.changePercent > 0 ? '+' : ''}{adjustment.changePercent}%
                        </span>
                      </div>
                      <Slider
                        value={[adjustment.changePercent]}
                        onValueChange={([v]) => updateAdjustment(adjustment.id, { changePercent: v })}
                        min={-50}
                        max={50}
                        step={5}
                        disabled={!adjustment.enabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-50%</span>
                        <span>0</span>
                        <span>+50%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Apply to Assets</label>
                      <Select
                        value={adjustment.assetIds.length === 0 ? 'all' : 'selected'}
                        onValueChange={value =>
                          updateAdjustment(adjustment.id, {
                            assetIds: value === 'all' ? [] : adjustment.assetIds,
                          })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assets</SelectItem>
                          <SelectItem value="selected">Selected Assets...</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {adjustment.assetIds.length === 0 ? null : (
                        <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                          {assets.map(asset => (
                            <div key={asset.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={adjustment.assetIds.includes(asset.id)}
                                onCheckedChange={checked => {
                                  const newIds = checked
                                    ? [...adjustment.assetIds, asset.id]
                                    : adjustment.assetIds.filter(id => id !== asset.id);
                                  updateAdjustment(adjustment.id, { assetIds: newIds });
                                }}
                              />
                              <span className="text-xs">{asset.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Impact Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Portfolio NPV Change (Proactive)</div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-2xl font-bold',
                      totalDelta < 0 ? 'text-status-nominal' : totalDelta > 0 ? 'text-destructive' : ''
                    )}
                  >
                    {totalDelta >= 0 ? '+' : ''}${totalDelta.toFixed(1)}M
                  </span>
                  <Badge
                    variant={totalDelta < 0 ? 'default' : totalDelta > 0 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {totalDeltaPercent >= 0 ? '+' : ''}{totalDeltaPercent.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  vs {activeScenario?.name || 'Baseline'}
                </div>
              </div>

              {/* Strategy breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Strategy Impact</div>
                {comparisonData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.delta < 0 ? (
                        <TrendingDown className="w-3 h-3 text-status-nominal" />
                      ) : item.delta > 0 ? (
                        <TrendingUp className="w-3 h-3 text-destructive" />
                      ) : null}
                      <span
                        className={cn(
                          'font-mono text-xs',
                          item.delta < 0 ? 'text-status-nominal' : item.delta > 0 ? 'text-destructive' : ''
                        )}
                      >
                        {item.delta >= 0 ? '+' : ''}{item.deltaPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}M`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(1)}M`, 'NPV']}
                    />
                    <Bar dataKey="baseline" fill="hsl(var(--muted-foreground))" opacity={0.3} />
                    <Bar dataKey="whatIf">
                      {comparisonData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.delta < 0 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-1))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insights */}
              {hasChanges && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    {totalDelta < 0 ? (
                      <CheckCircle className="w-4 h-4 text-status-nominal mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5" />
                    )}
                    <div className="text-xs">
                      {totalDelta < 0 ? (
                        <>
                          <strong className="text-status-nominal">Favorable outcome:</strong> These adjustments 
                          would reduce lifecycle costs by ${Math.abs(totalDelta).toFixed(1)}M.
                        </>
                      ) : (
                        <>
                          <strong className="text-status-warning">Cost increase:</strong> These adjustments 
                          would increase lifecycle costs by ${totalDelta.toFixed(1)}M.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Saved Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={cn(
                  'p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50',
                  scenario.id === activeScenarioId && 'border-primary bg-primary/5'
                )}
                onClick={() => setActiveScenario(scenario.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <span className="font-medium text-sm truncate">{scenario.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {scenario.description}
                </p>
                {scenario.id === activeScenarioId && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
