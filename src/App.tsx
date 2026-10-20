import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Header } from '@/components/common/Header';
import { HomeOnboardingScreen } from '@/components/screens/HomeOnboardingScreen';
import { VillageIntelligenceScreen } from '@/components/screens/VillageIntelligenceScreen';
import { BusinessComparisonScreen } from '@/components/screens/BusinessComparisonScreen';
import { FinancialStructuringScreen } from '@/components/screens/FinancialStructuringScreen';
import { SurvivalSimulatorScreen } from '@/components/screens/SurvivalSimulatorScreen';
import { AdvisorScreen } from '@/components/screens/AdvisorScreen';
import { BusinessBlueprintScreen } from '@/components/screens/BusinessBlueprintScreen';
import { formatINR } from '@/lib/finance/formatters';
import { t } from '@/lib/i18n';
import {
  Compass,
  Store,
  Landmark,
  ShieldAlert,
  Sparkles,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { onboarding, language, isDemoMode } = useAppStore();

  const handleNextFromHome = () => setActiveTab('village');
  const handleNextFromVillage = () => setActiveTab('compare');
  const handleNextFromCompare = () => setActiveTab('finance');
  const handleNextFromFinance = () => setActiveTab('simulator');
  const handleNextFromSimulator = () => setActiveTab('advisor');
  const handleNextFromAdvisor = () => setActiveTab('report');

  return (
    <div className="min-h-screen flex flex-col bg-surface text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Global Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeOnboardingScreen onContinue={handleNextFromHome} />
        )}

        {activeTab === 'village' && (
          <VillageIntelligenceScreen
            onContinue={handleNextFromVillage}
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'compare' && (
          <BusinessComparisonScreen
            onContinue={handleNextFromCompare}
            onBack={() => setActiveTab('village')}
          />
        )}

        {activeTab === 'finance' && (
          <FinancialStructuringScreen
            onContinue={handleNextFromFinance}
            onBack={() => setActiveTab('compare')}
          />
        )}

        {activeTab === 'simulator' && (
          <SurvivalSimulatorScreen
            onContinue={handleNextFromSimulator}
            onBack={() => setActiveTab('finance')}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorScreen
            onContinue={handleNextFromAdvisor}
            onBack={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'report' && (
          <BusinessBlueprintScreen onBack={() => setActiveTab('advisor')} />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="no-print bg-white border-t border-gray-200 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-gray-900">GramVenture AI</span>
              <span>•</span>
              <span className="text-primary-700 font-semibold">Tamil Nadu Micro-Enterprise Initiative</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Deterministic FinTech & Hyper-Local Business Advisory for Rural Micro-Entrepreneurs
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              52 Automated Unit Tests Passing
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">
              Active Currency: <strong>INR (₹)</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
