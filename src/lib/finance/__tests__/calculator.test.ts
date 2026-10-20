/**
 * GramVenture AI — Financial Engine Tests
 *
 * 17+ test cases covering:
 *   1.  Micro Finance routing at exact boundary (₹1,40,000)
 *   2.  Term Loan routing above boundary (₹1,40,001)
 *   3.  Project sizing from margin capital
 *   4.  Scheme constraint — loan cap enforcement
 *   5.  Scheme constraint — insufficient margin capital
 *   6.  EMI calculation (Micro Finance)
 *   7.  EMI calculation (Term Loan)
 *   8.  Zero-interest EMI
 *   9.  Amortization schedule — Micro Finance with moratorium
 *  10.  Amortization schedule — Term Loan quarterly
 *  11.  Amortization schedule — zero interest
 *  12.  DSCR — healthy ratio
 *  13.  DSCR — zero debt payments (division by zero)
 *  14.  Affordability — positive surplus
 *  15.  Affordability — negative surplus (unaffordable)
 *  16.  Affordable loan estimation
 *  17.  Stress test — mixed pass/fail
 *  18.  Indian number formatting
 *  19.  Project cost above ₹50,00,000 — no scheme
 */

import { describe, it, expect } from 'vitest';

import {
  calculateProjectSize,
  routeScheme,
  applySchemeConstraints,
  calculateEMI,
  generateAmortizationSchedule,
  calculateDSCR,
  calculateAffordability,
  estimateAffordableLoan,
  runStressTest,
} from '../calculator';

import {
  MICRO_FINANCE_SCHEME,
  TERM_LOAN_SCHEME,
} from '../schemeConfig';

import {
  formatINR,
  formatINRCompact,
  applyIndianGrouping,
  parseINR,
} from '../formatters';

// ═══════════════════════════════════════════════════════════════════════════════
// Test 1: Micro Finance routing at exact boundary (₹1,40,000)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Scheme Routing', () => {
  it('Test 1: routes to Micro Finance at exactly ₹1,40,000', () => {
    const scheme = routeScheme(140_000);
    expect(scheme.id).toBe('MICRO_FINANCE');
    expect(scheme.name).toBe('Micro Finance');
    expect(scheme.maxProjectCost).toBe(140_000);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 2: Term Loan routing above boundary (₹1,40,001)
  // ═════════════════════════════════════════════════════════════════════════
  it('Test 2: routes to Term Loan at ₹1,40,001', () => {
    const scheme = routeScheme(140_001);
    expect(scheme.id).toBe('TERM_LOAN');
    expect(scheme.name).toBe('Term Loan');
    expect(scheme.minProjectCost).toBe(140_001);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 19: No scheme above ₹50,00,000
  // ═════════════════════════════════════════════════════════════════════════
  it('Test 19: throws for project cost above ₹50,00,000', () => {
    expect(() => routeScheme(5_000_001)).toThrow(
      /No scheme available/
    );
  });

  it('routes correctly at scheme boundaries', () => {
    expect(routeScheme(1).id).toBe('MICRO_FINANCE');
    expect(routeScheme(5_000_000).id).toBe('TERM_LOAN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 3: Project Sizing from margin capital
// ═══════════════════════════════════════════════════════════════════════════════
describe('Project Sizing', () => {
  it('Test 3: sizes project from ₹14,000 margin capital', () => {
    const result = calculateProjectSize(14_000);

    expect(result.marginCapital).toBe(14_000);
    expect(result.marginPercent).toBe(0.10);
    expect(result.theoreticalProjectCost).toBe(140_000);
    expect(result.theoreticalLoanAmount).toBe(126_000);
    expect(result.applicableScheme.id).toBe('MICRO_FINANCE');
  });

  it('sizes large project from ₹50,000 margin', () => {
    const result = calculateProjectSize(50_000);

    expect(result.theoreticalProjectCost).toBe(500_000);
    expect(result.applicableScheme.id).toBe('TERM_LOAN');
  });

  it('throws for zero margin capital', () => {
    expect(() => calculateProjectSize(0)).toThrow();
  });

  it('throws for negative margin capital', () => {
    expect(() => calculateProjectSize(-1000)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Tests 4 & 5: Scheme Constraints
// ═══════════════════════════════════════════════════════════════════════════════
describe('Scheme Constraints', () => {
  it('Test 4: caps loan at scheme maximum', () => {
    // Project cost ₹1,40,000 → 90% = ₹1,26,000, but max loan is ₹1,25,000
    const result = applySchemeConstraints(
      140_000,
      15_000,
      MICRO_FINANCE_SCHEME
    );

    expect(result.eligible).toBe(true);
    expect(result.sanctionedLoan).toBe(125_000); // capped
    expect(result.requiredContribution).toBe(15_000);
    expect(result.effectiveProjectCost).toBe(140_000);
  });

  it('Test 5: rejects insufficient margin capital', () => {
    const result = applySchemeConstraints(
      140_000,
      10_000, // needs ₹15,000
      MICRO_FINANCE_SCHEME
    );

    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReasons.length).toBeGreaterThan(0);
    expect(result.ineligibilityReasons[0]).toContain('margin capital');
  });

  it('handles Term Loan cap correctly', () => {
    // ₹50,00,000 × 90% = ₹45,00,000 = max loan → exactly at cap
    const result = applySchemeConstraints(
      5_000_000,
      500_000,
      TERM_LOAN_SCHEME
    );

    expect(result.eligible).toBe(true);
    expect(result.sanctionedLoan).toBe(4_500_000);
  });

  it('rejects project below scheme minimum', () => {
    const result = applySchemeConstraints(
      100_000,
      10_000,
      TERM_LOAN_SCHEME // min is ₹1,40,001
    );

    expect(result.eligible).toBe(false);
    expect(result.ineligibilityReasons[0]).toContain('below the minimum');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Tests 6, 7, 8: EMI Calculations
// ═══════════════════════════════════════════════════════════════════════════════
describe('EMI Calculation', () => {
  it('Test 6: Micro Finance EMI (₹1,25,00,00 at 6.5% for 33 months)', () => {
    // After 3-month moratorium, repayment is 33 months: P=1,25,000, r=0.065/12, n=33 -> ₹4,146.72
    const emi = calculateEMI(125_000, 0.065, 33);

    expect(emi).toBeGreaterThan(4_100);
    expect(emi).toBeLessThan(4_200);
  });

  it('Test 7: Term Loan EMI (₹45,00,000 at 8% for 78 months)', () => {
    // After 6-month moratorium, repayment is 78 months: P=45,00,000, r=0.08/12, n=78 -> ₹74,174.32
    const emi = calculateEMI(4_500_000, 0.08, 78);

    expect(emi).toBeGreaterThan(73_000);
    expect(emi).toBeLessThan(75_500);
  });

  it('Test 8: Zero interest EMI', () => {
    const emi = calculateEMI(120_000, 0, 36);
    expect(emi).toBeCloseTo(3_333.33, 1);
  });

  it('throws for zero principal', () => {
    expect(() => calculateEMI(0, 0.08, 36)).toThrow();
  });

  it('throws for negative rate', () => {
    expect(() => calculateEMI(100_000, -0.05, 36)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Tests 9, 10, 11: Amortization Schedules
// ═══════════════════════════════════════════════════════════════════════════════
describe('Amortization Schedule', () => {
  it('Test 9: Micro Finance schedule with 3-month moratorium (quarterly)', () => {
    const schedule = generateAmortizationSchedule({
      principal: 125_000,
      annualInterestRate: 0.065,
      tenureMonths: 36,
      moratoriumMonths: 3,
      frequency: 'quarterly',
      moratoriumTreatment: 'interest_capitalised',
    });

    // 1 moratorium quarter + 11 repayment quarters = 12 total periods
    expect(schedule.rows.length).toBe(12);

    // First row should be moratorium
    expect(schedule.rows[0].isMoratorium).toBe(true);
    expect(schedule.rows[0].payment).toBe(0); // capitalised, no payment

    // Effective principal should be > original due to capitalised interest
    expect(schedule.effectivePrincipal).toBeGreaterThan(125_000);

    // Last row should have closing balance ≈ 0
    const lastRow = schedule.rows[schedule.rows.length - 1];
    expect(lastRow.closingBalance).toBeCloseTo(0, 0);

    // Total interest should be positive
    expect(schedule.totalInterestPaid).toBeGreaterThan(0);

    // Frequency is quarterly
    expect(schedule.frequency).toBe('quarterly');

    // Monthly EMI equivalent should be ~1/3 of periodic payment
    expect(schedule.monthlyEMIEquivalent).toBeCloseTo(
      schedule.periodicPayment / 3,
      0
    );
  });

  it('Test 10: Term Loan quarterly schedule with 6-month moratorium', () => {
    const schedule = generateAmortizationSchedule({
      principal: 4_500_000,
      annualInterestRate: 0.08,
      tenureMonths: 84,
      moratoriumMonths: 6,
      frequency: 'quarterly',
      moratoriumTreatment: 'interest_capitalised',
    });

    // 2 moratorium quarters + 26 repayment quarters = 28 total periods
    expect(schedule.rows.length).toBe(28);

    // First 2 rows are moratorium
    expect(schedule.rows[0].isMoratorium).toBe(true);
    expect(schedule.rows[1].isMoratorium).toBe(true);
    expect(schedule.rows[2].isMoratorium).toBe(false);

    // Effective principal > original
    expect(schedule.effectivePrincipal).toBeGreaterThan(4_500_000);

    // Last row closes at 0
    const lastRow = schedule.rows[schedule.rows.length - 1];
    expect(lastRow.closingBalance).toBeCloseTo(0, 0);
  });

  it('Test 11: Zero-interest amortization', () => {
    const schedule = generateAmortizationSchedule({
      principal: 120_000,
      annualInterestRate: 0,
      tenureMonths: 36,
      moratoriumMonths: 0,
      frequency: 'quarterly',
    });

    // 12 quarters
    expect(schedule.rows.length).toBe(12);

    // Each payment should be principal / 12
    expect(schedule.periodicPayment).toBe(10_000);

    // Total interest should be 0
    expect(schedule.totalInterestPaid).toBe(0);

    // Total paid = principal
    expect(schedule.totalAmountPaid).toBeCloseTo(120_000, 0);
  });

  it('handles interest_serviced moratorium', () => {
    const schedule = generateAmortizationSchedule({
      principal: 100_000,
      annualInterestRate: 0.10,
      tenureMonths: 24,
      moratoriumMonths: 3,
      frequency: 'quarterly',
      moratoriumTreatment: 'interest_serviced',
    });

    // Moratorium row: borrower pays interest, principal stays same
    expect(schedule.rows[0].isMoratorium).toBe(true);
    expect(schedule.rows[0].payment).toBeGreaterThan(0);
    expect(schedule.effectivePrincipal).toBe(100_000); // not capitalised
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Tests 12, 13: DSCR
// ═══════════════════════════════════════════════════════════════════════════════
describe('DSCR', () => {
  it('Test 12: healthy DSCR ratio', () => {
    const result = calculateDSCR(50_000, 30_000);

    expect(result.ratio).toBeCloseTo(1.67, 1);
    expect(result.isAdequate).toBe(true);
    expect(result.threshold).toBe(1.25);
  });

  it('Test 13: zero debt payments — handles division by zero', () => {
    const result = calculateDSCR(50_000, 0);

    expect(result.ratio).toBe(Infinity);
    expect(result.isAdequate).toBe(true);
  });

  it('handles negative cash available with zero debt', () => {
    const result = calculateDSCR(-10_000, 0);
    expect(result.ratio).toBe(-Infinity);
    expect(result.isAdequate).toBe(false);
  });

  it('flags inadequate DSCR below threshold', () => {
    const result = calculateDSCR(10_000, 10_000);
    expect(result.ratio).toBe(1);
    expect(result.isAdequate).toBe(false); // 1.0 < 1.25
  });

  it('respects custom threshold', () => {
    const result = calculateDSCR(10_000, 10_000, 1.0);
    expect(result.isAdequate).toBe(true); // 1.0 ≥ 1.0
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Tests 14, 15: Affordability
// ═══════════════════════════════════════════════════════════════════════════════
describe('Affordability', () => {
  it('Test 14: positive surplus — can afford new debt', () => {
    const result = calculateAffordability({
      monthlyIncome: 25_000,
      monthlyBusinessExpenses: 5_000,
      monthlyHouseholdCosts: 8_000,
      existingMonthlyDebt: 2_000,
    });

    // surplus = 25000 - 5000 - 8000 - 2000 = 10000
    expect(result.surplus).toBe(10_000);
    expect(result.maxAffordablePayment).toBe(10_000);
    expect(result.canAffordNewDebt).toBe(true);
    expect(result.existingDTI).toBeCloseTo(0.08, 2);
  });

  it('Test 15: negative surplus — cannot afford new debt', () => {
    const result = calculateAffordability({
      monthlyIncome: 15_000,
      monthlyBusinessExpenses: 5_000,
      monthlyHouseholdCosts: 8_000,
      existingMonthlyDebt: 5_000,
    });

    // surplus = 15000 - 5000 - 8000 - 5000 = -3000
    expect(result.surplus).toBe(-3_000);
    expect(result.maxAffordablePayment).toBe(0); // clamped to 0
    expect(result.canAffordNewDebt).toBe(false);
  });

  it('handles zero income', () => {
    const result = calculateAffordability({
      monthlyIncome: 0,
      monthlyBusinessExpenses: 0,
      monthlyHouseholdCosts: 0,
      existingMonthlyDebt: 0,
    });

    expect(result.surplus).toBe(0);
    expect(result.canAffordNewDebt).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 16: Affordable Loan Estimation
// ═══════════════════════════════════════════════════════════════════════════════
describe('Affordable Loan Estimation', () => {
  it('Test 16: estimates max principal from monthly payment', () => {
    const result = estimateAffordableLoan(10_000, 0.065, 33);

    // Reverse of EMI: should give us ~ ₹3,14,000
    expect(result.maxPrincipal).toBeGreaterThan(300_000);
    expect(result.maxPrincipal).toBeLessThan(330_000);
    expect(result.monthlyPayment).toBe(10_000);
  });

  it('zero-rate estimation: P = EMI × n', () => {
    const result = estimateAffordableLoan(5_000, 0, 36);
    expect(result.maxPrincipal).toBe(180_000);
  });

  it('returns 0 for zero payment', () => {
    const result = estimateAffordableLoan(0, 0.08, 36);
    expect(result.maxPrincipal).toBe(0);
  });

  it('round-trips with calculateEMI', () => {
    const principal = 125_000;
    const rate = 0.065;
    const tenure = 33;
    const emi = calculateEMI(principal, rate, tenure);
    const estimated = estimateAffordableLoan(emi, rate, tenure);

    // Should get back approximately the original principal
    expect(estimated.maxPrincipal).toBeCloseTo(principal, -1); // within ₹10
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 17: Stress Test
// ═══════════════════════════════════════════════════════════════════════════════
describe('Stress Test', () => {
  it('Test 17: mixed pass/fail scenarios', () => {
    const result = runStressTest({
      principal: 125_000,
      annualInterestRate: 0.065,
      tenureMonths: 33,
      rateShocksBps: [100, 200],
      revenueDeclines: [0.1, 0.3],
      projectedMonthlyRevenue: 20_000,
      projectedMonthlyCosts: 10_000,
    });

    // 2 rate shocks × 2 revenue declines = 4 scenarios
    expect(result.scenarios.length).toBe(4);

    // Each scenario has the required fields
    for (const s of result.scenarios) {
      expect(s.emi).toBeGreaterThan(0);
      expect(s.shockedRate).toBeGreaterThan(0.065);
      expect(typeof s.survives).toBe('boolean');
      expect(s.dscr.ratio).toBeDefined();
    }

    // worstCaseDSCR should be from the most stressed scenario
    expect(result.worstCaseDSCR).toBeLessThanOrEqual(
      result.scenarios[0].dscr.ratio
    );

    // allPass reflects whether all survived
    expect(result.allPass).toBe(result.scenarios.every((s) => s.survives));
  });

  it('all-pass scenario with strong financials', () => {
    const result = runStressTest({
      principal: 50_000,
      annualInterestRate: 0.065,
      tenureMonths: 36,
      rateShocksBps: [100],
      revenueDeclines: [0.05],
      projectedMonthlyRevenue: 50_000,
      projectedMonthlyCosts: 5_000,
    });

    expect(result.allPass).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 18: Indian Number Formatting
// ═══════════════════════════════════════════════════════════════════════════════
describe('Indian Number Formatting', () => {
  it('Test 18: formats ₹1,40,000 correctly', () => {
    expect(formatINR(140_000)).toBe('₹1,40,000');
  });

  it('formats ₹45,00,000 correctly', () => {
    expect(formatINR(4_500_000)).toBe('₹45,00,000');
  });

  it('formats ₹1,25,000 correctly', () => {
    expect(formatINR(125_000)).toBe('₹1,25,000');
  });

  it('formats small numbers without grouping', () => {
    expect(formatINR(500)).toBe('₹500');
    expect(formatINR(0)).toBe('₹0');
  });

  it('formats with decimals', () => {
    expect(formatINR(125_000.5, { decimals: 2 })).toBe('₹1,25,000.50');
  });

  it('formats without symbol', () => {
    expect(formatINR(140_000, { includeSymbol: false })).toBe('1,40,000');
  });

  it('compact formatting for lakhs', () => {
    expect(formatINRCompact(140_000)).toBe('₹1.40L');
  });

  it('compact formatting for crores', () => {
    expect(formatINRCompact(1_50_00_000)).toBe('₹1.50Cr');
  });

  it('Indian grouping helper', () => {
    expect(applyIndianGrouping('140000')).toBe('1,40,000');
    expect(applyIndianGrouping('4500000')).toBe('45,00,000');
    expect(applyIndianGrouping('1000')).toBe('1,000');
    expect(applyIndianGrouping('500')).toBe('500');
    expect(applyIndianGrouping('10000000')).toBe('1,00,00,000');
  });

  it('round-trips parse ↔ format', () => {
    const formatted = formatINR(140_000);
    expect(parseINR(formatted)).toBe(140_000);
  });

  it('formats negative values', () => {
    expect(formatINR(-140_000)).toBe('-₹1,40,000');
  });
});
