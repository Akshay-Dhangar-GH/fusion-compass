import { fusionAssets, FusionAsset } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { ChevronRight, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface AssetSummaryTableProps {
  onSelectAsset: (assetId: string) => void;
}

const riskIcons = {
  Critical: AlertTriangle,
  High: AlertCircle,
  Medium: Info,
  Low: CheckCircle,
};

const riskColors = {
  Critical: 'text-status-critical bg-status-critical/10',
  High: 'text-status-warning bg-status-warning/10',
  Medium: 'text-status-caution bg-status-caution/10',
  Low: 'text-status-nominal bg-status-nominal/10',
};

export const AssetSummaryTable = ({ onSelectAsset }: AssetSummaryTableProps) => {
  return (
    <div className="flp-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-foreground">Asset Portfolio Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Critical fusion components with lifecycle management status
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset</th>
              <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maturity</th>
              <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confidence</th>
              <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk</th>
              <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
              <th className="py-3 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {fusionAssets.map((asset, index) => {
              const RiskIcon = riskIcons[asset.riskLevel];
              
              return (
                <tr 
                  key={asset.id}
                  className={cn(
                    'border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors',
                    index % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                  )}
                  onClick={() => onSelectAsset(asset.id)}
                >
                  <td className="py-4 px-6">
                    <div className="font-medium text-foreground">{asset.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{asset.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-foreground">{asset.maturityLevel}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 flp-progress-bar">
                        <div 
                          className={cn(
                            'h-full rounded-full',
                            asset.confidenceScore >= 70 ? 'bg-status-nominal' :
                            asset.confidenceScore >= 50 ? 'bg-status-caution' :
                            'bg-status-warning'
                          )}
                          style={{ width: `${asset.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{asset.confidenceScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      riskColors[asset.riskLevel]
                    )}>
                      <RiskIcon className="w-3 h-3" />
                      {asset.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      'text-sm font-medium',
                      asset.learningPriority === 'Immediate' ? 'text-status-critical' :
                      asset.learningPriority === 'High' ? 'text-status-warning' :
                      'text-muted-foreground'
                    )}>
                      {asset.learningPriority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
