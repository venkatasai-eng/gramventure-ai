/**
 * GramVenture AI — Input Validation
 *
 * Zod-based validation schemas for every financial input surface.
 * All monetary values must be non-negative finite numbers.
 */

import { z } from 'zod';

// ─── Primitives ───────────────────────────────────────────────────────────────

const positiveFiniteNumber = z
  .number()
  .finite('Value must be a finite number')
  .nonnegative('Value must be ≥ 0');

const strictlyPositiveFiniteNumber = z
  .number()
  .finite('Value must be a finite number')
  .positive('Value must be > 0');

const rateDecimal = z
  .number()
  .finite()
  .min(0, 'Rate must be ≥ 0')
  .max(1, 'Rate must be ≤ 1 (i.e. 100 %)');

const schemeIdEnum = z.enum(['MICRO_FINANCE', 'TERM_LOAN']);

const repaymentFrequencyEnum = z.enum(['monthly', 'quarterly']);

const moratoriumTreatmentEnum = z.enum([
  'interest_capitalised',
  'interest_serviced',
  'full_deferral',
]);

// ─── Project Sizing ───────────────────────────────────────────────────────────

export const projectSizingSchema = z.object({
  marginCapital: strictlyPositiveFiniteNumber.describe(
    "Borrower's own contribution / margin capital (₹)"
  ),
});

// ─── Loan Calculation ─────────────────────────────────────────────────────────

export const loanCalculationSchema = z
  .object({
    projectCost: strictlyPositiveFiniteNumber.describe('Total project cost (₹)'),
    marginCapital: positiveFiniteNumber.describe(
      "Borrower's own contribution (₹)"
    ),
    schemeOverride: schemeIdEnum.optional(),
  })
  .refine((data) => data.marginCapital <= data.projectCost, {
    message: 'Margin capital cannot exceed project cost',
    path: ['marginCapital'],
  });

// ─── Amortization ─────────────────────────────────────────────────────────────

export const amortizationInputSchema = z
  .object({
    principal: strictlyPositiveFiniteNumber.describe('Loan principal (₹)'),
    annualInterestRate: z
      .number()
      .finite()
      .min(0, 'Annual interest rate must be ≥ 0'),
    tenureMonths: z
      .number()
      .int('Tenure must be a whole number of months')
      .positive('Tenure must be > 0'),
    moratoriumMonths: z
      .number()
      .int('Moratorium must be a whole number of months')
      .min(0, 'Moratorium must be ≥ 0'),
    frequency: repaymentFrequencyEnum.optional().default('quarterly'),
    moratoriumTreatment: moratoriumTreatmentEnum
      .optional()
      .default('interest_capitalised'),
  })
  .refine((data) => data.moratoriumMonths < data.tenureMonths, {
    message: 'Moratorium must be shorter than the total tenure',
    path: ['moratoriumMonths'],
  });

// ─── EMI ──────────────────────────────────────────────────────────────────────

export const emiInputSchema = z.object({
  principal: strictlyPositiveFiniteNumber,
  annualRate: z.number().finite().min(0),
  tenureMonths: z.number().int().positive(),
});

// ─── DSCR ─────────────────────────────────────────────────────────────────────

export const dscrInputSchema = z.object({
  cashAvailable: z.number().finite(),
  debtPayments: z.number().finite().min(0),
  threshold: z.number().finite().positive().optional().default(1.25),
});

// ─── Affordability ────────────────────────────────────────────────────────────

export const affordabilitySchema = z
  .object({
    monthlyIncome: positiveFiniteNumber.describe('Monthly household income (₹)'),
    monthlyBusinessExpenses: positiveFiniteNumber.describe(
      'Monthly business / operating expenses (₹)'
    ),
    monthlyHouseholdCosts: positiveFiniteNumber.describe(
      'Monthly household living costs (₹)'
    ),
    existingMonthlyDebt: positiveFiniteNumber.describe(
      'Total existing monthly debt obligations (₹)'
    ),
  })
  .refine(
    (data) =>
      data.monthlyIncome > 0 ||
      (data.monthlyBusinessExpenses === 0 &&
        data.monthlyHouseholdCosts === 0 &&
        data.existingMonthlyDebt === 0),
    {
      message:
        'If monthly income is 0, all expenses and debts must also be 0',
      path: ['monthlyIncome'],
    }
  );

// ─── Affordable Loan Estimation ───────────────────────────────────────────────

export const affordableLoanSchema = z.object({
  maxPayment: strictlyPositiveFiniteNumber.describe(
    'Maximum affordable monthly payment (₹)'
  ),
  annualRate: z.number().finite().min(0),
  tenureMonths: z.number().int().positive(),
});

// ─── Stress Test ──────────────────────────────────────────────────────────────

export const stressTestSchema = z.object({
  principal: strictlyPositiveFiniteNumber,
  annualInterestRate: z.number().finite().min(0),
  tenureMonths: z.number().int().positive(),
  rateShocksBps: z.array(z.number().int().positive()).min(1),
  revenueDeclines: z
    .array(z.number().min(0).max(1))
    .min(1),
  projectedMonthlyRevenue: positiveFiniteNumber,
  projectedMonthlyCosts: positiveFiniteNumber,
});

// ─── Convenience Validators ───────────────────────────────────────────────────

/**
 * Validate and parse an input object against a schema.
 * Returns `{ success: true, data }` or `{ success: false, errors }`.
 */
export function validateInput<T>(
  schema: z.ZodType<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate and parse, throwing on failure (for internal use).
 */
export function validateOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  return schema.parse(input);
}
