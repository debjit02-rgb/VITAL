import mysql.connector


def get_connection():
    return mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="Debjit*06ytho",
        database="vital"
    )


def get_student_by_name(name):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                student_id,
                roll_number,
                name,
                department,
                semester
            FROM students
            WHERE name = %s
            LIMIT 1
            """,
            (name,)
        )

        return cursor.fetchone()

    except mysql.connector.Error as error:
        print("MySQL error:", error)
        return None

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":

    print("=" * 60)
    print("VITAL DATABASE STUDENT TEST")
    print("=" * 60)

    student = get_student_by_name("Debjit")

    if student:
        print("Student found!")
        print()
        print("Student ID :", student["student_id"])
        print("Roll Number:", student["roll_number"])
        print("Name       :", student["name"])
        print("Department :", student["department"])
        print("Semester   :", student["semester"])
    else:
        print("Student not found.")

    print("=" * 60)