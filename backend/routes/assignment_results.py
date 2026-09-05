from fastapi import APIRouter
from backend.database.connection import get_connection

router = APIRouter()


# Get assignment results for a student
@router.get("/assignment-results/{student_id}")
def get_assignment_results(student_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            ar.result_id,
            ar.student_id,
            s.name,
            ar.assignment_id,
            a.title,
            a.subject,
            a.total_marks,
            ar.score,
            ar.submitted_at
        FROM assignment_results ar
        JOIN students s
            ON ar.student_id = s.student_id
        JOIN assignments a
            ON ar.assignment_id = a.assignment_id
        WHERE ar.student_id = %s
        ORDER BY ar.submitted_at DESC
    """, (student_id,))

    results = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "student_id": student_id,
        "count": len(results),
        "results": results
    }