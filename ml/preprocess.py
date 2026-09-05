import pandas as pd
from pathlib import Path


# ============================================
# VITAL - Dataset Preprocessing
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"

INPUT_FILE = DATASET_DIR / "Students Performance Dataset.csv"
OUTPUT_FILE = DATASET_DIR / "vital_dataset.csv"


# ============================================
# 1. Load original dataset
# ============================================

df = pd.read_csv(INPUT_FILE)

print("Original dataset loaded successfully.")
print(f"Number of records: {len(df)}")


# ============================================
# 2. Select VITAL features
# ============================================

vital_df = df[
    [
        "Student_ID",
        "Attendance (%)",
        "Quizzes_Avg",
        "Assignments_Avg"
    ]
].copy()


# ============================================
# 3. Rename columns
# ============================================

vital_df.rename(
    columns={
        "Attendance (%)": "Attendance",
        "Quizzes_Avg": "Quiz_Score",
        "Assignments_Avg": "Assignment_Score"
    },
    inplace=True
)


# ============================================
# 4. Calculate VITAL Performance Score
# ============================================
#
# Attendance  -> 40%
# Quiz        -> 30%
# Assignment  -> 30%
#

vital_df["VITAL_Score"] = (
    vital_df["Attendance"] * 0.40
    + vital_df["Quiz_Score"] * 0.30
    + vital_df["Assignment_Score"] * 0.30
)
print("\nVITAL Score Statistics:")
print(vital_df["VITAL_Score"].describe())

# ============================================
# 5. Create Understanding Level
# ============================================

def get_understanding_level(score):

    if score < 60:
        return "Poor"

    elif score < 70:
        return "Average"

    elif score < 85:
        return "Good"

    else:
        return "Excellent"


vital_df["Understanding_Level"] = (
    vital_df["VITAL_Score"].apply(get_understanding_level)
)


# ============================================
# 6. Remove VITAL_Score
# ============================================
#
# VITAL_Score is used only to create the label.
# The ML model will NOT receive this column.
#

vital_df.drop(columns=["VITAL_Score"], inplace=True)


# ============================================
# 7. Handle missing values
# ============================================

print("\nMissing values:")
print(vital_df.isnull().sum())

vital_df.dropna(inplace=True)


# ============================================
# 8. Save processed dataset
# ============================================

vital_df.to_csv(OUTPUT_FILE, index=False)


# ============================================
# 9. Display results
# ============================================

print("\nVITAL dataset created successfully.")
print(f"Saved to: {OUTPUT_FILE}")

print(f"\nFinal records: {len(vital_df)}")

print("\nColumns:")
print(list(vital_df.columns))

print("\nUnderstanding Level distribution:")
print(vital_df["Understanding_Level"].value_counts())

print("\nFirst 5 records:")
print(vital_df.head())