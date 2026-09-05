import joblib
import pandas as pd
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR.parent / "models" / "random_forest.pkl"


# Load model
model = joblib.load(MODEL_FILE)

print("VITAL model loaded successfully.\n")


# Get student data
attendance = float(input("Enter Attendance (%): "))
quiz_score = float(input("Enter Quiz Score: "))
assignment_score = float(input("Enter Assignment Score: "))


# Create input with the same column names used during training
input_data = pd.DataFrame(
    [[attendance, quiz_score, assignment_score]],
    columns=[
        "Attendance",
        "Quiz_Score",
        "Assignment_Score"
    ]
)


# Predict
prediction = model.predict(input_data)[0]


# Display result
print("\n============================================")
print("VITAL PREDICTION")
print("============================================")

print(f"Attendance       : {attendance:.2f}%")
print(f"Quiz Score       : {quiz_score:.2f}")
print(f"Assignment Score : {assignment_score:.2f}")

print(f"\nUnderstanding Level: {prediction}")

print("============================================")