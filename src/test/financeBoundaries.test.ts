import { describe, it, expect } from 'vitest';
import {
  calculateProjectSize,
  routeScheme,
  applySchemeConstraints,
  calculateEMI,
  generateAmortizationSchedule,
  calculateDSCR,
} from '@/lib/finance/calculator';
import {
  MICRO_FINANCE_SCHEME,
  TERM_LOAN_SCHEME,
} from '@/lib/finance/schemeConfig';

describe('Deterministic Financial Engine Boundary & Edge Cases', () => {
  describe('Project Sizing (10% Promoter Equity Rule)', () => {
    it('accurately sizes at exactly ₹1,40,000 for ₹14,000 margin capital', () => {
      const sizing = calculateProjectSize(14_000);
      expect(sizing.marginCapital).toBe(14_000);
      expect(sizing.theoreticalProjectCost).toBe(140_000);
      expect(sizing.theoreticalLoanAmount).toBe(126_000);
      expect(sizing.marginPercent).toBe(0.1);
    });

    it('accurately sizes at ₹50,00,000 for ₹5,00,000 margin capital', () => {
      const sizing = calculateProjectSize(500_000);
      expect(sizing.marginCapital).toBe(500_000);
      expect(sizing.theoreticalProjectCost).toBe(5_000_000);
      expect(sizing.theoreticalLoanAmount).toBe(4_500_000);
    });

    it('rejects zero or negative margin capital', () => {
      expect(() => calculateProjectSize(0)).toThrow();
      expect(() => calculateProjectSize(-5000)).toThrow();
    });
  });

  describe('Scheme Routing Boundaries', () => {
    it('routes ₹1 to Micro Finance (minimum boundary)', () => {
      const scheme = routeScheme(1);
      expect(scheme.id).toBe('MICRO_FINANCE');
    });

    it('routes ₹1,40,000 to Micro Finance (exact upper boundary)', () => {
      const scheme = routeScheme(140_000);
      expect(scheme.id).toBe('MICRO_FINANCE');
      expect(scheme.maxProjectCost).toBe(140_000);
    });

    it('routes ₹1,40,001 to Term Loan (exact lower boundary)', () => {
      const scheme = routeScheme(140_001);
      expect(scheme.id).toBe('TERM_LOAN');
      expect(scheme.minProjectCost).toBe(140_001);
    });

    it('routes ₹50,00,000 to Term Loan (exact upper boundary)', () => {
      const scheme = routeScheme(5_000_000);
      expect(scheme.id).toBe('TERM_LOAN');
      expect(scheme.maxProjectCost).toBe(5_000_000);
    });

    it('throws for project costs above ₹50,00,000', () => {
      expect(() => routeScheme(5_000_001)).toThrow();
      expect(() => routeScheme(10_000_000)).toThrow();
    });
  });

  describe('Scheme Constraints & Statutory Caps', () => {
    it('binds Micro Finance to maximum ₹1,25,000 loan cap', () => {
      // 90% of 140,000 is 126,000, but cap is 125,000
      const constraints = applySchemeConstraints(140_000, 15_000, MICRO_FINANCE_SCHEME);
      expect(constraints.sanctionedLoan).toBe(125_000);
      expect(constraints.requiredContribution).toBe(15_000);
      expect(constraints.effectiveFundingRatio).toBeCloseTo(125_000 / 140_000, 4);
      expect(constraints.eligible).toBe(true);
    });

    it('binds Term Loan to maximum ₹45,00,000 loan cap', () => {
      // 90% of 50,00,000 is exactly 45,00,000
      const constraints = applySchemeConstraints(5_000_000, 500_000, TERM_LOAN_SCHEME);
      expect(constraints.sanctionedLoan).toBe(4_500_000);
      expect(constraints.requiredContribution).toBe(500_000);
      expect(constraints.eligible).toBe(true);
    });

    it('flags ineligibility when margin capital is less than required contribution', () => {
      // ₹1,40,000 project requires at least ₹15,000 margin because loan is capped at ₹1,25,000
      const constraints = applySchemeConstraints(140_000, 10_000, MICRO_FINANCE_SCHEME);
      expect(constraints.eligible).toBe(false);
      expect(constraints.ineligibilityReasons.length).toBeGreaterThan(0);
    });
  });

  describe('EMI & Amortization Precision', () => {
    it('calculates exact EMI for Micro Finance (₹1,25,000 at 6.5% for 33 active repayment months)', () => {
      const emi = calculateEMI(125_000, 0.065, 33);
      expect(emi).toBeGreaterThan(4100);
      expect(emi).toBeLessThan(4200);
      expect(Math.round(emi)).toBe(4147);
    });

    it('calculates zero interest EMI without division by zero', () => {
      const emi = calculateEMI(120_000, 0, 12);
      expect(emi).toBe(10_000);
    });

    it('generates correct quarterly amortization schedule with capitalised moratorium', () => {
      const schedule = generateAmortizationSchedule({
        principal: 125_000,
        annualInterestRate: 0.065,
        tenureMonths: 36,
        moratoriumMonths: 3,
        frequency: 'quarterly',
        moratoriumTreatment: 'interest_capitalised',
      });

      expect(schedule.rows.length).toBe(12); // 36 months / 3 = 12 quarters
      expect(schedule.rows[0].isMoratorium).toBe(true);
      expect(schedule.rows[0].principalComponent).toBe(0);
      expect(schedule.rows[11].closingBalance).toBeCloseTo(0, 0);
      expect(schedule.totalAmountPaid).toBeGreaterThan(125_000);
    });
  });

  describe('DSCR Calculation', () => {
    it('correctly assesses DSCR >= 1.25 as adequate', () => {
      const dscr = calculateDSCR(25_000, 15_000, 1.25);
      expect(dscr.ratio).toBeCloseTo(1.667, 2);
      expect(dscr.isAdequate).toBe(true);
    });

    it('flags DSCR < 1.25 as inadequate', () => {
      const dscr = calculateDSCR(10_000, 15_000, 1.25);
      expect(dscr.ratio).toBeCloseTo(0.667, 2);
      expect(dscr.isAdequate).toBe(false);
    });

    it('handles zero debt gracefully without division by zero infinity errors', () => {
      const dscr = calculateDSCR(25_000, 0);
      expect(dscr.ratio).toBe(Infinity);
      expect(dscr.isAdequate).toBe(true);
    });
  });
});
