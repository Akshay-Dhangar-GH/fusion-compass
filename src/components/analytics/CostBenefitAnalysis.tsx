import { useMemo, useState } from 'react';
import { useScenario } from '@/contexts/ScenarioContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Target,
  Zap,
  Activity,
  Wand2,
} from 'lucide-react';
import { ScenarioHeader } from './ScenarioHeader';
import { DeltaIndicator } from './DeltaIndicator';
import { SensitivityAnalysis } from './SensitivityAnalysis';
import { WhatIfBuilder } from './WhatIfBuilder';
import { useStrategyAnalysis, maintenanceStrategies } from '@/hooks/useStrategyAnalysis';

export const CostBenefitAnalysis = () => {
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
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [planningHorizon, setPlanningHorizon] = useState(20); // years
  const [discountRate, setDiscountRate] = useState(5); // percent
  const [electricityPrice, setElectricityPrice] = useState(80); // $/MWh
  const [plantCapacity, setPlantCapacity] = useState(500); // MW
  
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const comparisonSelectedAsset = comparisonAssets?.find(a => a.id === selectedAssetId);
  
  const activeScenario = getScenario(activeScenarioId);
  const comparisonScenario = comparisonScenarioId ? getScenario(comparisonScenarioId) : null;
  
  const effectiveCompareMode = localCompareMode && comparisonAssets && comparisonScenarioId;

  // Active scenario analysis
  const { strategyWithROI, portfolioAnalysis } = useStrategyAnalysis({
    assets,
    selectedAsset,
    planningHorizon,
    discountRate,
    electricityPrice,
    plantCapacity,
  });

  // Comparison scenario analysis
  const { 
    strategyWithROI: comparisonStrategyWithROI, 
    portfolioAnalysis: comparisonPortfolioAnalysis 
  } = useStrategyAnalysis({
    assets: comparisonAssets || [],
    selectedAsset: comparisonSelectedAsset,
    planningHorizon,
    discountRate,
    electricityPrice,
    plantCapacity,
  });

  // Cost breakdown for selected strategy
  const costBreakdownData = useMemo(() => {
    const proactive = strategyWithROI.find(s => s.strategy.id === 'proactive');
    if (!proactive) return [];
    
    return [
      { name: 'Maintenance', value: proactive.totalMaintenanceCost, color: 'hsl(var(--chart-1))' },
      { name: 'Downtime', value: proactive.totalDowntimeCost, color: 'hsl(var(--chart-2))' },
      { name: 'Replacement', value: proactive.totalReplacementCost, color: 'hsl(var(--chart-3))' },
    ];
  }, [strategyWithROI]);

  // Radar data for strategy comparison
  const radarData = useMemo(() => {
    return [
      { metric: 'Cost Efficiency', Reactive: 100, Preventive: 70, Predictive: 60, Proactive: 50 },
      { metric: 'Availability', Reactive: 40, Preventive: 60, Predictive: 85, Proactive: 95 },
      { metric: 'Risk Reduction', Reactive: 10, Preventive: 50, Predictive: 75, Proactive: 90 },
      { metric: 'Predictability', Reactive: 20, Preventive: 60, Predictive: 80, Proactive: 95 },
      { metric: 'Flexibility', Reactive: 90, Preventive: 50, Predictive: 70, Proactive: 60 },
    ];
  }, []);

  if (!selectedAsset) {
    return (
      <div className="flp-card p-8 text-center">
        <p className="text-muted-foreground">No assets available for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flp-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              Cost-Benefit Analysis
            </h2>
            <p className="text-muted-foreground mt-1">
              Compare maintenance strategies and calculate ROI based on lifecycle costs
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            ISO 55000 Aligned
          </Badge>
        </div>
        
        {/* Scenario Header */}
        <ScenarioHeader
          showCompareToggle={true}
          localCompareMode={localCompareMode}
          onLocalCompareModeChange={setLocalCompareMode}
        />
        
        {effectiveCompareMode && (
          <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Comparison Mode Active:</span>{' '}
              Viewing cost-benefit analysis for{' '}
              <span className="font-medium" style={{ color: activeScenario?.color }}>
                {activeScenario?.name}
              </span>{' '}
              vs{' '}
              <span className="font-medium" style={{ color: comparisonScenario?.color }}>
                {comparisonScenario?.name}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Parameters Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Analysis Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Asset</label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Planning Horizon</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{planningHorizon} yrs</span>
              </div>
              <Slider
                value={[planningHorizon]}
                onValueChange={([v]) => setPlanningHorizon(v)}
                min={5}
                max={40}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Discount Rate</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{discountRate}%</span>
              </div>
              <Slider
                value={[discountRate]}
                onValueChange={([v]) => setDiscountRate(v)}
                min={1}
                max={15}
                step={0.5}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Electricity Price</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">${electricityPrice}/MWh</span>
              </div>
              <Slider
                value={[electricityPrice]}
                onValueChange={([v]) => setElectricityPrice(v)}
                min={40}
                max={200}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Plant Capacity</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{plantCapacity} MW</span>
              </div>
              <Slider
                value={[plantCapacity]}
                onValueChange={([v]) => setPlantCapacity(v)}
                min={100}
                max={1000}
                step={50}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Strategy Comparison</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="sensitivity" className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Sensitivity
          </TabsTrigger>
          <TabsTrigger value="whatif" className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            What-If Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          {/* Strategy Cards */}
          <div className="grid grid-cols-4 gap-4">
            {strategyWithROI.map((analysis, idx) => {
              const comparisonAnalysis = effectiveCompareMode 
                ? comparisonStrategyWithROI.find(c => c.strategy.id === analysis.strategy.id)
                : null;
              
              return (
                <Card 
                  key={analysis.strategy.id}
                  className={cn(
                    'relative overflow-hidden transition-all',
                    analysis.strategy.id === 'proactive' && 'ring-2 ring-primary'
                  )}
                >
                  {analysis.strategy.id === 'proactive' && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {analysis.strategy.name.split(' ')[0]}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {analysis.strategy.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          NPV (Total Cost)
                        </span>
                        <div className="text-right">
                          <span className="font-semibold">${analysis.npv.toFixed(1)}M</span>
                          {comparisonAnalysis && (
                            <div className="mt-0.5">
                              <DeltaIndicator
                                value={analysis.npv}
                                comparisonValue={comparisonAnalysis.npv}
                                prefix="$"
                                suffix="M"
                                higherIsBetter={false}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Savings vs Reactive
                        </span>
                        <div className="text-right">
                          <span className={cn(
                            'font-semibold',
                            analysis.savings > 0 ? 'text-status-nominal' : 'text-muted-foreground'
                          )}>
                            {analysis.savings > 0 ? '+' : ''}{analysis.savings.toFixed(1)}M
                          </span>
                          {comparisonAnalysis && (
                            <div className="mt-0.5">
                              <DeltaIndicator
                                value={analysis.savings}
                                comparisonValue={comparisonAnalysis.savings}
                                prefix="$"
                                suffix="M"
                                higherIsBetter={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Downtime Reduction
                        </span>
                        <span className="font-semibold">{analysis.availabilityGain.toFixed(0)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Risk Reduction
                        </span>
                        <span className="font-semibold">{analysis.riskReduction.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Annual Maintenance</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">${analysis.annualMaintenanceCost.toFixed(1)}M/yr</span>
                          {comparisonAnalysis && (
                            <div className="mt-0.5">
                              <DeltaIndicator
                                value={analysis.annualMaintenanceCost}
                                comparisonValue={comparisonAnalysis.annualMaintenanceCost}
                                prefix="$"
                                suffix="M"
                                higherIsBetter={false}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* NPV Comparison Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  NPV Comparison (Lower is Better)
                  {effectiveCompareMode && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      — Comparing scenarios
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strategyWithROI.map((s, idx) => {
                    const compS = effectiveCompareMode ? comparisonStrategyWithROI[idx] : null;
                    return {
                      name: s.strategy.name.split(' ')[0],
                      [`${activeScenario?.name || 'Active'}`]: s.npv,
                      ...(compS && { [`${comparisonScenario?.name || 'Comparison'}`]: compS.npv }),
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(1)}M`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey={activeScenario?.name || 'Active'} 
                      fill={activeScenario?.color || 'hsl(var(--chart-1))'} 
                    />
                    {effectiveCompareMode && (
                      <Bar 
                        dataKey={comparisonScenario?.name || 'Comparison'} 
                        fill={comparisonScenario?.color || 'hsl(var(--chart-2))'} 
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Strategy Performance Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Reactive" dataKey="Reactive" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} />
                    <Radar name="Preventive" dataKey="Preventive" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                    <Radar name="Predictive" dataKey="Predictive" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.2} />
                    <Radar name="Proactive" dataKey="Proactive" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {portfolioAnalysis.map((data, idx) => {
              const compData = effectiveCompareMode ? comparisonPortfolioAnalysis[idx] : null;
              
              return (
                <Card key={data.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{data.fullName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total NPV</span>
                        <div className="text-right">
                          <span className="text-lg font-bold">${data.npv.toFixed(0)}M</span>
                          {compData && (
                            <div className="mt-0.5">
                              <DeltaIndicator
                                value={data.npv}
                                comparisonValue={compData.npv}
                                prefix="$"
                                suffix="M"
                                higherIsBetter={false}
                                decimals={0}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Maintenance</span>
                        <div className="text-right">
                          <span className="font-medium">${data.maintenanceCost.toFixed(0)}M</span>
                          {compData && (
                            <div className="mt-0.5">
                              <DeltaIndicator
                                value={data.maintenanceCost}
                                comparisonValue={compData.maintenanceCost}
                                prefix="$"
                                suffix="M"
                                higherIsBetter={false}
                                decimals={0}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Downtime Cost</span>
                        <div className="text-right">
                          <span className="font-medium">${data.downtimeCost.toFixed(0)}M</span>
                          {compData && (
                            <div className="mt-0.5">
                              <DeltaIndicator
                                value={data.downtimeCost}
                                comparisonValue={compData.downtimeCost}
                                prefix="$"
                                suffix="M"
                                higherIsBetter={false}
                                decimals={0}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Portfolio-Wide Cost Comparison
                {effectiveCompareMode && (
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    — {activeScenario?.name} vs {comparisonScenario?.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={portfolioAnalysis.map((p, idx) => {
                  const compP = effectiveCompareMode ? comparisonPortfolioAnalysis[idx] : null;
                  return {
                    name: p.name,
                    [`${activeScenario?.name} Maintenance`]: p.maintenanceCost,
                    [`${activeScenario?.name} Downtime`]: p.downtimeCost,
                    ...(compP && {
                      [`${comparisonScenario?.name} Maintenance`]: compP.maintenanceCost,
                      [`${comparisonScenario?.name} Downtime`]: compP.downtimeCost,
                    }),
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${v}M`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(0)}M`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={`${activeScenario?.name} Maintenance`} 
                    fill={activeScenario?.color || 'hsl(var(--chart-1))'} 
                  />
                  <Bar 
                    dataKey={`${activeScenario?.name} Downtime`} 
                    fill="hsl(var(--chart-2))" 
                  />
                  {effectiveCompareMode && (
                    <>
                      <Bar 
                        dataKey={`${comparisonScenario?.name} Maintenance`} 
                        fill={comparisonScenario?.color || 'hsl(var(--chart-3))'} 
                      />
                      <Bar 
                        dataKey={`${comparisonScenario?.name} Downtime`} 
                        fill="hsl(var(--chart-4))" 
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Cost Distribution (Proactive Strategy)
                  {effectiveCompareMode && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      — {activeScenario?.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value.toFixed(1)}M`}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(1)}M`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategyWithROI.filter(s => s.strategy.id === 'proactive').map(proactive => {
                  const compProactive = effectiveCompareMode 
                    ? comparisonStrategyWithROI.find(s => s.strategy.id === 'proactive')
                    : null;
                  
                  return (
                    <div key="insights" className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-status-nominal/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-status-nominal mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Optimal Strategy: Proactive (RCM)
                            {effectiveCompareMode && (
                              <span className="text-xs font-normal text-muted-foreground ml-2">
                                in {activeScenario?.name}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saves ${proactive.savings.toFixed(1)}M over {planningHorizon} years compared to reactive maintenance
                            {compProactive && (
                              <span className="ml-1">
                                (
                                <span className={cn(
                                  proactive.savings > compProactive.savings 
                                    ? 'text-status-nominal' 
                                    : 'text-destructive'
                                )}>
                                  {proactive.savings > compProactive.savings ? '+' : ''}
                                  ${(proactive.savings - compProactive.savings).toFixed(1)}M
                                </span>
                                {' '}vs {comparisonScenario?.name})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <Zap className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Availability Improvement</p>
                          <p className="text-xs text-muted-foreground">
                            {proactive.availabilityGain.toFixed(0)}% reduction in unplanned downtime translates to 
                            additional revenue of ~${(proactive.totalDowntimeCost * 0.85).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-status-warning mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Risk Mitigation Value</p>
                          <p className="text-xs text-muted-foreground">
                            {proactive.riskReduction.toFixed(0)}% failure risk reduction protects against 
                            catastrophic loss scenarios valued at ${(selectedAsset?.costSchedule.replacementCostMillions || 0) * 2}M+
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 border rounded-lg">
                        <p className="text-sm font-medium mb-2">Recommendation</p>
                        <p className="text-sm text-muted-foreground">
                          For <span className="font-medium text-foreground">{selectedAsset?.name}</span>
                          {effectiveCompareMode && (
                            <span className="text-xs"> in {activeScenario?.name}</span>
                          )}
                          , implement a proactive RCM strategy with condition monitoring. The higher upfront 
                          investment of ${proactive.annualMaintenanceCost.toFixed(1)}M/year is justified by 
                          significantly reduced lifecycle costs and improved plant availability.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensitivity Analysis Tab */}
        <TabsContent value="sensitivity">
          <SensitivityAnalysis
            selectedAsset={selectedAsset}
            planningHorizon={planningHorizon}
            discountRate={discountRate}
            electricityPrice={electricityPrice}
            plantCapacity={plantCapacity}
          />
        </TabsContent>

        {/* What-If Builder Tab */}
        <TabsContent value="whatif">
          <WhatIfBuilder
            planningHorizon={planningHorizon}
            discountRate={discountRate}
            electricityPrice={electricityPrice}
            plantCapacity={plantCapacity}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
