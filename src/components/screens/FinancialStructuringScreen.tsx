import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/lib/i18n';
import {
  calculateProjectSize,
  routeScheme,
  applySchemeConstraints,
  generateAmortizationSchedule,
  calculateEMI,
  calculateDSCR,
  calculateAffordability,
  estimateAffordableLoan,
} from '@/lib/finance/calculator';
import { formatINR } from '@/lib/finance/formatters';
import {
  Landmark,
  ShieldAlert,
  AlertTriangle,
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';

interface FinancialStructuringScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export const FinancialStructuringScreen: React.FC<FinancialStructuringScreenProps> = ({
  onContinue,
  onBack,
}) => {
  const { onboarding, language } = useAppStore();
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [scheduleType, setScheduleType] = useState<'quarterly' | 'monthly'>('quarterly');

  const marginCapital = onboarding.profile.availableSavings || 100000;

  // Step 1: Theoretical Project Sizing
  const sizingResult = calculateProjectSize(marginCapital);

  // Step 2: Route Scheme and Apply Scheme Constraints
  const theoreticalCost = sizingResult.theoreticalProjectCost;
  const applicableScheme = routeScheme(theoreticalCost);
  const schemeConstraint = applySchemeConstraints(theoreticalCost, marginCapital, applicableScheme);

  // Step 3: Repayment Schedule Generation
  const schedule = generateAmortizationSchedule({
    principal: schemeConstraint.sanctionedLoan,
    annualInterestRate: applicableScheme.annualInterestRate,
    tenureMonths: applicableScheme.tenureMonths,
    moratoriumMonths: applicableScheme.moratoriumMonths,
    frequency: scheduleType,
    moratoriumTreatment: 'interest_capitalised',
  });

  // Step 4: Monthly EMI Equivalent
  const monthlyEMI = calculateEMI(
    schemeConstraint.sanctionedLoan,
    applicableScheme.annualInterestRate,
    applicableScheme.tenureMonths - applicableScheme.moratoriumMonths
  );

  // Step 5: Cash-Flow Affordability Check
  // Illustrative monthly operating cash flow from Dairy Base Case: ~₹27,500
  const estMonthlyRevenue = 84000;
  const estMonthlyOpEx = 56500;
  const householdCosts = onboarding.household.monthlyHouseholdExpenses || 12000;
  const existingDebt = onboarding.household.existingMonthlyLoanPayments || 0;

  const affordability = calculateAffordability({
    monthlyIncome: estMonthlyRevenue,
    monthlyBusinessExpenses: estMonthlyOpEx,
    monthlyHouseholdCosts: householdCosts,
    existingMonthlyDebt: existingDebt,
  });

  const cashAvailableForDebt = Math.max(0, affordability.surplus);
  const dscr = calculateDSCR(
    cashAvailableForDebt,
    monthlyEMI
  );

  // Affordable Loan Estimation (constrained by cash flow buffer, targeting DSCR >= 1.25)
  const maxSafePayment = cashAvailableForDebt / 1.25;
  const safeLoanEstimate = estimateAffordableLoan(
    maxSafePayment,
    applicableScheme.annualInterestRate,
    applicableScheme.tenureMonths - applicableScheme.moratoriumMonths
  );

  const schemeExceedsAffordable = schemeConstraint.sanctionedLoan > safeLoanEstimate.maxPrincipal;

  return (
    <div className="space-y-8 pb-16">
      {/* =========================================================
          1. SCHEME SUMMARY AND PAGE HEADING
          Left-aligned title & subtitle, right-aligned routed scheme card.
          Clean vertical rhythm, responsive stack on < 1024px.
          ========================================================= */}
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#23835B] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-emerald-200">
                <Landmark size={12} className="text-[#23835B]" />
                {t('finance.phaseBadge', language)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 font-medium">
                {t('finance.phaseDesc', language)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('finance.title', language)}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              {t('finance.subtitle', language)}
            </p>
          </div>

          {/* Routed Scheme Badge Card */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 sm:p-5 shrink-0 lg:text-right min-w-[280px]">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              {t('finance.routedSchemeLabel', language)}
            </span>
            <div className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
              {applicableScheme.name}
            </div>
            <div className="text-xs font-semibold text-emerald-700 mt-1 flex lg:justify-end items-center gap-1.5 flex-wrap">
              <span>{(applicableScheme.annualInterestRate * 100).toFixed(1)}% p.a.</span>
              <span>•</span>
              <span>{applicableScheme.tenureMonths / 12} Yrs</span>
              <span>•</span>
              <span>({applicableScheme.moratoriumMonths} Mo Moratorium)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. FOUR FINANCIAL SUMMARY CARDS
          Equal-height cards with clear visual hierarchy:
          - Label: 15-16px, semi-bold
          - Primary value: 28-32px, extra-bold
          - Supporting text: 13-14px, muted gray (#69756E)
          - 4 cols on desktop (>1280px), 2 cols on tablet (768-1280px), 1 col on mobile (<768px)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Available Margin Capital */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full transition-shadow hover:shadow-sm">
          <div>
            <span className="text-sm sm:text-base font-bold text-gray-800 block mb-2 leading-tight">
              1. {t('finance.availableMargin', language)}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#123B2A] tracking-tight">
              {formatINR(marginCapital)}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#69756E] mt-3 pt-2 border-t border-gray-100">
            {t('finance.marginDesc', language)}
          </p>
        </div>

        {/* Card 2: Theoretical Project Cost */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full transition-shadow hover:shadow-sm">
          <div>
            <span className="text-sm sm:text-base font-bold text-gray-800 block mb-2 leading-tight">
              2. {t('finance.theoreticalCost', language)} ({t('finance.tenPercentRule', language)})
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#202A26] tracking-tight">
              {formatINR(theoreticalCost)}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#69756E] mt-3 pt-2 border-t border-gray-100">
            {t('finance.theoreticalCostDesc', language)}
          </p>
        </div>

        {/* Card 3: Max Eligible Scheme Loan */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full transition-shadow hover:shadow-sm">
          <div>
            <span className="text-sm sm:text-base font-bold text-gray-800 block mb-2 leading-tight">
              3. {t('finance.sanctionedLoan', language)} (90%)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#23835B] tracking-tight">
              {formatINR(schemeConstraint.sanctionedLoan)}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#69756E] mt-3 pt-2 border-t border-gray-100">
            {t('finance.loanCapDesc', language, { cap: formatINR(applicableScheme.maxLoanAmount) })}
          </p>
        </div>

        {/* Card 4: Required Own Contribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full transition-shadow hover:shadow-sm">
          <div>
            <span className="text-sm sm:text-base font-bold text-gray-800 block mb-2 leading-tight">
              4. {t('finance.ownContribution', language)}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#E7A23B] tracking-tight">
              {formatINR(schemeConstraint.requiredContribution)}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#69756E] mt-3 pt-2 border-t border-gray-100">
            {((schemeConstraint.requiredContribution / theoreticalCost) * 100).toFixed(1)}% {t('finance.ofProjectCost', language)}
          </p>
        </div>
      </div>

      {/* =========================================================
          3. CORE FINTECH DISTINCTION: ELIGIBILITY ≠ CASH-FLOW AFFORDABILITY
          Solid dark forest green background (#123B2A)
          High contrast white / light emerald text and dark internal cards.
          NO pale-to-dark gradient that hides white text!
          ========================================================= */}
      <div className="bg-[#123B2A] text-white rounded-xl p-6 sm:p-7 space-y-6 shadow-sm border border-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 text-[#E7A23B] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
            <Info size={18} className="text-[#E7A23B] shrink-0" />
            <span>{t('finance.eligibilityVsAffordability', language)}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-4xl">
            {t('finance.eligibilitySubtitle', language)}
          </p>
        </div>

        {/* Side-by-side solid comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Statutory Scheme Sanction Maximum */}
          <div className="bg-[#0e2c1f] rounded-xl p-5 border border-emerald-700/40 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                {t('finance.statutoryMax', language)}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatINR(schemeConstraint.sanctionedLoan)}
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed pt-2 border-t border-emerald-800/40">
              {t('finance.statutoryMaxDesc', language)}
            </p>
          </div>

          {/* Cash-Flow Grounded Safe Borrowing Capacity */}
          <div className="bg-[#0e2c1f] rounded-xl p-5 border border-[#E7A23B]/50 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#E7A23B] uppercase tracking-wider block mb-1">
                {t('finance.safeBorrowingCapacity', language)}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#E7A23B] tracking-tight">
                {formatINR(safeLoanEstimate.maxPrincipal)}
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed pt-2 border-t border-emerald-800/40">
              {t('finance.safeBorrowingCapacityDesc', language)}
            </p>
          </div>
        </div>

        {/* =========================================================
            FINANCIAL WARNING COMPONENT (Fixed translation key & high-contrast styling)
            Pale amber background (#FEF3C7)
            Dark amber border (#F59E0B)
            Dark amber text (#78350F)
            No clipping, proper padding, dynamic parameter interpolation
            ========================================================= */}
        {schemeExceedsAffordable && (
          <div
            role="alert"
            className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5 text-[#78350F] shadow-xs"
          >
            <div className="p-2 rounded-lg bg-[#FDE68A] text-[#92400E] shrink-0 mt-0.5">
              <AlertTriangle size={22} className="text-[#B45309]" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-[#92400E] leading-snug">
                {t('finance.warning.exceedsTitle', language)}
              </h4>
              <p className="text-xs sm:text-sm text-[#78350F] leading-relaxed break-words">
                {t('finance.warning.exceeds', language, {
                  schemeLimit: formatINR(schemeConstraint.sanctionedLoan),
                  affordableAmount: formatINR(safeLoanEstimate.maxPrincipal),
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          4. AMORTIZATION & REPAYMENT SCHEDULES
          Full responsive table with quarterly / monthly views
          ========================================================= */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-[#23835B]" />
              <span>{t('finance.reducingBalanceTitle', language)}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {t('finance.reducingBalanceSubtitle', language, {
                tenure: applicableScheme.tenureMonths,
                moratorium: applicableScheme.moratoriumMonths,
              })}
            </p>
          </div>

          {/* Quarterly vs Monthly Selector */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg shrink-0 border border-gray-200">
            <button
              onClick={() => setScheduleType('quarterly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                scheduleType === 'quarterly'
                  ? 'bg-[#123B2A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('finance.quarterlyTab', language)}
            </button>
            <button
              onClick={() => setScheduleType('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                scheduleType === 'monthly'
                  ? 'bg-[#123B2A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('finance.monthlyTab', language)}
            </button>
          </div>
        </div>

        {/* Schedule Metric Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">{t('finance.periodicInstalment', language)}:</span>
            <span className="font-extrabold text-gray-900 text-sm sm:text-base">
              {formatINR(schedule.periodicPayment)}
              <span className="text-xs font-normal text-gray-500">
                /{scheduleType === 'quarterly' ? 'Qtr' : 'Mo'}
              </span>
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">{t('finance.monthlyEmi', language)}:</span>
            <span className="font-extrabold text-[#23835B] text-sm sm:text-base">
              {formatINR(monthlyEMI)}
              <span className="text-xs font-normal text-gray-500">/month</span>
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">{t('finance.totalInterest', language)}:</span>
            <span className="font-extrabold text-gray-900 text-sm sm:text-base">
              {formatINR(schedule.totalInterestPaid)}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">{t('finance.totalRepayment', language)}:</span>
            <span className="font-extrabold text-gray-900 text-sm sm:text-base">
              {formatINR(schedule.totalAmountPaid)}
            </span>
          </div>
        </div>

        {/* Amortization Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">{t('finance.colPeriod', language)}</th>
                <th className="px-4 py-3">{t('finance.colOpeningBalance', language)}</th>
                <th className="px-4 py-3">{t('finance.colInstalment', language)}</th>
                <th className="px-4 py-3">{t('finance.colPrincipal', language)}</th>
                <th className="px-4 py-3">{t('finance.colInterest', language)}</th>
                <th className="px-4 py-3">{t('finance.colClosingBalance', language)}</th>
                <th className="px-4 py-3">{t('finance.colStatus', language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(showFullSchedule ? schedule.rows : schedule.rows.slice(0, 8)).map((row) => (
                <tr
                  key={row.period}
                  className={row.isMoratorium ? 'bg-amber-50/60' : 'hover:bg-gray-50 transition-colors'}
                >
                  <td className="px-4 py-2.5 font-semibold text-gray-900">
                    {scheduleType === 'quarterly' ? `Qtr ${row.period}` : `Month ${row.period}`}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 font-mono">{formatINR(row.openingBalance)}</td>
                  <td className="px-4 py-2.5 font-bold text-gray-900 font-mono">{formatINR(row.payment)}</td>
                  <td className="px-4 py-2.5 text-[#23835B] font-semibold font-mono">{formatINR(row.principalComponent)}</td>
                  <td className="px-4 py-2.5 text-red-600 font-mono">{formatINR(row.interestComponent)}</td>
                  <td className="px-4 py-2.5 text-gray-600 font-mono">{formatINR(row.closingBalance)}</td>
                  <td className="px-4 py-2.5">
                    {row.isMoratorium ? (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                        {t('finance.statusMoratorium', language)}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {t('finance.statusActive', language)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedule.rows.length > 8 && (
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-bold text-[#23835B] hover:text-[#123B2A] flex items-center justify-center gap-1.5 mx-auto py-2 px-4 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <span>
              {showFullSchedule
                ? t('finance.collapseInstalments', language)
                : t('finance.showAllInstalments', language, { count: schedule.rows.length })}
            </span>
            {showFullSchedule ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      {/* Scheme Assumptions Disclosure */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 text-xs text-gray-600 space-y-1">
        <div className="font-bold text-gray-900 flex items-center gap-1.5">
          <FileSpreadsheet size={15} className="text-[#23835B]" />
          <span>{t('finance.schemeAssumptionsTitle', language)}</span>
        </div>
        <p className="leading-relaxed">
          {t('finance.schemeAssumptionsBody', language)}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
        >
          {t('finance.btnBack', language)}
        </button>

        <button
          onClick={onContinue}
          className="bg-[#23835B] hover:bg-[#1b6b49] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-xs flex items-center gap-2 transition-colors"
        >
          <span>{t('finance.btnContinue', language)}</span>
        </button>
      </div>
    </div>
  );
};
