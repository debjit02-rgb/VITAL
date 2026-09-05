from fastapi import APIRouter
from backend.database.connection import get_connection

router = APIRouter()


@router.get("/performance/{student_id}")
def get_student_performance(student_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get student information
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
        cursor.close()
        connection.close()

        return {
            "error": "Student not found"
        }

    # Get attendance
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
        attendance_percentage = 0


    # Get quiz average
    cursor.execute("""
        SELECT AVG(score) AS quiz_average
        FROM quiz_results
        WHERE student_id = %s
    """, (student_id,))

    quiz_data = cursor.fetchone()

    quiz_average = quiz_data["quiz_average"]

    if quiz_average is None:
        quiz_average = 0
    else:
        quiz_average = round(float(quiz_average), 2)


    # Get assignment average
    cursor.execute("""
        SELECT AVG(score) AS assignment_average
        FROM assignment_results
        WHERE student_id = %s
    """, (student_id,))

    assignment_data = cursor.fetchone()

    assignment_average = assignment_data["assignment_average"]

    if assignment_average is None:
        assignment_average = 0
    else:
        assignment_average = round(float(assignment_average), 2)


    cursor.close()
    connection.close()


    return {
        "student": student,
        "performance": {
            "attendance_percentage": attendance_percentage,
            "quiz_average": quiz_average,
            "assignment_average": assignment_average
        }
    }