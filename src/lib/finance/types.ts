/**
 * GramVenture AI — Financial Engine Types
 * All TypeScript interfaces and types for deterministic financial calculations.
 *
 * Currency: INR (₹) with Indian number formatting (lakhs / crores).
 * All monetary values are in paise-safe integers only where noted;
 * otherwise plain `number` denominated in ₹ (rupees).
 */

// ─── Scheme Identifiers ───────────────────────────────────────────────────────

/** The two scheme tiers supported by the platform. */
export type SchemeId = 'MICRO_FINANCE' | 'TERM_LOAN';

// ─── Scheme Configuration ─────────────────────────────────────────────────────

/** Immutable configuration for a single loan scheme. */
export interface SchemeConfig {
  /** Unique scheme identifier. */
  id: SchemeId;
  /** Human-readable scheme name. */
  name: string;
  /** Inclusive lower bound of eligible project cost (₹). */
  minProjectCost: number;
  /** Inclusive upper bound of eligible project cost (₹). */
  maxProjectCost: number;
  /** Funding ratio (0–1). E.g. 0.9 = 90 % funding. */
  fundingRatio: number;
  /** Maximum sanctionable loan amount (₹). */
  maxLoanAmount: number;
  /** Annual interest rate as a decimal (e.g. 0.065 = 6.5 %). */
  annualInterestRate: number;
  /** Stated rate type assumption (e.g. Reducing balance). */
  rateTypeAssumption?: string;
  /** Total loan tenure in months. */
  tenureMonths: number;
  /** Moratorium (grace) period in months — interest-only / deferred. */
  moratoriumMonths: number;
  /** Standard repayment planning frequency. */
  repaymentFrequency?: RepaymentFrequency;
  /** Treatment of interest during moratorium. */
  moratoriumTreatment?: MoratoriumTreatment;
  /** Source name or circular citation. */
  sourceName?: string;
  /** Source URL if verified, or null if unverified. */
  sourceUrl?: string | null;
  /** Verification status of scheme terms. */
  verificationStatus?: string;
  /** Date when officially verified, or null if unverified. */
  verifiedOn?: string | null;
}

// ─── Calculator Inputs ────────────────────────────────────────────────────────

/** Inputs required to size a project from margin capital. */
export interface ProjectSizingInput {
  /** Borrower's own contribution / margin capital (₹). */
  marginCapital: number;
}

/** Inputs for the full loan calculation pipeline. */
export interface LoanCalculationInput {
  /** Total project cost (₹). */
  projectCost: number;
  /** Borrower's own contribution (₹). */
  marginCapital: number;
  /** Optional override for the scheme to use. */
  schemeOverride?: SchemeId;
}

/** Inputs for generating an amortization schedule. */
export interface AmortizationInput {
  /** Loan principal (₹). */
  principal: number;
  /** Annual interest rate as a decimal. */
  annualInterestRate: number;
  /** Total tenure in months (including moratorium). */
  tenureMonths: number;
  /** Moratorium period in months (0 = no moratorium). */
  moratoriumMonths: number;
  /** Repayment frequency. Default: 'quarterly'. */
  frequency?: RepaymentFrequency;
  /** How the moratorium is treated. Default: 'interest_capitalised'. */
  moratoriumTreatment?: MoratoriumTreatment;
}

/** Inputs for affordability assessment. */
export interface AffordabilityInput {
  /** Monthly household income (₹). */
  monthlyIncome: number;
  /** Monthly business / operating expenses (₹). */
  monthlyBusinessExpenses: number;
  /** Monthly household living costs (₹). */
  monthlyHouseholdCosts: number;
  /** Total existing monthly debt obligations (₹). */
  existingMonthlyDebt: number;
}

/** Inputs for stress-test scenarios. */
export interface StressTestInput {
  /** Base-case loan principal (₹). */
  principal: number;
  /** Base-case annual interest rate (decimal). */
  annualInterestRate: number;
  /** Tenure in months. */
  tenureMonths: number;
  /** Rate increase scenarios (in basis points, e.g. [100, 200]). */
  rateShocksBps: number[];
  /** Revenue decline scenarios (as fraction, e.g. [0.1, 0.2, 0.3]). */
  revenueDeclines: number[];
  /** Projected monthly revenue (₹). */
  projectedMonthlyRevenue: number;
  /** Projected monthly costs (₹). */
  projectedMonthlyCosts: number;
}

// ─── Calculator Outputs ───────────────────────────────────────────────────────

/** Result of project sizing from margin capital. */
export interface ProjectSizingResult {
  /** Borrower's margin capital (₹). */
  marginCapital: number;
  /** Margin percentage applied. */
  marginPercent: number;
  /** Theoretical maximum project cost (₹). */
  theoreticalProjectCost: number;
  /** Theoretical loan amount (₹). */
  theoreticalLoanAmount: number;
  /** Scheme that would apply based on theoretical project cost. */
  applicableScheme: SchemeConfig;
}

/** Eligibility & constraint result after applying scheme limits. */
export interface SchemeConstraintResult {
  /** Whether the borrower is eligible for this scheme. */
  eligible: boolean;
  /** Reasons for ineligibility (empty if eligible). */
  ineligibilityReasons: string[];
  /** Actual sanctionable loan after caps (₹). */
  sanctionedLoan: number;
  /** Required borrower contribution (₹). */
  requiredContribution: number;
  /** Effective project cost (₹). */
  effectiveProjectCost: number;
  /** Feasible project cost considering available margin and scheme limits (₹). */
  feasibleProjectCost?: number;
  /** Available margin remaining after required contribution (₹). */
  availableMarginLeft?: number;
  /** Whether working capital is funded within the scheme loan. */
  workingCapitalFunded?: boolean;
  /** Scheme applied. */
  scheme: SchemeConfig;
  /** Effective funding ratio after caps. */
  effectiveFundingRatio: number;
  /** Estimated affordable borrowing range based on cash flow assumptions. */
  affordableBorrowingRange?: { min: number; max: number };
}

/** A single row in the amortization schedule. */
export interface AmortizationRow {
  /** Period number (1-based). */
  period: number;
  /** Opening balance at the start of this period (₹). */
  openingBalance: number;
  /** Payment due this period (₹). */
  payment: number;
  /** Interest component (₹). */
  interestComponent: number;
  /** Principal component (₹). */
  principalComponent: number;
  /** Closing balance at the end of this period (₹). */
  closingBalance: number;
  /** Whether this period falls in the moratorium window. */
  isMoratorium: boolean;
}

/** Full amortization schedule result. */
export interface AmortizationSchedule {
  /** All rows in the schedule. */
  rows: AmortizationRow[];
  /** Total interest paid over the life of the loan (₹). */
  totalInterestPaid: number;
  /** Total amount paid (principal + interest) (₹). */
  totalAmountPaid: number;
  /** Periodic payment amount (₹) — during repayment phase. */
  periodicPayment: number;
  /** Monthly EMI equivalent (₹). */
  monthlyEMIEquivalent: number;
  /** Effective principal after moratorium capitalisation (₹). */
  effectivePrincipal: number;
  /** Repayment frequency used. */
  frequency: RepaymentFrequency;
}

/** DSCR calculation result. */
export interface DSCRResult {
  /** Debt Service Coverage Ratio. */
  ratio: number;
  /** Cash available for debt service (₹). */
  cashAvailable: number;
  /** Scheduled debt payments (₹). */
  scheduledDebtPayments: number;
  /** Whether the DSCR is adequate (≥ 1.25 is typical threshold). */
  isAdequate: boolean;
  /** Threshold used for adequacy check. */
  threshold: number;
}

/** Affordability assessment result. */
export interface AffordabilityResult {
  /** Maximum affordable monthly payment (₹). */
  maxAffordablePayment: number;
  /** Surplus income after all obligations (₹). */
  surplus: number;
  /** Debt-to-income ratio (existing debt). */
  existingDTI: number;
  /** Total DTI if the new loan were approved. */
  projectedDTI: number;
  /** Whether the borrower can afford any new debt at all. */
  canAffordNewDebt: boolean;
}

/** Result of estimating the affordable loan principal. */
export interface AffordableLoanResult {
  /** Maximum principal that can be supported (₹). */
  maxPrincipal: number;
  /** Monthly payment used in the calculation (₹). */
  monthlyPayment: number;
  /** Annual interest rate used (decimal). */
  annualInterestRate: number;
  /** Tenure in months. */
  tenureMonths: number;
}

/** A single stress-test scenario result. */
export interface StressScenario {
  /** Scenario label. */
  label: string;
  /** Shocked interest rate (decimal). */
  shockedRate: number;
  /** Stressed monthly revenue (₹). */
  stressedRevenue: number;
  /** Stressed monthly costs (₹). */
  stressedCosts: number;
  /** EMI under this scenario (₹). */
  emi: number;
  /** DSCR under this scenario. */
  dscr: DSCRResult;
  /** Whether the project survives this scenario. */
  survives: boolean;
}

/** Full stress-test result. */
export interface StressTestResult {
  /** Individual scenario results. */
  scenarios: StressScenario[];
  /** Whether ALL scenarios pass. */
  allPass: boolean;
  /** Worst-case DSCR across all scenarios. */
  worstCaseDSCR: number;
}

// ─── Enumerations ─────────────────────────────────────────────────────────────

/** Supported repayment frequencies. */
export type RepaymentFrequency = 'monthly' | 'quarterly';

/** How the moratorium period is treated. */
export type MoratoriumTreatment =
  | 'interest_capitalised'   // Interest is added to principal.
  | 'interest_serviced'      // Borrower pays interest during moratorium.
  | 'full_deferral';         // No payments; interest accrues and capitalises.

// ─── Formatting ───────────────────────────────────────────────────────────────

/** Options for the Indian currency formatter. */
export interface IndianCurrencyFormatOptions {
  /** Whether to include the ₹ symbol. Default: true. */
  includeSymbol?: boolean;
  /** Number of decimal places. Default: 0. */
  decimals?: number;
  /** Whether to show the "Dr" / "Cr" suffix for negative / positive. */
  showSign?: boolean;
}
