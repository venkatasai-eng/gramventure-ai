# GramVenture AI — Live Demonstration & Verification Checklist

**Purpose:** Comprehensive guide for evaluators, judges, and developers to verify all features and requirements of GramVenture AI in a live walkthrough.

---

## 1. Quick Launch

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Run automated test suite (89 tests)
npx vitest run

# 3. Build production bundle (TypeScript compilation + Vite bundling)
npm run build

# 4. Start local development server
npm run dev
```

The application runs locally at `http://localhost:5173`.

---

## 2. Requirement-by-Requirement Verification Checklist

### Step 1: Multilingual Global Header
- [x] Check language selector in top header. Options are:
  - `English` (Default)
  - `తెలుగు (Telugu)`
  - `தமிழ் (Tamil)`
- [x] Switch between languages: verify all navigation items, titles, helper texts, and buttons translate immediately.
- [x] Verify persistence: refresh the page (`F5`); verify the selected language remains active.
- [x] Verify state stability: language switching does NOT reset the selected district, margin capital, coordinates, or active step.

### Step 2: Problem Statement ID Removal
- [x] Inspect header: no problem statement ID is displayed.
- [x] Inspect footer: displays "GramVenture AI • Built for rural and semi-urban entrepreneurs in Tamil Nadu" without problem statement numbers.
- [x] Inspect Business Blueprint (DPR) header and disclaimers: reference reads `GV-DPR-...` with no problem statement ID.

### Step 3: Demand-First Onboarding Flow
- [x] Open the onboarding screen.
- [x] Verify initial question reads:
  *"What products or services do people in your area need, or what products or services do you want to sell?"*
- [x] District selector: searchable dropdown containing all **38 official Tamil Nadu districts** with canonical IDs and localized names.
- [x] Locality input: free-text field allowing village, town, or PIN code (e.g., `Vadipatti`, `625218`).
- [x] Type in locality and click outside: automatic Nominatim geocoding triggers with fallback to District Centroid if unavailable.
- [x] Personal investment input: enter margin capital (e.g., `₹1,00,000`). Verify negative numbers are strictly rejected.
- [x] Click **Explore Demo** button: preloads the Tamil Nadu Madurai / Vadipatti baseline without requiring an API key or account.

### Step 4: Hyper-Local Competitor Discovery (within 5 km)
- [x] Navigate to **Market Intelligence** tab.
- [x] Click **Scan OpenStreetMap POIs**: triggers Overpass API query for business POIs within a 5 km radius of current coordinates.
- [x] Notice the Haversine distance badge on each POI.
- [x] If zero POIs are found in a rural area, verify the honest warning:  
  *"0 POIs registered in OpenStreetMap within 5 km... Lack of mapped entries does not prove lack of competition. Rely on manual field survey."*
- [x] Log a manual field observation: enter competitor type, count, and observed price. Notice it is clearly separated with a green `Verified Local Observation` badge.

### Step 5: Financial Structuring & Amortization
- [x] Navigate to **Financial Structuring** tab.
- [x] Sizing: verify ₹1,00,000 margin capital sizes to ₹10,00,000 project cost and ₹9,00,000 loan under the 10% equity rule.
- [x] Scheme routing: project cost ₹10,00,000 routes to **Term Loan Scheme** (8.0% p.a., 84 months tenure, 6 months moratorium).
- [x] Test boundary values:
  - Margin ₹14,000 $\implies$ ₹1,40,000 project cost $\implies$ **Micro Finance** (6.5% p.a., 36 months, 3 months moratorium).
  - Margin ₹14,001 $\implies$ ₹1,40,010 project cost $\implies$ **Term Loan**.
- [x] Inspect reducing-balance schedule: displays quarterly instalments, moratorium interest capitalisation, and monthly EMI equivalents.

### Step 6: Interactive Survival Simulator
- [x] Navigate to **Survival Simulator** tab.
- [x] Move the **Sales Decline** slider to 20% and **Cost Inflation** slider to 15%.
- [x] Observe the real-time DSCR recalculation and the Recharts 12-month cash-flow graph.
- [x] Notice the algorithmic resizing advice recommending borrowing less to maintain a safe DSCR buffer.
- [x] Inspect the **Experimental Machine Learning Viability Panel**:
  - Displays Random Forest prediction (Viable / High Risk).
  - Displays cross-validated metrics (Accuracy 90.0%, F1 91.9%, ROC-AUC 94.4%).
  - Displays the mandatory prominent disclaimer: *"Experimental synthetic-data ML model trained on 600 records; demonstration only, not a real-world success guarantee."*

### Step 7: Business Blueprint (DPR) & Print-to-PDF
- [x] Navigate to **Business Blueprint** tab.
- [x] Inspect the 7 bankable feasibility sections:
  1. Executive Summary (with promoter name, district, coordinates).
  2. Project Cost & Means of Finance.
  3. Hyper-Local Market Evidence & Field Survey (distinguishing live provider POIs from user observations).
  4. Cash-Flow Sensitivity & DSCR Stress Testing.
  5. Experimental Machine Learning Viability Evaluation.
  6. Practical 90-Day Pre-Investment Execution Checklist.
  7. Official Limitations & Policy Disclaimers.
- [x] Click **Print / Save as PDF**: verify clean print stylesheet with navigation and action bars hidden.
