import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OnboardingData,
  Language,
  BusinessCategory,
  CompetitorObservation,
  ProviderCompetitor,
  PricingObservation,
  Location,
  EntrepreneurProfile,
  HouseholdFinances,
  Scenario,
  MLPredictionResult,
} from '@/types';
import { getDemoCompetitors } from '@/services/competitorService';

interface StressTestParams {
  salesDeclinePercent: number;
  costInflationPercent: number;
  paymentDelayPercent: number;
  paymentDelayDays: number;
  seasonalSlowdownMonths: number[];
  seasonalSlowdownPercent: number;
  unexpectedExpense: number;
}

interface AppState {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Demo mode
  isDemoMode: boolean;
  setDemoMode: (mode: boolean) => void;

  // Current step / active tab
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Onboarding data
  onboarding: OnboardingData;
  updateLocation: (location: Partial<Location>) => void;
  updateProfile: (profile: Partial<EntrepreneurProfile>) => void;
  updateHousehold: (household: Partial<HouseholdFinances>) => void;
  setSelectedBusinesses: (businesses: BusinessCategory[]) => void;
  addCompetitor: (competitor: CompetitorObservation) => void;
  removeCompetitor: (id: string) => void;
  setProviderCompetitors: (competitors: ProviderCompetitor[]) => void;
  addPricing: (pricing: PricingObservation) => void;
  removePricing: (id: string) => void;
  setMLPrediction: (prediction: MLPredictionResult) => void;

  // Scenario
  activeScenario: Scenario;
  setActiveScenario: (scenario: Scenario) => void;

  // Stress test
  stressTest: StressTestParams;
  updateStressTest: (params: Partial<StressTestParams>) => void;

  // Reset & Demo
  resetAll: () => void;
  loadDemoData: () => void;
}

const defaultOnboarding: OnboardingData = {
  location: {
    state: 'Tamil Nadu',
    district: 'Madurai',
    districtId: 'madurai',
    block: 'Vadipatti Block',
    village: '',
    pinCode: '',
    coordinates: { lat: 9.9252, lng: 78.1198 },
    locationAccuracy: 'District Headquarters Centroid',
    locationSource: 'District Centroid',
    analysisRadius: 5,
  },
  profile: {
    demandDescription: '',
    productsForResale: '',
    intendedCustomerGroups: '',
    desiredSellingPriceOrBudget: '',
    availableLandOrWorkspace: '',
    additionalNotes: '',
    availableSavings: 0,
    desiredCategory: 'dairy',
    inferredCategories: ['dairy', 'grocery', 'food-processing'],
    isExistingBusiness: false,
    preferredLanguage: 'en',
    hasWorkspace: false,
    experienceYears: 0,
  },
  household: {
    monthlyHouseholdExpenses: 0,
    existingMonthlyLoanPayments: 0,
    essentialReserve: 0,
    availableWorkingCapital: 0,
  },
  selectedBusinesses: ['dairy', 'grocery', 'mobile-repair'],
  competitors: [],
  providerCompetitors: [],
  pricing: [],
};

const defaultStressTest: StressTestParams = {
  salesDeclinePercent: 20,
  costInflationPercent: 15,
  paymentDelayPercent: 30,
  paymentDelayDays: 30,
  seasonalSlowdownMonths: [5, 6],
  seasonalSlowdownPercent: 35,
  unexpectedExpense: 0,
};

// Grounded Tamil Nadu Demo Data (Madurai / Vadipatti Pilot)
const getDemoData = (): OnboardingData => {
  const demoCoords = { lat: 10.0104, lng: 77.4768 };
  return {
    location: {
      state: 'Tamil Nadu',
      district: 'Madurai',
      districtId: 'madurai',
      block: 'Vadipatti Block',
      village: 'Vadipatti (Demo Locality)',
      pinCode: '625218',
      coordinates: demoCoords,
      locationAccuracy: 'Exact Verified Geocoder',
      locationSource: 'Demo Baseline',
      analysisRadius: 5,
    },
    profile: {
      demandDescription:
        'Local tea stalls and residential households in Vadipatti need a reliable daily fresh milk and curd supply before 6:30 AM, with evening cold storage.',
      productsForResale: 'Cattle feed concentrates, mineral mixture bags, stainless steel milk containers',
      intendedCustomerGroups: 'Neighborhood tea stalls, morning commuters, 120 residential households',
      desiredSellingPriceOrBudget: '₹46/litre raw milk; ₹65/kg fresh curd',
      availableLandOrWorkspace: '150 sq ft shed space available adjacent to family residence',
      additionalNotes: 'Summer water availability requires storage tank; green fodder cultivated on 0.5 acre',
      availableSavings: 100000, // ₹1,00,000 margin capital -> sizes to ₹10,00,000 project
      desiredCategory: 'dairy',
      inferredCategories: ['dairy', 'food-processing', 'grocery'],
      isExistingBusiness: false,
      preferredLanguage: 'en',
      hasWorkspace: true,
      experienceYears: 2,
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
        id: 'user-obs-1',
        category: 'dairy',
        count: 2,
        radiusKm: 3.5,
        dateObserved: '2026-10-15',
        notes: 'Two small vendor stalls selling loose cow milk; neither has refrigeration or testing equipment.',
        isUserObservation: true,
      },
      {
        id: 'user-obs-2',
        category: 'grocery',
        count: 4,
        radiusKm: 2.0,
        dateObserved: '2026-10-15',
        notes: 'Four provision shops in main bazaar with limited chilled dairy products.',
        isUserObservation: true,
      },
    ],
    providerCompetitors: getDemoCompetitors(demoCoords.lat, demoCoords.lng, 5),
    pricing: [
      {
        id: 'price-demo-1',
        productName: 'Raw Cow Milk (1 Litre)',
        competitorPrice: 48,
        estimatedCost: 34,
        desiredMargin: 29,
        source: 'User-Provided Input',
        notes: 'Observed at bazaar tea stall delivery point',
      },
      {
        id: 'price-demo-2',
        productName: 'Fresh Curd (1 Kg)',
        competitorPrice: 65,
        estimatedCost: 42,
        desiredMargin: 35,
        source: 'Model Estimate',
        notes: 'Value-added conversion margin estimate',
      },
    ],
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),

      isDemoMode: false,
      setDemoMode: (isDemoMode) => set({ isDemoMode }),

      currentStep: 0,
      setCurrentStep: (currentStep) => set({ currentStep }),

      onboarding: { ...defaultOnboarding },
      updateLocation: (location) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            location: { ...state.onboarding.location, ...location },
          },
        })),
      updateProfile: (profile) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            profile: { ...state.onboarding.profile, ...profile },
          },
        })),
      updateHousehold: (household) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            household: { ...state.onboarding.household, ...household },
          },
        })),
      setSelectedBusinesses: (selectedBusinesses) =>
        set((state) => ({
          onboarding: { ...state.onboarding, selectedBusinesses },
        })),
      addCompetitor: (competitor) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            competitors: [...state.onboarding.competitors, competitor],
          },
        })),
      removeCompetitor: (id) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            competitors: state.onboarding.competitors.filter((c) => c.id !== id),
          },
        })),
      setProviderCompetitors: (providerCompetitors) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            providerCompetitors,
          },
        })),
      addPricing: (pricing) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            pricing: [...state.onboarding.pricing, pricing],
          },
        })),
      removePricing: (id) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            pricing: state.onboarding.pricing.filter((p) => p.id !== id),
          },
        })),
      setMLPrediction: (mlPrediction) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            mlPrediction,
          },
        })),

      activeScenario: 'base',
      setActiveScenario: (activeScenario) => set({ activeScenario }),

      stressTest: { ...defaultStressTest },
      updateStressTest: (params) =>
        set((state) => ({
          stressTest: { ...state.stressTest, ...params },
        })),

      resetAll: () =>
        set({
          onboarding: { ...defaultOnboarding },
          currentStep: 0,
          isDemoMode: false,
          activeScenario: 'base',
          stressTest: { ...defaultStressTest },
        }),

      loadDemoData: () =>
        set({
          onboarding: getDemoData(),
          currentStep: 1,
          isDemoMode: true,
          activeScenario: 'base',
          stressTest: { ...defaultStressTest },
        }),
    }),
    {
      name: 'gramventure-storage',
      partialize: (state) => ({
        language: state.language,
        onboarding: state.onboarding,
        currentStep: state.currentStep,
        isDemoMode: state.isDemoMode,
        activeScenario: state.activeScenario,
        stressTest: state.stressTest,
      }),
    }
  )
);

export type { StressTestParams };
