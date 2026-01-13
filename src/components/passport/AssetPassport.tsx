import { FusionAsset } from '@/data/fusionAssets';
import { PassportSection } from './PassportSection';
import { cn } from '@/lib/utils';
import { 
  Fingerprint, 
  Activity, 
  Eye, 
  Wrench, 
  Zap, 
  Trash2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetPassportProps {
  asset: FusionAsset;
  onBack: () => void;
}

const confidenceColors = {
  High: 'bg-status-nominal text-status-nominal',
  Medium: 'bg-status-caution text-status-caution',
  Low: 'bg-status-warning text-status-warning',
  Unknown: 'bg-muted-foreground text-muted-foreground',
};

const riskColors = {
  Critical: 'bg-status-critical/10 text-status-critical border-status-critical/30',
  High: 'bg-status-warning/10 text-status-warning border-status-warning/30',
  Medium: 'bg-status-caution/10 text-status-caution border-status-caution/30',
  Low: 'bg-status-nominal/10 text-status-nominal border-status-nominal/30',
};

export const AssetPassport = ({ asset, onBack }: AssetPassportProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{asset.category}</p>
              <h2 className="text-2xl font-bold text-foreground">{asset.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{asset.id}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                'px-4 py-2 rounded-lg border font-medium',
                riskColors[asset.riskLevel]
              )}>
                {asset.riskLevel} Risk
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-foreground">{asset.confidenceScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flp-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Maturity</p>
          <p className="font-semibold text-foreground">{asset.maturityLevel}</p>
        </div>
        <div className="flp-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Neutron Uncertainty</p>
          <p className="font-semibold text-foreground">{asset.neutronDamageUncertainty}/5</p>
        </div>
        <div className="flp-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Replaceability</p>
          <p className="font-semibold text-foreground">{asset.replaceabilityDifficulty}/5</p>
        </div>
        <div className="flp-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Learning Priority</p>
          <p className={cn(
            'font-semibold',
            asset.learningPriority === 'Immediate' ? 'text-status-critical' :
            asset.learningPriority === 'High' ? 'text-status-warning' :
            'text-muted-foreground'
          )}>{asset.learningPriority}</p>
        </div>
      </div>

      {/* Passport Sections */}
      <div className="space-y-4">
        {/* Asset Identity & Design Intent */}
        <PassportSection 
          title="Asset Identity & Design Intent" 
          icon={<Fingerprint className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Functional Role</p>
              <p className="text-foreground">{asset.functionalRole}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Operating Envelope</p>
                <p className="text-sm text-foreground">{asset.operatingEnvelope}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Duty Cycle</p>
                <p className="text-sm text-foreground">{asset.dutyCycle}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Design Margins</p>
              <p className="text-sm text-foreground">{asset.designMargins}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Constraints</p>
              <ul className="space-y-1">
                {asset.constraints.map((constraint, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PassportSection>

        {/* Degradation & Failure Hypotheses */}
        <PassportSection 
          title="Degradation & Failure Hypotheses" 
          icon={<Activity className="w-4 h-4" />}
          badge={
            <span className="text-xs text-muted-foreground">
              {asset.degradationHypotheses.length} mechanisms identified
            </span>
          }
        >
          <div className="space-y-4">
            {asset.degradationHypotheses.map((hypothesis, i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{hypothesis.mechanism}</span>
                    {hypothesis.knownUnknown && (
                      <span className="flp-badge flp-badge-warning">Known Unknown</span>
                    )}
                  </div>
                  <span className={cn(
                    'flp-badge',
                    hypothesis.confidence === 'High' ? 'flp-badge-nominal' :
                    hypothesis.confidence === 'Medium' ? 'flp-badge-warning' :
                    hypothesis.confidence === 'Low' ? 'flp-badge-critical' :
                    'flp-badge-info'
                  )}>
                    {hypothesis.confidence} Confidence
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{hypothesis.description}</p>
              </div>
            ))}
          </div>
        </PassportSection>

        {/* Monitoring & Observability Strategy */}
        <PassportSection 
          title="Monitoring & Observability Strategy" 
          icon={<Eye className="w-4 h-4" />}
        >
          <div className="space-y-4">
            {asset.monitoringStrategy.map((strategy, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b border-border">
                  <span className="font-medium text-foreground">{strategy.parameter}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Method</p>
                      <p className="text-sm text-foreground">{strategy.method}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Purpose</p>
                      <p className="text-sm text-foreground">{strategy.purpose}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Uncertainty Reduction</p>
                    <p className="text-sm text-status-nominal">{strategy.uncertaintyReduction}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fallback if Unavailable</p>
                    <p className="text-sm text-foreground">{strategy.fallback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PassportSection>

        {/* Maintainability & Replaceability */}
        <PassportSection 
          title="Maintainability & Replaceability" 
          icon={<Wrench className="w-4 h-4" />}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Access Constraints</p>
                <p className="text-foreground">{asset.maintainability.accessConstraints}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Replacement Strategy</p>
                <p className="text-foreground">{asset.maintainability.replacementStrategy}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Estimated Duration</p>
                <p className="text-foreground">{asset.maintainability.estimatedDuration}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Remote Handling</p>
                  <span className={cn(
                    'flp-badge',
                    asset.maintainability.remoteHandling ? 'flp-badge-warning' : 'flp-badge-nominal'
                  )}>
                    {asset.maintainability.remoteHandling ? 'Required' : 'Not Required'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Supply Chain</p>
                  <span className={cn(
                    'flp-badge',
                    asset.maintainability.supplyChainRealism === 'Proven' ? 'flp-badge-nominal' :
                    asset.maintainability.supplyChainRealism === 'Developing' ? 'flp-badge-warning' :
                    'flp-badge-critical'
                  )}>
                    {asset.maintainability.supplyChainRealism}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PassportSection>

        {/* System Value Dependency */}
        <PassportSection 
          title="System Value Dependency" 
          icon={<Zap className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Availability Impact</p>
                <span className={cn(
                  'flp-badge',
                  asset.systemValue.availabilityImpact === 'Critical' ? 'flp-badge-critical' :
                  asset.systemValue.availabilityImpact === 'Major' ? 'flp-badge-warning' :
                  'flp-badge-nominal'
                )}>
                  {asset.systemValue.availabilityImpact}
                </span>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Flexibility Impact</p>
                <span className={cn(
                  'flp-badge',
                  asset.systemValue.flexibilityImpact === 'Critical' ? 'flp-badge-critical' :
                  asset.systemValue.flexibilityImpact === 'Major' ? 'flp-badge-warning' :
                  'flp-badge-nominal'
                )}>
                  {asset.systemValue.flexibilityImpact}
                </span>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">System Value Score</p>
                <span className="text-xl font-bold text-foreground">{asset.systemValueImpact}/5</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Output Impact</p>
              <p className="text-foreground">{asset.systemValue.outputImpact}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Energy System Links</p>
              <ul className="space-y-1">
                {asset.systemValue.energySystemLinks.map((link, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PassportSection>

        {/* End-of-Life & Decommissioning */}
        <PassportSection 
          title="End-of-Life & Decommissioning Assumptions" 
          icon={<Trash2 className="w-4 h-4" />}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Waste Classification</p>
                <p className="text-foreground">{asset.endOfLife.wasteClassification}</p>
                <span className={cn(
                  'flp-badge mt-2',
                  asset.endOfLife.classificationUncertainty === 'Low' ? 'flp-badge-nominal' :
                  asset.endOfLife.classificationUncertainty === 'Medium' ? 'flp-badge-warning' :
                  'flp-badge-critical'
                )}>
                  {asset.endOfLife.classificationUncertainty} Classification Uncertainty
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cooling Period</p>
                <p className="text-foreground">{asset.endOfLife.coolingPeriod}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Handling Requirements</p>
                <p className="text-foreground">{asset.endOfLife.handlingRequirements}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Disposal Complexity</p>
                <span className={cn(
                  'flp-badge',
                  asset.endOfLife.disposalComplexity === 'Low' ? 'flp-badge-nominal' :
                  asset.endOfLife.disposalComplexity === 'Medium' ? 'flp-badge-warning' :
                  asset.endOfLife.disposalComplexity === 'High' ? 'flp-badge-critical' :
                  'flp-badge-critical'
                )}>
                  {asset.endOfLife.disposalComplexity}
                </span>
              </div>
            </div>
          </div>
        </PassportSection>

        {/* R&D Investment Justification */}
        <div className="flp-card p-6 border-l-4 border-l-teal">
          <h3 className="font-semibold text-foreground mb-2">R&D Investment Justification</h3>
          <p className="text-muted-foreground">{asset.rdInvestmentJustification}</p>
          <div className="mt-4 flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Instrumentation Priority</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'w-6 h-2 rounded-full',
                      level <= asset.instrumentationPriority ? 'bg-teal' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
