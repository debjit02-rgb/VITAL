from fastapi import APIRouter
from backend.database.connection import get_connection

router = APIRouter()


@router.get("/attendance")
def get_attendance():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            a.attendance_id,
            s.student_id,
            s.roll_number,
            s.name,
            a.session_id,
            a.status,
            a.marked_at
        FROM attendance a
        JOIN students s
            ON a.student_id = s.student_id
        ORDER BY a.marked_at DESC
    """)

    attendance = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "count": len(attendance),
        "attendance": attendance
    }