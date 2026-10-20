"""
GramVenture AI — Synthetic Entrepreneur Dataset Generator
=========================================================

Generates `sample_entrepreneur_dataset.csv` with 600 deterministic synthetic records
covering all 38 Tamil Nadu districts, diverse location types, and 8 business categories.

CRITICAL DISCLAIMER & ETHICAL TRANSPARENCY:
- This is a 100% synthetic research demonstration dataset.
- These records DO NOT represent real entrepreneurs, real individuals, or observed loans.
- Seed is fixed (42) for complete reproducibility.
- Target label 'business_viability' (1 = Viable, 0 = High Risk/Non-viable) is derived via an
  explicit, documented rule reflecting unit-economics margin coverage, competitor density,
  and debt-service capacity.
- Demographic variables (age, education_level) are generated to satisfy benchmark schema
  requirements but are STRICTLY EXCLUDED from predictor feature sets during training.
"""

import os
import random
import numpy as np
import pandas as pd

TAMIL_NADU_DISTRICTS = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
    'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
]

BUSINESS_CATEGORIES = [
    'Dairy', 'Grocery / Kirana', 'Tailoring', 'Poultry',
    'Mobile Repair', 'Agricultural Inputs', 'Food Processing', 'Local Services'
]

EDUCATION_LEVELS = [
    'Primary (5th std)', 'Secondary (10th std)', 'Higher Secondary (12th std)',
    'Diploma / ITI', 'Graduate (Bachelor degree)'
]

LOCATION_TYPES = ['Rural Village', 'Semi-Urban Town', 'Peri-Urban Growth Center']

def generate_dataset(num_records: int = 600, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for i in range(1, num_records + 1):
        entrepreneur_id = f"TN-ENT-{i:04d}"
        age = int(np.random.randint(21, 62))
        education_level = random.choice(EDUCATION_LEVELS)
        entrepreneur_experience_years = int(np.clip(np.random.exponential(scale=4), 0, 30))
        district = TAMIL_NADU_DISTRICTS[i % len(TAMIL_NADU_DISTRICTS)]
        location_type = random.choice(LOCATION_TYPES)
        business_category = random.choice(BUSINESS_CATEGORIES)
        business_experience_years = int(min(entrepreneur_experience_years, np.random.randint(0, 15)))

        # Sizing & Investment (based on 10% margin rule)
        # Distribution: 65% micro/small projects (<5 lakhs), 35% medium projects (5-20 lakhs)
        if np.random.rand() < 0.65:
            available_investment = int(np.random.choice([15000, 25000, 40000, 50000, 75000, 100000]))
            total_project_cost = int(available_investment * 10)
        else:
            available_investment = int(np.random.choice([120000, 150000, 200000, 250000, 350000]))
            total_project_cost = int(min(5000000, available_investment * 10))

        # Requested loan (up to 90%, subject to scheme caps)
        if total_project_cost <= 140000:
            requested_loan_amount = int(min(125000, total_project_cost * 0.90))
            monthly_interest_rate = 0.065 / 12
            tenure_months = 36
        else:
            requested_loan_amount = int(min(4500000, total_project_cost * 0.90))
            monthly_interest_rate = 0.08 / 12
            tenure_months = 84

        # Monthly loan repayment (reducing balance approximation)
        r = monthly_interest_rate
        n = tenure_months
        if r > 0 and n > 0:
            emi = requested_loan_amount * r * ((1 + r)**n) / (((1 + r)**n) - 1)
        else:
            emi = requested_loan_amount / n
        estimated_monthly_loan_repayment = int(round(emi))

        # Expected monthly revenue and cost based on business category
        category_multipliers = {
            'Dairy': (0.16, 0.65),
            'Grocery / Kirana': (0.22, 0.78),
            'Tailoring': (0.12, 0.40),
            'Poultry': (0.25, 0.72),
            'Mobile Repair': (0.15, 0.45),
            'Agricultural Inputs': (0.24, 0.82),
            'Food Processing': (0.18, 0.55),
            'Local Services': (0.14, 0.38),
        }

        rev_ratio, cost_ratio = category_multipliers[business_category]
        # Add realistic variance (+/- 20%)
        rev_noise = np.random.uniform(0.80, 1.25)
        cost_noise = np.random.uniform(0.85, 1.20)

        expected_monthly_revenue = int(round(total_project_cost * rev_ratio * rev_noise))
        expected_monthly_operating_cost = int(round(expected_monthly_revenue * cost_ratio * cost_noise))
        estimated_monthly_profit = int(expected_monthly_revenue - expected_monthly_operating_cost)

        # Environmental & Competitor Factors
        local_demand_score = round(float(np.clip(np.random.normal(68, 15), 20, 100)), 1)
        competitor_count_5km = int(np.random.poisson(lam=4))
        average_competitor_distance_km = round(float(np.random.uniform(0.6, 5.0)), 2)
        estimated_customer_count = int(np.random.randint(40, 600))
        expected_monthly_sales_volume = int(np.random.randint(100, 3000))

        supplier_availability_score = round(float(np.clip(np.random.normal(70, 14), 25, 100)), 1)
        market_accessibility_score = round(float(np.clip(np.random.normal(65, 16), 20, 100)), 1)
        seasonality_risk_score = round(float(np.random.uniform(15, 80)), 1)
        business_risk_score = round(float(np.random.uniform(20, 75)), 1)

        # Estimated monthly cash flow after estimated household withdrawal (~₹10,000-15,000)
        household_living_allowance = int(np.random.choice([10000, 12000, 14000]))
        estimated_monthly_cash_flow = int(estimated_monthly_profit - household_living_allowance)

        # ── Ground Truth Target Label Generation ─────────────────────────────
        # Rule: A venture is labeled viable (1) if:
        # 1. Monthly cash flow exceeds debt repayment with safe DSCR buffer (CADS >= 1.25 * EMI)
        # 2. Demand score is adequate (>= 50)
        # 3. Market access score is adequate (>= 40)
        # 4. Competitor density is not saturating (>10 competitors with low demand)
        # Otherwise high risk / non-viable (0).
        cads = max(0, estimated_monthly_cash_flow)
        dscr = cads / estimated_monthly_loan_repayment if estimated_monthly_loan_repayment > 0 else 2.0

        is_financially_sound = dscr >= 1.20
        is_market_viable = local_demand_score >= 50.0 and market_accessibility_score >= 40.0
        not_oversaturated = not (competitor_count_5km >= 8 and local_demand_score < 60)

        business_viability = 1 if (is_financially_sound and is_market_viable and not_oversaturated) else 0

        records.append({
            'entrepreneur_id': entrepreneur_id,
            'age': age,
            'education_level': education_level,
            'entrepreneur_experience_years': entrepreneur_experience_years,
            'district': district,
            'location_type': location_type,
            'business_category': business_category,
            'business_experience_years': business_experience_years,
            'available_investment': available_investment,
            'total_project_cost': total_project_cost,
            'requested_loan_amount': requested_loan_amount,
            'expected_monthly_revenue': expected_monthly_revenue,
            'expected_monthly_operating_cost': expected_monthly_operating_cost,
            'estimated_monthly_profit': estimated_monthly_profit,
            'local_demand_score': local_demand_score,
            'competitor_count_5km': competitor_count_5km,
            'average_competitor_distance_km': average_competitor_distance_km,
            'estimated_customer_count': estimated_customer_count,
            'expected_monthly_sales_volume': expected_monthly_sales_volume,
            'supplier_availability_score': supplier_availability_score,
            'market_accessibility_score': market_accessibility_score,
            'seasonality_risk_score': seasonality_risk_score,
            'business_risk_score': business_risk_score,
            'estimated_monthly_loan_repayment': estimated_monthly_loan_repayment,
            'estimated_monthly_cash_flow': estimated_monthly_cash_flow,
            'business_viability': business_viability,
        })

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    df = generate_dataset(num_records=600, random_seed=42)
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sample_entrepreneur_dataset.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully at: {output_path}")
    print(f"Row count: {len(df)}")
    print(f"Target distribution (business_viability):\n{df['business_viability'].value_counts(normalize=True)}")
    print(f"Districts covered: {df['district'].nunique()} (All 38 Tamil Nadu districts represented)")
