import pandas as pd
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ============================================
# VITAL - Random Forest Training
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_FILE = BASE_DIR / "dataset" / "vital_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_FILE = MODEL_DIR / "random_forest.pkl"


# ============================================
# 1. Load dataset
# ============================================

df = pd.read_csv(DATASET_FILE)

print("Dataset loaded successfully.")
print(f"Records: {len(df)}")


# ============================================
# 2. Select features and target
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
# 3. Split dataset
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# ============================================
# 4. Create Random Forest
# ============================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ============================================
# 5. Train
# ============================================

print("\nTraining Random Forest...")

model.fit(X_train, y_train)

print("Training completed.")


# ============================================
# 6. Evaluate
# ============================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n============================================")
print("MODEL RESULTS")
print("============================================")

print(f"\nAccuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ============================================
# 7. Feature importance
# ============================================

print("\nFeature Importance:")

for feature, importance in zip(
    features,
    model.feature_importances_
):
    print(f"{feature}: {importance:.4f}")


# ============================================
# 8. Save model
# ============================================

MODEL_DIR.mkdir(exist_ok=True)

joblib.dump(model, MODEL_FILE)

print("\n============================================")
print("MODEL SAVED")
print("============================================")
print(f"Location: {MODEL_FILE}")