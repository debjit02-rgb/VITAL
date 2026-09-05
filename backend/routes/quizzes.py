from fastapi import APIRouter
from backend.database.connection import get_connection

router = APIRouter()


@router.get("/quizzes")
def get_quizzes():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            quiz_id,
            title,
            subject,
            total_marks,
            quiz_date,
            created_at
        FROM quizzes
        ORDER BY quiz_date DESC
    """)

    quizzes = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "count": len(quizzes),
        "quizzes": quizzes
    }


@router.get("/quiz-results/{student_id}")
def get_quiz_results(student_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            qr.result_id,
            qr.student_id,
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
        ORDER BY qr.submitted_at DESC
    """, (student_id,))

    results = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "student_id": student_id,
        "count": len(results),
        "results": results
    }