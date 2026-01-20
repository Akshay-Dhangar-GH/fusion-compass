import { useMemo, useState } from 'react';
import { FusionAsset } from '@/data/fusionAssets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Activity, Info } from 'lucide-react';
import { maintenanceStrategies } from '@/hooks/useStrategyAnalysis';

interface SensitivityAnalysisProps {
  selectedAsset: FusionAsset;
  planningHorizon: number;
  discountRate: number;
  electricityPrice: number;
  plantCapacity: number;
}

type SensitivityParameter = 'replacementCost' | 'maintenanceCost' | 'downtime';

const SENSITIVITY_RANGE = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
const STRATEGY_COLORS = {
  reactive: 'hsl(var(--chart-1))',
  preventive: 'hsl(var(--chart-2))',
  predictive: 'hsl(var(--chart-3))',
  proactive: 'hsl(var(--chart-4))',
};

const PARAMETER_LABELS: Record<SensitivityParameter, string> = {
  replacementCost: 'Replacement Cost',
  maintenanceCost: 'Maintenance Cost',
  downtime: 'Downtime Duration',
};

export const SensitivityAnalysis = ({
  selectedAsset,
  planningHorizon,
  discountRate,
  electricityPrice,
  plantCapacity,
}: SensitivityAnalysisProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState('proactive');
  const [comparisonStrategy, setComparisonStrategy] = useState('reactive');
  const [highlightedParam, setHighlightedParam] = useState<SensitivityParameter | null>(null);

  // Calculate NPV for a given set of parameters
  const calculateNPV = (
    asset: FusionAsset,
    strategy: typeof maintenanceStrategies[0],
    replacementMultiplier = 1,
    maintenanceMultiplier = 1,
    downtimeMultiplier = 1
  ) => {
    const baseReplacementCost = asset.costSchedule.replacementCostMillions * replacementMultiplier;
    const baseAnnualMaintenance = asset.costSchedule.annualMaintenanceCostMillions * maintenanceMultiplier;
    const baseDowntime = asset.costSchedule.downtimeWeeks * downtimeMultiplier;
    
    const weeklyRevenue = (plantCapacity * 168 * electricityPrice * 0.8) / 1000000;
    const annualMaintenanceCost = baseAnnualMaintenance * (1 + strategy.costMultiplier);
    const expectedDowntime = baseDowntime * (1 - strategy.downtimeReduction);
    const downtimeCostPerEvent = expectedDowntime * weeklyRevenue;
    
    const baseFailureRate = asset.riskLevel === 'Critical' ? 0.15 : 
                            asset.riskLevel === 'High' ? 0.1 :
                            asset.riskLevel === 'Medium' ? 0.05 : 0.02;
    const adjustedFailureRate = baseFailureRate * (1 - strategy.failureRiskReduction);
    
    let npv = 0;
    for (let year = 1; year <= planningHorizon; year++) {
      const discountFactor = Math.pow(1 + discountRate / 100, -year);
      npv += annualMaintenanceCost * discountFactor;
      const expectedFailureCost = adjustedFailureRate * (baseReplacementCost + downtimeCostPerEvent);
      npv += expectedFailureCost * discountFactor;
    }
    
    return npv;
  };

  // Calculate ROI for strategy comparison
  const calculateROI = (
    asset: FusionAsset,
    primaryStrategy: typeof maintenanceStrategies[0],
    baselineStrategy: typeof maintenanceStrategies[0],
    replacementMultiplier = 1,
    maintenanceMultiplier = 1,
    downtimeMultiplier = 1
  ) => {
    const primaryNPV = calculateNPV(asset, primaryStrategy, replacementMultiplier, maintenanceMultiplier, downtimeMultiplier);
    const baselineNPV = calculateNPV(asset, baselineStrategy, replacementMultiplier, maintenanceMultiplier, downtimeMultiplier);
    
    if (primaryNPV <= 0) return 0;
    return ((baselineNPV - primaryNPV) / primaryNPV) * 100;
  };

  // Generate sensitivity data for each parameter
  const sensitivityData = useMemo(() => {
    const strategy = maintenanceStrategies.find(s => s.id === selectedStrategy);
    const baseline = maintenanceStrategies.find(s => s.id === comparisonStrategy);
    
    if (!strategy || !baseline) return [];
    
    return SENSITIVITY_RANGE.map(percentChange => {
      const multiplier = 1 + percentChange / 100;
      
      return {
        percentChange,
        label: `${percentChange >= 0 ? '+' : ''}${percentChange}%`,
        replacementCost: calculateROI(selectedAsset, strategy, baseline, multiplier, 1, 1),
        maintenanceCost: calculateROI(selectedAsset, strategy, baseline, 1, multiplier, 1),
        downtime: calculateROI(selectedAsset, strategy, baseline, 1, 1, multiplier),
      };
    });
  }, [selectedAsset, selectedStrategy, comparisonStrategy, planningHorizon, discountRate, electricityPrice, plantCapacity]);

  // Calculate tornado chart data (sensitivity at ±20%)
  const tornadoData = useMemo(() => {
    const strategy = maintenanceStrategies.find(s => s.id === selectedStrategy);
    const baseline = maintenanceStrategies.find(s => s.id === comparisonStrategy);
    
    if (!strategy || !baseline) return [];
    
    const baseROI = calculateROI(selectedAsset, strategy, baseline);
    
    const params: SensitivityParameter[] = ['replacementCost', 'maintenanceCost', 'downtime'];
    
    return params.map(param => {
      const lowMultiplier = 0.8;
      const highMultiplier = 1.2;
      
      let lowROI: number, highROI: number;
      
      switch (param) {
        case 'replacementCost':
          lowROI = calculateROI(selectedAsset, strategy, baseline, lowMultiplier, 1, 1);
          highROI = calculateROI(selectedAsset, strategy, baseline, highMultiplier, 1, 1);
          break;
        case 'maintenanceCost':
          lowROI = calculateROI(selectedAsset, strategy, baseline, 1, lowMultiplier, 1);
          highROI = calculateROI(selectedAsset, strategy, baseline, 1, highMultiplier, 1);
          break;
        case 'downtime':
          lowROI = calculateROI(selectedAsset, strategy, baseline, 1, 1, lowMultiplier);
          highROI = calculateROI(selectedAsset, strategy, baseline, 1, 1, highMultiplier);
          break;
      }
      
      return {
        parameter: PARAMETER_LABELS[param],
        parameterId: param,
        baseROI,
        lowROI,
        highROI,
        swing: Math.abs(highROI - lowROI),
        lowDelta: lowROI - baseROI,
        highDelta: highROI - baseROI,
      };
    }).sort((a, b) => b.swing - a.swing);
  }, [selectedAsset, selectedStrategy, comparisonStrategy, planningHorizon, discountRate, electricityPrice, plantCapacity]);

  // Multi-strategy NPV sensitivity
  const strategyComparisonData = useMemo(() => {
    return SENSITIVITY_RANGE.map(percentChange => {
      const multiplier = 1 + percentChange / 100;
      
      const result: Record<string, number | string> = {
        percentChange,
        label: `${percentChange >= 0 ? '+' : ''}${percentChange}%`,
      };
      
      maintenanceStrategies.forEach(strategy => {
        result[strategy.id] = calculateNPV(selectedAsset, strategy, multiplier, 1, 1);
      });
      
      return result;
    });
  }, [selectedAsset, planningHorizon, discountRate, electricityPrice, plantCapacity]);

  const selectedStrategyInfo = maintenanceStrategies.find(s => s.id === selectedStrategy);
  const comparisonStrategyInfo = maintenanceStrategies.find(s => s.id === comparisonStrategy);
  const baseROI = tornadoData[0]?.baseROI || 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sensitivity Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Primary Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceStrategies.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name.split(' ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Baseline Comparison</label>
              <Select value={comparisonStrategy} onValueChange={setComparisonStrategy}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceStrategies.filter(s => s.id !== selectedStrategy).map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name.split(' ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <div className="p-3 bg-muted rounded-lg flex-1">
                <div className="text-xs text-muted-foreground">Base ROI</div>
                <div className="text-lg font-bold text-primary">
                  {baseROI > 0 ? '+' : ''}{baseROI.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedStrategyInfo?.name.split(' ')[0]} vs {comparisonStrategyInfo?.name.split(' ')[0]}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Tornado Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Sensitivity Tornado (±20% Change)
              <Badge variant="outline" className="text-xs font-normal">
                ROI Impact
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tornadoData.map((item, idx) => {
                const maxSwing = Math.max(...tornadoData.map(d => d.swing));
                const scale = maxSwing > 0 ? 100 / maxSwing : 1;
                
                return (
                  <div 
                    key={item.parameter}
                    className="space-y-1"
                    onMouseEnter={() => setHighlightedParam(item.parameterId)}
                    onMouseLeave={() => setHighlightedParam(null)}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{item.parameter}</span>
                      <span className="text-muted-foreground">
                        Swing: {item.swing.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-8 bg-muted rounded flex items-center">
                      {/* Center line */}
                      <div className="absolute left-1/2 h-full w-px bg-border z-10" />
                      
                      {/* Low bar (left of center) */}
                      <div 
                        className="absolute h-6 rounded-l transition-all"
                        style={{
                          right: '50%',
                          width: `${Math.abs(item.lowDelta) * scale / 2}%`,
                          backgroundColor: item.lowDelta >= 0 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-1))',
                          opacity: highlightedParam === item.parameterId || !highlightedParam ? 1 : 0.3,
                        }}
                      />
                      
                      {/* High bar (right of center) */}
                      <div 
                        className="absolute h-6 rounded-r transition-all"
                        style={{
                          left: '50%',
                          width: `${Math.abs(item.highDelta) * scale / 2}%`,
                          backgroundColor: item.highDelta >= 0 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-1))',
                          opacity: highlightedParam === item.parameterId || !highlightedParam ? 1 : 0.3,
                        }}
                      />
                      
                      {/* Labels */}
                      <div className="absolute left-2 text-xs font-mono">
                        {item.lowDelta >= 0 ? '+' : ''}{item.lowDelta.toFixed(1)}%
                      </div>
                      <div className="absolute right-2 text-xs font-mono">
                        {item.highDelta >= 0 ? '+' : ''}{item.highDelta.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-20%</span>
                      <span>+20%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{tornadoData[0]?.parameter}</strong> has the highest 
                  impact on ROI. A 20% change in this parameter swings ROI by{' '}
                  <strong className="text-foreground">±{(tornadoData[0]?.swing / 2).toFixed(1)}%</strong>.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              ROI Sensitivity Curves
              <Badge variant="outline" className="text-xs font-normal">
                {selectedStrategyInfo?.name.split(' ')[0]} vs {comparisonStrategyInfo?.name.split(' ')[0]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={sensitivityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11 }} 
                  className="fill-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                  label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, PARAMETER_LABELS[name as SensitivityParameter]]}
                  labelFormatter={(label) => `Parameter Change: ${label}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => PARAMETER_LABELS[value as SensitivityParameter]}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="5 5" />
                <ReferenceLine x="0%" stroke="hsl(var(--border))" strokeDasharray="5 5" />
                <Line 
                  type="monotone" 
                  dataKey="replacementCost" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  opacity={highlightedParam === 'replacementCost' || !highlightedParam ? 1 : 0.2}
                />
                <Line 
                  type="monotone" 
                  dataKey="maintenanceCost" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  opacity={highlightedParam === 'maintenanceCost' || !highlightedParam ? 1 : 0.2}
                />
                <Line 
                  type="monotone" 
                  dataKey="downtime" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  opacity={highlightedParam === 'downtime' || !highlightedParam ? 1 : 0.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Strategy NPV Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            All Strategies NPV Sensitivity (Replacement Cost)
            <Badge variant="outline" className="text-xs font-normal">
              Lower NPV = Better
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={strategyComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11 }} 
                className="fill-muted-foreground"
                label={{ value: 'Replacement Cost Change', position: 'bottom', offset: -5, fontSize: 11 }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                className="fill-muted-foreground"
                tickFormatter={(v) => `$${v.toFixed(0)}M`}
                label={{ value: 'NPV ($M)', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => {
                  const strategyName = maintenanceStrategies.find(s => s.id === name)?.name.split(' ')[0] || name;
                  return [`$${value.toFixed(2)}M`, strategyName];
                }}
                labelFormatter={(label) => `Replacement Cost: ${label}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value) => maintenanceStrategies.find(s => s.id === value)?.name.split(' ')[0] || value}
              />
              <ReferenceLine x="0%" stroke="hsl(var(--border))" strokeDasharray="5 5" />
              {maintenanceStrategies.map(strategy => (
                <Line 
                  key={strategy.id}
                  type="monotone" 
                  dataKey={strategy.id}
                  stroke={STRATEGY_COLORS[strategy.id as keyof typeof STRATEGY_COLORS]}
                  strokeWidth={strategy.id === selectedStrategy ? 3 : 1.5}
                  dot={{ r: strategy.id === selectedStrategy ? 4 : 2 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray={strategy.id === comparisonStrategy ? '5 5' : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Key Sensitivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {tornadoData.map((item, idx) => (
              <div key={item.parameter} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: idx === 0 ? 'hsl(var(--chart-1))' : 
                                       idx === 1 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))'
                    }}
                  />
                  <span className="font-medium text-sm">{item.parameter}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {idx === 0 ? (
                    <>Most sensitive parameter. Focus procurement efforts on negotiating this cost.</>
                  ) : idx === 1 ? (
                    <>Moderate sensitivity. Consider value engineering opportunities.</>
                  ) : (
                    <>Least sensitive. Already well-managed by the {selectedStrategyInfo?.name.split(' ')[0]} strategy.</>
                  )}
                </p>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Breakeven change: </span>
                  <span className="font-mono font-medium">
                    {baseROI > 0 ? `+${(baseROI / (item.swing / 40) * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
