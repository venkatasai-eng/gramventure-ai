/**
 * GramVenture AI — Business Scoring Engine
 *
 * Weighted scoring with 5 components:
 *   1. Financial Affordability  — 30%
 *   2. Local Opportunity Evidence — 25%
 *   3. Competitive Positioning  — 20%
 *   4. Operational Risk         — 15%
 *   5. Capital Fit              — 10%
 *
 * Each component is normalised to 0–100.
 * Composite = Σ (component × weight).
 * Grade: A (≥80), B (≥65), C (≥50), D (≥35), F (<35).
 *
 * "Insufficient Data" handling: if evidence coverage for a component
 * falls below a threshold, the component receives a penalty cap and
 * is flagged as insufficientData.
 */

import type {
  BusinessModelTemplate,
  BusinessScenario,
  BusinessScore,
  ComponentScore,
  CompetitorObservation,
  EvidenceReport,
  PricingObservation,
  ScenarioLevel,
  ScoringWeights,
  UserInput,
  VillageProfile,
} from './types';

import { BUSINESS_MODELS, computeScenarioTotals, totalSetupCost } from './businessModels';
import { buildEvidenceReport } from './evidenceEngine';

// ---------------------------------------------------------------------------
// Default Weights (configurable by caller)
// ---------------------------------------------------------------------------

export const DEFAULT_WEIGHTS: ScoringWeights = {
  financialAffordability: 0.30,
  localOpportunity: 0.25,
  competitivePositioning: 0.20,
  operationalRisk: 0.15,
  capitalFit: 0.10,
};

/**
 * Minimum evidence-coverage % required for a component before
 * an "Insufficient Data" penalty is applied.
 */
const INSUFFICIENT_DATA_THRESHOLD = 30;

/**
 * Maximum score a component can achieve when data is insufficient.
 * This prevents over-confident recommendations.
 */
const INSUFFICIENT_DATA_CAP = 50;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score a single business model against the user's inputs.
 *
 * @param modelId   – ID of the BusinessModelTemplate
 * @param input     – Full user-provided context
 * @param scenario  – Which scenario to score against
 * @param weights   – Optional custom weights (defaults used otherwise)
 *
 * @returns BusinessScore with composite, components, and evidence report.
 */
export function scoreBusinessModel(
  modelId: string,
  input: UserInput,
  scenario: ScenarioLevel = 'base',
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): BusinessScore {
  const model = BUSINESS_MODELS[modelId];
  if (!model) {
    throw new Error(`Unknown business model ID: ${modelId}`);
  }

  const scenarioData = computeScenarioTotals({ ...structuredClone(model.scenarios[scenario]) });
  const setup = totalSetupCost(scenarioData);
  const evidenceReport = buildEvidenceReport(input, model);

  // Competitor observations for THIS category
  const competitors = input.competitorObservations.filter(
    (c) => c.businessCategory === model.category,
  );

  // Pricing observations for THIS category
  const pricingObs = input.pricingObservations.filter(
    (p) => p.businessCategory === model.category,
  );

  // --- Component 1: Financial Affordability (30%) -------------------------
  const financialAffordability = scoreFinancialAffordability(
    input.availableCapital,
    setup,
    scenarioData,
    evidenceReport,
  );

  // --- Component 2: Local Opportunity Evidence (25%) ----------------------
  const localOpportunity = scoreLocalOpportunity(
    input.village,
    model,
    pricingObs,
    evidenceReport,
  );

  // --- Component 3: Competitive Positioning (20%) -------------------------
  const competitivePositioning = scoreCompetitivePositioning(
    competitors,
    input.village,
    model,
    evidenceReport,
  );

  // --- Component 4: Operational Risk (15%) --------------------------------
  const operationalRisk = scoreOperationalRisk(
    model,
    scenarioData,
    input.availableCapital,
    evidenceReport,
  );

  // --- Component 5: Capital Fit (10%) ------------------------------------
  const capitalFit = scoreCapitalFit(
    input.availableCapital,
    setup,
    scenarioData,
    evidenceReport,
  );

  // --- Assemble components ------------------------------------------------
  const components: ComponentScore[] = [
    applyWeight(financialAffordability, weights.financialAffordability),
    applyWeight(localOpportunity, weights.localOpportunity),
    applyWeight(competitivePositioning, weights.competitivePositioning),
    applyWeight(operationalRisk, weights.operationalRisk),
    applyWeight(capitalFit, weights.capitalFit),
  ];

  const compositeScore = Math.round(
    components.reduce((sum, c) => sum + c.weightedScore, 0),
  );

  return {
    businessModelId: modelId,
    businessName: model.name,
    compositeScore,
    grade: toGrade(compositeScore),
    components,
    evidenceReport,
    scenarioUsed: scenario,
    scoredAt: new Date().toISOString(),
  };
}

/**
 * Score ALL selected businesses and return ranked results.
 */
export function scoreAllBusinesses(
  input: UserInput,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): BusinessScore[] {
  return input.selectedBusinessIds
    .map((id) => scoreBusinessModel(id, input, input.preferredScenario, weights))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

export const scoreBusiness = scoreBusinessModel;
export const rankBusinesses = (
  modelIds: string[],
  input: UserInput,
  scenario: ScenarioLevel = 'base',
  weights: ScoringWeights = DEFAULT_WEIGHTS
): BusinessScore[] =>
  scoreAllBusinesses(
    { ...input, selectedBusinessIds: modelIds, preferredScenario: scenario },
    weights
  );

/**
 * Returns a human-readable explanation of the scoring formula.
 * This ensures the formula is fully inspectable.
 */
export function explainScoringFormula(weights: ScoringWeights = DEFAULT_WEIGHTS): string {
  return [
    '═══ GramVenture AI — Scoring Formula ═══',
    '',
    'Composite Score = Σ (Component Score × Weight)',
    '',
    `  1. Financial Affordability  × ${(weights.financialAffordability * 100).toFixed(0)}%`,
    `     → Measures: Can the entrepreneur afford setup + 3 months operating costs?`,
    `     → Formula: 100 × min(1, availableCapital / (setupCost + 3 × monthlyCost))`,
    `     → Bonus: +10 if capital covers 6+ months; +5 if 4–6 months.`,
    '',
    `  2. Local Opportunity Evidence × ${(weights.localOpportunity * 100).toFixed(0)}%`,
    `     → Measures: Is there evidence of demand in this location?`,
    `     → Factors: Population adequacy, pricing observations, market access.`,
    `     → Penalty: −20 if no pricing data; −15 if population < 1000.`,
    '',
    `  3. Competitive Positioning   × ${(weights.competitivePositioning * 100).toFixed(0)}%`,
    `     → Measures: How crowded is the market?`,
    `     → Formula: 100 − (competitors × 20), floor 20.`,
    `     → Bonus: +15 if nearest competitor > 3km; +10 if all competitors "weak".`,
    '',
    `  4. Operational Risk          × ${(weights.operationalRisk * 100).toFixed(0)}%`,
    `     → Measures: How risky is execution?`,
    `     → Factors: Seasonality variance, perishability, regulatory needs, skill intensity.`,
    `     → Higher score = LOWER risk (inverted for intuitive interpretation).`,
    '',
    `  5. Capital Fit               × ${(weights.capitalFit * 100).toFixed(0)}%`,
    `     → Measures: Is this the right SIZE of business for available capital?`,
    `     → Sweet spot: setup = 40–70% of capital. Too little or too much is penalised.`,
    '',
    `Insufficient Data Rule:`,
    `  If evidence coverage for a component < ${INSUFFICIENT_DATA_THRESHOLD}%, the component`,
    `  score is capped at ${INSUFFICIENT_DATA_CAP} and flagged as "Insufficient Data".`,
    '',
    'Grade Scale: A (≥80) | B (≥65) | C (≥50) | D (≥35) | F (<35)',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Component Scoring Functions
// ---------------------------------------------------------------------------

function scoreFinancialAffordability(
  capital: number,
  setupCost: number,
  scenario: BusinessScenario,
  evidence: EvidenceReport,
): Omit<ComponentScore, 'weight' | 'weightedScore'> {
  const monthlyCost = scenario.totalMonthlyCost ?? 0;
  const totalNeeded = setupCost + 3 * monthlyCost; // 3 months operating reserve
  const ratio = capital / Math.max(totalNeeded, 1);

  let rawScore = Math.round(Math.min(1, ratio) * 100);

  // Bonus for comfortable capital buffer
  const monthsCovered = (capital - setupCost) / Math.max(monthlyCost, 1);
  if (monthsCovered >= 6) rawScore = Math.min(100, rawScore + 10);
  else if (monthsCovered >= 4) rawScore = Math.min(100, rawScore + 5);

  // Penalty if capital doesn't even cover setup
  if (capital < setupCost) {
    rawScore = Math.min(rawScore, 25);
  }

  const insufficientData = checkInsufficientData(evidence, 'cost_estimate');

  return {
    name: 'Financial Affordability',
    rawScore: insufficientData ? Math.min(rawScore, INSUFFICIENT_DATA_CAP) : rawScore,
    insufficientData,
    explanation: capital < setupCost
      ? `Available capital ₹${fmt(capital)} is less than setup cost ₹${fmt(setupCost)}. Business cannot be started at this scale.`
      : `Capital ₹${fmt(capital)} covers setup ₹${fmt(setupCost)} + ~${Math.round(monthsCovered)} months of operating costs.`,
  };
}

function scoreLocalOpportunity(
  village: VillageProfile,
  model: BusinessModelTemplate,
  pricingObs: PricingObservation[],
  evidence: EvidenceReport,
): Omit<ComponentScore, 'weight' | 'weightedScore'> {
  let rawScore = 60; // Base score — most businesses have some local demand

  // Population factor
  const pop = village.population.value;
  if (pop >= 5000) rawScore += 15;
  else if (pop >= 2000) rawScore += 10;
  else if (pop >= 1000) rawScore += 5;
  else rawScore -= 15; // Very small village — limited demand

  // Pricing evidence
  if (pricingObs.length >= 3) rawScore += 10;
  else if (pricingObs.length >= 1) rawScore += 5;
  else rawScore -= 20; // No pricing data — big uncertainty

  // Distance to town
  const dist = village.distanceToTownKm.value;
  if (dist > 20) rawScore += 5; // Far from town = less competition from town shops
  else if (dist < 5) rawScore -= 5; // Close to town = town shops compete

  // Economic activity match
  const relatedActivities = village.economicActivities.filter((a) =>
    model.tags.some((t) => a.toLowerCase().includes(t.toLowerCase())),
  );
  if (relatedActivities.length > 0) rawScore += 10;

  rawScore = clamp(rawScore, 0, 100);
  const insufficientData = checkInsufficientData(evidence, 'population');

  return {
    name: 'Local Opportunity Evidence',
    rawScore: insufficientData ? Math.min(rawScore, INSUFFICIENT_DATA_CAP) : rawScore,
    insufficientData,
    explanation: `Population ${fmt(pop)}, ${pricingObs.length} pricing observations, ${dist} km from nearest town. ${relatedActivities.length > 0 ? 'Related economic activities found.' : 'No directly related economic activities listed.'}`,
  };
}

function scoreCompetitivePositioning(
  competitors: CompetitorObservation[],
  village: VillageProfile,
  model: BusinessModelTemplate,
  evidence: EvidenceReport,
): Omit<ComponentScore, 'weight' | 'weightedScore'> {
  let rawScore = 100; // Start perfect and subtract for competition

  // Each competitor reduces score
  rawScore -= competitors.length * 20;
  rawScore = Math.max(rawScore, 20); // Floor at 20

  // Distance bonus — if nearest competitor is far, less direct competition
  if (competitors.length > 0) {
    const nearestDist = Math.min(...competitors.map((c) => c.distanceKm.value));
    if (nearestDist > 5) rawScore = Math.min(100, rawScore + 20);
    else if (nearestDist > 3) rawScore = Math.min(100, rawScore + 15);
    else if (nearestDist > 1) rawScore = Math.min(100, rawScore + 5);
  }

  // Competitor strength assessment
  const weakCompetitors = competitors.filter((c) => c.strengthAssessment === 'weak');
  if (weakCompetitors.length === competitors.length && competitors.length > 0) {
    rawScore = Math.min(100, rawScore + 10);
  }

  const strongCompetitors = competitors.filter((c) => c.strengthAssessment === 'strong');
  if (strongCompetitors.length > 0) {
    rawScore -= strongCompetitors.length * 10;
  }

  rawScore = clamp(rawScore, 0, 100);
  const insufficientData = checkInsufficientData(evidence, 'competitor');

  return {
    name: 'Competitive Positioning',
    rawScore: insufficientData ? Math.min(rawScore, INSUFFICIENT_DATA_CAP) : rawScore,
    insufficientData,
    explanation: competitors.length === 0
      ? 'No competitors documented. Score assumes open market, but may reflect incomplete observation.'
      : `${competitors.length} competitor(s) observed. ${strongCompetitors.length} strong, ${weakCompetitors.length} weak.`,
  };
}

function scoreOperationalRisk(
  model: BusinessModelTemplate,
  scenario: BusinessScenario,
  capital: number,
  evidence: EvidenceReport,
): Omit<ComponentScore, 'weight' | 'weightedScore'> {
  let rawScore = 80; // Start with moderate risk, adjust

  // Seasonality variance → higher variance = more risk = lower score
  const multipliers = model.seasonality.monthlyMultipliers;
  const avg = multipliers.reduce((s, m) => s + m, 0) / 12;
  const variance =
    multipliers.reduce((s, m) => s + (m - avg) ** 2, 0) / 12;
  if (variance > 0.03) rawScore -= 15; // High seasonality
  else if (variance > 0.01) rawScore -= 8;

  // Time to revenue
  const ttr = model.timeToRevenueInDays.value;
  if (ttr > 90) rawScore -= 15;
  else if (ttr > 30) rawScore -= 8;
  else if (ttr <= 7) rawScore += 5;

  // Working capital adequacy
  const wcNeeded = scenario.workingCapitalNeeded.value;
  const setup = totalSetupCost(scenario);
  const remainingAfterSetup = capital - setup;
  if (remainingAfterSetup < wcNeeded) rawScore -= 15;
  else if (remainingAfterSetup < wcNeeded * 1.5) rawScore -= 5;

  // Category-specific risks
  const riskyCategories: Record<string, number> = {
    'Poultry': -10,       // Disease risk
    'Dairy': -5,          // Animal health risk
    'Food Processing': -5, // Perishability + FSSAI compliance
    'Agricultural Inputs': -10, // Seasonal cash flow risk
  };
  rawScore += riskyCategories[model.category] ?? 0;

  rawScore = clamp(rawScore, 0, 100);
  const insufficientData = checkInsufficientData(evidence, 'cost_estimate');

  return {
    name: 'Operational Risk',
    rawScore: insufficientData ? Math.min(rawScore, INSUFFICIENT_DATA_CAP) : rawScore,
    insufficientData,
    explanation: `Time to revenue: ${ttr} days. Seasonality variance: ${variance.toFixed(3)}. Working capital ${remainingAfterSetup >= wcNeeded ? 'adequate' : 'tight'}.`,
  };
}

function scoreCapitalFit(
  capital: number,
  setupCost: number,
  scenario: BusinessScenario,
  evidence: EvidenceReport,
): Omit<ComponentScore, 'weight' | 'weightedScore'> {
  // Sweet spot: setup should be 40–70% of available capital
  const setupRatio = setupCost / Math.max(capital, 1);
  let rawScore: number;

  if (setupRatio >= 0.40 && setupRatio <= 0.70) {
    rawScore = 100; // Perfect fit
  } else if (setupRatio < 0.20) {
    rawScore = 60; // Under-investing — capital could be used for bigger opportunity
  } else if (setupRatio < 0.40) {
    rawScore = 80; // Slightly under-invested
  } else if (setupRatio <= 0.85) {
    rawScore = 70; // Slightly over-invested — tight on WC
  } else if (setupRatio <= 1.0) {
    rawScore = 40; // Very tight — no WC buffer
  } else {
    rawScore = 10; // Can't afford setup
  }

  // ROI potential bonus
  const monthlyProfit = scenario.netMonthlyProfit ?? 0;
  const paybackMonths = monthlyProfit > 0 ? setupCost / monthlyProfit : Infinity;
  if (paybackMonths <= 6) rawScore = Math.min(100, rawScore + 10);
  else if (paybackMonths <= 12) rawScore = Math.min(100, rawScore + 5);
  else if (paybackMonths > 24) rawScore -= 10;

  rawScore = clamp(rawScore, 0, 100);
  const insufficientData = checkInsufficientData(evidence, 'cost_estimate');

  return {
    name: 'Capital Fit',
    rawScore: insufficientData ? Math.min(rawScore, INSUFFICIENT_DATA_CAP) : rawScore,
    insufficientData,
    explanation: `Setup ₹${fmt(setupCost)} is ${Math.round(setupRatio * 100)}% of capital ₹${fmt(capital)}. Estimated payback: ${paybackMonths === Infinity ? 'N/A' : Math.round(paybackMonths) + ' months'}.`,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applyWeight(
  component: Omit<ComponentScore, 'weight' | 'weightedScore'>,
  weight: number,
): ComponentScore {
  return {
    ...component,
    weight,
    weightedScore: Math.round(component.rawScore * weight * 100) / 100,
  };
}

function toGrade(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Indian number formatting. */
function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

/**
 * Check if a specific evidence dimension is below the insufficient-data threshold.
 */
function checkInsufficientData(
  report: EvidenceReport,
  dimension: string,
): boolean {
  const dim = report.dimensions.find((d) => d.dimension === dimension);
  return dim ? dim.score < INSUFFICIENT_DATA_THRESHOLD : true;
}
