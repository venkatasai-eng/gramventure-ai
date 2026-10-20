// Global application types for GramVenture AI

export type Language = 'en' | 'te' | 'ta';

export type EvidenceLabel =
  | 'Official Data'
  | 'Provider Result'
  | 'Verified Local Observation'
  | 'User-Provided Input'
  | 'User-Provided Observation'
  | 'User-Provided Assumption'
  | 'Illustrative Model Estimate'
  | 'Model Estimate'
  | 'Synthetic Demo Data'
  | 'Missing/Unknown'
  | 'Missing Data';

export type BusinessCategory =
  | 'dairy'
  | 'grocery'
  | 'tailoring'
  | 'poultry'
  | 'mobile-repair'
  | 'agri-inputs'
  | 'food-processing'
  | 'local-services'
  | 'small-manufacturing';

export interface Location {
  state: string;
  district: string;
  districtId?: string;
  block: string;
  village: string;
  locality?: string;
  pinCode?: string;
  coordinates?: { lat: number; lng: number };
  locationAccuracy?:
    | 'Exact Verified Geocoder'
    | 'District Headquarters Centroid'
    | 'User-Provided Coordinates'
    | 'Manual Address Only (No Coordinates)';
  locationSource?:
    | 'OpenStreetMap / Nominatim'
    | 'District Centroid'
    | 'User Input'
    | 'User-Provided Coordinates'
    | 'Demo Baseline'
    | 'Unverified Manual Input';
  analysisRadius: 5 | 10;
}

export interface EntrepreneurProfile {
  // Demand-first inputs
  entrepreneurName?: string;
  demandDescription?: string;
  productOrServiceDemand?: string;
  desiredBusinessActivity?: string;
  productsForResale?: string;
  intendedCustomerGroups?: string;
  desiredSellingPriceOrBudget?: string;
  availableLandOrWorkspace?: string;
  additionalNotes?: string;

  // Financial & operational profile
  availableSavings: number;
  desiredCategory: BusinessCategory;
  inferredCategories?: BusinessCategory[];
  isExistingBusiness: boolean;
  preferredLanguage: Language;
  hasWorkspace: boolean;
  experienceYears: number;
}

export interface HouseholdFinances {
  monthlyHouseholdExpenses: number;
  existingMonthlyLoanPayments: number;
  essentialReserve: number;
  availableWorkingCapital: number;
}

export interface CompetitorObservation {
  id: string;
  category: BusinessCategory;
  count: number;
  radiusKm: number;
  dateObserved: string;
  notes: string;
  isUserObservation?: boolean;
}

export interface ProviderCompetitor {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  lat?: number;
  lon?: number;
  address?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  source: 'OpenStreetMap' | 'Google Places (New)' | 'Fallback Reference' | 'Demo Provider';
  retrievalTime: string;
  attribution: string;
}

export interface PricingObservation {
  id: string;
  productName: string;
  competitorPrice: number;
  estimatedCost: number;
  desiredMargin: number;
  source: EvidenceLabel;
  notes: string;
}

export interface MLPredictionResult {
  predictedViable: boolean;
  viabilityProbability: number;
  riskScore: number;
  modelType: string;
  modelVersion: string;
  disclaimer: string;
  evaluatedMetrics: {
    accuracy: number;
    f1Score: number;
    precision: number;
    recall: number;
    rocAuc?: number;
  };
  featuresUsed: string[];
}

export interface OnboardingData {
  location: Location;
  profile: EntrepreneurProfile;
  demand?: {
    productOrServiceDemand?: string;
    desiredBusinessActivity?: string;
  };
  household: HouseholdFinances;
  selectedBusinesses: BusinessCategory[];
  competitors: CompetitorObservation[];
  providerCompetitors?: ProviderCompetitor[];
  pricing: PricingObservation[];
  mlPrediction?: MLPredictionResult;
}

export type Scenario = 'low' | 'base' | 'high';

export interface NavigationItem {
  id: string;
  label: string;
  labelTe?: string;
  labelTa?: string;
  icon: string;
  path: string;
  completed: boolean;
  enabled: boolean;
}

export const BUSINESS_CATEGORY_LABELS: Record<
  BusinessCategory,
  { en: string; te: string; ta: string }
> = {
  dairy: { en: 'Dairy & Cattle', te: 'డెయిరీ & పాడి పశువులు', ta: 'பால் பண்ணை & கால்நடை' },
  grocery: { en: 'Grocery / Kirana', te: 'కిరాణా & నిత్యావసరాలు', ta: 'மளிகை & பலசரக்கு கடை' },
  tailoring: { en: 'Tailoring & Textiles', te: 'దర్జీ & వస్త్రాలు', ta: 'தையல் & ஆடை வடிவமைப்பு' },
  poultry: { en: 'Poultry Farm', te: 'కోళ్ల పరిశ్రమ', ta: 'கோழிப் பண்ணை' },
  'mobile-repair': { en: 'Mobile Repair & Spares', te: 'మొబైల్ రిపేర్ & స్పేర్స్', ta: 'மொபைல் பழுதுநீக்கம் & உதிரிபாகங்கள்' },
  'agri-inputs': { en: 'Agricultural Inputs', te: 'వ్యవసాయ సామగ్రి & ఎరువులు', ta: 'விவசாய இடுபொருட்கள் & உரங்கள்' },
  'food-processing': { en: 'Food Processing (Pickles/Flour)', te: 'ఆహార ప్రసంస్కరణ (ఊరగాయలు/పిండి)', ta: 'உணவு பதப்படுத்துதல் (ஊறுகாய்/மாவு)' },
  'local-services': { en: 'Local Services / Digital Point', te: 'స్థానిక సేవలు / డిజిటల్ కేంద్రం', ta: 'உள்ளூர் சேவைகள் / இ-சேவை மையம்' },
  'small-manufacturing': { en: 'Small Manufacturing / Workshop', te: 'చిన్న తయారీ / వర్క్‌షాప్', ta: 'சிறு உற்பத்தி / பட்டறை' },
};
