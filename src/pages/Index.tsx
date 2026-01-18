import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { PassportList } from '@/components/passport/PassportList';
import { AssetPassport } from '@/components/passport/AssetPassport';
import { CriticalityMatrix } from '@/components/matrix/CriticalityMatrix';
import { DecisionAnalytics } from '@/components/analytics/DecisionAnalytics';
import { CostBenefitAnalysis } from '@/components/analytics/CostBenefitAnalysis';
import { DeliveryModel } from '@/components/consulting/DeliveryModel';
import { getAssetById } from '@/data/fusionAssets';

type Section = 'dashboard' | 'passports' | 'matrix' | 'analytics' | 'costbenefit' | 'consulting';

const sectionHeaders: Record<Section, { title: string; subtitle: string }> = {
  dashboard: { 
    title: 'Executive Summary', 
    subtitle: 'Fusion Lifecycle Passport Overview' 
  },
  passports: { 
    title: 'Asset Passports', 
    subtitle: 'Comprehensive lifecycle documentation' 
  },
  matrix: { 
    title: 'Criticality Matrix', 
    subtitle: 'Investment prioritisation tool' 
  },
  analytics: { 
    title: 'Decision Analytics', 
    subtitle: 'Evidence-based decision support' 
  },
  costbenefit: { 
    title: 'Cost-Benefit Analysis', 
    subtitle: 'ROI calculation for maintenance strategies' 
  },
  consulting: { 
    title: 'Delivery Model', 
    subtitle: 'Consulting implementation framework' 
  },
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveSection('passports');
  };

  const handleBackToList = () => {
    setSelectedAssetId(null);
  };

  const selectedAsset = selectedAssetId ? getAssetById(selectedAssetId) : null;

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
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
