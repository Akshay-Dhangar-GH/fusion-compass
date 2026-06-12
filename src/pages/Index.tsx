import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { PassportList } from '@/components/passport/PassportList';
import { AssetPassport } from '@/components/passport/AssetPassport';
import { CriticalityMatrix } from '@/components/matrix/CriticalityMatrix';
import { DecisionAnalytics } from '@/components/analytics/DecisionAnalytics';
import { CostBenefitAnalysis } from '@/components/analytics/CostBenefitAnalysis';
import { DeliveryModel } from '@/components/consulting/DeliveryModel';
import { useScenario } from '@/contexts/ScenarioContext';
import { usePlant } from '@/contexts/PlantContext';

type Section = 'dashboard' | 'passports' | 'matrix' | 'analytics' | 'costbenefit' | 'consulting';

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const { getActiveAssets } = useScenario();
  const { plantType, terminology } = usePlant();

  // Clear selected asset if it no longer exists in the active dataset (e.g. plant switch)
  const assets = getActiveAssets();
  useEffect(() => {
    if (selectedAssetId && !assets.find(a => a.id === selectedAssetId)) {
      setSelectedAssetId(null);
    }
  }, [plantType, assets, selectedAssetId]);

  const sectionHeaders: Record<Section, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Summary', subtitle: `${terminology.productName} Overview` },
    passports: { title: 'Asset Passports', subtitle: 'Comprehensive lifecycle documentation' },
    matrix: { title: 'Criticality Matrix', subtitle: 'Investment prioritisation tool' },
    analytics: { title: 'Decision Analytics', subtitle: 'Evidence-based decision support' },
    costbenefit: { title: 'Cost-Benefit Analysis', subtitle: 'ROI calculation for maintenance strategies' },
    consulting: { title: 'Delivery Model', subtitle: 'Consulting implementation framework' },
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveSection('passports');
  };

  const handleBackToList = () => setSelectedAssetId(null);

  const selectedAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null;

  const renderContent = () => {
    if (activeSection === 'passports' && selectedAsset) {
      return <AssetPassport asset={selectedAsset} onBack={handleBackToList} />;
    }
    switch (activeSection) {
      case 'dashboard':
        return <ExecutiveDashboard onSelectAsset={handleSelectAsset} />;
      case 'passports':
        return <PassportList onSelectAsset={handleSelectAsset} />;
      case 'matrix':
        return <CriticalityMatrix onSelectAsset={handleSelectAsset} />;
      case 'analytics':
        return <DecisionAnalytics />;
      case 'costbenefit':
        return <CostBenefitAnalysis />;
      case 'consulting':
        return <DeliveryModel />;
      default:
        return <ExecutiveDashboard onSelectAsset={handleSelectAsset} />;
    }
  };

  const currentHeader = selectedAsset
    ? { title: 'Asset Passport', subtitle: selectedAsset.name }
    : sectionHeaders[activeSection];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section as Section);
          setSelectedAssetId(null);
        }}
      />

      <main className="ml-64">
        <Header title={currentHeader.title} subtitle={currentHeader.subtitle} />
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Index;
