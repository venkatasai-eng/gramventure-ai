import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TAMIL_NADU_DISTRICTS } from '@/data/tamilNaduDistricts';
import mlMetadata from '@/data/mlMetadata.json';
import { evaluateExperimentalML } from '@/services/mlService';
import type { OnboardingData } from '@/types';

describe('Synthetic Entrepreneur Dataset & ML Pipeline Verification', () => {
  const csvPath = path.resolve(process.cwd(), 'sample_entrepreneur_dataset.csv');

  it('has generated sample_entrepreneur_dataset.csv with at least 500 records', () => {
    expect(fs.existsSync(csvPath)).toBe(true);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    const rowCount = lines.length - 1; // subtract header
    expect(rowCount).toBeGreaterThanOrEqual(500);
    expect(rowCount).toBe(600);
  });

  it('contains all 26 required schema columns', () => {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const headerLine = content.split('\n')[0].trim();
    const columns = headerLine.split(',');

    const expectedColumns = [
      'entrepreneur_id',
      'age',
      'education_level',
      'entrepreneur_experience_years',
      'district',
      'location_type',
      'business_category',
      'business_experience_years',
      'available_investment',
      'total_project_cost',
      'requested_loan_amount',
      'expected_monthly_revenue',
      'expected_monthly_operating_cost',
      'estimated_monthly_profit',
      'local_demand_score',
      'competitor_count_5km',
      'average_competitor_distance_km',
      'estimated_customer_count',
      'expected_monthly_sales_volume',
      'supplier_availability_score',
      'market_accessibility_score',
      'seasonality_risk_score',
      'business_risk_score',
      'estimated_monthly_loan_repayment',
      'estimated_monthly_cash_flow',
      'business_viability',
    ];

    expect(columns).toEqual(expectedColumns);
  });

  it('covers all 38 Tamil Nadu districts in dataset rows', () => {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n').slice(1);
    const districtsInCsv = new Set<string>();

    lines.forEach((line: string) => {
      const parts = line.split(',');
      const district = parts[4]?.trim();
      if (district) districtsInCsv.add(district);
    });

    TAMIL_NADU_DISTRICTS.forEach((d) => {
      expect(districtsInCsv.has(d.nameEn)).toBe(true);
    });
    expect(districtsInCsv.size).toBe(38);
  });

  it('has balanced viable (1) and non-viable (0) target distribution', () => {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n').slice(1);

    let viableCount = 0;
    lines.forEach((line: string) => {
      const parts = line.split(',');
      const isViable = parts[25]?.trim();
      if (isViable === '1') viableCount++;
    });

    const viableRatio = viableCount / lines.length;
    // Balanced within reasonable range (between 45% and 75%)
    expect(viableRatio).toBeGreaterThanOrEqual(0.45);
    expect(viableRatio).toBeLessThanOrEqual(0.75);
  });

  it('contains valid cross-validated ML model metadata with mandatory disclaimer', () => {
    expect(mlMetadata.model_name).toBe('RandomForestClassifier');
    expect(mlMetadata.metrics.accuracy).toBeGreaterThanOrEqual(0.85);
    expect(mlMetadata.metrics.roc_auc).toBeGreaterThanOrEqual(0.85);
    expect(mlMetadata.critical_limitation).toBeTruthy();
    expect(mlMetadata.critical_limitation.toLowerCase()).toContain('synthetic');
    expect(mlMetadata.critical_limitation.toLowerCase()).toContain('experimental');
  });

  it('evaluates experimental viability in client service with clear disclaimer', () => {
    const mockOnboarding: OnboardingData = {
      location: {
        state: 'Tamil Nadu',
        district: 'Madurai',
        block: 'Vadipatti',
        village: 'Vadipatti',
        coordinates: { lat: 9.9252, lng: 78.1198 },
        analysisRadius: 5,
      },
      profile: {
        demandDescription: 'High demand for fresh milk and ghee',
        availableSavings: 100000,
        desiredCategory: 'dairy',
        experienceYears: 2,
        hasWorkspace: true,
        isExistingBusiness: false,
        preferredLanguage: 'en',
      },
      household: {
        monthlyHouseholdExpenses: 12000,
        existingMonthlyLoanPayments: 0,
        essentialReserve: 30000,
        availableWorkingCapital: 20000,
      },
      selectedBusinesses: ['dairy'],
      competitors: [],
      pricing: [],
    };

    const result = evaluateExperimentalML(
      mockOnboarding,
      1000000,
      900000,
      84000,
      56500
    );

    expect(typeof result.predictedViable).toBe('boolean');
    expect(result.viabilityProbability).toBeGreaterThan(0);
    expect(result.viabilityProbability).toBeLessThanOrEqual(100);
    expect(result.disclaimer).toBe(mlMetadata.critical_limitation);
    expect(result.evaluatedMetrics.accuracy).toBe(mlMetadata.metrics.accuracy);
  });
});
