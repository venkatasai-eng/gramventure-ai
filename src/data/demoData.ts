/**
 * GramVenture AI — Hackathon Stable Demo Scenario
 *
 * Designed to satisfy GramVenture AI rural entrepreneur requirements:
 * - Entrepreneur has ₹1,00,000 margin capital.
 * - Sizing under 10% rule = ₹10,00,000 project cost.
 * - Theoretical loan = ₹9,00,000.
 * - Comparing 3 business models: Dairy (primary), Grocery/Kirana, Mobile Repair.
 * - Shows stress test under 20% sales decline leading to DSCR warnings and project resizing advice.
 *
 * ALL data is explicitly labeled as Illustrative Demo Data.
 */

import type { OnboardingData } from '@/types';
import type { UserInput } from '@/lib/scoring/types';

export const DEMO_ONBOARDING_DATA: OnboardingData = {
  location: {
    state: 'Telangana',
    district: 'Warangal',
    block: 'Dharmasagar',
    village: 'Rampur',
    coordinates: { lat: 18.0125, lng: 79.4891 },
    analysisRadius: 5,
  },
  profile: {
    availableSavings: 100000, // ₹1,00,000 Margin Capital
    desiredCategory: 'dairy',
    isExistingBusiness: false,
    preferredLanguage: 'en',
    hasWorkspace: true,
    experienceYears: 1,
  },
  household: {
    monthlyHouseholdExpenses: 12000,
    existingMonthlyLoanPayments: 0,
    essentialReserve: 30000,
    availableWorkingCapital: 20000,
  },
  selectedBusinesses: ['dairy', 'grocery', 'mobile-repair'],
  competitors: [
    {
      id: 'comp-dairy-1',
      category: 'dairy',
      count: 2,
      radiusKm: 3.5,
      dateObserved: '2024-10-15',
      notes: 'Two small dairy farmers selling unchilled loose milk directly. No packaged milk or curd.',
    },
    {
      id: 'comp-grocery-1',
      category: 'grocery',
      count: 5,
      radiusKm: 2.0,
      dateObserved: '2024-10-14',
      notes: 'Five small general kirana shops within main bazaar street. Limited FMCG inventory.',
    },
    {
      id: 'comp-mobile-1',
      category: 'mobile-repair',
      count: 1,
      radiusKm: 4.8,
      dateObserved: '2024-10-12',
      notes: 'Single accessory kiosk near bus shelter with basic screen replacement. Major repairs sent to Warangal town.',
    },
  ],
  pricing: [
    {
      id: 'price-1',
      productName: 'Raw Buffalo Milk (per Litre)',
      competitorPrice: 60,
      estimatedCost: 42,
      desiredMargin: 30,
      source: 'Verified Local Observation',
      notes: 'Observed price paid by village procurement center vs local retail sale.',
    },
    {
      id: 'price-2',
      productName: 'Fresh Curd / Dahi (per Kg)',
      competitorPrice: 75,
      estimatedCost: 48,
      desiredMargin: 36,
      source: 'User-Provided Input',
      notes: 'Value-added dairy product priced at small tea stalls and homes.',
    },
    {
      id: 'price-3',
      productName: 'Standard Mobile Display Replacement',
      competitorPrice: 1200,
      estimatedCost: 750,
      desiredMargin: 37,
      source: 'Model Estimate',
      notes: 'Typical Android screen replacement cost in rural hub.',
    },
  ],
};

export const DEMO_SCORING_INPUT: UserInput = {
  village: {
    villageName: 'Rampur',
    district: 'Warangal',
    state: 'Telangana',
    population: {
      value: 3850,
      source: 'Model Estimate',
      verificationNote: 'Based on 2011 Census projection (+15% demographic trend) — not officially certified for 2024.',
    },
    households: {
      value: 820,
      source: 'Model Estimate',
      verificationNote: 'Estimated assuming average family size of 4.7 members.',
    },
    distanceToTownKm: {
      value: 14,
      source: 'Verified Local Observation',
      verificationNote: 'Road distance measured via State Highway 3 to Warangal town.',
    },
    economicActivities: ['Paddy cultivation', 'Cotton farming', 'Dairy rearing', 'Daily wage labor'],
    isIllustrative: true,
  },
  availableCapital: 100000,
  selectedBusinessIds: ['dairy_unit', 'grocery_store', 'mobile_repair'],
  competitorObservations: [
    {
      id: 'c-1',
      businessCategory: 'Dairy',
      competitorName: 'Local dairy producers (2 informal)',
      distanceKm: {
        value: 3.5,
        source: 'Verified Local Observation',
        verificationNote: 'Observed during morning milk collection.',
      },
      strengthAssessment: 'moderate',
      productsOffered: ['Raw loose milk'],
      observedDate: '2024-10-15',
      notes: 'No chilling unit; immediate sale required.',
      source: 'Verified Local Observation',
    },
    {
      id: 'c-2',
      businessCategory: 'Grocery / Kirana',
      competitorName: 'Bazaar Kirana cluster (5 shops)',
      distanceKm: {
        value: 2.0,
        source: 'Verified Local Observation',
        verificationNote: 'Counted on Main Bazaar lane.',
      },
      strengthAssessment: 'strong',
      productsOffered: ['Grains', 'Cooking oil', 'Packaged snacks', 'Soap'],
      observedDate: '2024-10-14',
      notes: 'Long-standing relationships with customers offering informal credit.',
      source: 'Verified Local Observation',
    },
    {
      id: 'c-3',
      businessCategory: 'Mobile Repair',
      competitorName: 'Shiva Mobile Corner',
      distanceKm: {
        value: 4.8,
        source: 'Verified Local Observation',
        verificationNote: 'Located at bus shelter junction.',
      },
      strengthAssessment: 'weak',
      productsOffered: ['Covers', 'Screen protectors', 'Simple repairs'],
      observedDate: '2024-10-12',
      notes: 'Lacks micro-soldering tools and parts inventory.',
      source: 'Verified Local Observation',
    },
  ],
  pricingObservations: [
    {
      id: 'p-1',
      productName: 'Raw Buffalo Milk',
      businessCategory: 'Dairy',
      observedPrice: {
        value: 60,
        source: 'Verified Local Observation',
        verificationNote: 'Local retail purchase on 15 Oct 2024.',
      },
      location: 'Rampur Village Center',
      observedDate: '2024-10-15',
      source: 'Verified Local Observation',
    },
  ],
  preferredScenario: 'base',
};
