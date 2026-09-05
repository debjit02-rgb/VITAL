from fastapi import APIRouter
from backend.database.connection import get_connection

router = APIRouter()


# Get all assignments
@router.get("/assignments")
def get_assignments():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            assignment_id,
            title,
            subject,
            total_marks,
            assignment_date,
            created_at
        FROM assignments
        ORDER BY assignment_date DESC
    """)

    assignments = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "count": len(assignments),
        "assignments": assignments
    }