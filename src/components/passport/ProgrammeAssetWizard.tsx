import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useScenario } from '@/contexts/ScenarioContext';
import { FusionAsset, DegradationHypothesis, MonitoringStrategy } from '@/data/fusionAssets';
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProgrammeAssetWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  'Pre-Construction', 'Governance', 'Construction', 'Supply Chain', 'Organisation',
  'Commissioning', 'Operations', 'Regulatory', 'Decommissioning', 'Financial',
];

const ASSURANCE_STATUSES = ['Concept', 'Design', 'Prototype', 'Qualified', 'Operational'] as const;
const RISK_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;
const LEARNING_PRIORITIES = ['Immediate', 'High', 'Medium', 'Low'] as const;

const STEPS = [
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Evidence & Constraints' },
  { id: 3, label: 'Risk Hypotheses' },
  { id: 4, label: 'Governance Controls' },
  { id: 5, label: 'Scoring & Exposure' },
];

const blankRisk = (): DegradationHypothesis => ({
  mechanism: '', confidence: 'Medium', description: '', knownUnknown: false,
});

const blankControl = (): MonitoringStrategy => ({
  parameter: '', method: '', purpose: '', uncertaintyReduction: '', fallback: '',
});

export const ProgrammeAssetWizard = ({ open, onOpenChange }: ProgrammeAssetWizardProps) => {
  const { activeScenarioId, addAsset } = useScenario();
  const [step, setStep] = useState(1);

  // Step 1: Identity
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Governance');
  const [functionalRole, setFunctionalRole] = useState('');

  // Step 2: Evidence & Constraints
  const [assuranceStatus, setAssuranceStatus] = useState<typeof ASSURANCE_STATUSES[number]>('Design');
  const [confidenceScore, setConfidenceScore] = useState(60);
  const [deliveryMilestones, setDeliveryMilestones] = useState('');
  const [operatingEnvelope, setOperatingEnvelope] = useState('');
  const [dutyCycle, setDutyCycle] = useState('');
  const [designMargins, setDesignMargins] = useState('');
  const [constraints, setConstraints] = useState<string[]>(['']);

  // Step 3: Risk hypotheses
  const [risks, setRisks] = useState<DegradationHypothesis[]>([blankRisk()]);

  // Step 4: Governance controls
  const [controls, setControls] = useState<MonitoringStrategy[]>([blankControl()]);

  // Step 5: Scoring & cost
  const [outcomeUncertainty, setOutcomeUncertainty] = useState(3);
  const [recoverability, setRecoverability] = useState(3);
  const [strategicValue, setStrategicValue] = useState(3);
  const [riskLevel, setRiskLevel] = useState<typeof RISK_LEVELS[number]>('High');
  const [learningPriority, setLearningPriority] = useState<typeof LEARNING_PRIORITIES[number]>('High');
  const [assurancePriority, setAssurancePriority] = useState(3);
  const [replacementCost, setReplacementCost] = useState(200);
  const [leadTime, setLeadTime] = useState(24);
  const [downtimeWeeks, setDowntimeWeeks] = useState(26);
  const [annualMaintCost, setAnnualMaintCost] = useState(15);
  const [investmentJustification, setInvestmentJustification] = useState('');

  const reset = () => {
    setStep(1); setName(''); setCategory('Governance'); setFunctionalRole('');
    setAssuranceStatus('Design'); setConfidenceScore(60); setDeliveryMilestones('');
    setOperatingEnvelope(''); setDutyCycle(''); setDesignMargins(''); setConstraints(['']);
    setRisks([blankRisk()]); setControls([blankControl()]);
    setOutcomeUncertainty(3); setRecoverability(3); setStrategicValue(3);
    setRiskLevel('High'); setLearningPriority('High'); setAssurancePriority(3);
    setReplacementCost(200); setLeadTime(24); setDowntimeWeeks(26); setAnnualMaintCost(15);
    setInvestmentJustification('');
  };

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0 && functionalRole.trim().length > 0;
    if (step === 2) return deliveryMilestones.trim().length > 0;
    if (step === 3) return risks.some(r => r.mechanism.trim().length > 0);
    if (step === 4) return controls.some(c => c.parameter.trim().length > 0);
    return true;
  };

  const handleSubmit = () => {
    const id = `prog-${Date.now()}`;
    const asset: FusionAsset = {
      id, name, category,
      functionalRole,
      operatingEnvelope: operatingEnvelope || deliveryMilestones,
      dutyCycle: dutyCycle || 'Programme-cycle aligned',
      designMargins: designMargins || 'Contingency reserved at programme level',
      constraints: constraints.filter(c => c.trim().length > 0),
      neutronDamageUncertainty: outcomeUncertainty,
      replaceabilityDifficulty: recoverability,
      systemValueImpact: strategicValue,
      maturityLevel: assuranceStatus,
      confidenceScore,
      riskLevel,
      degradationHypotheses: risks.filter(r => r.mechanism.trim().length > 0),
      monitoringStrategy: controls.filter(c => c.parameter.trim().length > 0),
      maintainability: {
        accessConstraints: 'Programme-level intervention via governance / contractual route',
        replacementStrategy: 'Re-baseline via integrated change-control',
        estimatedDuration: `${Math.round(downtimeWeeks / 4)} months typical recovery`,
        remoteHandling: false,
        supplyChainRealism: 'Developing',
      },
      systemValue: {
        availabilityImpact: strategicValue >= 4 ? 'Critical' : strategicValue >= 3 ? 'Major' : 'Moderate',
        flexibilityImpact: strategicValue >= 4 ? 'Major' : 'Moderate',
        outputImpact: deliveryMilestones,
        energySystemLinks: [],
      },
      endOfLife: {
        wasteClassification: 'Programme records archived per governance baseline',
        classificationUncertainty: 'Low',
        coolingPeriod: 'Asset life',
        handlingRequirements: 'Handover to operator / decommissioning entity',
        disposalComplexity: 'Low',
      },
      learningPriority,
      rdInvestmentJustification: investmentJustification || `Targeted intervention on ${name} reduces residual programme risk exposure.`,
      instrumentationPriority: assurancePriority,
      costSchedule: {
        replacementCostMillions: replacementCost,
        leadTimeMonths: leadTime,
        downtimeWeeks,
        annualMaintenanceCostMillions: annualMaintCost,
        sparePartsAvailability: 'Medium',
      },
    };

    addAsset(activeScenarioId, asset);
    toast.success(`Added programme element: ${name}`, {
      description: `Now visible in passport list, matrix and analytics for scenario.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            New Programme Element — Evidence Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step === s.id ? 'text-primary font-semibold' : step > s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === s.id ? 'bg-primary text-primary-foreground' : step > s.id ? 'bg-status-nominal text-white' : 'bg-muted-foreground/30'}`}>
                  {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                </div>
                <span className="text-xs whitespace-nowrap">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        <div className="space-y-4 py-2">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Identify the programme element. Treat it as a managed lifecycle asset — not a task on a Gantt chart.</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Element name *"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Long-Lead Forging Procurement" /></Field>
                <Field label="Category">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Functional role in the programme *">
                <Textarea value={functionalRole} onChange={(e) => setFunctionalRole(e.target.value)} placeholder="What this element delivers, and why losing it threatens programme outcomes." rows={3} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Capture the current evidence base. The model uses this to weight confidence in downstream analytics.</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Assurance status">
                  <Select value={assuranceStatus} onValueChange={(v) => setAssuranceStatus(v as typeof ASSURANCE_STATUSES[number])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ASSURANCE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label={`Evidence confidence: ${confidenceScore}%`}>
                  <Slider value={[confidenceScore]} onValueChange={([v]) => setConfidenceScore(v)} min={0} max={100} step={5} />
                </Field>
              </div>
              <Field label="Delivery milestones *">
                <Textarea value={deliveryMilestones} onChange={(e) => setDeliveryMilestones(e.target.value)} placeholder="Gated milestones (FID, GDA decision, first concrete, fuel load, COD, LTO sanction…)." rows={2} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Operating envelope"><Textarea value={operatingEnvelope} onChange={(e) => setOperatingEnvelope(e.target.value)} placeholder="Scope, duration, parties involved." rows={2} /></Field>
                <Field label="Duty cycle"><Textarea value={dutyCycle} onChange={(e) => setDutyCycle(e.target.value)} placeholder="When and how often this element is active or stressed." rows={2} /></Field>
              </div>
              <Field label="Design margins / contingency posture"><Input value={designMargins} onChange={(e) => setDesignMargins(e.target.value)} placeholder="What contingency or fallback is held against this element?" /></Field>
              <Field label="Constraints">
                <div className="space-y-2">
                  {constraints.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={c} onChange={(e) => { const next = [...constraints]; next[i] = e.target.value; setConstraints(next); }} placeholder="e.g. Regulator pace cannot be compressed" />
                      <Button variant="ghost" size="icon" onClick={() => setConstraints(constraints.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setConstraints([...constraints, ''])}><Plus className="w-4 h-4 mr-1" /> Add constraint</Button>
                </div>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">List the credible threats to delivery. Mark anything where the mechanism itself is uncertain as a known-unknown.</p>
              {risks.map((r, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Input value={r.mechanism} onChange={(e) => { const next = [...risks]; next[i] = { ...r, mechanism: e.target.value }; setRisks(next); }} placeholder="Risk mechanism (e.g. Capex overrun erodes equity returns)" />
                    <Select value={r.confidence} onValueChange={(v) => { const next = [...risks]; next[i] = { ...r, confidence: v as DegradationHypothesis['confidence'] }; setRisks(next); }}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['High', 'Medium', 'Low', 'Unknown'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => setRisks(risks.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <Textarea value={r.description} onChange={(e) => { const next = [...risks]; next[i] = { ...r, description: e.target.value }; setRisks(next); }} placeholder="How this would manifest and why it matters" rows={2} />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={r.knownUnknown} onChange={(e) => { const next = [...risks]; next[i] = { ...r, knownUnknown: e.target.checked }; setRisks(next); }} />
                    Mark as known-unknown (mechanism itself uncertain)
                  </label>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setRisks([...risks, blankRisk()])}><Plus className="w-4 h-4 mr-1" /> Add risk</Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Define the governance, assurance and early-warning controls in place — these reduce the residual risk used in the cost-benefit model.</p>
              {controls.map((c, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between gap-2">
                    <Input value={c.parameter} onChange={(e) => { const next = [...controls]; next[i] = { ...c, parameter: e.target.value }; setControls(next); }} placeholder="What is being monitored / assured (e.g. CPI/SPI, NCR rate, stakeholder sentiment)" />
                    <Button variant="ghost" size="icon" onClick={() => setControls(controls.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={c.method} onChange={(e) => { const next = [...controls]; next[i] = { ...c, method: e.target.value }; setControls(next); }} placeholder="Method / cadence" />
                    <Input value={c.purpose} onChange={(e) => { const next = [...controls]; next[i] = { ...c, purpose: e.target.value }; setControls(next); }} placeholder="Decision this informs" />
                    <Input value={c.uncertaintyReduction} onChange={(e) => { const next = [...controls]; next[i] = { ...c, uncertaintyReduction: e.target.value }; setControls(next); }} placeholder="Uncertainty reduction" />
                    <Input value={c.fallback} onChange={(e) => { const next = [...controls]; next[i] = { ...c, fallback: e.target.value }; setControls(next); }} placeholder="Fallback if signal missed" />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setControls([...controls, blankControl()])}><Plus className="w-4 h-4 mr-1" /> Add control</Button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Score the element and its programme exposure. Used directly by the criticality matrix and the programme cost-benefit model.</p>
              <div className="grid grid-cols-3 gap-4">
                <ScoreSlider label="Outcome uncertainty" value={outcomeUncertainty} setValue={setOutcomeUncertainty} />
                <ScoreSlider label="Recoverability difficulty" value={recoverability} setValue={setRecoverability} />
                <ScoreSlider label="Strategic value impact" value={strategicValue} setValue={setStrategicValue} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Overall risk level">
                  <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as typeof RISK_LEVELS[number])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RISK_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Learning priority">
                  <Select value={learningPriority} onValueChange={(v) => setLearningPriority(v as typeof LEARNING_PRIORITIES[number])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEARNING_PRIORITIES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <ScoreSlider label="Assurance priority" value={assurancePriority} setValue={setAssurancePriority} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={`Programme exposure (£M): ${replacementCost}`}><Slider value={[replacementCost]} onValueChange={([v]) => setReplacementCost(v)} min={5} max={5000} step={5} /></Field>
                <Field label={`Lead time (months): ${leadTime}`}><Slider value={[leadTime]} onValueChange={([v]) => setLeadTime(v)} min={1} max={120} step={1} /></Field>
                <Field label={`Recovery (weeks): ${downtimeWeeks}`}><Slider value={[downtimeWeeks]} onValueChange={([v]) => setDowntimeWeeks(v)} min={0} max={260} step={1} /></Field>
                <Field label={`Annual governance / assurance (£M): ${annualMaintCost}`}><Slider value={[annualMaintCost]} onValueChange={([v]) => setAnnualMaintCost(v)} min={0} max={200} step={1} /></Field>
              </div>
              <Field label="Investment / intervention justification"><Textarea value={investmentJustification} onChange={(e) => setInvestmentJustification(e.target.value)} placeholder="Why investing in this element has highest leverage on programme outcomes." rows={2} /></Field>

              <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{category}</Badge>
                  <Badge variant="outline">{assuranceStatus}</Badge>
                  <Badge variant="outline">{riskLevel} risk</Badge>
                  <Badge variant="outline">{risks.filter(r => r.mechanism.trim()).length} risks</Badge>
                  <Badge variant="outline">{controls.filter(c => c.parameter.trim()).length} controls</Badge>
                  <Badge variant="outline">£{replacementCost}M exposure</Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</div>
          {step < STEPS.length ? (
            <Button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}><Check className="w-4 h-4 mr-1" /> Add programme element</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const ScoreSlider = ({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) => (
  <Field label={`${label}: ${value}/5`}>
    <Slider value={[value]} onValueChange={([v]) => setValue(v)} min={1} max={5} step={1} />
  </Field>
);
