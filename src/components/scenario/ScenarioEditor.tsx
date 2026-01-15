import { useState } from 'react';
import { useScenario } from '@/contexts/ScenarioContext';
import { FusionAsset } from '@/data/fusionAssets';
import { cn } from '@/lib/utils';
import { 
  Slider,
} from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  RotateCcw,
  ChevronDown,
  Atom,
  Zap,
  Shield,
  Wrench,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScenarioEditorProps {
  scenarioId: string;
  onClose?: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'Plasma-Facing': Zap,
  'Magnets': Atom,
  'Blanket': Shield,
  'Structural': Wrench,
  'Auxiliary': Activity,
};

export const ScenarioEditor = ({ scenarioId, onClose }: ScenarioEditorProps) => {
  const { getScenario, modifyAsset, resetAsset, resetScenario, getAssetDiff } = useScenario();
  const scenario = getScenario(scenarioId);
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Plasma-Facing');

  if (!scenario) return null;

  const assetsByCategory = scenario.assets.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, FusionAsset[]>);

  const hasChanges = (assetId: string) => {
    const diffs = getAssetDiff(assetId);
    return diffs.length > 0;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{scenario.name}</h3>
          <p className="text-xs text-muted-foreground">{scenario.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resetScenario(scenarioId)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset All
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-2">
        {Object.entries(assetsByCategory).map(([category, assets]) => {
          const CategoryIcon = categoryIcons[category] || Activity;
          
          return (
            <Collapsible
              key={category}
              open={expandedCategory === category}
              onOpenChange={(open) => setExpandedCategory(open ? category : null)}
            >
              <CollapsibleTrigger className="w-full">
                <div className={cn(
                  'flex items-center justify-between p-3 rounded-lg transition-colors',
                  expandedCategory === category ? 'bg-primary/10' : 'bg-muted/50 hover:bg-muted'
                )}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{category}</span>
                    <span className="text-xs text-muted-foreground">({assets.length})</span>
                  </div>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform',
                    expandedCategory === category && 'rotate-180'
                  )} />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-1 space-y-1">
                {assets.map((asset) => (
                  <Collapsible
                    key={asset.id}
                    open={expandedAsset === asset.id}
                    onOpenChange={(open) => setExpandedAsset(open ? asset.id : null)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className={cn(
                        'flex items-center justify-between p-2 pl-8 rounded-lg transition-colors text-left',
                        expandedAsset === asset.id ? 'bg-secondary' : 'hover:bg-muted/30',
                        hasChanges(asset.id) && 'border-l-2 border-primary'
                      )}>
                        <span className="text-sm font-medium truncate">{asset.name}</span>
                        <div className="flex items-center gap-2">
                          {hasChanges(asset.id) && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                          <ChevronDown className={cn(
                            'w-3 h-3 text-muted-foreground transition-transform',
                            expandedAsset === asset.id && 'rotate-180'
                          )} />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pl-8 pr-2 py-2">
                      <AssetParameterEditor
                        asset={asset}
                        scenarioId={scenarioId}
                        onModify={(mods) => modifyAsset(scenarioId, asset.id, mods)}
                        onReset={() => resetAsset(scenarioId, asset.id)}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

interface AssetParameterEditorProps {
  asset: FusionAsset;
  scenarioId: string;
  onModify: (modifications: Partial<FusionAsset>) => void;
  onReset: () => void;
}

const AssetParameterEditor = ({ asset, onModify, onReset }: AssetParameterEditorProps) => {
  return (
    <div className="space-y-4 bg-muted/30 rounded-lg p-3">
      {/* Criticality Scoring */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Criticality Scoring
        </h5>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Neutron Damage Uncertainty</label>
            <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
              {asset.neutronDamageUncertainty}/5
            </span>
          </div>
          <Slider
            value={[asset.neutronDamageUncertainty]}
            onValueChange={([value]) => onModify({ neutronDamageUncertainty: value })}
            min={1}
            max={5}
            step={1}
            className="cursor-pointer"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Replaceability Difficulty</label>
            <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
              {asset.replaceabilityDifficulty}/5
            </span>
          </div>
          <Slider
            value={[asset.replaceabilityDifficulty]}
            onValueChange={([value]) => onModify({ replaceabilityDifficulty: value })}
            min={1}
            max={5}
            step={1}
            className="cursor-pointer"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">System Value Impact</label>
            <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
              {asset.systemValueImpact}/5
            </span>
          </div>
          <Slider
            value={[asset.systemValueImpact]}
            onValueChange={([value]) => onModify({ systemValueImpact: value })}
            min={1}
            max={5}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Lifecycle Status */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lifecycle Status
        </h5>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Maturity Level</label>
            <Select
              value={asset.maturityLevel}
              onValueChange={(value) => onModify({ maturityLevel: value as FusionAsset['maturityLevel'] })}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {['Concept', 'Design', 'Prototype', 'Qualified', 'Operational'].map((level) => (
                  <SelectItem key={level} value={level} className="text-xs">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Risk Level</label>
            <Select
              value={asset.riskLevel}
              onValueChange={(value) => onModify({ riskLevel: value as FusionAsset['riskLevel'] })}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {['Critical', 'High', 'Medium', 'Low'].map((level) => (
                  <SelectItem key={level} value={level} className="text-xs">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Confidence Score</label>
            <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
              {asset.confidenceScore}%
            </span>
          </div>
          <Slider
            value={[asset.confidenceScore]}
            onValueChange={([value]) => onModify({ confidenceScore: value })}
            min={0}
            max={100}
            step={5}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* R&D & Learning */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          R&D & Learning
        </h5>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Learning Priority</label>
          <Select
            value={asset.learningPriority}
            onValueChange={(value) => onModify({ learningPriority: value as FusionAsset['learningPriority'] })}
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {['Immediate', 'High', 'Medium', 'Low'].map((priority) => (
                <SelectItem key={priority} value={priority} className="text-xs">
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Instrumentation Priority</label>
            <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
              {asset.instrumentationPriority}/5
            </span>
          </div>
          <Slider
            value={[asset.instrumentationPriority]}
            onValueChange={([value]) => onModify({ instrumentationPriority: value })}
            min={1}
            max={5}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset to Baseline
        </Button>
      </div>
    </div>
  );
};
