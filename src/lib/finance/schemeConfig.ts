/**
 * GramVenture AI — Scheme Configuration
 *
 * Deterministic, immutable scheme parameters derived from
 * the challenge brief configuration.
 *
 * MICRO FINANCE : Project ≤ ₹1,40,000 | 90 % funding | max loan ₹1,25,000
 *                 6.5 % p.a. | 3-year tenure | 3-month moratorium
 *
 * TERM LOAN     : Project ₹1,40,001–₹50,00,000 | 90 % funding | max loan ₹45,00,000
 *                 8 % p.a. | 7-year tenure | 6-month moratorium
 *
 * Transparency Note: Terms are derived from the challenge brief and labeled
 * as "Challenge brief; not independently verified". Do not claim official state
 * verification unless an official circular is verified.
 */

import type { SchemeConfig, SchemeId } from './types';

// ─── Scheme Definitions ───────────────────────────────────────────────────────

export const MICRO_FINANCE_SCHEME: Readonly<SchemeConfig> = Object.freeze({
  id: 'MICRO_FINANCE' as SchemeId,
  name: 'Micro Finance',
  minProjectCost: 1, // ₹1 (minimum non-zero)
  maxProjectCost: 140_000, // ₹1,40,000
  fundingRatio: 0.90, // 90 %
  maxLoanAmount: 125_000, // ₹1,25,000
  annualInterestRate: 0.065, // 6.5 % p.a.
  rateTypeAssumption: 'Reducing balance nominal annual fixed rate',
  tenureMonths: 36, // 3 years
  moratoriumMonths: 3, // 3 months
  repaymentFrequency: 'quarterly',
  moratoriumTreatment: 'interest_capitalised',
  sourceName: 'Challenge brief; not independently verified',
  sourceUrl: null,
  verificationStatus: 'Unverified (Challenge brief parameter)',
  verifiedOn: null,
});

export const TERM_LOAN_SCHEME: Readonly<SchemeConfig> = Object.freeze({
  id: 'TERM_LOAN' as SchemeId,
  name: 'Term Loan',
  minProjectCost: 140_001, // ₹1,40,001
  maxProjectCost: 5_000_000, // ₹50,00,000
  fundingRatio: 0.90, // 90 %
  maxLoanAmount: 4_500_000, // ₹45,00,000
  annualInterestRate: 0.08, // 8 % p.a.
  rateTypeAssumption: 'Reducing balance nominal annual fixed rate',
  tenureMonths: 84, // 7 years
  moratoriumMonths: 6, // 6 months
  repaymentFrequency: 'quarterly',
  moratoriumTreatment: 'interest_capitalised',
  sourceName: 'Challenge brief; not independently verified',
  sourceUrl: null,
  verificationStatus: 'Unverified (Challenge brief parameter)',
  verifiedOn: null,
});

// ─── Registry ─────────────────────────────────────────────────────────────────

/** All available schemes, ordered from lowest to highest project cost. */
export const ALL_SCHEMES: ReadonlyArray<Readonly<SchemeConfig>> = Object.freeze([
  MICRO_FINANCE_SCHEME,
  TERM_LOAN_SCHEME,
]);

/**
 * Look up a scheme by its ID.
 * @throws {Error} if the scheme ID is unknown.
 */
export function getSchemeById(id: SchemeId): Readonly<SchemeConfig> {
  const scheme = ALL_SCHEMES.find((s) => s.id === id);
  if (!scheme) {
    throw new Error(`Unknown scheme ID: ${id}`);
  }
  return scheme;
}

// ─── Global Limits ────────────────────────────────────────────────────────────

/** Absolute minimum project cost supported by the platform (₹). */
export const MIN_PROJECT_COST = 1;

/** Absolute maximum project cost supported by the platform (₹). */
export const MAX_PROJECT_COST = 5_000_000;

/** Default DSCR threshold for adequacy checks. */
export const DEFAULT_DSCR_THRESHOLD = 1.25;

/** Standard margin percentage (borrower's own contribution). */
export const STANDARD_MARGIN_PERCENT = 0.10; // 10 %
