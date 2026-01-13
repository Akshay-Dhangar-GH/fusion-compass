import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'nominal';
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = 'default'
}: MetricCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  const variantStyles = {
    default: 'border-l-4 border-l-primary',
    critical: 'border-l-4 border-l-status-critical',
    warning: 'border-l-4 border-l-status-warning',
    nominal: 'border-l-4 border-l-status-nominal',
  };

  const trendStyles = {
    up: 'text-status-nominal',
    down: 'text-status-critical',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('flp-card p-6', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="flp-section-title mb-2">{title}</p>
          <p className="flp-metric text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', trendStyles[trend])}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
