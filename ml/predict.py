"""
GramVenture AI — ML Prediction CLI & Inference Test
===================================================

Runs inference using the saved pipeline artifact `ml/model.joblib`.
"""

import os
import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')

def predict_sample(sample_dict=None):
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}. Run train_model.py first.")

    pipeline = joblib.load(MODEL_PATH)

    if sample_dict is None:
        sample_dict = {
            'entrepreneur_experience_years': 3,
            'business_experience_years': 2,
            'available_investment': 100000,
            'total_project_cost': 1000000,
            'requested_loan_amount': 900000,
            'expected_monthly_revenue': 160000,
            'expected_monthly_operating_cost': 104000,
            'local_demand_score': 74.0,
            'competitor_count_5km': 2,
            'average_competitor_distance_km': 1.8,
            'estimated_customer_count': 180,
            'expected_monthly_sales_volume': 1200,
            'supplier_availability_score': 75.0,
            'market_accessibility_score': 70.0,
            'seasonality_risk_score': 35.0,
            'business_risk_score': 30.0,
            'district': 'Madurai',
            'location_type': 'Rural Village',
            'business_category': 'Dairy',
        }

    input_df = pd.DataFrame([sample_dict])
    prediction = pipeline.predict(input_df)[0]
    probability = pipeline.predict_proba(input_df)[0][1]

    result = {
        'predicted_viable': bool(prediction == 1),
        'viability_score': round(float(probability * 100), 1),
        'risk_rating': 'Moderate Risk' if probability > 0.5 else 'High Risk',
        'disclaimer': (
            'Experimental synthetic-data model output — not a real-world success probability. '
            'This machine-learning demonstration is trained on synthetic benchmark data only.'
        ),
    }

    return result

if __name__ == '__main__':
    res = predict_sample()
    print("Inference Test Result:")
    for k, v in res.items():
        print(f"  {k}: {v}")
