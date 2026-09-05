import os
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
import joblib
import pandas as pd
from backend.database.connection import get_connection
from backend.services.auth_service import require_student, get_current_user

router = APIRouter(tags=["Student Portal"])

# Load ML Model
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models" / "random_forest.pkl"
model = joblib.load(MODEL_PATH)


@router.get("/student/dashboard")
def get_student_dashboard(current_user: Dict[str, Any] = Depends(require_student)):
    student_id = current_user.get("student_id")
    if not student_id:
        raise HTTPException(status_code=400, detail="Student profile not linked")

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # 1. Student Info
        cur.execute("""
            SELECT student_id, roll_number, name, email, department, semester,
                   (face_encoding IS NOT NULL) AS has_face_profile
            FROM students
            WHERE student_id = %s
        """, (student_id,))
        student = cur.fetchone()

        if not student:
            raise HTTPException(status_code=404, detail="Student record not found")

        # 2. Attendance
        cur.execute("""
            SELECT 
                COUNT(*) AS total_classes,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_classes
            FROM attendance
            WHERE student_id = %s
        """, (student_id,))
        att_data = cur.fetchone()
        total_classes = att_data["total_classes"] or 0
        present_classes = att_data["present_classes"] or 0
        attendance_percentage = round((present_classes / total_classes * 100), 2) if total_classes > 0 else 0.0

        # 3. Quizzes
        cur.execute("""
            SELECT qr.quiz_id, q.title, q.subject, q.total_marks, qr.score, qr.submitted_at
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            WHERE qr.student_id = %s
            ORDER BY qr.submitted_at DESC
        """, (student_id,))
        quizzes = cur.fetchall()

        cur.execute("SELECT AVG(score) AS quiz_average FROM quiz_results WHERE student_id = %s", (student_id,))
        q_avg_row = cur.fetchone()
        quiz_average = round(float(q_avg_row["quiz_average"]), 2) if q_avg_row and q_avg_row["quiz_average"] is not None else 0.0

        # 4. Assignments
        cur.execute("""
            SELECT ar.assignment_id, a.title, a.subject, a.total_marks, ar.score, ar.submitted_at
            FROM assignment_results ar
            JOIN assignments a ON ar.assignment_id = a.assignment_id
            WHERE ar.student_id = %s
            ORDER BY ar.submitted_at DESC
        """, (student_id,))
        assignments = cur.fetchall()

        cur.execute("SELECT AVG(score) AS assignment_average FROM assignment_results WHERE student_id = %s", (student_id,))
        a_avg_row = cur.fetchone()
        assignment_average = round(float(a_avg_row["assignment_average"]), 2) if a_avg_row and a_avg_row["assignment_average"] is not None else 0.0

        # 5. ML Prediction
        model_input = pd.DataFrame(
            [[attendance_percentage, quiz_average, assignment_average]],
            columns=["Attendance", "Quiz_Score", "Assignment_Score"]
        )
        prediction = str(model.predict(model_input)[0])

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
                "understanding_level": prediction
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get("/student/attendance")
def get_student_attendance_history(current_user: Dict[str, Any] = Depends(require_student)):
    student_id = current_user["student_id"]
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                a.attendance_id,
                a.session_id,
                a.status,
                a.marked_at,
                s.subject,
                s.session_date,
                s.start_time
            FROM attendance a
            LEFT JOIN attendance_sessions s ON a.session_id = s.session_id
            WHERE a.student_id = %s
            ORDER BY a.marked_at DESC
        """, (student_id,))
        records = cur.fetchall()

        total = len(records)
        present = sum(1 for r in records if r["status"] == "Present")
        absent = total - present
        rate = round((present / total * 100), 2) if total > 0 else 0.0

        return {
            "summary": {
                "total": total,
                "present": present,
                "absent": absent,
                "rate": rate
            },
            "records": records
        }
    finally:
        cur.close()
        conn.close()


@router.get("/student/quizzes")
def get_student_quizzes(current_user: Dict[str, Any] = Depends(require_student)):
    student_id = current_user["student_id"]
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                qr.result_id,
                qr.quiz_id,
                q.title,
                q.subject,
                q.total_marks,
                qr.score,
                qr.submitted_at
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            WHERE qr.student_id = %s
            ORDER BY qr.submitted_at DESC
        """, (student_id,))
        quizzes = cur.fetchall()
        return {"quizzes": quizzes}
    finally:
        cur.close()
        conn.close()


@router.get("/student/assignments")
def get_student_assignments(current_user: Dict[str, Any] = Depends(require_student)):
    student_id = current_user["student_id"]
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                ar.result_id,
                ar.assignment_id,
                a.title,
                a.subject,
                a.total_marks,
                ar.score,
                ar.submitted_at
            FROM assignment_results ar
            JOIN assignments a ON ar.assignment_id = a.assignment_id
            WHERE ar.student_id = %s
            ORDER BY ar.submitted_at DESC
        """, (student_id,))
        assignments = cur.fetchall()
        return {"assignments": assignments}
    finally:
        cur.close()
        conn.close()


@router.get("/student/ai-insights")
def get_student_ai_insights(current_user: Dict[str, Any] = Depends(require_student)):
    student_id = current_user["student_id"]
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Attendance %
        cur.execute("""
            SELECT COUNT(*) AS total, SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present
            FROM attendance WHERE student_id = %s
        """, (student_id,))
        att = cur.fetchone()
        tot = att["total"] or 0
        pres = att["present"] or 0
        att_pct = round((pres / tot * 100), 2) if tot > 0 else 0.0

        # Quiz avg
        cur.execute("SELECT AVG(score) AS q_avg FROM quiz_results WHERE student_id = %s", (student_id,))
        q_avg_row = cur.fetchone()
        q_avg = round(float(q_avg_row["q_avg"]), 2) if q_avg_row and q_avg_row["q_avg"] is not None else 0.0

        # Assignment avg
        cur.execute("SELECT AVG(score) AS a_avg FROM assignment_results WHERE student_id = %s", (student_id,))
        a_avg_row = cur.fetchone()
        a_avg = round(float(a_avg_row["a_avg"]), 2) if a_avg_row and a_avg_row["a_avg"] is not None else 0.0

        model_input = pd.DataFrame(
            [[att_pct, q_avg, a_avg]],
            columns=["Attendance", "Quiz_Score", "Assignment_Score"]
        )
        prediction = str(model.predict(model_input)[0])

        # Feature importances
        feature_names = ["Attendance (40%)", "Quiz Score (30%)", "Assignment Score (30%)"]
        importances = [float(x) for x in model.feature_importances_]
        
        # Recommendations
        rec_map = {
            "Excellent": [
                "Maintain your exemplary attendance record (>90%).",
                "Take the lead in collaborative peer-learning groups.",
                "Explore elective research papers in AI & Machine Learning."
            ],
            "Good": [
                "Target 95%+ in upcoming quizzes to achieve 'Excellent' standing.",
                "Ensure assignments are submitted on time with full documentation.",
                "Maintain steady weekly study hours."
            ],
            "Average": [
                "Prioritize class attendance to build foundational knowledge.",
                "Review earlier quiz topics where scores were below 14/20.",
                "Consult faculty during office hours for clarifying complex concepts."
            ],
            "Poor": [
                "Urgent: Boost attendance immediately to avoid academic warning.",
                "Complete all pending assignment submissions.",
                "Schedule a personalized academic mentoring session with faculty."
            ]
        }

        return {
            "understanding_level": prediction,
            "metrics": {
                "attendance_percentage": att_pct,
                "quiz_average": q_avg,
                "assignment_average": a_avg
            },
            "feature_weights": dict(zip(feature_names, importances)),
            "recommendations": rec_map.get(prediction, ["Maintain steady academic performance."])
        }
    finally:
        cur.close()
        conn.close()


@router.get("/student/profile")
def get_student_profile(current_user: Dict[str, Any] = Depends(require_student)):
    student_id = current_user["student_id"]
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT student_id, roll_number, name, email, department, semester,
                   (face_encoding IS NOT NULL) AS has_face_profile,
                   created_at
            FROM students
            WHERE student_id = %s
        """, (student_id,))
        student = cur.fetchone()
        return {"student": student}
    finally:
        cur.close()
        conn.close()
