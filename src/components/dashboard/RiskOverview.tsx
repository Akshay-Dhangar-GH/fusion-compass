import { fusionAssets } from '@/data/fusionAssets';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RiskOverview = () => {
  const riskCounts = {
    Critical: fusionAssets.filter(a => a.riskLevel === 'Critical').length,
    High: fusionAssets.filter(a => a.riskLevel === 'High').length,
    Medium: fusionAssets.filter(a => a.riskLevel === 'Medium').length,
    Low: fusionAssets.filter(a => a.riskLevel === 'Low').length,
  };

  const riskConfig = {
    Critical: { icon: AlertTriangle, color: 'bg-status-critical', textColor: 'text-status-critical' },
    High: { icon: AlertCircle, color: 'bg-status-warning', textColor: 'text-status-warning' },
    Medium: { icon: Info, color: 'bg-status-caution', textColor: 'text-status-caution' },
    Low: { icon: CheckCircle, color: 'bg-status-nominal', textColor: 'text-status-nominal' },
  };

  return (
    <div className="flp-card p-6">
      <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
      <div className="space-y-3">
        {(Object.keys(riskCounts) as Array<keyof typeof riskCounts>).map((level) => {
          const config = riskConfig[level];
          const Icon = config.icon;
          const percentage = (riskCounts[level] / fusionAssets.length) * 100;
          
          return (
            <div key={level} className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color, 'bg-opacity-10')}>
                <Icon className={cn('w-4 h-4', config.textColor)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{level}</span>
                  <span className="text-sm text-muted-foreground">{riskCounts[level]} assets</span>
                </div>
                <div className="flp-progress-bar">
                  <div 
                    className={cn('h-full rounded-full transition-all duration-500', config.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
