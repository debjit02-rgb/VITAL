from fastapi import APIRouter
from backend.database.connection import get_connection

import joblib
import pandas as pd
from pathlib import Path


router = APIRouter()


# ============================================================
# LOAD ML MODEL
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "models" / "random_forest.pkl"

model = joblib.load(MODEL_PATH)


# ============================================================
# PREDICTION API
# ============================================================

@router.get("/prediction/{student_id}")
def predict_student(student_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # ====================================================
        # 1. GET STUDENT
        # ====================================================

        cursor.execute("""
            SELECT
                student_id,
                roll_number,
                name,
                email,
                department,
                semester
            FROM students
            WHERE student_id = %s
        """, (student_id,))

        student = cursor.fetchone()

        if not student:
            return {
                "error": "Student not found"
            }


        # ====================================================
        # 2. CALCULATE ATTENDANCE
        # ====================================================

        cursor.execute("""
            SELECT
                COUNT(*) AS total_classes,
                SUM(
                    CASE
                        WHEN status = 'Present' THEN 1
                        ELSE 0
                    END
                ) AS present_classes
            FROM attendance
            WHERE student_id = %s
        """, (student_id,))

        attendance = cursor.fetchone()

        total_classes = attendance["total_classes"] or 0
        present_classes = attendance["present_classes"] or 0

        if total_classes > 0:
            attendance_percentage = round(
                (present_classes / total_classes) * 100,
                2
            )
        else:
            attendance_percentage = 0.0


        # ====================================================
        # 3. CALCULATE QUIZ AVERAGE
        # ====================================================

        cursor.execute("""
            SELECT
                AVG(score) AS quiz_average
            FROM quiz_results
            WHERE student_id = %s
        """, (student_id,))

        quiz_data = cursor.fetchone()

        quiz_average = quiz_data["quiz_average"]

        if quiz_average is None:
            quiz_average = 0.0
        else:
            quiz_average = round(float(quiz_average), 2)


        # ====================================================
        # 4. CALCULATE ASSIGNMENT AVERAGE
        # ====================================================

        cursor.execute("""
            SELECT
                AVG(score) AS assignment_average
            FROM assignment_results
            WHERE student_id = %s
        """, (student_id,))

        assignment_data = cursor.fetchone()

        assignment_average = assignment_data["assignment_average"]

        if assignment_average is None:
            assignment_average = 0.0
        else:
            assignment_average = round(
                float(assignment_average),
                2
            )


        # ====================================================
        # 5. PREPARE ML INPUT
        # ====================================================

        model_input = pd.DataFrame(
            [[
                attendance_percentage,
                quiz_average,
                assignment_average
            ]],
            columns=[
                "Attendance",
                "Quiz_Score",
                "Assignment_Score"
            ]
        )


        # ====================================================
        # 6. ML PREDICTION
        # ====================================================

        prediction = model.predict(model_input)[0]


        # ====================================================
        # 7. SAVE PREDICTION
        # ====================================================

        cursor.execute("""
            INSERT INTO predictions (
                student_id,
                attendance_percentage,
                quiz_score,
                assignment_score,
                understanding_level
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            student_id,
            attendance_percentage,
            quiz_average,
            assignment_average,
            str(prediction)
        ))

        connection.commit()


        # ====================================================
        # 8. RETURN RESPONSE
        # ====================================================

        return {
            "student": student,

            "input": {
                "attendance_percentage": attendance_percentage,
                "quiz_score": quiz_average,
                "assignment_score": assignment_average
            },

            "prediction": {
                "understanding_level": str(prediction)
            }
        }

    finally:

        cursor.close()
        connection.close()