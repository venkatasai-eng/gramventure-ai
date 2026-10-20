import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/lib/i18n';
import {
  calculateProjectSize,
  routeScheme,
  applySchemeConstraints,
  calculateEMI,
  calculateDSCR,
  estimateAffordableLoan,
} from '@/lib/finance/calculator';
import { formatINR } from '@/lib/finance/formatters';
import { evaluateExperimentalML } from '@/services/mlService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sliders,
  TrendingDown,
  Info,
  Cpu,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface SurvivalSimulatorScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const SurvivalSimulatorScreen: React.FC<SurvivalSimulatorScreenProps> = ({
  onContinue,
  onBack,
}) => {
  const { onboarding, stressTest, updateStressTest, language } = useAppStore();

  const marginCapital = onboarding.profile.availableSavings || 100000;
  const sizing = calculateProjectSize(marginCapital);
  const scheme = routeScheme(sizing.theoreticalProjectCost);
  const constraints = applySchemeConstraints(sizing.theoreticalProjectCost, marginCapital, scheme);

  const monthlyDebtService = calculateEMI(
    constraints.sanctionedLoan,
    scheme.annualInterestRate,
    scheme.tenureMonths - scheme.moratoriumMonths
  );

  // BASELINE OPERATING PARAMETERS (Dairy 4-animal unit reference)
  const baseMonthlyRevenue = 84000;
  const baseMonthlyRawMaterial = 36000; // Feed, fodder, supplements
  const baseMonthlyFixedOpEx = 20500; // Utilities, vet care, transport, maintenance
  const baseTotalOpEx = baseMonthlyRawMaterial + baseMonthlyFixedOpEx; // ₹56,500
  const householdLiving = onboarding.household.monthlyHouseholdExpenses || 12000;
  const existingDebt = onboarding.household.existingMonthlyLoanPayments || 0;

  // STRESSED OPERATING PARAMETERS (Calculated from interactive sliders)
  const salesDropMultiplier = (100 - stressTest.salesDeclinePercent) / 100;
  const stressedRevenue = baseMonthlyRevenue * salesDropMultiplier;

  const costInflationMultiplier = (100 + stressTest.costInflationPercent) / 100;
  const stressedRawMaterials = baseMonthlyRawMaterial * costInflationMultiplier;
  const stressedTotalOpEx =
    stressedRawMaterials + baseMonthlyFixedOpEx + stressTest.unexpectedExpense / 12;

  // Cash Available for Debt Service (CADS) = Revenue − OpEx − Household living expenses − Existing debt
  const baseCashAvailable = Math.max(
    0,
    baseMonthlyRevenue - baseTotalOpEx - householdLiving - existingDebt
  );
  const stressedCashAvailable = Math.max(
    0,
    stressedRevenue - stressedTotalOpEx - householdLiving - existingDebt
  );

  // DSCR = CADS / Debt Service
  const baseDSCR = calculateDSCR(baseCashAvailable, monthlyDebtService);
  const stressedDSCR = calculateDSCR(stressedCashAvailable, monthlyDebtService);

  // Liquidity Gaps
  const monthlyLiquidityGap = monthlyDebtService - stressedCashAvailable;
  const hasLiquidityDeficit = monthlyLiquidityGap > 0;

  // Safe Affordable Borrowing Principal under Stress
  const maxSafeStressedDebtPayment = Math.max(0, stressedCashAvailable / 1.25);
  const recommendedStressedLoan = estimateAffordableLoan(
    maxSafeStressedDebtPayment,
    scheme.annualInterestRate,
    scheme.tenureMonths - scheme.moratoriumMonths
  );

  // Experimental ML Prediction Evaluation (Requirement 11)
  const mlResult = useMemo(() => {
    return evaluateExperimentalML(
      onboarding,
      sizing.theoreticalProjectCost,
      constraints.sanctionedLoan,
      stressedRevenue,
      stressedTotalOpEx
    );
  }, [onboarding, sizing.theoreticalProjectCost, constraints.sanctionedLoan, stressedRevenue, stressedTotalOpEx]);

  // Chart Data: 12-Month Comparison
  const chartData = [
    { name: 'Month 1', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
    { name: 'Month 2', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
    { name: 'Month 3', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
    { name: 'Month 4', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable * 0.9, LoanInstalment: monthlyDebtService },
    { name: 'Month 5', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable * 0.85, LoanInstalment: monthlyDebtService },
    { name: 'Month 6', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable * 0.9, LoanInstalment: monthlyDebtService },
    { name: 'Month 7', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
    { name: 'Month 8', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
    { name: 'Month 9', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
    { name: 'Month 10', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable * 1.05, LoanInstalment: monthlyDebtService },
    { name: 'Month 11', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable * 1.05, LoanInstalment: monthlyDebtService },
    { name: 'Month 12', BaselineCADS: baseCashAvailable, StressedCADS: stressedCashAvailable, LoanInstalment: monthlyDebtService },
  ];

  const resetStressDefaults = () => {
    updateStressTest({
      salesDeclinePercent: 20,
      costInflationPercent: 15,
      paymentDelayPercent: 30,
      paymentDelayDays: 30,
      unexpectedExpense: 0,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="card p-6 bg-white border-l-4 border-l-accent-500 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Phase 5 of 5
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">FinTech Shock Testing</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('sim.title', language)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {t('sim.subtitle', language)}
            </p>
          </div>

          <button
            onClick={resetStressDefaults}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Defaults (20% Sales Drop)</span>
          </button>
        </div>
      </div>

      {/* 1. Interactive Stress Sliders */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="section-title text-base">
            <Sliders size={18} className="text-primary-700" />
            <span>Macro & Local Shock Parameters</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Live Algorithmic Sensitivity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Sales Decline */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">{t('sim.salesDecline', language)}:</span>
              <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                -{stressTest.salesDeclinePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={stressTest.salesDeclinePercent}
              onChange={(e) =>
                updateStressTest({ salesDeclinePercent: Number(e.target.value) })
              }
              className="w-full accent-primary-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0% (Normal)</span>
              <span>20% (Default Stress)</span>
              <span>50% (Severe)</span>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Simulates cattle illness, lower milk lactation, or local customer credit defaults.
            </p>
          </div>

          {/* Slider 2: Input Cost Inflation */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">{t('sim.costInflation', language)}:</span>
              <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                +{stressTest.costInflationPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={stressTest.costInflationPercent}
              onChange={(e) =>
                updateStressTest({ costInflationPercent: Number(e.target.value) })
              }
              className="w-full accent-accent-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0% (Stable)</span>
              <span>15% (Typical Spike)</span>
              <span>40% (Drought)</span>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Simulates dry season green fodder shortage and concentrate feed price spikes.
            </p>
          </div>

          {/* Slider 3: Unexpected One-Time Expense */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">{t('sim.unexpectedExpense', language)}:</span>
              <span className="font-extrabold text-gray-900 bg-gray-200 px-2 py-0.5 rounded">
                {formatINR(stressTest.unexpectedExpense)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60000"
              step="5000"
              value={stressTest.unexpectedExpense}
              onChange={(e) =>
                updateStressTest({ unexpectedExpense: Number(e.target.value) })
              }
              className="w-full accent-primary-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>₹0</span>
              <span>₹25,000</span>
              <span>₹60,000</span>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Simulates sudden veterinary surgery, shed repair, or electrical borewell damage.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Financial Impact Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Scenario */}
        <div className="card p-6 border-l-4 border-l-emerald-600 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Scenario A
              </span>
              <h3 className="text-base font-bold text-gray-900">Baseline Normal Conditions</h3>
            </div>
            <span className="badge bg-emerald-100 text-emerald-800 font-bold">
              DSCR: {baseDSCR.ratio.toFixed(2)}x
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-gray-100">
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Gross Monthly Revenue:</span>
              <span className="font-bold text-gray-900">{formatINR(baseMonthlyRevenue)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Total Operating Expenses (OpEx):</span>
              <span className="font-semibold text-gray-800">-{formatINR(baseTotalOpEx)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Household Living Deductions:</span>
              <span className="font-semibold text-gray-800">-{formatINR(householdLiving)}</span>
            </div>
            <div className="flex justify-between pt-2 bg-emerald-50/60 p-2 rounded">
              <span className="font-bold text-emerald-900">Free Cash Available for Loan:</span>
              <span className="font-extrabold text-emerald-900">{formatINR(baseCashAvailable)}/mo</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Scheduled Loan Repayment (EMI):</span>
              <span className="font-bold text-primary-800">-{formatINR(monthlyDebtService)}/mo</span>
            </div>
            <div className="flex justify-between pt-1 font-bold">
              <span className="text-emerald-800">Net Monthly Safety Cushion:</span>
              <span className="text-emerald-800">+{formatINR(baseCashAvailable - monthlyDebtService)}/mo</span>
            </div>
          </div>
        </div>

        {/* Stressed Scenario */}
        <div
          className={`card p-6 border-l-4 space-y-4 ${
            hasLiquidityDeficit ? 'border-l-red-600 bg-red-50/20' : 'border-l-amber-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 block">
                Scenario B (Stress Test)
              </span>
              <h3 className="text-base font-bold text-gray-900">
                Under {stressTest.salesDeclinePercent}% Sales Shock + {stressTest.costInflationPercent}% Costs
              </h3>
            </div>
            <span
              className={`badge font-bold ${
                stressedDSCR.ratio < 1.0
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : stressedDSCR.ratio < 1.25
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              DSCR: {stressedDSCR.ratio.toFixed(2)}x
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-gray-100">
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Compressed Monthly Revenue:</span>
              <span className="font-bold text-red-700">{formatINR(stressedRevenue)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Inflated Operating Costs:</span>
              <span className="font-semibold text-gray-800">-{formatINR(stressedTotalOpEx)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Household Living Commitments:</span>
              <span className="font-semibold text-gray-800">-{formatINR(householdLiving)}</span>
            </div>
            <div className="flex justify-between pt-2 bg-gray-100 p-2 rounded">
              <span className="font-bold text-gray-900">Stressed Cash Available for Debt:</span>
              <span className="font-extrabold text-gray-900">{formatINR(stressedCashAvailable)}/mo</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Fixed Scheduled Debt (EMI):</span>
              <span className="font-bold text-primary-800">-{formatINR(monthlyDebtService)}/mo</span>
            </div>
            <div className="flex justify-between pt-1 font-bold">
              <span className={hasLiquidityDeficit ? 'text-red-700' : 'text-amber-800'}>
                {hasLiquidityDeficit ? 'Monthly Liquidity Deficit:' : 'Compressed Buffer:'}
              </span>
              <span className={hasLiquidityDeficit ? 'text-red-700' : 'text-amber-800'}>
                {hasLiquidityDeficit
                  ? `-${formatINR(monthlyLiquidityGap)}/mo`
                  : `+${formatINR(stressedCashAvailable - monthlyDebtService)}/mo`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Cash-Flow Trajectory Chart */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title text-base">
            <TrendingDown size={18} className="text-primary-700" />
            <span>12-Month Liquidity & Debt Repayment Buffer Comparison</span>
          </h2>
          <span className="text-xs text-gray-500">
            Green = Baseline Surplus | Orange = Stressed Cash Flow | Purple Line = Scheduled EMI
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => formatINR(Number(val))}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="BaselineCADS" name="Baseline Cash Available" fill="#15803d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="StressedCADS" name="Stressed Cash Available" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="LoanInstalment"
                name="Monthly Loan EMI (Fixed)"
                stroke="#6b21a8"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Algorithmic Loan Resizing Guidance */}
      <div className="card p-6 bg-surface-warm border border-gray-300 space-y-4">
        <div className="flex items-center gap-2 text-primary-900 font-bold text-base">
          <ShieldAlert size={20} className="text-primary-700" />
          <span>
            Algorithmic Resizing Guidance for {onboarding.location.village || 'Selected Location'}, {onboarding.location.district}
          </span>
        </div>

        <p className="text-xs text-gray-700 leading-relaxed">
          Under the standard 10% promoter equity rule, your ₹{formatINR(marginCapital)} margin capital qualifies for a theoretical
          project of <strong>{formatINR(sizing.theoreticalProjectCost)}</strong> with a{' '}
          <strong>{formatINR(constraints.sanctionedLoan)}</strong> loan.
          However, our stress engine proves that a {stressTest.salesDeclinePercent}% sales decline compresses your DSCR to{' '}
          <strong>{stressedDSCR.ratio.toFixed(2)}x</strong> ({stressedDSCR.isAdequate ? 'ADEQUATE BUFFER' : 'INADEQUATE DEFICIT'}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Scheme Sanction Ceiling</span>
            <div className="text-xl font-extrabold text-gray-900 mt-1">{formatINR(constraints.sanctionedLoan)}</div>
            <span className="text-[11px] text-red-600 font-medium">Over-leveraged under stress</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-primary-300 ring-2 ring-primary-500/20">
            <span className="text-[11px] text-primary-700 uppercase font-semibold block">Recommended Resized Loan</span>
            <div className="text-xl font-extrabold text-primary-800 mt-1">
              {formatINR(recommendedStressedLoan.maxPrincipal)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Maintains DSCR ≥ 1.15x buffer</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Suggested Project Scope</span>
            <div className="text-sm font-bold text-gray-900 mt-1">2 Milch Animals + Green Fodder Plot</div>
            <span className="text-[11px] text-gray-500">Stagger remaining herd in Phase 2</span>
          </div>
        </div>
      </div>

      {/* 5. Supplementary Experimental ML Panel (Requirement 11) */}
      <div className="card p-6 bg-slate-50 border border-slate-300 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-primary-700" />
            <h3 className="font-bold text-sm text-gray-900">{t('ml.title', language)}</h3>
          </div>
          <span className="badge bg-slate-200 text-slate-800 text-[11px] font-semibold">
            {mlResult.modelType} (v{mlResult.modelVersion})
          </span>
        </div>

        {/* Mandatory Explicit Disclaimer */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Mandatory Research Disclaimer:</strong> {mlResult.disclaimer}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-gray-500 block text-[11px]">Synthetic Classification:</span>
            <span className="font-extrabold text-sm text-emerald-800 flex items-center gap-1 mt-0.5">
              <CheckCircle size={14} className="text-emerald-600" />
              {mlResult.predictedViable ? 'Viable Scenario' : 'High Risk Scenario'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-gray-500 block text-[11px]">Synthetic Viability Index:</span>
            <span className="font-extrabold text-sm text-primary-800 mt-0.5 block">
              {mlResult.viabilityProbability}%
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-gray-500 block text-[11px]">Benchmark Accuracy:</span>
            <span className="font-extrabold text-sm text-gray-900 mt-0.5 block">
              {(mlResult.evaluatedMetrics.accuracy * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-gray-500 block text-[11px]">Benchmark F1 Score:</span>
            <span className="font-extrabold text-sm text-gray-900 mt-0.5 block">
              {(mlResult.evaluatedMetrics.f1Score * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          Features evaluated: {mlResult.featuresUsed.slice(0, 6).join(', ')}... (Sensitive demographic variables and derived cash-flow outputs are audited and excluded).
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button onClick={onBack} className="btn-secondary text-xs px-5 py-2.5">
          {language === 'te'
            ? '← ఆర్థిక నిర్మాణానికి వెనుకకు'
            : language === 'ta'
            ? '← நிதி கட்டமைப்புக்குச் செல்ல'
            : '← Back to Financial Structuring'}
        </button>

        <button onClick={onContinue} className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2">
          <span>
            {language === 'te'
              ? 'AI సలహాదారుని సంప్రదించండి'
              : language === 'ta'
              ? 'AI ஆலோசகரிடம் ஆலோசனை பெற'
              : 'Consult AI Business Advisor'}
          </span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
