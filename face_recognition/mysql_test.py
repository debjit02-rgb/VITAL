import mysql.connector

print("Connecting to MySQL...")

try:
    connection = mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="Debjit*06",
        database="vital"
    )

    if connection.is_connected():
        print("✅ MYSQL CONNECTION SUCCESSFUL")
        print("Database: vital")

except mysql.connector.Error as error:
    print("❌ MYSQL CONNECTION FAILED")
    print("Error:", error)

finally:
    try:
        if connection.is_connected():
            connection.close()
            print("MySQL connection closed.")
    except:
        pass