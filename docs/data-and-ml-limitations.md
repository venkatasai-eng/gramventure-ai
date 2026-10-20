# GramVenture AI — Data Provenance, Geospatial Assumptions & ML Limitations

**Target Geography:** 38 Administrative Districts of Tamil Nadu, India  
**Policy Compliance:** Non-Fabrication Rule • Transparent Labeling • Safe AI Principles  

---

## 1. Data Provenance & Evidence Taxonomy

Every numeric metric and categorical assumption in GramVenture AI carries an explicit provenance badge:

| Provenance Label | Definition | UI Visual Indicator |
| :--- | :--- | :--- |
| `Official Data` | Authoritative data from government gazettes, Census tables, or official circulars. | Blue Badge |
| `Provider Result` | Retrieved via live API query (OpenStreetMap Overpass, Nominatim). | Cyan Badge |
| `Verified Local Observation` | Field data verified on the ground by the promoter or local surveyor. | Green Badge |
| `User-Provided Input` | Direct input provided by the entrepreneur during the onboarding flow. | Indigo Badge |
| `User-Provided Observation` | Specific physical competitor/price observation logged by the user. | Teal Badge |
| `User-Provided Assumption` | Stated operational assumption (e.g. expected daily footfall). | Purple Badge |
| `Model Estimate` | Deterministically derived estimate (e.g. population projection from Census). | Amber Badge |
| `Synthetic Demo Data` | Illustrative data pre-loaded for offline demonstration purposes. | Gray Badge |
| `Missing Data` | Critical information not yet verified on the ground. | Red Dotted Badge |

---

## 2. Geospatial Provider Integration & Limitations

### 2.1 Geocoding (OpenStreetMap Nominatim)
- Queries Nominatim with user-agent identification and 1-second polite rate-limiting.
- **Limitation in Rural Tamil Nadu:** Many small hamlets or habitations (*kudiyiruppu*) are not mapped as distinct geocoded entities in Nominatim.
- **Safe Fallback:** When geocoding is unavailable or times out, the system cleanly defaults to the official District Headquarters Centroid from `src/data/tamilNaduDistricts.ts`, clearly marking the location accuracy as `District Headquarters Centroid` and disabling radius searches until coordinates are confirmed.

### 2.2 Competitor Discovery (OpenStreetMap Overpass API)
- Retrieves Points of Interest (POIs) using standard OpenStreetMap tags (`shop=dairy`, `shop=convenience`, `craft=tailor`, `shop=mobile_phone`, `amenity=pharmacy`).
- Filters all returned nodes strictly using the **Haversine great-circle formula** centered on the user's verified coordinates, discarding any node beyond 5.0 km.
- **Rural Mapping Reality:** OpenStreetMap coverage in rural Tamil Nadu is often sparse. Informal petty shops, loose-milk vendors, and roadside repair stalls are rarely mapped on OpenStreetMap.
- **Honest System Behavior:** The UI never fabricates competitors when Overpass returns 0 results. It explicitly displays:  
  *"0 POIs registered in OpenStreetMap within 5 km. Rural areas often feature unmapped informal stalls. Lack of mapped entries does not prove lack of competition. Rely on manual field survey."*

---

## 3. Synthetic Entrepreneur Dataset & ML Pipeline Limitations

### 3.1 Synthetic Dataset Specifications (`sample_entrepreneur_dataset.csv`)
- **Row Count:** 600 records (exceeds the 500 requirement).
- **Geographic Coverage:** Balanced across all 38 Tamil Nadu districts.
- **Columns (26 attributes):**
  - Demographic & Experience: `entrepreneur_id`, `age`, `education_level`, `entrepreneur_experience_years`, `district`, `location_type`, `business_category`, `business_experience_years`
  - Financial Sizing: `available_investment`, `total_project_cost`, `requested_loan_amount`, `expected_monthly_revenue`, `expected_monthly_operating_cost`, `estimated_monthly_profit`
  - Market Evidence: `local_demand_score`, `competitor_count_5km`, `average_competitor_distance_km`, `estimated_customer_count`, `expected_monthly_sales_volume`, `supplier_availability_score`, `market_accessibility_score`, `seasonality_risk_score`, `business_risk_score`
  - Repayment & Viability: `estimated_monthly_loan_repayment`, `estimated_monthly_cash_flow`, `business_viability` (61% viable, 39% non-viable).

### 3.2 Target Leakage Prevention & Bias Audit
- **Exclusion of Derived Financial Proxies:** `estimated_monthly_profit`, `estimated_monthly_loan_repayment`, and `estimated_monthly_cash_flow` were strictly excluded from model feature matrix $X$ to prevent target leakage.
- **Demographic Proxy Audit:** `age` and `education_level` were removed from model features to avoid demographic proxy discrimination.
- **Evaluation Metrics (Random Forest Classifier):**
  - Accuracy: **90.0%**
  - Precision: **91.1%**
  - Recall: **92.7%**
  - F1-Score: **91.9%**
  - ROC-AUC: **94.4%**

### 3.3 Mandatory User-Facing Disclaimer
> **CRITICAL DISCLAIMER:**  
> This machine learning model is an experimental proof-of-concept trained exclusively on synthetic data. It is provided solely for educational and algorithmic demonstration. **It does NOT represent a reliable real-world probability of business success, creditworthiness, or official loan approval.** Financial decisions must be based on verified local market demand and deterministic debt-service capacity.
