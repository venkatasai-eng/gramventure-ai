/**
 * GramVenture AI — Evidence Classification & Coverage Engine
 *
 * Deterministic assessment of evidence coverage across 5 dimensions:
 *   1. Population Evidence
 *   2. Competitor Observations
 *   3. Pricing Evidence
 *   4. Business Cost Estimates
 *   5. Source Freshness
 *
 * Calculates a transparent evidence-coverage percentage (0-100%).
 * Explicitly identifies missing data.
 * NOTE: Evidence Coverage is NOT probability of business success.
 */

import type {
  BusinessModelTemplate,
  EvidenceCoverage,
  EvidenceDimension,
  EvidenceReport,
  UserInput,
} from './types';

export function calculateDimensionCoverage(
  dimension: EvidenceDimension,
  input: UserInput,
  model?: BusinessModelTemplate
): EvidenceCoverage {
  switch (dimension) {
    case 'population': {
      let factorsDocumented = 0;
      const factorsRequired = 3; // Population, Households, Distance to town

      if (input.village?.population?.source !== 'Missing Data' && (input.village?.population?.value ?? 0) > 0) {
        factorsDocumented += input.village.population.source === 'Official Data' ? 1 : 0.7;
      }
      if (input.village?.households?.source !== 'Missing Data' && (input.village?.households?.value ?? 0) > 0) {
        factorsDocumented += input.village.households.source === 'Official Data' ? 1 : 0.7;
      }
      if (input.village?.distanceToTownKm?.source !== 'Missing Data') {
        factorsDocumented += 1;
      }

      const score = Math.min(100, Math.round((factorsDocumented / factorsRequired) * 100));
      return {
        dimension: 'population',
        score,
        factorsDocumented: Math.round(factorsDocumented),
        factorsRequired,
        explanation: score >= 70
          ? 'Good demographic baseline available for local market estimation.'
          : 'Village population or household counts are based on estimates or missing official census data.',
      };
    }

    case 'competitor': {
      const factorsRequired = 3; // At least 1 observation, distance recorded, products/strength recorded
      const category = model?.category;
      const relevantCompetitors = category
        ? input.competitorObservations.filter((c) => c.businessCategory === category)
        : input.competitorObservations;

      let factorsDocumented = 0;
      if (relevantCompetitors.length > 0) {
        factorsDocumented += 1;
        const hasDistances = relevantCompetitors.some((c) => (c.distanceKm?.value ?? 0) > 0);
        if (hasDistances) factorsDocumented += 1;
        const hasStrengths = relevantCompetitors.some((c) => c.strengthAssessment !== 'unknown');
        if (hasStrengths) factorsDocumented += 1;
      }

      const score = Math.min(100, Math.round((factorsDocumented / factorsRequired) * 100));
      return {
        dimension: 'competitor',
        score,
        factorsDocumented,
        factorsRequired,
        explanation: relevantCompetitors.length > 0
          ? `${relevantCompetitors.length} competitor observation(s) recorded in this category.`
          : 'No verified local competitor observations recorded. Field survey needed before borrowing.',
      };
    }

    case 'pricing': {
      const factorsRequired = 2; // At least 1 observed price point, supplier or competitor comparison
      const category = model?.category;
      const relevantPricing = category
        ? input.pricingObservations.filter((p) => p.businessCategory === category)
        : input.pricingObservations;

      let factorsDocumented = 0;
      if (relevantPricing.length > 0) {
        factorsDocumented += 1;
        const hasVerified = relevantPricing.some(
          (p) => p.source === 'Verified Local Observation' || p.source === 'User-Provided Input'
        );
        if (hasVerified) factorsDocumented += 1;
      }

      const score = Math.min(100, Math.round((factorsDocumented / factorsRequired) * 100));
      return {
        dimension: 'pricing',
        score,
        factorsDocumented,
        factorsRequired,
        explanation: relevantPricing.length > 0
          ? `${relevantPricing.length} local price point(s) recorded for this trade.`
          : 'No local pricing evidence provided. Reliance on regional model defaults.',
      };
    }

    case 'cost_estimate': {
      const factorsRequired = 4; // Setup items documented, rent, labor, raw materials
      let factorsDocumented = 0;

      if (model) {
        const scenario = model.scenarios[input.preferredScenario || 'base'];
        if (scenario.setupCosts.length > 0) factorsDocumented += 1;
        const hasRentLabor = scenario.monthlyCosts.some(
          (c) => c.category === 'rent' || c.category === 'labor'
        );
        if (hasRentLabor) factorsDocumented += 1;
        const hasRawMaterials = scenario.monthlyCosts.some(
          (c) => c.category === 'raw_materials' || c.category === 'inventory'
        );
        if (hasRawMaterials) factorsDocumented += 1;
        if (scenario.workingCapitalNeeded.value > 0) factorsDocumented += 1;
      } else {
        factorsDocumented = 2;
      }

      const score = Math.min(100, Math.round((factorsDocumented / factorsRequired) * 100));
      return {
        dimension: 'cost_estimate',
        score,
        factorsDocumented,
        factorsRequired,
        explanation: score >= 75
          ? 'Comprehensive bill of quantities and operational cost schedule established.'
          : 'Preliminary cost estimates; supplier quotations required before loan application.',
      };
    }

    case 'source_freshness': {
      const factorsRequired = 2; // Observations within last 6 months, verified source types
      let factorsDocumented = 0;

      const allObs = [...input.competitorObservations, ...input.pricingObservations];
      if (allObs.length > 0) {
        factorsDocumented += 1;
        const now = new Date().getTime();
        const hasRecent = allObs.some((obs) => {
          const dateStr = 'observedDate' in obs ? obs.observedDate : '';
          if (!dateStr) return false;
          const obsTime = new Date(dateStr).getTime();
          const diffDays = (now - obsTime) / (1000 * 3600 * 24);
          return diffDays < 180;
        });
        if (hasRecent) factorsDocumented += 1;
      } else {
        // If no user observations, freshness depends on baseline data
        factorsDocumented = input.village?.isIllustrative ? 0 : 1;
      }

      const score = Math.min(100, Math.round((factorsDocumented / factorsRequired) * 100));
      return {
        dimension: 'source_freshness',
        score,
        factorsDocumented,
        factorsRequired,
        explanation: score >= 50
          ? 'Market observations are recent or dated within acceptable project planning horizons.'
          : 'Observations may be outdated or based on illustrative assumptions. Re-verify locally.',
      };
    }
  }
}

/**
 * Builds the comprehensive Evidence Report for a given user context and optional business model.
 */
export function buildEvidenceReport(
  input: UserInput,
  model?: BusinessModelTemplate
): EvidenceReport {
  const dimensions: EvidenceCoverage[] = [
    calculateDimensionCoverage('population', input, model),
    calculateDimensionCoverage('competitor', input, model),
    calculateDimensionCoverage('pricing', input, model),
    calculateDimensionCoverage('cost_estimate', input, model),
    calculateDimensionCoverage('source_freshness', input, model),
  ];

  // Weight for overall evidence coverage:
  // Population: 20%, Competitor: 25%, Pricing: 20%, Cost Estimate: 20%, Freshness: 15%
  const overallCoveragePercent = Math.round(
    dimensions[0].score * 0.20 +
    dimensions[1].score * 0.25 +
    dimensions[2].score * 0.20 +
    dimensions[3].score * 0.20 +
    dimensions[4].score * 0.15
  );

  const missingDataItems: string[] = [];
  if (dimensions[0].score < 50) missingDataItems.push('Official village census / household registry');
  if (dimensions[1].score < 50) missingDataItems.push('Nearby competitor survey within 5 km radius');
  if (dimensions[2].score < 50) missingDataItems.push('Actual local retail and wholesale market prices');
  if (dimensions[3].score < 50) missingDataItems.push('Written vendor quotations for machinery & equipment');
  if (dimensions[4].score < 50) missingDataItems.push('Fresh local observations from the last 90 days');

  let recommendation = '';
  if (overallCoveragePercent >= 75) {
    recommendation = 'Strong evidence coverage. Ground reality aligns well with planning assumptions.';
  } else if (overallCoveragePercent >= 50) {
    recommendation = 'Moderate evidence coverage. Core figures are plausible but require local validation of pricing and supplier terms.';
  } else {
    recommendation = 'Low evidence coverage. Critical market data is missing. Conduct an on-the-ground survey before borrowing.';
  }

  return {
    overallCoveragePercent,
    dimensions,
    missingDataItems,
    recommendation,
  };
}
