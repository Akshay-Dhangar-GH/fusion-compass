import { MetricCard } from './MetricCard';
import { RiskOverview } from './RiskOverview';
import { MaturityTimeline } from './MaturityTimeline';
import { AssetSummaryTable } from './AssetSummaryTable';
import { fusionAssets } from '@/data/fusionAssets';
import { Atom, AlertTriangle, Target, Activity, TrendingUp, Zap } from 'lucide-react';

interface ExecutiveDashboardProps {
  onSelectAsset: (assetId: string) => void;
}

export const ExecutiveDashboard = ({ onSelectAsset }: ExecutiveDashboardProps) => {
  const criticalCount = fusionAssets.filter(a => a.riskLevel === 'Critical').length;
  const avgConfidence = Math.round(fusionAssets.reduce((sum, a) => sum + a.confidenceScore, 0) / fusionAssets.length);
  const immediateActions = fusionAssets.filter(a => a.learningPriority === 'Immediate').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Summary Header */}
      <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-3">Fusion Lifecycle Passport</h2>
          <p className="text-primary-foreground/80 leading-relaxed">
            Comprehensive asset management framework for first-of-a-kind fusion power plants. 
            This dashboard provides decision-support for lifecycle planning, risk prioritization, 
            and R&D investment justification aligned with ISO 55000 principles.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets"
          value={fusionAssets.length}
          subtitle="Under lifecycle management"
          icon={<Atom className="w-6 h-6" />}
        />
        <MetricCard
          title="Critical Risk"
          value={criticalCount}
          subtitle="Require immediate attention"
          variant="critical"
          icon={<AlertTriangle className="w-6 h-6" />}
        />
        <MetricCard
          title="Average Confidence"
          value={`${avgConfidence}%`}
          subtitle="Across all assets"
          trend="up"
          trendValue="+5% vs baseline"
          icon={<Target className="w-6 h-6" />}
        />
        <MetricCard
          title="Immediate Actions"
          value={immediateActions}
          subtitle="Priority learning items"
          variant="warning"
          icon={<Zap className="w-6 h-6" />}
        />
      </div>

      {/* Secondary Metrics Row */}
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
                Early learning multiplier for FOAK deployment decisions
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Design Lock-in Risk</span>
                <span className="font-medium text-status-warning">Medium</span>
              </div>
              <p className="text-xs text-muted-foreground">
                2 components approaching design freeze with high uncertainty
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <AssetSummaryTable onSelectAsset={onSelectAsset} />

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flp-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Key Decision Points</h3>
          <div className="space-y-3">
            {[
              { title: 'Blanket Design Selection', status: 'Active', timeline: 'Q2 2025' },
              { title: 'Divertor Material Qualification', status: 'Pending', timeline: 'Q4 2025' },
              { title: 'Remote Handling Strategy', status: 'Review', timeline: 'Q1 2026' },
            ].map((decision, i) => (
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
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-status-critical mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Grid Availability Target</p>
                <p className="text-xs text-muted-foreground">
                  Current component reliability estimates suggest 65-75% capacity factor achievable
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-status-warning mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Windows</p>
                <p className="text-xs text-muted-foreground">
                  Divertor replacement frequency may limit operational flexibility
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-status-nominal mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Fuel Self-Sufficiency</p>
                <p className="text-xs text-muted-foreground">
                  Tritium breeding strategy aligned with long-term fuel security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
