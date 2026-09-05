import os
from backend.database.connection import get_connection

def run_pipeline_migration():
    conn = get_connection()
    cur = conn.cursor()
    print("Running VITAL Attendance Verification Pipeline Migration...")

    # Helper to safely add column
    def add_column_if_missing(table, col_name, col_def):
        cur.execute(f"SHOW COLUMNS FROM `{table}` LIKE '{col_name}'")
        if not cur.fetchone():
            cur.execute(f"ALTER TABLE `{table}` ADD COLUMN {col_name} {col_def}")
            print(f"Added column `{col_name}` to `{table}`")

    # 1. Update attendance_sessions
    add_column_if_missing("attendance_sessions", "teacher_id", "INT NULL")
    add_column_if_missing("attendance_sessions", "class_id", "VARCHAR(50) DEFAULT 'CSE-AIML-SEM3'")
    add_column_if_missing("attendance_sessions", "room_name", "VARCHAR(100) DEFAULT 'Main AIML Lab 402'")
    add_column_if_missing("attendance_sessions", "session_token", "VARCHAR(64) NULL")
    add_column_if_missing("attendance_sessions", "latitude", "DECIMAL(10, 8) DEFAULT 22.572645")
    add_column_if_missing("attendance_sessions", "longitude", "DECIMAL(11, 8) DEFAULT 88.363892")
    add_column_if_missing("attendance_sessions", "allowed_radius_meters", "DECIMAL(6, 2) DEFAULT 100.0")
    add_column_if_missing("attendance_sessions", "duration_seconds", "INT DEFAULT 300")
    add_column_if_missing("attendance_sessions", "expires_at", "TIMESTAMP NULL")
    add_column_if_missing("attendance_sessions", "status", "ENUM('active', 'ended', 'expired') DEFAULT 'active'")

    # 2. Update attendance table
    add_column_if_missing("attendance", "location_verified", "BOOLEAN DEFAULT TRUE")
    add_column_if_missing("attendance", "qr_verified", "BOOLEAN DEFAULT TRUE")
    add_column_if_missing("attendance", "face_verified", "BOOLEAN DEFAULT TRUE")
    add_column_if_missing("attendance", "similarity_score", "DECIMAL(5, 4) NULL")
    add_column_if_missing("attendance", "distance_meters", "DECIMAL(7, 2) NULL")
    add_column_if_missing("attendance", "verification_method", "VARCHAR(50) DEFAULT 'multi-factor'")

    conn.commit()
    cur.close()
    conn.close()
    print("Attendance verification pipeline schema updated successfully!")


if __name__ == "__main__":
    run_pipeline_migration()
