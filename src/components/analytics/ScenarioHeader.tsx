import { useScenario } from '@/contexts/ScenarioContext';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitCompare, Layers } from 'lucide-react';

interface ScenarioHeaderProps {
  showCompareToggle?: boolean;
  localCompareMode?: boolean;
  onLocalCompareModeChange?: (enabled: boolean) => void;
}

export const ScenarioHeader = ({
  showCompareToggle = true,
  localCompareMode = false,
  onLocalCompareModeChange,
}: ScenarioHeaderProps) => {
  const {
    scenarios,
    activeScenarioId,
    comparisonScenarioId,
    setActiveScenario,
    setComparisonScenario,
    getScenario,
  } = useScenario();

  const activeScenario = getScenario(activeScenarioId);
  const comparisonScenario = comparisonScenarioId ? getScenario(comparisonScenarioId) : null;

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
      {/* Active Scenario Selector */}
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Scenario:</span>
        <Select value={activeScenarioId} onValueChange={setActiveScenario}>
          <SelectTrigger className="h-8 w-[180px]">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeScenario?.color }}
              />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {scenarios.map(scenario => (
              <SelectItem key={scenario.id} value={scenario.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  {scenario.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Compare Toggle */}
      {showCompareToggle && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Compare:</span>
            <Switch
              checked={localCompareMode}
              onCheckedChange={onLocalCompareModeChange}
            />
          </div>
        </>
      )}

      {/* Comparison Scenario Selector */}
      {localCompareMode && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">vs</span>
            <Select
              value={comparisonScenarioId || ''}
              onValueChange={(value) => setComparisonScenario(value || null)}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <div className="flex items-center gap-2">
                  {comparisonScenario && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: comparisonScenario.color }}
                    />
                  )}
                  <SelectValue placeholder="Select scenario..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {scenarios
                  .filter(s => s.id !== activeScenarioId)
                  .map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: scenario.color }}
                        />
                        {scenario.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {comparisonScenario && (
            <Badge variant="outline" className="text-xs gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeScenario?.color }}
              />
              vs
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: comparisonScenario.color }}
              />
            </Badge>
          )}
        </>
      )}
    </div>
  );
};
