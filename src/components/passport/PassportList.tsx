import { fusionAssets, FusionAsset } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PassportListProps {
  onSelectAsset: (assetId: string) => void;
}

const categories = ['All', 'Plasma-Facing', 'Magnets', 'Blanket', 'Structural', 'Auxiliary'] as const;

export const PassportList = ({ onSelectAsset }: PassportListProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredAssets = activeCategory === 'All' 
    ? fusionAssets 
    : fusionAssets.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Asset Passports</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive lifecycle documentation for critical fusion components
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className={cn(
              'transition-all',
              activeCategory === category && 'bg-primary text-primary-foreground'
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => onSelectAsset(asset.id)}
            className="flp-card p-6 cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {asset.category}
                </span>
                <h3 className="font-semibold text-lg text-foreground mt-1 group-hover:text-primary transition-colors">
                  {asset.name}
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {asset.functionalRole}
            </p>

            <div className="flex items-center gap-3">
              <span className={cn(
                'flp-badge',
                asset.riskLevel === 'Critical' ? 'flp-badge-critical' :
                asset.riskLevel === 'High' ? 'flp-badge-warning' :
                asset.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                'flp-badge-nominal'
              )}>
                {asset.riskLevel}
              </span>
              <span className="flp-badge bg-secondary text-secondary-foreground">
                {asset.maturityLevel}
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                {asset.confidenceScore}% confidence
              </span>
            </div>

            {/* Mini stats */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Neutron Unc.</p>
                <p className="font-semibold text-foreground">{asset.neutronDamageUncertainty}/5</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Replaceability</p>
                <p className="font-semibold text-foreground">{asset.replaceabilityDifficulty}/5</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">System Value</p>
                <p className="font-semibold text-foreground">{asset.systemValueImpact}/5</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
