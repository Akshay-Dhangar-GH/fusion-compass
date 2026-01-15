import { useState } from 'react';
import { useScenario, Scenario } from '@/contexts/ScenarioContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Copy, 
  Trash2, 
  GitCompare,
  Check,
  X,
} from 'lucide-react';

interface ScenarioSelectorProps {
  onSelectScenario?: (scenarioId: string) => void;
}

export const ScenarioSelector = ({ onSelectScenario }: ScenarioSelectorProps) => {
  const {
    scenarios,
    activeScenarioId,
    comparisonScenarioId,
    isComparing,
    setActiveScenario,
    setComparisonScenario,
    createScenario,
    duplicateScenario,
    deleteScenario,
    toggleCompareMode,
  } = useScenario();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');

  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;
    
    const id = createScenario(newScenarioName, newScenarioDesc);
    setActiveScenario(id);
    setNewScenarioName('');
    setNewScenarioDesc('');
    setIsCreateOpen(false);
    onSelectScenario?.(id);
  };

  const handleDuplicate = (scenario: Scenario) => {
    const id = duplicateScenario(scenario.id, `${scenario.name} (Copy)`);
    if (id) {
      setActiveScenario(id);
      onSelectScenario?.(id);
    }
  };

  return (
    <div className="flp-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Scenarios</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={isComparing ? 'default' : 'outline'}
            size="sm"
            onClick={toggleCompareMode}
            className="text-xs"
          >
            <GitCompare className="w-3 h-3 mr-1" />
            Compare
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border border-border">
              <DialogHeader>
                <DialogTitle>Create New Scenario</DialogTitle>
                <DialogDescription>
                  Create a scenario to test different asset assumptions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Conservative Estimate"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    placeholder="Brief description of this scenario"
                    value={newScenarioDesc}
                    onChange={(e) => setNewScenarioDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateScenario} disabled={!newScenarioName.trim()}>
                  Create Scenario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer',
              activeScenarioId === scenario.id
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
            )}
            onClick={() => {
              if (isComparing && activeScenarioId !== scenario.id) {
                setComparisonScenario(scenario.id);
              } else {
                setActiveScenario(scenario.id);
                onSelectScenario?.(scenario.id);
              }
            }}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: scenario.color }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {scenario.name}
                </span>
                {scenario.id === 'baseline' && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Original
                  </span>
                )}
              </div>
              {scenario.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {scenario.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isComparing && (
                <>
                  {activeScenarioId === scenario.id && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      A
                    </span>
                  )}
                  {comparisonScenarioId === scenario.id && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                      B
                    </span>
                  )}
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(scenario);
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              {scenario.id !== 'baseline' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScenario(scenario.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isComparing && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">
            {comparisonScenarioId 
              ? 'Comparing scenarios side by side' 
              : 'Click another scenario to compare'}
          </p>
        </div>
      )}
    </div>
  );
};
