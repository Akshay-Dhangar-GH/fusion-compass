import { useState } from 'react';
import { useScenario } from '@/contexts/ScenarioContext';
import { ScenarioSelector } from './ScenarioSelector';
import { ScenarioEditor } from './ScenarioEditor';
import { ScenarioComparison } from './ScenarioComparison';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, GitCompare, BarChart3 } from 'lucide-react';

interface ScenarioPanelProps {
  children?: React.ReactNode;
}

export const ScenarioPanel = ({ children }: ScenarioPanelProps) => {
  const { activeScenarioId, isComparing, comparisonScenarioId } = useScenario();
  const [activeTab, setActiveTab] = useState<'select' | 'edit' | 'compare'>('select');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Settings2 className="w-4 h-4" />
          Scenario Modelling
          {isComparing && comparisonScenarioId && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
              Comparing
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[500px] sm:w-[600px] p-0 bg-background border-l border-border"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Scenario Modelling</h2>
            <p className="text-sm text-muted-foreground">
              Create scenarios, modify parameters, and compare outcomes
            </p>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="mx-4 mt-4 grid grid-cols-3">
              <TabsTrigger value="select" className="gap-1">
                <BarChart3 className="w-3 h-3" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger value="edit" className="gap-1">
                <Settings2 className="w-3 h-3" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-1">
                <GitCompare className="w-3 h-3" />
                Compare
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="select" className="h-full m-0 p-4">
                <ScenarioSelector onSelectScenario={() => setActiveTab('edit')} />
              </TabsContent>
              
              <TabsContent value="edit" className="h-full m-0 overflow-hidden">
                <ScenarioEditor scenarioId={activeScenarioId} />
              </TabsContent>
              
              <TabsContent value="compare" className="h-full m-0 p-4 overflow-auto">
                <ScenarioComparison />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
      {children}
    </Sheet>
  );
};
