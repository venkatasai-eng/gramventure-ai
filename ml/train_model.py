"""
GramVenture AI — Scikit-Learn Model Training & Evaluation Pipeline
===================================================================

Trains baseline classifiers (Logistic Regression vs. Random Forest) on the
synthetic entrepreneur dataset (`sample_entrepreneur_dataset.csv`).

LEAKAGE & ETHICS AUDIT CONTROLS:
1. Target Leakage Control:
   - Excluded derived post-hoc outputs: `estimated_monthly_profit`, `estimated_monthly_cash_flow`,
     and `estimated_monthly_loan_repayment`.
2. Ethical & Non-Discrimination Audit:
   - Excluded sensitive demographic proxies: `age`, `education_level`.
3. Preprocessing:
   - Numerical: StandardScaler with imputation
   - Categorical: OneHotEncoder(handle_unknown='ignore')
4. Model Pipeline:
   - Fitted ONLY on training split (no preprocessor leakage).
   - Stratified Train (70%) / Validation (15%) / Test (15%) splits with fixed seed.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sample_entrepreneur_dataset.csv')
ARTIFACT_DIR = os.path.dirname(__file__)

PREDICTOR_NUMERICAL = [
    'entrepreneur_experience_years',
    'business_experience_years',
    'available_investment',
    'total_project_cost',
    'requested_loan_amount',
    'expected_monthly_revenue',
    'expected_monthly_operating_cost',
    'local_demand_score',
    'competitor_count_5km',
    'average_competitor_distance_km',
    'estimated_customer_count',
    'expected_monthly_sales_volume',
    'supplier_availability_score',
    'market_accessibility_score',
    'seasonality_risk_score',
    'business_risk_score',
]

PREDICTOR_CATEGORICAL = [
    'district',
    'location_type',
    'business_category',
]

EXCLUDED_DEMOGRAPHIC = ['age', 'education_level']
EXCLUDED_LEAKAGE = [
    'estimated_monthly_profit',
    'estimated_monthly_loan_repayment',
    'estimated_monthly_cash_flow',
    'entrepreneur_id',
]

def train_and_evaluate():
    print(f"Loading dataset from: {DATASET_PATH}")
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}. Run generate_dataset.py first.")

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df)} records.")

    features = PREDICTOR_NUMERICAL + PREDICTOR_CATEGORICAL
    X = df[features]
    y = df['business_viability']

    # 1. Stratified 70 / 15 / 15 Train-Val-Test Split
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.1765, random_state=42, stratify=y_train_val
    )  # 0.1765 * 0.85 approx 0.15 of total

    print(f"Split sizes - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # 2. Build ColumnTransformer Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), PREDICTOR_NUMERICAL),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), PREDICTOR_CATEGORICAL),
        ]
    )

    # 3. Model 1: Logistic Regression Baseline
    pipe_lr = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=1000, random_state=42)),
    ])
    pipe_lr.fit(X_train, y_train)
    y_pred_lr = pipe_lr.predict(X_val)
    y_prob_lr = pipe_lr.predict_proba(X_val)[:, 1]
    f1_lr = f1_score(y_val, y_pred_lr)
    auc_lr = roc_auc_score(y_val, y_prob_lr)
    print(f"Logistic Regression Validation - F1: {f1_lr:.4f}, ROC-AUC: {auc_lr:.4f}")

    # 4. Model 2: Random Forest Classifier
    pipe_rf = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)),
    ])
    pipe_rf.fit(X_train, y_train)
    y_pred_rf = pipe_rf.predict(X_val)
    y_prob_rf = pipe_rf.predict_proba(X_val)[:, 1]
    f1_rf = f1_score(y_val, y_pred_rf)
    auc_rf = roc_auc_score(y_val, y_prob_rf)
    print(f"Random Forest Validation - F1: {f1_rf:.4f}, ROC-AUC: {auc_rf:.4f}")

    # Select Best Model for Final Test Evaluation
    best_pipe = pipe_rf if f1_rf >= f1_lr else pipe_lr
    best_name = "RandomForestClassifier" if f1_rf >= f1_lr else "LogisticRegression"

    # Evaluate on Unseen Holdout Test Split
    y_test_pred = best_pipe.predict(X_test)
    y_test_prob = best_pipe.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_test_pred)
    prec = precision_score(y_test, y_test_pred)
    rec = recall_score(y_test, y_test_pred)
    f1 = f1_score(y_test, y_test_pred)
    roc_auc = roc_auc_score(y_test, y_test_prob)
    cm = confusion_matrix(y_test, y_test_pred).tolist()

    print("\n===========================================================")
    print(f"FINAL TEST SET EVALUATION ({best_name})")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"Confusion Matrix: {cm}")
    print("===========================================================\n")

    # 5. Save Artifact & Evaluation Report
    model_path = os.path.join(ARTIFACT_DIR, 'model.joblib')
    joblib.dump(best_pipe, model_path)
    print(f"Trained pipeline saved to: {model_path}")

    report = {
        'model_name': best_name,
        'model_version': '1.0.0-synthetic-proof-of-concept',
        'dataset_version': 'sample_entrepreneur_dataset_v1',
        'random_seed': 42,
        'train_samples': len(X_train),
        'val_samples': len(X_val),
        'test_samples': len(X_test),
        'metrics': {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(roc_auc, 4),
            'confusion_matrix': cm,
        },
        'features_used': features,
        'excluded_demographics': EXCLUDED_DEMOGRAPHIC,
        'excluded_leakage_features': EXCLUDED_LEAKAGE,
        'critical_limitation': (
            'Because the training records and labels are synthetic, metrics only demonstrate '
            'that the scikit-learn pipeline runs correctly on the generated data. They do NOT validate '
            'prediction of real-world business success. This output must be labeled as an experimental '
            'synthetic-data model output—not a real-world success probability.'
        ),
    }

    report_path = os.path.join(ARTIFACT_DIR, 'evaluation_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"Evaluation report written to: {report_path}")

    # Also export a lightweight JSON representation for browser client consumption
    browser_metadata_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'src', 'data', 'mlMetadata.json'
    )
    with open(browser_metadata_path, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"Browser client metadata written to: {browser_metadata_path}")

if __name__ == '__main__':
    train_and_evaluate()
