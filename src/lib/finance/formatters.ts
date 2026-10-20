/**
 * GramVenture AI — Indian Currency Formatters
 *
 * Formats numbers in the Indian numbering system:
 *   1,00,000   = 1 lakh
 *   1,00,00,000 = 1 crore
 *
 * Examples:
 *   formatINR(140000)    → "₹1,40,000"
 *   formatINR(4500000)   → "₹45,00,000"
 *   formatINR(125000.5, { decimals: 2 }) → "₹1,25,000.50"
 */

import type { IndianCurrencyFormatOptions } from './types';

// ─── Core Formatter ───────────────────────────────────────────────────────────

/**
 * Format a number using the Indian grouping system (lakhs / crores).
 *
 * Grouping rule: last three digits are grouped together,
 * then every two digits going left.
 *
 * @param value  - The numeric value (₹).
 * @param options - Formatting options.
 * @returns Formatted string, e.g. "₹1,40,000".
 */
export function formatINR(
  value: number,
  options: IndianCurrencyFormatOptions = {}
): string {
  const {
    includeSymbol = true,
    decimals = 0,
    showSign = false,
  } = options;

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // Split integer and decimal parts
  const fixed = absValue.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Apply Indian grouping
  const grouped = applyIndianGrouping(integerPart);

  // Assemble
  let result = grouped;
  if (decimalPart !== undefined) {
    result += '.' + decimalPart;
  }

  if (includeSymbol) {
    result = '₹' + result;
  }

  if (showSign) {
    result = isNegative ? result + ' Dr' : result + ' Cr';
  } else if (isNegative) {
    result = '-' + result;
  }

  return result;
}

/**
 * Apply Indian-style comma grouping to an integer string.
 *
 * "140000"  → "1,40,000"
 * "4500000" → "45,00,000"
 * "1000"    → "1,000"
 * "500"     → "500"
 */
export function applyIndianGrouping(intStr: string): string {
  if (intStr.length <= 3) {
    return intStr;
  }

  // Last 3 digits
  const lastThree = intStr.slice(-3);
  const remaining = intStr.slice(0, -3);

  // Group remaining in pairs from the right
  const pairs: string[] = [];
  let i = remaining.length;
  while (i > 0) {
    const start = Math.max(0, i - 2);
    pairs.unshift(remaining.slice(start, i));
    i = start;
  }

  return pairs.join(',') + ',' + lastThree;
}

// ─── Convenience Utilities ────────────────────────────────────────────────────

/**
 * Format as compact Indian notation.
 *   < 1 lakh     → "₹50,000"
 *   ≥ 1 lakh     → "₹1.40L"
 *   ≥ 1 crore    → "₹1.25Cr"
 */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    const crores = abs / 1_00_00_000;
    return `${sign}₹${crores.toFixed(2)}Cr`;
  }
  if (abs >= 1_00_000) {
    const lakhs = abs / 1_00_000;
    return `${sign}₹${lakhs.toFixed(2)}L`;
  }
  return formatINR(value);
}

/**
 * Format a percentage with the given number of decimal places.
 */
export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format a DSCR ratio.
 */
export function formatDSCR(ratio: number): string {
  if (!isFinite(ratio)) return '∞';
  return ratio.toFixed(2) + 'x';
}

/**
 * Parse a formatted INR string back to a number.
 * Strips ₹, commas, Dr/Cr suffixes.
 * Returns NaN if the string cannot be parsed.
 */
export function parseINR(formatted: string): number {
  const cleaned = formatted
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\s*(Dr|Cr)\s*$/i, '')
    .trim();

  const num = Number(cleaned);
  return num;
}
