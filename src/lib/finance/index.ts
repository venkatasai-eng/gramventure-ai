/**
 * GramVenture AI — Financial Engine
 *
 * Barrel export for all public APIs.
 */

// Types
export type {
  SchemeId,
  SchemeConfig,
  ProjectSizingInput,
  LoanCalculationInput,
  AmortizationInput,
  AffordabilityInput,
  StressTestInput,
  ProjectSizingResult,
  SchemeConstraintResult,
  AmortizationRow,
  AmortizationSchedule,
  DSCRResult,
  AffordabilityResult,
  AffordableLoanResult,
  StressScenario,
  StressTestResult,
  RepaymentFrequency,
  MoratoriumTreatment,
  IndianCurrencyFormatOptions,
} from './types';

// Scheme configuration
export {
  MICRO_FINANCE_SCHEME,
  TERM_LOAN_SCHEME,
  ALL_SCHEMES,
  getSchemeById,
  MIN_PROJECT_COST,
  MAX_PROJECT_COST,
  DEFAULT_DSCR_THRESHOLD,
  STANDARD_MARGIN_PERCENT,
} from './schemeConfig';

// Calculator
export {
  calculateProjectSize,
  routeScheme,
  applySchemeConstraints,
  generateAmortizationSchedule,
  calculateEMI,
  calculateDSCR,
  calculateAffordability,
  estimateAffordableLoan,
  runStressTest,
} from './calculator';

// Validation
export {
  projectSizingSchema,
  loanCalculationSchema,
  amortizationInputSchema,
  emiInputSchema,
  dscrInputSchema,
  affordabilitySchema,
  affordableLoanSchema,
  stressTestSchema,
  validateInput,
  validateOrThrow,
} from './validation';

// Formatters
export {
  formatINR,
  formatINRCompact,
  formatPercent,
  formatDSCR,
  parseINR,
  applyIndianGrouping,
} from './formatters';
