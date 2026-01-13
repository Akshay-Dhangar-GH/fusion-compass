import { fusionAssets } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';

const maturityLevels = ['Concept', 'Design', 'Prototype', 'Qualified', 'Operational'] as const;

export const MaturityTimeline = () => {
  const maturityCounts = maturityLevels.reduce((acc, level) => {
    acc[level] = fusionAssets.filter(a => a.maturityLevel === level).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flp-card p-6">
      <h3 className="font-semibold text-foreground mb-4">Technology Maturity</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
        
        <div className="flex justify-between relative">
          {maturityLevels.map((level, index) => {
            const count = maturityCounts[level];
            const isActive = count > 0;
            
            return (
              <div key={level} className="flex flex-col items-center z-10">
                <div 
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {count}
                </div>
                <span className={cn(
                  'text-xs mt-2 text-center',
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Average Confidence</span>
          <span className="font-semibold text-foreground">
            {Math.round(fusionAssets.reduce((sum, a) => sum + a.confidenceScore, 0) / fusionAssets.length)}%
          </span>
        </div>
      </div>
    </div>
  );
};
