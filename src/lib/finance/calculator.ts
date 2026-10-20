/**
 * GramVenture AI — Core Financial Calculator
 *
 * 100 % deterministic. No randomness. No LLM involvement.
 *
 * Functions:
 *   - calculateProjectSize    → Size a project from margin capital
 *   - routeScheme             → Determine which scheme applies
 *   - applySchemeConstraints  → Apply caps, limits, eligibility
 *   - generateAmortizationSchedule → Full repayment schedule
 *   - calculateEMI            → Monthly EMI (reducing balance)
 *   - calculateDSCR           → Debt Service Coverage Ratio
 *   - calculateAffordability  → Affordability assessment
 *   - estimateAffordableLoan  → Max principal from a monthly budget
 *   - runStressTest           → Multi-scenario stress testing
 */

import type {
  AffordabilityInput,
  AffordabilityResult,
  AffordableLoanResult,
  AmortizationInput,
  AmortizationRow,
  AmortizationSchedule,
  DSCRResult,
  MoratoriumTreatment,
  ProjectSizingResult,
  RepaymentFrequency,
  SchemeConfig,
  SchemeConstraintResult,
  StressScenario,
  StressTestInput,
  StressTestResult,
} from './types';

import {
  ALL_SCHEMES,
  DEFAULT_DSCR_THRESHOLD,
  MAX_PROJECT_COST,
  STANDARD_MARGIN_PERCENT,
} from './schemeConfig';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PROJECT SIZING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the theoretical project size from the borrower's margin capital.
 *
 * margin = 10 % of project cost  →  project cost = margin / 0.10
 * loan   = project cost × 0.90
 *
 * Then route to the appropriate scheme based on the theoretical project cost.
 *
 * @param marginCapital - Borrower's own contribution (₹). Must be > 0.
 * @returns ProjectSizingResult
 */
export function calculateProjectSize(
  marginCapital: number
): ProjectSizingResult {
  if (marginCapital <= 0 || !isFinite(marginCapital)) {
    throw new Error('marginCapital must be a positive finite number');
  }

  const marginPercent = STANDARD_MARGIN_PERCENT; // 10 %
  const theoreticalProjectCost = marginCapital / marginPercent;
  const theoreticalLoanAmount =
    theoreticalProjectCost * (1 - marginPercent);
  const applicableScheme = routeScheme(theoreticalProjectCost);

  return {
    marginCapital,
    marginPercent,
    theoreticalProjectCost,
    theoreticalLoanAmount,
    applicableScheme,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SCHEME ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Determine which scheme applies based on the total project cost.
 *
 * The schemes are searched in order; the first scheme whose
 * [minProjectCost, maxProjectCost] range contains the project cost is returned.
 *
 * @param projectCost - Total project cost (₹).
 * @returns The applicable SchemeConfig.
 * @throws {Error} if no scheme covers the given project cost.
 */
export function routeScheme(projectCost: number): SchemeConfig {
  if (projectCost <= 0 || !isFinite(projectCost)) {
    throw new Error('projectCost must be a positive finite number');
  }

  for (const scheme of ALL_SCHEMES) {
    if (
      projectCost >= scheme.minProjectCost &&
      projectCost <= scheme.maxProjectCost
    ) {
      return { ...scheme };
    }
  }

  throw new Error(
    `No scheme available for project cost ₹${projectCost}. ` +
      `Maximum supported project cost is ₹${MAX_PROJECT_COST}.`
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SCHEME CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply scheme-specific constraints (caps, contribution rules, eligibility).
 *
 * Rules:
 * 1. Loan requested = projectCost × fundingRatio
 * 2. Loan is capped at scheme.maxLoanAmount
 * 3. Required contribution = projectCost − sanctionedLoan
 * 4. Borrower's margin must be ≥ required contribution
 * 5. Project cost must fall within scheme limits
 *
 * @param projectCost    - Total project cost (₹).
 * @param marginCapital  - Borrower's own contribution (₹).
 * @param scheme         - The scheme to apply.
 * @returns SchemeConstraintResult
 */
export function applySchemeConstraints(
  projectCost: number,
  marginCapital: number,
  scheme: SchemeConfig
): SchemeConstraintResult {
  if (projectCost < 0 || !isFinite(projectCost)) {
    throw new Error('projectCost must be a non-negative finite number');
  }
  if (marginCapital < 0 || !isFinite(marginCapital)) {
    throw new Error('marginCapital must be a non-negative finite number');
  }

  const reasons: string[] = [];

  // ── Boundary checks ──────────────────────────────────────────────────────
  if (projectCost < scheme.minProjectCost) {
    reasons.push(
      `Project cost ₹${projectCost} is below the minimum ₹${scheme.minProjectCost} for ${scheme.name}.`
    );
  }
  if (projectCost > scheme.maxProjectCost) {
    reasons.push(
      `Project cost ₹${projectCost} exceeds the maximum ₹${scheme.maxProjectCost} for ${scheme.name}.`
    );
  }

  // ── Calculate loan ───────────────────────────────────────────────────────
  const rawLoan = projectCost * scheme.fundingRatio;
  const sanctionedLoan = Math.min(rawLoan, scheme.maxLoanAmount);
  const requiredContribution = projectCost - sanctionedLoan;

  if (marginCapital < requiredContribution) {
    reasons.push(
      `Borrower's margin capital ₹${marginCapital} is less than the required contribution ₹${requiredContribution}.`
    );
  }

  const effectiveFundingRatio =
    projectCost > 0 ? sanctionedLoan / projectCost : 0;

  const feasibleProjectCost = Math.min(
    projectCost,
    marginCapital > 0 ? marginCapital / (1 - scheme.fundingRatio) : 0,
    scheme.maxProjectCost
  );

  const availableMarginLeft = Math.max(0, marginCapital - requiredContribution);

  return {
    eligible: reasons.length === 0,
    ineligibilityReasons: reasons,
    sanctionedLoan: roundToTwo(sanctionedLoan),
    requiredContribution: roundToTwo(requiredContribution),
    effectiveProjectCost: roundToTwo(projectCost),
    feasibleProjectCost: roundToTwo(feasibleProjectCost),
    availableMarginLeft: roundToTwo(availableMarginLeft),
    workingCapitalFunded: sanctionedLoan > 0 && sanctionedLoan < scheme.maxLoanAmount,
    scheme,
    effectiveFundingRatio,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EMI CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard reducing-balance EMI formula:
 *
 *   EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 *
 * where:
 *   P = principal
 *   r = monthly interest rate (annualRate / 12)
 *   n = tenure in months
 *
 * Special case: if r = 0, EMI = P / n (avoid division by zero).
 *
 * @param principal   - Loan principal (₹). Must be > 0.
 * @param annualRate  - Annual interest rate as a decimal (e.g. 0.08).
 * @param tenureMonths - Number of monthly payments.
 * @returns Monthly EMI (₹), rounded to 2 decimal places.
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || !isFinite(principal)) {
    throw new Error('Principal must be a positive finite number');
  }
  if (annualRate < 0 || !isFinite(annualRate)) {
    throw new Error('Annual rate must be a non-negative finite number');
  }
  if (tenureMonths <= 0 || !Number.isInteger(tenureMonths)) {
    throw new Error('Tenure must be a positive integer');
  }

  // Zero-interest special case
  if (annualRate === 0) {
    return roundToTwo(principal / tenureMonths);
  }

  const r = annualRate / 12;
  const n = tenureMonths;
  const rPowN = Math.pow(1 + r, n);
  const emi = (principal * r * rPowN) / (rPowN - 1);

  return roundToTwo(emi);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. AMORTIZATION SCHEDULE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a complete amortization schedule with moratorium support.
 *
 * Moratorium treatment options:
 *   - interest_capitalised: Interest during moratorium is added to principal.
 *     Repayment EMI is computed on the enlarged principal.
 *   - interest_serviced: Borrower pays interest-only during moratorium.
 *     Repayment EMI is on the original principal.
 *   - full_deferral: No payments during moratorium; interest capitalises.
 *     Same as interest_capitalised computationally, but moratorium rows
 *     show zero payment.
 *
 * @param input - AmortizationInput
 * @returns AmortizationSchedule
 */
export function generateAmortizationSchedule(
  input: AmortizationInput
): AmortizationSchedule {
  const {
    principal,
    annualInterestRate,
    tenureMonths,
    moratoriumMonths,
    frequency = 'quarterly',
    moratoriumTreatment = 'interest_capitalised',
  } = input;

  if (principal <= 0 || !isFinite(principal)) {
    throw new Error('Principal must be a positive finite number');
  }
  if (tenureMonths <= 0) {
    throw new Error('Tenure must be positive');
  }
  if (moratoriumMonths >= tenureMonths) {
    throw new Error('Moratorium must be shorter than tenure');
  }

  const monthsPerPeriod = frequency === 'quarterly' ? 3 : 1;
  const periodicRate = (annualInterestRate / 12) * monthsPerPeriod;

  // ── Step 1: Moratorium phase ─────────────────────────────────────────────
  let effectivePrincipal = principal;
  const moratoriumRows: AmortizationRow[] = [];

  if (moratoriumMonths > 0) {
    const moratoriumPeriods = Math.ceil(moratoriumMonths / monthsPerPeriod);

    for (let p = 1; p <= moratoriumPeriods; p++) {
      const interestThisPeriod = roundToTwo(
        effectivePrincipal * periodicRate
      );

      let payment = 0;
      let principalComp = 0;
      let closingBalance = effectivePrincipal;

      switch (moratoriumTreatment) {
        case 'interest_capitalised':
        case 'full_deferral':
          // Interest adds to principal
          closingBalance = roundToTwo(effectivePrincipal + interestThisPeriod);
          payment = 0;
          principalComp = 0;
          break;
        case 'interest_serviced':
          // Borrower pays interest only
          payment = interestThisPeriod;
          principalComp = 0;
          closingBalance = effectivePrincipal;
          break;
      }

      moratoriumRows.push({
        period: p,
        openingBalance: roundToTwo(effectivePrincipal),
        payment,
        interestComponent: interestThisPeriod,
        principalComponent: principalComp,
        closingBalance,
        isMoratorium: true,
      });

      effectivePrincipal = closingBalance;
    }
  }

  // ── Step 2: Repayment phase ──────────────────────────────────────────────
  const repaymentMonths = tenureMonths - moratoriumMonths;
  const repaymentPeriods = Math.ceil(repaymentMonths / monthsPerPeriod);

  // Compute periodic payment on (possibly enlarged) principal
  let periodicPayment: number;
  if (periodicRate === 0) {
    periodicPayment = roundToTwo(effectivePrincipal / repaymentPeriods);
  } else {
    const rPowN = Math.pow(1 + periodicRate, repaymentPeriods);
    periodicPayment = roundToTwo(
      (effectivePrincipal * periodicRate * rPowN) / (rPowN - 1)
    );
  }

  const repaymentRows: AmortizationRow[] = [];
  let balance = effectivePrincipal;
  const startPeriod = moratoriumRows.length + 1;

  for (let p = 0; p < repaymentPeriods; p++) {
    const interest = roundToTwo(balance * periodicRate);
    let principalComp: number;
    let payment: number;

    if (p === repaymentPeriods - 1) {
      // Last period: clear remaining balance
      principalComp = roundToTwo(balance);
      payment = roundToTwo(principalComp + interest);
    } else {
      payment = periodicPayment;
      principalComp = roundToTwo(payment - interest);
    }

    const closing = roundToTwo(balance - principalComp);

    repaymentRows.push({
      period: startPeriod + p,
      openingBalance: roundToTwo(balance),
      payment,
      interestComponent: interest,
      principalComponent: principalComp,
      closingBalance: Math.max(0, closing), // avoid -0 / tiny negatives
      isMoratorium: false,
    });

    balance = Math.max(0, closing);
  }

  // ── Step 3: Aggregate ────────────────────────────────────────────────────
  const allRows = [...moratoriumRows, ...repaymentRows];

  const totalInterestPaid = allRows.reduce(
    (sum, row) => sum + row.interestComponent,
    0
  );
  const totalAmountPaid = allRows.reduce(
    (sum, row) => sum + row.payment,
    0
  );

  // Monthly EMI equivalent
  const monthlyEMIEquivalent =
    frequency === 'quarterly'
      ? roundToTwo(periodicPayment / 3)
      : periodicPayment;

  return {
    rows: allRows,
    totalInterestPaid: roundToTwo(totalInterestPaid),
    totalAmountPaid: roundToTwo(totalAmountPaid),
    periodicPayment,
    monthlyEMIEquivalent,
    effectivePrincipal,
    frequency,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. DSCR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the Debt Service Coverage Ratio.
 *
 *   DSCR = Cash Available for Debt Service / Scheduled Debt Payments
 *
 * Handles zero denominator: if scheduled debt payments = 0 and
 * cashAvailable ≥ 0, DSCR is Infinity (no debt to service).
 * If cashAvailable < 0 and debtPayments = 0, DSCR is -Infinity.
 *
 * @param cashAvailable   - Annual/periodic cash available for debt service (₹).
 * @param debtPayments    - Annual/periodic scheduled debt payments (₹).
 * @param threshold       - Adequacy threshold. Default 1.25.
 * @returns DSCRResult
 */
export function calculateDSCR(
  cashAvailable: number,
  debtPayments: number,
  threshold: number = DEFAULT_DSCR_THRESHOLD
): DSCRResult {
  let ratio: number;

  if (debtPayments === 0) {
    // Zero denominator
    ratio = cashAvailable >= 0 ? Infinity : -Infinity;
  } else {
    ratio = cashAvailable / debtPayments;
  }

  return {
    ratio: isFinite(ratio) ? roundToTwo(ratio) : ratio,
    cashAvailable,
    scheduledDebtPayments: debtPayments,
    isAdequate: ratio >= threshold,
    threshold,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. AFFORDABILITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate affordability: how much monthly debt the borrower can handle.
 *
 * surplus = income − businessExpenses − householdCosts − existingDebt
 * maxAffordablePayment = max(0, surplus)
 *
 * Never silently approve unaffordable projects.
 *
 * @param input - AffordabilityInput
 * @returns AffordabilityResult
 */
export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const {
    monthlyIncome,
    monthlyBusinessExpenses,
    monthlyHouseholdCosts,
    existingMonthlyDebt,
  } = input;

  const totalOutgo =
    monthlyBusinessExpenses + monthlyHouseholdCosts + existingMonthlyDebt;
  const surplus = monthlyIncome - totalOutgo;

  const maxAffordablePayment = Math.max(0, surplus);

  const existingDTI =
    monthlyIncome > 0 ? existingMonthlyDebt / monthlyIncome : 0;

  // We don't yet know the new loan's EMI, so projectedDTI at this stage
  // uses maximum affordable payment.
  const projectedDTI =
    monthlyIncome > 0
      ? (existingMonthlyDebt + maxAffordablePayment) / monthlyIncome
      : 0;

  return {
    maxAffordablePayment: roundToTwo(maxAffordablePayment),
    surplus: roundToTwo(surplus),
    existingDTI: roundToTwo(existingDTI),
    projectedDTI: roundToTwo(projectedDTI),
    canAffordNewDebt: surplus > 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. AFFORDABLE LOAN ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate the maximum loan principal that a given monthly payment can support.
 *
 * Rearranging the EMI formula:
 *   P = EMI × ((1+r)^n − 1) / (r × (1+r)^n)
 *
 * Zero-interest case:  P = EMI × n
 *
 * @param maxPayment   - Maximum affordable monthly payment (₹).
 * @param annualRate   - Annual interest rate (decimal).
 * @param tenureMonths - Loan tenure in months.
 * @returns AffordableLoanResult
 */
export function estimateAffordableLoan(
  maxPayment: number,
  annualRate: number,
  tenureMonths: number
): AffordableLoanResult {
  if (maxPayment <= 0) {
    return {
      maxPrincipal: 0,
      monthlyPayment: maxPayment,
      annualInterestRate: annualRate,
      tenureMonths,
    };
  }

  let maxPrincipal: number;

  if (annualRate === 0) {
    maxPrincipal = maxPayment * tenureMonths;
  } else {
    const r = annualRate / 12;
    const n = tenureMonths;
    const rPowN = Math.pow(1 + r, n);
    maxPrincipal = (maxPayment * (rPowN - 1)) / (r * rPowN);
  }

  return {
    maxPrincipal: roundToTwo(maxPrincipal),
    monthlyPayment: maxPayment,
    annualInterestRate: annualRate,
    tenureMonths,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. STRESS TESTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run multi-scenario stress tests.
 *
 * For each combination of (rateShock, revenueDecline):
 *   - shockedRate = baseRate + (bps / 10_000)
 *   - stressedRevenue = baseRevenue × (1 − decline)
 *   - stressedCosts = baseCosts  (costs are sticky)
 *   - emi = calculateEMI(principal, shockedRate, tenure)
 *   - cashAvailable = stressedRevenue − stressedCosts
 *   - dscr = cashAvailable / emi
 *   - survives = dscr ≥ threshold
 *
 * @param input - StressTestInput
 * @returns StressTestResult
 */
export function runStressTest(input: StressTestInput): StressTestResult {
  const {
    principal,
    annualInterestRate,
    tenureMonths,
    rateShocksBps,
    revenueDeclines,
    projectedMonthlyRevenue,
    projectedMonthlyCosts,
  } = input;

  const scenarios: StressScenario[] = [];

  for (const bps of rateShocksBps) {
    for (const decline of revenueDeclines) {
      const shockedRate = annualInterestRate + bps / 10_000;
      const stressedRevenue = projectedMonthlyRevenue * (1 - decline);
      const stressedCosts = projectedMonthlyCosts;
      const emi = calculateEMI(principal, shockedRate, tenureMonths);
      const cashAvailable = stressedRevenue - stressedCosts;
      const dscr = calculateDSCR(cashAvailable, emi);

      scenarios.push({
        label: `Rate +${bps}bps, Revenue -${(decline * 100).toFixed(0)}%`,
        shockedRate,
        stressedRevenue: roundToTwo(stressedRevenue),
        stressedCosts,
        emi,
        dscr,
        survives: dscr.isAdequate,
      });
    }
  }

  const allPass = scenarios.every((s) => s.survives);
  const worstCaseDSCR = scenarios.reduce(
    (min, s) => (s.dscr.ratio < min ? s.dscr.ratio : min),
    Infinity
  );

  return {
    scenarios,
    allPass,
    worstCaseDSCR: isFinite(worstCaseDSCR) ? roundToTwo(worstCaseDSCR) : worstCaseDSCR,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Round to 2 decimal places (banker-safe). */
function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
