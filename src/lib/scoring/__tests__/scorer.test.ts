import { describe, it, expect } from 'vitest';
import { scoreBusiness, rankBusinesses, DEFAULT_WEIGHTS } from '../scorer';
import { BUSINESS_MODELS, BUSINESS_MODEL_LIST } from '../businessModels';
import { buildEvidenceReport } from '../evidenceEngine';
import { generateSWOT } from '../swotGenerator';
import { DEMO_SCORING_INPUT } from '../../../data/demoData';
import type { UserInput } from '../types';

describe('Business Scoring Engine', () => {
  it('loads all 8 business models with low, base, and high scenarios', () => {
    expect(BUSINESS_MODEL_LIST.length).toBe(8);
    for (const model of BUSINESS_MODEL_LIST) {
      expect(model.scenarios.low).toBeDefined();
      expect(model.scenarios.base).toBeDefined();
      expect(model.scenarios.high).toBeDefined();
      expect(model.seasonality.monthlyMultipliers.length).toBe(12);
    }
  });

  it('scores a business model deterministically with 5 weighted components', () => {
    const dairy = BUSINESS_MODELS['dairy-small'];
    const score = scoreBusiness(dairy.id, DEMO_SCORING_INPUT, 'base');

    expect(score.compositeScore).toBeGreaterThan(0);
    expect(score.compositeScore).toBeLessThanOrEqual(100);
    expect(score.components.length).toBe(5);

    // Sum of weights equals 1.0
    const totalWeight = score.components.reduce((sum, c) => sum + c.weight, 0);
    expect(Math.round(totalWeight * 100) / 100).toBe(1.0);

    // Composite score matches sum of weighted scores
    const calculatedComposite = Math.round(
      score.components.reduce((sum, c) => sum + c.weightedScore, 0)
    );
    expect(score.compositeScore).toBe(calculatedComposite);
  });

  it('ranks three businesses transparently', () => {
    const modelIds = ['dairy-small', 'grocery-kirana', 'mobile-repair'];
    const ranking = rankBusinesses(modelIds, DEMO_SCORING_INPUT, 'base');

    expect(ranking.length).toBe(3);
    expect(ranking[0].compositeScore).toBeGreaterThanOrEqual(ranking[1].compositeScore);
    expect(ranking[1].compositeScore).toBeGreaterThanOrEqual(ranking[2].compositeScore);
  });

  it('flags insufficient data when competitor and pricing observations are missing', () => {
    const emptyInput: UserInput = {
      ...DEMO_SCORING_INPUT,
      competitorObservations: [],
      pricingObservations: [],
    };

    const dairy = BUSINESS_MODELS['dairy-small'];
    const score = scoreBusiness(dairy.id, emptyInput, 'base');
    const compScore = score.components.find((c) => c.name === 'Competitive Positioning');
    expect(compScore).toBeDefined();
    expect(compScore?.insufficientData).toBe(true);
  });

  it('generates an evidence report with documented coverage percentage', () => {
    const report = buildEvidenceReport(DEMO_SCORING_INPUT);
    expect(report.overallCoveragePercent).toBeGreaterThanOrEqual(0);
    expect(report.overallCoveragePercent).toBeLessThanOrEqual(100);
    expect(report.dimensions.length).toBe(5);
  });

  it('generates evidence-linked SWOT analysis', () => {
    const dairy = BUSINESS_MODELS['dairy-small'];
    const swot = generateSWOT(dairy, DEMO_SCORING_INPUT, 'base');

    expect(swot.strengths.length).toBeGreaterThan(0);
    expect(swot.weaknesses.length).toBeGreaterThan(0);
    expect(swot.opportunities.length).toBeGreaterThan(0);
    expect(swot.threats.length).toBeGreaterThan(0);

    // Ensure each item has an evidence basis
    for (const item of [...swot.strengths, ...swot.weaknesses, ...swot.opportunities, ...swot.threats]) {
      expect(['Official Data', 'Verified Local Observation', 'User-Provided Input', 'Model Estimate', 'Missing Data']).toContain(item.evidenceBasis);
    }
  });
});
