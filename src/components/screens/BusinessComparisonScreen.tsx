import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/lib/i18n';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import {
  BUSINESS_MODELS,
  totalSetupCost,
  computeScenarioTotals,
} from '@/lib/scoring/businessModels';
import { scoreAllBusinesses, explainScoringFormula, DEFAULT_WEIGHTS } from '@/lib/scoring/scorer';
import type { ScenarioLevel, UserInput } from '@/lib/scoring/types';
import { formatINR } from '@/lib/finance/formatters';
import {
  Store,
  Sliders,
  Award,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BusinessComparisonScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const BusinessComparisonScreen: React.FC<BusinessComparisonScreenProps> = ({
  onContinue,
  onBack,
}) => {
  const { onboarding, activeScenario, setActiveScenario, language } = useAppStore();
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null);

  // Map selected category strings to model IDs
  const modelIdMap: Record<string, string> = {
    dairy: 'dairy-small',
    grocery: 'grocery-kirana',
    tailoring: 'tailoring',
    poultry: 'poultry',
    'mobile-repair': 'mobile-repair',
    'agri-inputs': 'agri-inputs',
    'food-processing': 'food-processing',
    'local-services': 'local-services',
  };

  const selectedModelIds = (
    onboarding.selectedBusinesses.length > 0
      ? onboarding.selectedBusinesses.map((b) => modelIdMap[b] || 'dairy-small')
      : ['dairy-small', 'grocery-kirana', 'mobile-repair']
  ).slice(0, 3);

  // Prepare user input context for scoring
  const userInputContext: UserInput = {
    village: {
      villageName: onboarding.location.village || 'Rampur',
      district: onboarding.location.district || 'Warangal',
      state: onboarding.location.state || 'Telangana',
      population: {
        value: 3850,
        source: 'Model Estimate',
        verificationNote: '2011 Census projection (+15% trend)',
      },
      households: {
        value: 820,
        source: 'Model Estimate',
        verificationNote: 'Average 4.7 members per household',
      },
      distanceToTownKm: {
        value: 14,
        source: 'Verified Local Observation',
        verificationNote: 'Road distance to town',
      },
      economicActivities: ['Agriculture', 'Dairy', 'Retail'],
      isIllustrative: true,
    },
    availableCapital: onboarding.profile.availableSavings || 100000,
    selectedBusinessIds: selectedModelIds,
    competitorObservations: onboarding.competitors.map((c) => ({
      id: c.id,
      businessCategory: c.category === 'dairy' ? 'Dairy' : 'Grocery / Kirana',
      competitorName: `${c.category} shop`,
      distanceKm: {
        value: c.radiusKm,
        source: 'Verified Local Observation',
        verificationNote: 'Ground count',
      },
      strengthAssessment: 'moderate',
      productsOffered: [c.category],
      observedDate: c.dateObserved,
      notes: c.notes,
      source: 'Verified Local Observation',
    })),
    pricingObservations: onboarding.pricing.map((p) => ({
      id: p.id,
      productName: p.productName,
      businessCategory: 'Dairy',
      observedPrice: {
        value: p.competitorPrice,
        source: p.source,
        verificationNote: p.notes,
      },
      location: onboarding.location.village,
      observedDate: new Date().toISOString().split('T')[0],
      source: p.source,
    })),
    preferredScenario: (activeScenario as ScenarioLevel) || 'base',
  };

  // Run scoring across the 3 selected models
  const scores = scoreAllBusinesses(userInputContext, DEFAULT_WEIGHTS);

  // Models with computed scenarios
  const evaluatedModels = selectedModelIds.map((id) => {
    const rawModel = BUSINESS_MODELS[id] || BUSINESS_MODELS['dairy-small'];
    const scenarioData = computeScenarioTotals({
      ...structuredClone(rawModel.scenarios[activeScenario as ScenarioLevel]),
    });
    const setupCost = totalSetupCost(scenarioData);
    const workingCapital = scenarioData.workingCapitalNeeded.value;
    const totalCapital = setupCost + workingCapital;
    const monthlyRev = scenarioData.totalMonthlyRevenue || 0;
    const monthlyCost = scenarioData.totalMonthlyCost || 0;
    const operatingSurplus = monthlyRev - monthlyCost;

    // Household deduction
    const netCashAfterHousehold = Math.max(
      0,
      operatingSurplus - (onboarding.household.monthlyHouseholdExpenses || 12000)
    );

    const scoreObj = scores.find((s) => s.businessModelId === rawModel.id);

    return {
      model: rawModel,
      scenarioData,
      setupCost,
      workingCapital,
      totalCapital,
      monthlyRev,
      monthlyCost,
      operatingSurplus,
      netCashAfterHousehold,
      scoreObj,
    };
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Scenario Switcher */}
      <div className="card p-6 bg-white border-l-4 border-l-primary-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Phase 3 of 5
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">Unit Economics & Relative Ranking</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Deterministic Business Model Comparison
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Side-by-side comparison across structured cost schedules. Transparent 5-pillar ranking.
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg shrink-0">
            <span className="text-xs font-semibold text-gray-600 px-2 flex items-center gap-1">
              <Sliders size={13} />
              Scenario:
            </span>
            {(['low', 'base', 'high'] as ScenarioLevel[]).map((sc) => (
              <button
                key={sc}
                onClick={() => setActiveScenario(sc)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  activeScenario === sc
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {sc} Case
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking Summary Bar */}
      <div className="bg-primary-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-500 text-white flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                Algorithmic Relative Ranking ({activeScenario.toUpperCase()} Scenario)
              </h3>
              <p className="text-xs text-primary-200 mt-0.5">
                Top Recommendation: <strong>{scores[0]?.businessName || 'Dairy Unit'}</strong> (Score:{' '}
                {scores[0]?.compositeScore}/100)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="text-xs bg-white/10 hover:bg-white/20 text-accent-300 border border-accent-400/30 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Inspect Scoring Formula</span>
          </button>
        </div>

        {/* Expandable Scoring Formula */}
        {showFormulaModal && (
          <div className="mt-4 pt-4 border-t border-primary-800 text-xs text-primary-100 bg-primary-950/60 p-4 rounded-lg font-mono whitespace-pre-line leading-relaxed">
            {explainScoringFormula(DEFAULT_WEIGHTS)}
          </div>
        )}
      </div>

      {/* 3-Business Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {evaluatedModels.map(({ model, scenarioData, setupCost, workingCapital, totalCapital, monthlyRev, monthlyCost, operatingSurplus, netCashAfterHousehold, scoreObj }, idx) => {
          const isWinner = scores[0]?.businessModelId === model.id;
          const isExpanded = expandedBreakdown === model.id;

          return (
            <div
              key={model.id}
              className={`card flex flex-col justify-between transition-all ${
                isWinner ? 'border-2 border-primary-600 shadow-md ring-4 ring-primary-500/10' : ''
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Option {idx + 1}
                  </span>
                  {isWinner ? (
                    <span className="badge bg-primary-100 text-primary-800 font-bold border border-primary-300">
                      ★ Rank #1
                    </span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-700">Rank #{idx + 1}</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {model.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{model.description}</p>

                {/* Score Pill */}
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-xs text-gray-600 font-medium">Composite Score:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-primary-800">
                      {scoreObj?.compositeScore ?? 65}/100
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary-200 text-primary-900">
                      Grade {scoreObj?.grade ?? 'B'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="p-5 space-y-3.5 text-xs">
                {/* Outlay */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Total Startup Outlay:</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {formatINR(totalCapital)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-500 pl-2">
                  <span>• Fixed Capex (Setup):</span>
                  <span>{formatINR(setupCost)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 pl-2">
                  <span>• 30-Day Working Capital:</span>
                  <span>{formatINR(workingCapital)}</span>
                </div>

                {/* Monthly Performance */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Est. Monthly Revenue:</span>
                  <span className="font-bold text-emerald-700">
                    +{formatINR(monthlyRev)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Est. Monthly OpEx:</span>
                  <span className="font-bold text-red-600">
                    -{formatINR(monthlyCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-primary-50 p-2 rounded">
                  <span className="text-primary-900 font-semibold">Operating Surplus:</span>
                  <span className="font-extrabold text-primary-900">
                    {formatINR(operatingSurplus)}/mo
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span>After Household Deductions:</span>
                  <span className="font-semibold text-gray-700">
                    {formatINR(netCashAfterHousehold)}/mo
                  </span>
                </div>

                {/* Score Components Breakdown */}
                {scoreObj && (
                  <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px]">
                    <span className="font-semibold text-gray-700 block mb-1">Component Scores:</span>
                    {scoreObj.components.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-gray-600">
                        <span className="truncate max-w-[170px]">{c.name} ({(c.weight * 100).toFixed(0)}%):</span>
                        <span className="font-medium">
                          {c.rawScore}/100 {c.insufficientData && <span className="text-amber-600 font-bold">*</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Toggle Detailed Line Items */}
                <button
                  onClick={() => setExpandedBreakdown(isExpanded ? null : model.id)}
                  className="w-full pt-2 text-[11px] font-semibold text-primary-700 hover:text-primary-800 flex items-center justify-center gap-1"
                >
                  <span>{isExpanded ? 'Hide Cost Schedule' : 'View Itemized CapEx Schedule'}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {isExpanded && (
                  <div className="pt-2 border-t border-gray-100 space-y-1.5 bg-gray-50 p-2 rounded text-[11px]">
                    <span className="font-bold text-gray-700 block">CapEx Breakdown:</span>
                    {scenarioData.setupCosts.map((sc, sidx) => (
                      <div key={sidx} className="flex items-center justify-between text-gray-600">
                        <span>{sc.name}:</span>
                        <span className="font-medium">{formatINR(sc.amount.value)}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-gray-200 flex items-center justify-between">
                      <EvidenceBadge label="Model Estimate" size="sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-100 text-[11px] text-gray-500">
                <span>Gestation to revenue: ~{model.timeToRevenueInDays.value} days</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prominent Mandatory Disclaimer */}
      <div className="warning-box flex items-start gap-2.5">
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-700" />
        <div className="text-xs leading-relaxed">
          <strong>Relative Suitability Disclaimer:</strong> Ranking indicates relative
          suitability under the entered assumptions. It does not constitute a commercial guarantee.
          Validate actual village demand, local wholesale fodder/raw material costs, and current
          implementing agency scheme conditions before investing capital.
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button onClick={onBack} className="btn-secondary text-xs px-5 py-2.5">
          {language === 'te'
            ? '← గ్రామ విశ్లేషణకు వెనుకకు'
            : language === 'ta'
            ? '← கிராம நுண்ணறிவுக்குச் செல்ல'
            : '← Back to Village Evidence'}
        </button>

        <button onClick={onContinue} className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2">
          <span>
            {language === 'te'
              ? 'ఆర్థిక నిర్మాణం & రుణ రూటింగ్'
              : language === 'ta'
              ? 'நிதி கட்டமைப்பு மற்றும் கடன் திட்டம்'
              : 'Structure Financing & Loan Routing'}
          </span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
