import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DeltaIndicatorProps {
  value: number;
  comparisonValue: number;
  prefix?: string;
  suffix?: string;
  higherIsBetter?: boolean;
  decimals?: number;
  showAbsolute?: boolean;
}

export const DeltaIndicator = ({
  value,
  comparisonValue,
  prefix = '',
  suffix = '',
  higherIsBetter = true,
  decimals = 1,
  showAbsolute = true,
}: DeltaIndicatorProps) => {
  const delta = value - comparisonValue;
  const percentChange = comparisonValue !== 0 
    ? ((value - comparisonValue) / Math.abs(comparisonValue)) * 100 
    : 0;

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = Math.abs(delta) < 0.01;

  // Determine if the change is good or bad based on higherIsBetter
  const isGood = higherIsBetter ? isPositive : isNegative;
  const isBad = higherIsBetter ? isNegative : isPositive;

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-3 h-3" />
        <span className="text-xs">No change</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        isGood && 'text-status-nominal',
        isBad && 'text-destructive'
      )}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      <span className="text-xs font-medium">
        {showAbsolute && (
          <>
            {prefix}
            {isPositive ? '+' : ''}
            {delta.toFixed(decimals)}
            {suffix}
          </>
        )}
        {!showAbsolute && (
          <>
            {isPositive ? '+' : ''}
            {percentChange.toFixed(1)}%
          </>
        )}
      </span>
    </div>
  );
};
