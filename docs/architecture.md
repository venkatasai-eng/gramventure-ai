# GramVenture AI — System Architecture & Trust Framework

**Product Name:** GramVenture AI  
**Focus Area:** GovFinTech / Rural Financial Intelligence & Micro-Enterprise Structuring for Tamil Nadu  
**Core Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Zustand + Recharts + Vitest + scikit-learn  

---

## 1. Architectural Philosophy: The Zero-Math-Hallucination Mandate

Standard Generative AI applications fail critically in rural micro-lending because Large Language Models (LLMs) are probabilistic and prone to arithmetic hallucinations. In rural debt structuring, an erroneous 1% interest amortization calculation or an unmodeled debt service coverage ratio (DSCR) can lead directly to household insolvency.

**GramVenture AI enforces strict architectural separation:**
1. **Deterministic Financial Engine:** 100% written in strongly-typed TypeScript. Sizing, statutory caps, reducing-balance amortizations, and DSCR stress testing run exclusively through deterministic mathematical algorithms with zero LLM intervention.
2. **Provider-Adapter Geospatial Intelligence:** Integrates live OpenStreetMap (Nominatim for geocoding, Overpass API for POI competitor discovery) with local centroid fallbacks, query rate limiting, and client-side Haversine filtering strictly within 5 km.
3. **Deterministic Business Scoring Engine:** Evaluates business viability via 5 weighted components (Affordability 30%, Local Evidence 25%, Competitive Positioning 20%, Operational Risk 15%, Capital Fit 10%) with full formula transparency.
4. **Evidence Classification Engine:** Stamps every metric with provenance tags (*Official Data, Provider Result, Verified Local Observation, User-Provided Input, Model Estimate, Missing Data*) and computes an *Evidence Coverage Score* (NOT a probability of success).
5. **Experimental Synthetic-Data ML Pipeline:** Standalone Python/scikit-learn pipeline trained on 600 synthetic entrepreneur records across all 38 Tamil Nadu districts. Strictly labeled as an experimental demonstration that never overrides deterministic financial caps.
6. **Context-Grounded Multilingual AI Advisor:** Dual-mode assistant (Live Gemini API with automatic fallback to a deterministic rule-based engine) that interprets financial outputs in plain English, Telugu (`తెలుగు`), and Tamil (`தமிழ்`) without the authority to alter numbers.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│           React 19 + TypeScript + Vite + Tailwind CSS + Recharts       │
│           Trilingual UI: English, Telugu (తెలుగు), Tamil (தமிழ்)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reads Reactive State
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ZUSTAND CLIENT STORE                            │
│       Persistent LocalStorage • All 38 Tamil Nadu Districts Baseline   │
│       Demand-First Onboarding State • Live POIs • Stress Test Values   │
└───────────┬───────────────────────┬────────────────────────┬───────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│   FINANCIAL ENGINE    │ │  SCORING ENGINE   │ │  GEOSPATIAL / PROVIDER │
│  - Micro Finance Cap  │ │  - 9 Rural Trades │ │  - OSM Nominatim Geo   │
│  - Term Loan Cap      │ │  - 5-Pillar Weight│ │  - OSM Overpass POI    │
│  - Reducing Amortize  │ │  - Low/Base/High  │ │  - Haversine Filter    │
│  - DSCR Shock Engine  │ │  - Dynamic SWOT   │ │  - Honest Rural Fallback│
└───────────────────────┘ └───────────────────┘ └────────────────────────┘
            │                       │                        │
            └───────────────────────┼────────────────────────┘
                                    │ Serialized Read-Only Context
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GROUNDED ADVISORY SERVICE                        │
│   • Mode 1: Live Gemini 1.5 Flash API (when key present in env)        │
│   • Mode 2: Deterministic Rule-Based Fallback Engine (Zero-API mode)   │
│   • Trilingual Output: English, Telugu, and Tamil                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Structure & Data Flow

1. **Demand-First Onboarding (`HomeOnboardingScreen.tsx`):**
   - Collects core demand narrative: *"What products or services do people in your area need, or what products or services do you want to sell?"*
   - Selects Tamil Nadu district from canonical 38-district baseline (`src/data/tamilNaduDistricts.ts`).
   - Free-text village / locality / PIN code input with live Nominatim geocoding and centroid fallback.
   - Initial promoter equity validation (rejects negative or zero numbers).
   - Progressive disclosure for optional household and operational parameters.

2. **Market Intelligence (`VillageIntelligenceScreen.tsx`):**
   - Fetches live nearby competitors via Overpass API within 5 km.
   - Separates live provider POIs from user field observations.
   - Alerts user to sparse rural mapping when zero POIs are recorded in OSM.

3. **Business Model Comparison (`BusinessComparisonScreen.tsx`):**
   - Compares 3 candidate business options based on local demand and margin capital.
   - Evaluates capital outlay, unit economics, payback period, and 5-pillar score.

4. **Financial Structuring (`FinancialStructuringScreen.tsx`):**
   - Routes loan to Micro Finance (≤ ₹1,40,000) or Term Loan (₹1,40,001–₹50,00,000).
   - Generates quarterly reducing-balance amortization schedules.
   - Explains statutory scheme caps and promoter contribution requirements.

5. **Survival Simulator (`SurvivalSimulatorScreen.tsx`):**
   - Interactive sliders for sales decline (default 20%), cost inflation (15%), payment delays, and unexpected costs.
   - Dynamic 12-month cash-flow comparison chart.
   - Algorithmic loan resizing recommendation when stressed DSCR falls below 1.0.
   - Supplementary Experimental ML Viability Panel with synthetic dataset disclaimer.

6. **Business Blueprint DPR (`BusinessBlueprintScreen.tsx`):**
   - Bankable 7-section feasibility dossier formatted for print-to-PDF.
   - Bound to live district coordinates, demand description, live competitor summary, and debt schedule.
   - 90-day practical implementation checklist.
