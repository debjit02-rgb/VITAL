import os
import hashlib
import secrets
from pathlib import Path
from backend.database.connection import get_connection

# ============================================================
# PASSWORD HASHING UTILITY (PBKDF2-HMAC-SHA256)
# ============================================================
def hash_password(password: str) -> str:
    """Generate a salted PBKDF2-HMAC-SHA256 hash."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored PBKDF2-HMAC-SHA256 hash."""
    try:
        parts = stored_hash.split('$')
        if len(parts) != 3:
            return False
        algorithm_info, salt, expected_hex = parts
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False


def run_migration():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    
    print("Running VITAL Auth & Role Migration...")

    # 1. Create teachers table if not exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS teachers (
            teacher_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            department VARCHAR(100) DEFAULT 'CSE AIML',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)

    # 2. Create users table if not exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('student', 'teacher') NOT NULL,
            student_id INT NULL,
            teacher_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL,
            FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)

    # 3. Seed Teachers
    teachers_data = [
        {"name": "Prof. Rajesh Sharma", "email": "prof.sharma@vital.edu", "department": "CSE AIML"},
        {"name": "Dr. Priya Banerjee", "email": "dr.banerjee@vital.edu", "department": "Data Science & AI"}
    ]

    for t in teachers_data:
        cur.execute("SELECT teacher_id FROM teachers WHERE email = %s", (t["email"],))
        existing = cur.fetchone()
        if not existing:
            cur.execute("""
                INSERT INTO teachers (name, email, department)
                VALUES (%s, %s, %s)
            """, (t["name"], t["email"], t["department"]))
            teacher_id = cur.lastrowid
            print(f"Created teacher: {t['name']} (ID: {teacher_id})")
        else:
            teacher_id = existing["teacher_id"]

        # Ensure teacher has a user account
        cur.execute("SELECT user_id FROM users WHERE email = %s", (t["email"],))
        if not cur.fetchone():
            pwd_hash = hash_password("teacher123")
            cur.execute("""
                INSERT INTO users (email, name, password_hash, role, teacher_id)
                VALUES (%s, %s, %s, 'teacher', %s)
            """, (t["email"], t["name"], pwd_hash, teacher_id))
            print(f"Created teacher user account for: {t['email']}")

    # 4. Seed Student User Accounts
    cur.execute("SELECT student_id, name, email FROM students")
    students = cur.fetchall()

    for s in students:
        if not s["email"]:
            continue
        cur.execute("SELECT user_id FROM users WHERE email = %s", (s["email"],))
        if not cur.fetchone():
            pwd_hash = hash_password("student123")
            cur.execute("""
                INSERT INTO users (email, name, password_hash, role, student_id)
                VALUES (%s, %s, %s, 'student', %s)
            """, (s["email"], s["name"], pwd_hash, s["student_id"]))
            print(f"Created student user account for: {s['name']} ({s['email']})")

    conn.commit()
    cur.close()
    conn.close()
    print("Migration completed successfully!")


if __name__ == "__main__":
    run_migration()
