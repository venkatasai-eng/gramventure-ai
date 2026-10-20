/**
 * GramVenture AI — Core Type Definitions
 *
 * All monetary values are in Indian Rupees (₹ / INR).
 * Indian number formatting: 1,00,000 = one lakh; 10,00,000 = ten lakh.
 */

// ---------------------------------------------------------------------------
// Evidence & Source Labelling
// ---------------------------------------------------------------------------

/** Every numeric assumption MUST carry one of these provenance labels. */
export type EvidenceSourceLabel =
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

/** A single documented assumption behind a number. */
export interface DocumentedAssumption<T = number> {
  /** The numeric (or typed) value. */
  value: T;
  /** How the value was sourced / verified. */
  source: EvidenceSourceLabel;
  /** Human-readable note on how / when this was verified. */
  verificationNote: string;
}

// ---------------------------------------------------------------------------
// Cost & Revenue Structures
// ---------------------------------------------------------------------------

/** One-time setup / capital expenditure line-item. */
export interface SetupCostItem {
  name: string;
  amount: DocumentedAssumption<number>;
  /** Optional category for grouping (Equipment, Licensing, Renovation …). */
  category?: string;
}

/** Recurring monthly operating cost line-item. */
export interface MonthlyCostItem {
  name: string;
  amount: DocumentedAssumption<number>;
  category: 'rent' | 'labor' | 'utilities' | 'transport' | 'raw_materials' | 'inventory' | 'marketing' | 'miscellaneous';
}

/** Revenue stream with volume × price. */
export interface RevenueStream {
  name: string;
  /** Units sold per month. */
  volumePerMonth: DocumentedAssumption<number>;
  /** Selling price per unit (₹). */
  sellingPricePerUnit: DocumentedAssumption<number>;
  /** Cost price per unit (₹) — used to derive gross margin. */
  costPricePerUnit: DocumentedAssumption<number>;
  /** Gross margin percentage (0–100). Derived if not provided. */
  grossMarginPercent?: number;
}

/** Seasonality multiplier per month (1.0 = normal, 1.3 = 30% above, 0.7 = 30% below). */
export interface SeasonalityProfile {
  /** Indexed 0–11 for Jan–Dec. */
  monthlyMultipliers: [number, number, number, number, number, number, number, number, number, number, number, number];
  notes: string;
}

// ---------------------------------------------------------------------------
// Business Model Template — LOW / BASE / HIGH scenarios
// ---------------------------------------------------------------------------

export type ScenarioLevel = 'low' | 'base' | 'high';

export interface BusinessScenario {
  setupCosts: SetupCostItem[];
  monthlyCosts: MonthlyCostItem[];
  revenueStreams: RevenueStream[];
  workingCapitalNeeded: DocumentedAssumption<number>;
  /** Total monthly revenue (derived). */
  totalMonthlyRevenue?: number;
  /** Total monthly cost (derived). */
  totalMonthlyCost?: number;
  /** Net monthly profit (derived). */
  netMonthlyProfit?: number;
}

export interface BusinessModelTemplate {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  /** Typical time-to-revenue in days. */
  timeToRevenueInDays: DocumentedAssumption<number>;
  /** Seasonality affecting this business. */
  seasonality: SeasonalityProfile;
  /** Scenarios keyed by level. */
  scenarios: Record<ScenarioLevel, BusinessScenario>;
  /** Tags for search / filtering. */
  tags: string[];
  /** Suitability notes for rural India. */
  ruralSuitabilityNotes: string;
}

export type BusinessCategory =
  | 'Dairy'
  | 'Grocery / Kirana'
  | 'Tailoring'
  | 'Poultry'
  | 'Mobile Repair'
  | 'Agricultural Inputs'
  | 'Food Processing'
  | 'Local Services'
  | 'dairy'
  | 'grocery'
  | 'tailoring'
  | 'poultry'
  | 'mobile-repair'
  | 'agri-inputs'
  | 'food-processing'
  | 'local-services'
  | 'small-manufacturing';

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export interface VillageProfile {
  villageName: string;
  district: string;
  state: string;
  /** Estimated population. */
  population: DocumentedAssumption<number>;
  /** Number of households. */
  households: DocumentedAssumption<number>;
  /** Distance to nearest town (km). */
  distanceToTownKm: DocumentedAssumption<number>;
  /** Key economic activities observed. */
  economicActivities: string[];
  /** Whether this profile is illustrative / demo. */
  isIllustrative: boolean;
}

// ---------------------------------------------------------------------------
// Competitor / Market Observations
// ---------------------------------------------------------------------------

export interface CompetitorObservation {
  id: string;
  businessCategory: BusinessCategory;
  /** Name or descriptor (e.g. "Lakshmi Dairy"). */
  competitorName: string;
  /** Estimated monthly revenue (₹), if known. */
  estimatedMonthlyRevenue?: DocumentedAssumption<number>;
  /** Distance from proposed location (km). */
  distanceKm: DocumentedAssumption<number>;
  /** Qualitative strength assessment. */
  strengthAssessment: 'strong' | 'moderate' | 'weak' | 'unknown';
  /** Products / services offered. */
  productsOffered: string[];
  /** Observation date (ISO). */
  observedDate: string;
  notes: string;
  source: EvidenceSourceLabel;
}

export interface PricingObservation {
  id: string;
  productName: string;
  businessCategory: BusinessCategory;
  /** Observed retail price (₹). */
  observedPrice: DocumentedAssumption<number>;
  /** Location where price was observed. */
  location: string;
  observedDate: string;
  source: EvidenceSourceLabel;
}

// ---------------------------------------------------------------------------
// Evidence Engine
// ---------------------------------------------------------------------------

export type EvidenceDimension =
  | 'population'
  | 'competitor'
  | 'pricing'
  | 'cost_estimate'
  | 'source_freshness';

export interface EvidenceCoverage {
  dimension: EvidenceDimension;
  /** 0–100 coverage score for this dimension. */
  score: number;
  /** Items contributing to this dimension. */
  factorsDocumented: number;
  factorsRequired: number;
  /** Human-readable explanation. */
  explanation: string;
}

export interface EvidenceReport {
  overallCoveragePercent: number;
  dimensions: EvidenceCoverage[];
  /** Items with "Missing Data" label. */
  missingDataItems: string[];
  /** Recommendation text. */
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface ScoringWeights {
  financialAffordability: number;   // default 0.30
  localOpportunity: number;         // default 0.25
  competitivePositioning: number;   // default 0.20
  operationalRisk: number;          // default 0.15
  capitalFit: number;               // default 0.10
}

export interface ComponentScore {
  name: string;
  rawScore: number;       // 0–100
  weight: number;         // 0–1
  weightedScore: number;  // rawScore × weight
  /** If true, data was insufficient and a penalty was applied. */
  insufficientData: boolean;
  explanation: string;
}

export interface BusinessScore {
  businessModelId: string;
  businessName: string;
  /** Composite weighted score 0–100. */
  compositeScore: number;
  /** Letter grade A–F. */
  grade: string;
  components: ComponentScore[];
  /** Evidence coverage that fed into the score. */
  evidenceReport: EvidenceReport;
  /** Scenario used for scoring. */
  scenarioUsed: ScenarioLevel;
  /** Timestamp (ISO). */
  scoredAt: string;
}

// ---------------------------------------------------------------------------
// SWOT
// ---------------------------------------------------------------------------

export interface SWOTItem {
  text: string;
  severity: 'high' | 'medium' | 'low';
  evidenceBasis: EvidenceSourceLabel;
}

export interface SWOTAnalysis {
  businessModelId: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// User Input Bundle  (what the UI collects)
// ---------------------------------------------------------------------------

export interface UserInput {
  village: VillageProfile;
  availableCapital: number;   // ₹
  selectedBusinessIds: string[];
  competitorObservations: CompetitorObservation[];
  pricingObservations: PricingObservation[];
  /** Preferred scenario level for scoring. */
  preferredScenario: ScenarioLevel;
}

// ---------------------------------------------------------------------------
// Full Analysis Result (returned to UI)
// ---------------------------------------------------------------------------

export interface AnalysisResult {
  scores: BusinessScore[];
  swotAnalyses: SWOTAnalysis[];
  evidenceReport: EvidenceReport;
  rankedRecommendations: string[];
  generatedAt: string;
}
