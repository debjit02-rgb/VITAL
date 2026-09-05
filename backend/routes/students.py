from fastapi import APIRouter
from backend.database.connection import get_connection

router = APIRouter()


@router.get("/students")
def get_students():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            student_id,
            roll_number,
            name,
            email,
            department,
            semester
        FROM students
        ORDER BY student_id
    """)

    students = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "count": len(students),
        "students": students
    }