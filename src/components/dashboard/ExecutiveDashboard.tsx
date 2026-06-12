import { MetricCard } from './MetricCard';
import { RiskOverview } from './RiskOverview';
import { MaturityTimeline } from './MaturityTimeline';
import { AssetSummaryTable } from './AssetSummaryTable';
import { useScenario } from '@/contexts/ScenarioContext';
import { usePlant } from '@/contexts/PlantContext';
import { Atom, AlertTriangle, Target, Zap } from 'lucide-react';

interface ExecutiveDashboardProps {
  onSelectAsset: (assetId: string) => void;
}

export const ExecutiveDashboard = ({ onSelectAsset }: ExecutiveDashboardProps) => {
  const { getActiveAssets } = useScenario();
  const { terminology } = usePlant();
  const assets = getActiveAssets();

  const criticalCount = assets.filter(a => a.riskLevel === 'Critical').length;
  const avgConfidence = assets.length
    ? Math.round(assets.reduce((sum, a) => sum + a.confidenceScore, 0) / assets.length)
    : 0;
  const immediateActions = assets.filter(a => a.learningPriority === 'Immediate' || a.learningPriority === 'High').length;

  const dotClass: Record<'critical' | 'warning' | 'nominal', string> = {
    critical: 'bg-status-critical',
    warning: 'bg-status-warning',
    nominal: 'bg-status-nominal',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-3">{terminology.dashboardHeroTitle}</h2>
          <p className="text-primary-foreground/80 leading-relaxed">
            {terminology.dashboardHeroSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Assets" value={assets.length} subtitle="Under lifecycle management" icon={<Atom className="w-6 h-6" />} />
        <MetricCard title="Critical Risk" value={criticalCount} subtitle="Require immediate attention" variant="critical" icon={<AlertTriangle className="w-6 h-6" />} />
        <MetricCard title="Average Confidence" value={`${avgConfidence}%`} subtitle="Across all assets" trend="up" trendValue="+5% vs baseline" icon={<Target className="w-6 h-6" />} />
        <MetricCard title="Priority Actions" value={immediateActions} subtitle="Immediate / High learning items" variant="warning" icon={<Zap className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskOverview />
        <MaturityTimeline />
        <div className="flp-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Value of Information</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Monitoring ROI</span>
                <span className="font-medium text-foreground">High</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Instrumentation investment reduces lifecycle uncertainty by up to 40%
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">R&D Leverage</span>
                <span className="font-medium text-foreground">3.2x</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Early learning multiplier for deployment decisions
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Design Lock-in Risk</span>
                <span className="font-medium text-status-warning">Medium</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Components approaching irreversible decision points with high uncertainty
              </p>
            </div>
          </div>
        </div>
      </div>

      <AssetSummaryTable onSelectAsset={onSelectAsset} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flp-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Key Decision Points</h3>
          <div className="space-y-3">
            {terminology.decisionPoints.map((decision, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{decision.title}</p>
                  <p className="text-xs text-muted-foreground">{decision.timeline}</p>
                </div>
                <span className={`flp-badge ${
                  decision.status === 'Active' ? 'flp-badge-warning' :
                  decision.status === 'Pending' ? 'flp-badge-info' : 'flp-badge-nominal'
                }`}>
                  {decision.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flp-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Connected System Impacts</h3>
          <div className="space-y-3">
            {terminology.systemImpacts.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${dotClass[item.level]}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
