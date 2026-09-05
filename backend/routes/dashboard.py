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
# DASHBOARD API
# ============================================================

@router.get("/dashboard/{student_id}")
def get_dashboard(student_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # ====================================================
        # 1. STUDENT DETAILS
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
        # 2. ATTENDANCE
        # ====================================================

        cursor.execute("""
            SELECT
                COUNT(*) AS total_classes,
                SUM(
                    CASE
                        WHEN status = 'Present'
                        THEN 1
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
        # 3. QUIZ RESULTS
        # ====================================================

        cursor.execute("""
            SELECT
                qr.quiz_id,
                q.title,
                q.subject,
                q.total_marks,
                qr.score,
                qr.submitted_at
            FROM quiz_results qr
            JOIN quizzes q
                ON qr.quiz_id = q.quiz_id
            WHERE qr.student_id = %s
            ORDER BY q.quiz_date DESC
        """, (student_id,))

        quizzes = cursor.fetchall()


        # ====================================================
        # 4. QUIZ AVERAGE
        # ====================================================

        cursor.execute("""
            SELECT AVG(score) AS quiz_average
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
        # 5. ASSIGNMENT RESULTS
        # ====================================================

        cursor.execute("""
            SELECT
                ar.assignment_id,
                a.title,
                a.subject,
                a.total_marks,
                ar.score,
                ar.submitted_at
            FROM assignment_results ar
            JOIN assignments a
                ON ar.assignment_id = a.assignment_id
            WHERE ar.student_id = %s
            ORDER BY a.assignment_date DESC
        """, (student_id,))

        assignments = cursor.fetchall()


        # ====================================================
        # 6. ASSIGNMENT AVERAGE
        # ====================================================

        cursor.execute("""
            SELECT AVG(score) AS assignment_average
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
        # 7. ML PREDICTION
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

        prediction = model.predict(model_input)[0]


        # ====================================================
        # 8. RETURN COMPLETE DASHBOARD
        # ====================================================

        return {

            "student": student,

            "attendance": {
                "total_classes": total_classes,
                "present_classes": present_classes,
                "attendance_percentage": attendance_percentage
            },

            "performance": {
                "quiz_average": quiz_average,
                "assignment_average": assignment_average
            },

            "quizzes": quizzes,

            "assignments": assignments,

            "prediction": {
                "understanding_level": str(prediction)
            }
        }

    finally:

        cursor.close()
        connection.close()