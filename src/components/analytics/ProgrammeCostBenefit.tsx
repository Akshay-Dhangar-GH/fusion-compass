import { useMemo, useState } from 'react';
import { useScenario } from '@/contexts/ScenarioContext';
import { usePlant } from '@/contexts/PlantContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Briefcase,
} from 'lucide-react';

/**
 * Programme-level cost-benefit / ROI model.
 *
 * Calculates the lifecycle value of four programme intervention postures:
 *   1. Minimal Governance (baseline)
 *   2. Standard Assurance
 *   3. Enhanced Resilience
 *   4. Integrated Programme Excellence
 *
 * Each posture has:
 *   - A governance overhead multiplier applied to a baseline programme governance cost
 *   - A disruption-probability reduction factor applied per programme element
 *   - A schedule-slip reduction factor (translates to deferred revenue)
 *
 * Disruption value = avoided expected loss from delivery / outcome failure per element
 *   per-element expected loss = outcomeUncertainty/5 * recoverability/5 * elementExposure (£M)
 *
 * Net programme value (NPV) = avoided disruption + accelerated revenue – governance overhead
 * ROI = (Net value – governance overhead) / governance overhead
 */

interface ProgrammePosture {
  id: string;
  name: string;
  description: string;
  governanceMultiplier: number;   // x baseline annual governance spend
  disruptionReduction: number;    // 0-1 reduction of expected disruption loss
  scheduleSlipReduction: number;  // 0-1 reduction of schedule-slip months
}

const POSTURES: ProgrammePosture[] = [
  {
    id: 'minimal',
    name: 'Minimal Governance',
    description: 'Compliance-only assurance; risks managed reactively as they emerge.',
    governanceMultiplier: 0.4,
    disruptionReduction: 0.0,
    scheduleSlipReduction: 0.0,
  },
  {
    id: 'standard',
    name: 'Standard Assurance',
    description: 'Three-lines-of-defence, periodic independent review, structured risk register.',
    governanceMultiplier: 1.0,
    disruptionReduction: 0.35,
    scheduleSlipReduction: 0.25,
  },
  {
    id: 'enhanced',
    name: 'Enhanced Resilience',
    description: 'Active resilience investment: dual sourcing, surge workforce, early-warning controls.',
    governanceMultiplier: 1.6,
    disruptionReduction: 0.6,
    scheduleSlipReduction: 0.45,
  },
  {
    id: 'excellence',
    name: 'Integrated Programme Excellence',
    description: 'Living safety case, integrated digital assurance, continuous regulator and lender engagement.',
    governanceMultiplier: 2.2,
    disruptionReduction: 0.78,
    scheduleSlipReduction: 0.6,
  },
];

const npv = (annual: number, years: number, rate: number) => {
  if (rate === 0) return annual * years;
  const r = rate / 100;
  return annual * ((1 - Math.pow(1 + r, -years)) / r);
};

export const ProgrammeCostBenefit = () => {
  const { getActiveAssets } = useScenario();
  const { terminology } = usePlant();
  const assets = getActiveAssets();

  // Programme inputs
  const [programmeCapex, setProgrammeCapex] = useState(8000);       // £M total programme capex
  const [plannedSchedule, setPlannedSchedule] = useState(10);       // years construction
  const [expectedSlipMonths, setExpectedSlipMonths] = useState(18); // baseline expected slip
  const [governanceBaseline, setGovernanceBaseline] = useState(80); // £M/yr baseline governance/assurance spend at Standard
  const [planningHorizon, setPlanningHorizon] = useState(40);       // years post-COD
  const [discountRate, setDiscountRate] = useState(7);              // %
  const [annualRevenue, setAnnualRevenue] = useState(900);          // £M/yr at COD
  const [disruptionExposureFactor, setDisruptionExposureFactor] = useState(40); // £M per element-unit

  // Aggregate programme-element risk (sum across the active programme asset set)
  const programmeRisk = useMemo(() => {
    // Expected disruption loss before mitigation
    // per element = outcomeUncertainty/5 * recoverability/5 * disruptionExposureFactor * scaling
    let expectedLoss = 0;
    let weightedExposure = 0;
    assets.forEach(a => {
      const u = a.neutronDamageUncertainty / 5;
      const r = a.replaceabilityDifficulty / 5;
      const v = a.systemValueImpact / 5;
      expectedLoss += u * r * v * disruptionExposureFactor;
      weightedExposure += v * disruptionExposureFactor;
    });
    return { expectedLoss, weightedExposure };
  }, [assets, disruptionExposureFactor]);

  const postureAnalysis = useMemo(() => {
    return POSTURES.map(posture => {
      // Avoided expected disruption loss (£M, one-shot over construction + early operations)
      const avoidedDisruption = programmeRisk.expectedLoss * posture.disruptionReduction;

      // Accelerated revenue from reduced schedule slip
      const slipMonthsAvoided = expectedSlipMonths * posture.scheduleSlipReduction;
      const acceleratedRevenue = (annualRevenue / 12) * slipMonthsAvoided;

      // Governance overhead — annual, NPV'd over construction + operations
      const annualGovernance = governanceBaseline * posture.governanceMultiplier;
      const governanceYears = plannedSchedule + planningHorizon;
      const governanceNPV = npv(annualGovernance, governanceYears, discountRate);

      // Programme-life value of risk reduction (treated as lump-sum at COD, discounted to today)
      const discountToCOD = Math.pow(1 + discountRate / 100, -plannedSchedule);
      const benefitPV = (avoidedDisruption + acceleratedRevenue) * discountToCOD;

      const netValue = benefitPV - governanceNPV;
      const roi = governanceNPV > 0 ? (netValue / governanceNPV) * 100 : 0;
      const capexRiskExposure = programmeCapex * (programmeRisk.expectedLoss / Math.max(programmeRisk.weightedExposure, 1));
      const residualExposure = capexRiskExposure * (1 - posture.disruptionReduction);

      return {
        posture,
        annualGovernance,
        governanceNPV,
        avoidedDisruption,
        acceleratedRevenue,
        benefitPV,
        netValue,
        roi,
        residualExposure,
        slipMonthsAvoided,
      };
    });
  }, [
    programmeRisk, expectedSlipMonths, annualRevenue, governanceBaseline,
    plannedSchedule, planningHorizon, discountRate, programmeCapex,
  ]);

  const bestPosture = useMemo(
    () => postureAnalysis.reduce((best, p) => (p.netValue > best.netValue ? p : best), postureAnalysis[0]),
    [postureAnalysis],
  );

  const chartData = postureAnalysis.map(p => ({
    name: p.posture.name.split(' ')[0],
    'Avoided Disruption': Math.round(p.avoidedDisruption),
    'Accelerated Revenue': Math.round(p.acceleratedRevenue),
    'Governance NPV': -Math.round(p.governanceNPV),
    'Net Value': Math.round(p.netValue),
  }));

  const radarData = [
    { metric: 'Governance Cost', Minimal: 95, Standard: 70, Enhanced: 45, Excellence: 25 },
    { metric: 'Disruption Resilience', Minimal: 10, Standard: 45, Enhanced: 70, Excellence: 90 },
    { metric: 'Schedule Confidence', Minimal: 15, Standard: 50, Enhanced: 70, Excellence: 88 },
    { metric: 'Lender Confidence', Minimal: 20, Standard: 60, Enhanced: 80, Excellence: 95 },
    { metric: 'Regulator Confidence', Minimal: 30, Standard: 65, Enhanced: 80, Excellence: 95 },
  ];

  if (assets.length === 0) {
    return (
      <div className="flp-card p-8 text-center">
        <p className="text-muted-foreground">No programme elements available. Add elements via the Asset Passports wizard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flp-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Programme Cost-Benefit & ROI
            </h2>
            <p className="text-muted-foreground mt-1">
              {terminology.costBenefitSubtitle}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">ISO 55000 + ISO 31000</Badge>
        </div>
      </div>

      {/* Programme inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Programme Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SliderInput label="Programme Capex" value={programmeCapex} setValue={setProgrammeCapex} min={1000} max={30000} step={500} unit="£M" />
            <SliderInput label="Planned Schedule" value={plannedSchedule} setValue={setPlannedSchedule} min={4} max={15} step={1} unit="yrs" />
            <SliderInput label="Baseline Expected Slip" value={expectedSlipMonths} setValue={setExpectedSlipMonths} min={0} max={60} step={3} unit="mo" />
            <SliderInput label="Annual Governance @ Standard" value={governanceBaseline} setValue={setGovernanceBaseline} min={10} max={300} step={10} unit="£M/yr" />
            <SliderInput label="Planning Horizon (post-COD)" value={planningHorizon} setValue={setPlanningHorizon} min={10} max={60} step={5} unit="yrs" />
            <SliderInput label="Discount Rate" value={discountRate} setValue={setDiscountRate} min={1} max={15} step={0.5} unit="%" />
            <SliderInput label="Annual Revenue (post-COD)" value={annualRevenue} setValue={setAnnualRevenue} min={100} max={3000} step={50} unit="£M/yr" />
            <SliderInput label="Disruption Exposure per Element" value={disruptionExposureFactor} setValue={setDisruptionExposureFactor} min={5} max={200} step={5} unit="£M" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="postures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="postures">Intervention Postures</TabsTrigger>
          <TabsTrigger value="value">Value Stack</TabsTrigger>
          <TabsTrigger value="radar">Posture Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="postures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {postureAnalysis.map(a => {
              const isBest = a.posture.id === bestPosture.posture.id;
              return (
                <Card key={a.posture.id} className={cn('relative overflow-hidden', isBest && 'ring-2 ring-primary')}>
                  {isBest && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground text-xs">Highest Net Value</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      {a.posture.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.posture.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Row icon={<DollarSign className="w-3 h-3" />} label="Annual Governance" value={`£${a.annualGovernance.toFixed(0)}M`} />
                    <Row icon={<DollarSign className="w-3 h-3" />} label="Governance NPV" value={`£${a.governanceNPV.toFixed(0)}M`} />
                    <Row icon={<ShieldCheck className="w-3 h-3" />} label="Avoided Disruption (PV)" value={`£${a.avoidedDisruption.toFixed(0)}M`} positive />
                    <Row icon={<TrendingUp className="w-3 h-3" />} label="Accelerated Revenue (PV)" value={`£${a.acceleratedRevenue.toFixed(0)}M`} positive />
                    <Row icon={<AlertTriangle className="w-3 h-3" />} label="Residual Capex Exposure" value={`£${a.residualExposure.toFixed(0)}M`} />
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Net Programme Value</span>
                        <span className={cn('text-sm font-bold', a.netValue >= 0 ? 'text-status-nominal' : 'text-status-critical')}>
                          £{a.netValue.toFixed(0)}M
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium">ROI on Governance Spend</span>
                        <span className={cn('text-sm font-bold', a.roi >= 0 ? 'text-status-nominal' : 'text-status-critical')}>
                          {a.roi.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Programme Risk Context (from active programme elements)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Elements assessed</p>
                <p className="font-semibold">{assets.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aggregate expected disruption loss</p>
                <p className="font-semibold">£{programmeRisk.expectedLoss.toFixed(0)}M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Programme capex at risk</p>
                <p className="font-semibold">£{(programmeCapex * (programmeRisk.expectedLoss / Math.max(programmeRisk.weightedExposure, 1))).toFixed(0)}M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best-posture slip avoided</p>
                <p className="font-semibold">{bestPosture.slipMonthsAvoided.toFixed(1)} months</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lifecycle Value Stack by Posture (£M, present value)</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Avoided Disruption" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="Accelerated Revenue" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="Governance NPV" stackId="a" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="Net Value" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Posture Profile</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Minimal" dataKey="Minimal" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} />
                  <Radar name="Standard" dataKey="Standard" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                  <Radar name="Enhanced" dataKey="Enhanced" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} />
                  <Radar name="Excellence" dataKey="Excellence" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SliderInput = ({
  label, value, setValue, min, max, step, unit,
}: { label: string; value: number; setValue: (n: number) => void; min: number; max: number; step: number; unit: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground">{label}</label>
      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{value}{unit ? ` ${unit}` : ''}</span>
    </div>
    <Slider value={[value]} onValueChange={([v]) => setValue(v)} min={min} max={max} step={step} />
  </div>
);

const Row = ({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground flex items-center gap-1">{icon}{label}</span>
    <span className={cn('text-sm font-semibold', positive && 'text-status-nominal')}>{value}</span>
  </div>
);
