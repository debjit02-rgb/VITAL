import pandas as pd
import joblib
from pathlib import Path

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ============================================
# VITAL - Model Evaluation
# ============================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_FILE = BASE_DIR / "dataset" / "vital_dataset.csv"
MODEL_FILE = BASE_DIR.parent / "models" / "random_forest.pkl"


# ============================================
# Load dataset and model
# ============================================

df = pd.read_csv(DATASET_FILE)
model = joblib.load(MODEL_FILE)

print("VITAL model and dataset loaded successfully.")


# ============================================
# Features and target
# ============================================

features = [
    "Attendance",
    "Quiz_Score",
    "Assignment_Score"
]

target = "Understanding_Level"

X = df[features]
y = df[target]


# ============================================
# Evaluate on complete dataset
# ============================================

predictions = model.predict(X)

accuracy = accuracy_score(y, predictions)


print("\n============================================")
print("VITAL MODEL EVALUATION")
print("============================================")

print(f"\nDataset records: {len(df)}")
print(f"Accuracy on complete dataset: {accuracy * 100:.2f}%")


print("\nClassification Report:")
print(classification_report(y, predictions))


print("\nConfusion Matrix:")
print(confusion_matrix(y, predictions))


print("\n============================================")
print("Evaluation completed.")
print("============================================")