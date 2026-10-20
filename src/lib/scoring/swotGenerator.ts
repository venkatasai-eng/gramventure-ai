/**
 * GramVenture AI — Dynamic SWOT Generator
 *
 * Generates an evidence-backed SWOT analysis for a specific business model,
 * conditioned on the entrepreneur's budget, local competitor observations,
 * and cost structure.
 *
 * Every SWOT item links to a specific evidence basis.
 */

import type {
  BusinessModelTemplate,
  EvidenceSourceLabel,
  ScenarioLevel,
  SWOTAnalysis,
  SWOTItem,
  UserInput,
} from './types';
import { totalSetupCost, computeScenarioTotals } from './businessModels';

export function generateSWOT(
  model: BusinessModelTemplate,
  input: UserInput,
  scenarioLevel: ScenarioLevel = 'base'
): SWOTAnalysis {
  const scenario = computeScenarioTotals({ ...structuredClone(model.scenarios[scenarioLevel]) });
  const setupCost = totalSetupCost(scenario);
  const workingCapital = scenario.workingCapitalNeeded.value;
  const totalCapex = setupCost + workingCapital;
  const availableCapital = input.availableCapital;

  const relevantCompetitors = input.competitorObservations.filter(
    (c) => c.businessCategory === model.category
  );
  const competitorCount = relevantCompetitors.reduce((sum, c) => sum + (c.distanceKm ? 1 : 0), 0) || relevantCompetitors.length;

  const strengths: SWOTItem[] = [];
  const weaknesses: SWOTItem[] = [];
  const opportunities: SWOTItem[] = [];
  const threats: SWOTItem[] = [];

  // 1. Capital & Budget Strengths / Weaknesses
  if (availableCapital >= totalCapex) {
    strengths.push({
      text: `Fully self-fundable or requires minimal debt: Capital required (₹${totalCapex.toLocaleString('en-IN')}) is covered by available funds (₹${availableCapital.toLocaleString('en-IN')}).`,
      severity: 'high',
      evidenceBasis: 'User-Provided Input',
    });
  } else if (availableCapital >= totalCapex * 0.10) {
    strengths.push({
      text: `Eligible for concessional 90% debt financing: Available margin capital (₹${availableCapital.toLocaleString('en-IN')}) covers the mandatory 10% equity contribution.`,
      severity: 'medium',
      evidenceBasis: 'Model Estimate',
    });
  } else {
    weaknesses.push({
      text: `Capital shortfall: Available capital (₹${availableCapital.toLocaleString('en-IN')}) is below the required 10% promoter equity for ₹${totalCapex.toLocaleString('en-IN')} project outlay.`,
      severity: 'high',
      evidenceBasis: 'User-Provided Input',
    });
  }

  // 2. Margin & Cash-flow Strengths / Weaknesses
  const primaryRev = scenario.revenueStreams[0];
  if (primaryRev && primaryRev.grossMarginPercent && primaryRev.grossMarginPercent >= 30) {
    strengths.push({
      text: `Healthy product gross margin (${primaryRev.grossMarginPercent}%) provides resilience against operational cost fluctuations.`,
      severity: 'medium',
      evidenceBasis: 'Model Estimate',
    });
  }

  if (model.timeToRevenueInDays.value <= 15) {
    strengths.push({
      text: `Fast cash conversion: Business generates daily liquid cash flows within ${model.timeToRevenueInDays.value} days of launch.`,
      severity: 'high',
      evidenceBasis: 'Model Estimate',
    });
  } else if (model.timeToRevenueInDays.value > 45) {
    weaknesses.push({
      text: `Extended gestation period: Takes approximately ${model.timeToRevenueInDays.value} days before first revenue, requiring dedicated working capital reserves.`,
      severity: 'high',
      evidenceBasis: 'Model Estimate',
    });
  }

  // 3. Operational & Perishability Risks
  if (model.category === 'Dairy' || model.category === 'Poultry' || model.category === 'Food Processing') {
    weaknesses.push({
      text: 'High perishability and cold-chain/hygiene dependency: Unreliable local electricity or storage can lead to spoilage.',
      severity: 'high',
      evidenceBasis: 'Verified Local Observation',
    });
  }

  // 4. Competitor Landscape Opportunities / Threats
  if (competitorCount === 0) {
    opportunities.push({
      text: 'First-mover advantage in immediate village radius: No direct registered competitors observed within 5 km.',
      severity: 'high',
      evidenceBasis: relevantCompetitors.length > 0 ? 'Verified Local Observation' : 'Model Estimate',
    });
  } else if (competitorCount <= 2) {
    opportunities.push({
      text: 'Low competitor density: Market has capacity for a differentiated provider focusing on door-to-door delivery or digital payments.',
      severity: 'medium',
      evidenceBasis: 'Verified Local Observation',
    });
  } else {
    threats.push({
      text: `High local competition: ${competitorCount} existing vendors observed nearby. May trigger price competition and customer credit expectations.`,
      severity: 'high',
      evidenceBasis: 'Verified Local Observation',
    });
  }

  // 5. Seasonality
  const maxMultiplier = Math.max(...model.seasonality.monthlyMultipliers);
  const minMultiplier = Math.min(...model.seasonality.monthlyMultipliers);
  if (maxMultiplier - minMultiplier > 0.4) {
    threats.push({
      text: `Significant seasonal volatility: Lean months drop by ${Math.round((1 - minMultiplier) * 100)}% of average sales, creating potential debt-service strain.`,
      severity: 'medium',
      evidenceBasis: 'Model Estimate',
    });
  }

  // 6. Generic opportunities based on category
  opportunities.push({
    text: 'Value-added service differentiation: Offering home delivery, morning supply, or aggregation for nearby weekly markets (shandies).',
    severity: 'medium',
    evidenceBasis: 'Model Estimate',
  });

  threats.push({
    text: 'Local credit (udhar) risk: Customer expectation of deferred payment in rural communities can severely constrain daily working capital.',
    severity: 'high',
    evidenceBasis: 'Verified Local Observation',
  });

  return {
    businessModelId: model.id,
    strengths,
    weaknesses,
    opportunities,
    threats,
    generatedAt: new Date().toISOString(),
  };
}
