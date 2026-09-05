from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import joblib
import pandas as pd
from backend.database.connection import get_connection
from backend.services.auth_service import require_teacher

router = APIRouter(tags=["Teacher Portal"])

# Load ML Model
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models" / "random_forest.pkl"
model = joblib.load(MODEL_PATH)


class CreateQuizRequest(BaseModel):
    title: str = Field(..., min_length=2)
    subject: str = Field(..., min_length=2)
    total_marks: int = Field(20, ge=1)
    quiz_date: Optional[str] = None


class CreateAssignmentRequest(BaseModel):
    title: str = Field(..., min_length=2)
    subject: str = Field(..., min_length=2)
    total_marks: int = Field(20, ge=1)
    assignment_date: Optional[str] = None


class ScoreEntryRequest(BaseModel):
    student_id: int
    item_id: int  # quiz_id or assignment_id
    score: float = Field(..., ge=0)


@router.get("/teacher/dashboard")
def get_teacher_dashboard(current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # 1. Total Students
        cur.execute("SELECT COUNT(*) AS total_students FROM students")
        total_students = cur.fetchone()["total_students"]

        # 2. Overall Class Attendance
        cur.execute("""
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_records
            FROM attendance
        """)
        att_stat = cur.fetchone()
        tot_att = att_stat["total_records"] or 0
        pres_att = att_stat["present_records"] or 0
        avg_attendance = round((pres_att / tot_att * 100), 2) if tot_att > 0 else 0.0

        # 3. Overall Quiz & Assignment Averages
        cur.execute("SELECT AVG(score) AS avg_score FROM quiz_results")
        quiz_row = cur.fetchone()
        avg_quiz = round(float(quiz_row["avg_score"]), 2) if quiz_row and quiz_row["avg_score"] is not None else 0.0

        cur.execute("SELECT AVG(score) AS avg_score FROM assignment_results")
        assign_row = cur.fetchone()
        avg_assignment = round(float(assign_row["avg_score"]), 2) if assign_row and assign_row["avg_score"] is not None else 0.0

        # 4. Check for active attendance session
        cur.execute("""
            SELECT session_id, subject, session_date, start_time,
                   created_at, status, expires_at, room_name
            FROM attendance_sessions
            WHERE status = 'active'
            ORDER BY session_id DESC
            LIMIT 1
        """)
        active_session = cur.fetchone()

        # 5. Student List with Predictions and Risk Identification
        cur.execute("""
            SELECT 
                s.student_id,
                s.roll_number,
                s.name,
                s.email,
                s.department,
                s.semester,
                COALESCE(
                    ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2),
                    0.0
                ) AS attendance_pct,
                COALESCE(ROUND(AVG(qr.score), 2), 0.0) AS quiz_avg,
                COALESCE(ROUND(AVG(ar.score), 2), 0.0) AS assign_avg
            FROM students s
            LEFT JOIN attendance a ON s.student_id = a.student_id
            LEFT JOIN quiz_results qr ON s.student_id = qr.student_id
            LEFT JOIN assignment_results ar ON s.student_id = ar.student_id
            GROUP BY s.student_id, s.roll_number, s.name, s.email, s.department, s.semester
            ORDER BY s.student_id
        """)
        students = cur.fetchall()

        understanding_counts = {"Excellent": 0, "Good": 0, "Average": 0, "Poor": 0}
        students_needing_attention = []

        for st in students:
            inp = pd.DataFrame(
                [[st["attendance_pct"], st["quiz_avg"], st["assign_avg"]]],
                columns=["Attendance", "Quiz_Score", "Assignment_Score"]
            )
            level = str(model.predict(inp)[0])
            st["understanding_level"] = level
            understanding_counts[level] = understanding_counts.get(level, 0) + 1

            if level in ["Poor", "Average"] or st["attendance_pct"] < 75.0:
                students_needing_attention.append({
                    "student_id": st["student_id"],
                    "name": st["name"],
                    "roll_number": st["roll_number"],
                    "attendance_pct": st["attendance_pct"],
                    "quiz_avg": st["quiz_avg"],
                    "assign_avg": st["assign_avg"],
                    "understanding_level": level,
                    "reason": "Low Attendance" if st["attendance_pct"] < 75.0 else f"ML Risk: {level}"
                })

        return {
            "teacher": {
                "name": current_user["name"],
                "email": current_user["email"],
                "department": current_user.get("department") or "CSE AIML"
            },
            "metrics": {
                "total_students": total_students,
                "average_attendance": avg_attendance,
                "average_quiz_score": avg_quiz,
                "average_assignment_score": avg_assignment,
                "active_session": active_session is not None
            },
            "active_session": active_session,
            "understanding_distribution": understanding_counts,
            "students_needing_attention": students_needing_attention,
            "recent_students": students[:8]
        }
    finally:
        cur.close()
        conn.close()


@router.get("/teacher/students")
def get_teacher_students(current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                s.student_id,
                s.roll_number,
                s.name,
                s.email,
                s.department,
                s.semester,
                (s.face_encoding IS NOT NULL) AS has_biometrics,
                COALESCE(
                    ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2),
                    0.0
                ) AS attendance_pct,
                COALESCE(ROUND(AVG(qr.score), 2), 0.0) AS quiz_avg,
                COALESCE(ROUND(AVG(ar.score), 2), 0.0) AS assign_avg
            FROM students s
            LEFT JOIN attendance a ON s.student_id = a.student_id
            LEFT JOIN quiz_results qr ON s.student_id = qr.student_id
            LEFT JOIN assignment_results ar ON s.student_id = ar.student_id
            GROUP BY s.student_id, s.roll_number, s.name, s.email, s.department, s.semester, s.face_encoding
            ORDER BY s.student_id
        """)
        students = cur.fetchall()

        for st in students:
            inp = pd.DataFrame(
                [[st["attendance_pct"], st["quiz_avg"], st["assign_avg"]]],
                columns=["Attendance", "Quiz_Score", "Assignment_Score"]
            )
            st["understanding_level"] = str(model.predict(inp)[0])

        return {
            "count": len(students),
            "students": students
        }
    finally:
        cur.close()
        conn.close()


@router.post("/teacher/quizzes")
def create_quiz(payload: CreateQuizRequest, current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            INSERT INTO quizzes (title, subject, total_marks, quiz_date)
            VALUES (%s, %s, %s, COALESCE(%s, CURDATE()))
        """, (payload.title, payload.subject, payload.total_marks, payload.quiz_date))
        conn.commit()
        quiz_id = cur.lastrowid
        return {
            "message": "Quiz created successfully",
            "quiz_id": quiz_id
        }
    finally:
        cur.close()
        conn.close()


@router.post("/teacher/assignments")
def create_assignment(payload: CreateAssignmentRequest, current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            INSERT INTO assignments (title, subject, total_marks, assignment_date)
            VALUES (%s, %s, %s, COALESCE(%s, CURDATE()))
        """, (payload.title, payload.subject, payload.total_marks, payload.assignment_date))
        conn.commit()
        assignment_id = cur.lastrowid
        return {
            "message": "Assignment created successfully",
            "assignment_id": assignment_id
        }
    finally:
        cur.close()
        conn.close()


@router.post("/teacher/quiz-results")
def record_quiz_score(payload: ScoreEntryRequest, current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Check if record exists
        cur.execute("""
            SELECT result_id FROM quiz_results 
            WHERE student_id = %s AND quiz_id = %s
        """, (payload.student_id, payload.item_id))
        existing = cur.fetchone()

        if existing:
            cur.execute("""
                UPDATE quiz_results SET score = %s, submitted_at = CURRENT_TIMESTAMP
                WHERE result_id = %s
            """, (payload.score, existing["result_id"]))
            msg = "Quiz score updated successfully"
        else:
            cur.execute("""
                INSERT INTO quiz_results (student_id, quiz_id, score)
                VALUES (%s, %s, %s)
            """, (payload.student_id, payload.item_id, payload.score))
            msg = "Quiz score recorded successfully"
        
        conn.commit()
        return {"message": msg}
    finally:
        cur.close()
        conn.close()


@router.post("/teacher/assignment-results")
def record_assignment_score(payload: ScoreEntryRequest, current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT result_id FROM assignment_results 
            WHERE student_id = %s AND assignment_id = %s
        """, (payload.student_id, payload.item_id))
        existing = cur.fetchone()

        if existing:
            cur.execute("""
                UPDATE assignment_results SET score = %s, submitted_at = CURRENT_TIMESTAMP
                WHERE result_id = %s
            """, (payload.score, existing["result_id"]))
            msg = "Assignment score updated successfully"
        else:
            cur.execute("""
                INSERT INTO assignment_results (student_id, assignment_id, score)
                VALUES (%s, %s, %s)
            """, (payload.student_id, payload.item_id, payload.score))
            msg = "Assignment score recorded successfully"
        
        conn.commit()
        return {"message": msg}
    finally:
        cur.close()
        conn.close()


@router.get("/teacher/analytics")
def get_teacher_analytics(current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Subject-wise comparison
        cur.execute("""
            SELECT 
                q.subject,
                ROUND(AVG(qr.score), 2) AS avg_quiz_score,
                COUNT(DISTINCT qr.result_id) AS total_quiz_submissions
            FROM quizzes q
            JOIN quiz_results qr ON q.quiz_id = qr.quiz_id
            GROUP BY q.subject
        """)
        quiz_subjects = cur.fetchall()

        cur.execute("""
            SELECT 
                a.subject,
                ROUND(AVG(ar.score), 2) AS avg_assignment_score,
                COUNT(DISTINCT ar.result_id) AS total_assignment_submissions
            FROM assignments a
            JOIN assignment_results ar ON a.assignment_id = ar.assignment_id
            GROUP BY a.subject
        """)
        assignment_subjects = cur.fetchall()

        # Grade bracket distribution
        cur.execute("""
            SELECT 
                CASE 
                    WHEN score >= 18 THEN '90-100% (A+)'
                    WHEN score >= 15 THEN '75-89% (A)'
                    WHEN score >= 12 THEN '60-74% (B)'
                    ELSE '<60% (Needs Help)'
                END AS grade_tier,
                COUNT(*) AS count
            FROM quiz_results
            GROUP BY grade_tier
        """)
        quiz_distribution = cur.fetchall()

        return {
            "quiz_subject_analytics": quiz_subjects,
            "assignment_subject_analytics": assignment_subjects,
            "quiz_grade_distribution": quiz_distribution
        }
    finally:
        cur.close()
        conn.close()
