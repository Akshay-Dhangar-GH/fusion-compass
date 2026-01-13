import { fusionAssets } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

export const DecisionAnalytics = () => {
  const prioritizedAssets = [...fusionAssets].sort((a, b) => {
    // Priority score: higher uncertainty + harder to replace = higher priority
    const scoreA = a.neutronDamageUncertainty + a.replaceabilityDifficulty + a.systemValueImpact;
    const scoreB = b.neutronDamageUncertainty + b.replaceabilityDifficulty + b.systemValueImpact;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Decision Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Evidence-based decision support for lifecycle management and R&D investment
        </p>
      </div>

      {/* Analytics Approach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flp-card p-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Physics-Informed Models</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Degradation models grounded in materials science and plasma physics, 
            calibrated with experimental data where available.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Neutron damage accumulation
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Thermal fatigue cycling
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Erosion rate estimation
            </li>
          </ul>
        </div>

        <div className="flp-card p-6">
          <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-teal" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Probabilistic Methods</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bayesian updating of uncertainty as operational data becomes available, 
            explicit quantification of knowledge gaps.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Prior/posterior uncertainty tracking
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Value of information analysis
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Decision tree modelling
            </li>
          </ul>
        </div>

        <div className="flp-card p-6">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6 text-gold" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Explainable ML</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Simple, interpretable machine learning for pattern recognition in monitoring 
            data, with clear uncertainty quantification.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Anomaly detection
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Trend extrapolation
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-4 h-4 text-status-nominal" />
              Confidence intervals
            </li>
          </ul>
        </div>
      </div>

      {/* FLP Decision Support */}
      <div className="flp-card p-6">
        <h3 className="font-semibold text-foreground mb-6">How the FLP Supports Decisions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Monitoring Spend',
              description: 'Prioritise instrumentation investment where uncertainty reduction has highest value',
              metric: 'Up to 40%',
              metricLabel: 'uncertainty reduction',
            },
            {
              title: 'Design Changes',
              description: 'Justify conservatism or innovation based on quantified lifecycle risk',
              metric: '3.2x',
              metricLabel: 'ROI on early decisions',
            },
            {
              title: 'Learning Sequence',
              description: 'Optimal ordering of R&D activities across FOAK deployment phases',
              metric: '18 mo',
              metricLabel: 'potential acceleration',
            },
            {
              title: 'Lifecycle Cost',
              description: 'Reduce total cost of ownership through informed maintenance planning',
              metric: '15-25%',
              metricLabel: 'cost avoidance potential',
            },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <div className="pt-3 border-t border-border">
                <p className="text-2xl font-bold text-primary">{item.metric}</p>
                <p className="text-xs text-muted-foreground">{item.metricLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Ranking */}
      <div className="flp-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Investment Priority Ranking</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Assets ranked by combined criticality score (neutron uncertainty + replaceability + system value)
        </p>
        <div className="space-y-3">
          {prioritizedAssets.slice(0, 5).map((asset, index) => {
            const score = asset.neutronDamageUncertainty + asset.replaceabilityDifficulty + asset.systemValueImpact;
            const maxScore = 15;
            const percentage = (score / maxScore) * 100;

            return (
              <div key={asset.id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{asset.name}</span>
                    <span className="text-sm text-muted-foreground">{score}/15</span>
                  </div>
                  <div className="flp-progress-bar">
                    <div 
                      className={cn(
                        'h-full rounded-full',
                        percentage >= 80 ? 'bg-status-critical' :
                        percentage >= 60 ? 'bg-status-warning' :
                        'bg-status-nominal'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-24">
                  <span className={cn(
                    'flp-badge',
                    asset.learningPriority === 'Immediate' ? 'flp-badge-critical' :
                    asset.learningPriority === 'High' ? 'flp-badge-warning' :
                    'flp-badge-info'
                  )}>
                    {asset.learningPriority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uncertainty Reduction Roadmap */}
      <div className="flp-card p-6">
        <h3 className="font-semibold text-foreground mb-6">Uncertainty Reduction Roadmap</h3>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-8">
            {[
              {
                phase: 'Phase 1: Design Stage',
                timeline: '2024-2026',
                actions: [
                  'Establish baseline uncertainty for all FLP components',
                  'Prioritise R&D investment based on criticality matrix',
                  'Define monitoring strategy requirements',
                ],
                status: 'active',
              },
              {
                phase: 'Phase 2: Construction',
                timeline: '2026-2030',
                actions: [
                  'Validate manufacturing assumptions',
                  'Commission instrumentation systems',
                  'Update degradation models with as-built data',
                ],
                status: 'upcoming',
              },
              {
                phase: 'Phase 3: Commissioning',
                timeline: '2030-2032',
                actions: [
                  'Initial operational data collection',
                  'Bayesian updating of lifetime predictions',
                  'First maintenance planning refinement',
                ],
                status: 'upcoming',
              },
              {
                phase: 'Phase 4: Operations',
                timeline: '2032+',
                actions: [
                  'Continuous monitoring and model refinement',
                  'Fleet learning across FOAK deployments',
                  'Predictive maintenance optimisation',
                ],
                status: 'upcoming',
              },
            ].map((phase, i) => (
              <div key={i} className="relative pl-16">
                <div className={cn(
                  'absolute left-4 w-4 h-4 rounded-full border-2',
                  phase.status === 'active' 
                    ? 'bg-primary border-primary' 
                    : 'bg-card border-border'
                )} />
                
                <div className={cn(
                  'p-4 rounded-lg',
                  phase.status === 'active' ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-foreground">{phase.phase}</h4>
                    <span className="text-sm text-muted-foreground">{phase.timeline}</span>
                    {phase.status === 'active' && (
                      <span className="flp-badge flp-badge-nominal">Current</span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {phase.actions.map((action, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
