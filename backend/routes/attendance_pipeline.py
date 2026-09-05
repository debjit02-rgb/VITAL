import os
import time
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from backend.database.connection import get_connection
from backend.services.auth_service import require_teacher, require_student, get_current_user
from backend.services.attendance_service import (
    verify_location,
    verify_student_face,
    FACE_SIMILARITY_THRESHOLD
)

router = APIRouter(tags=["Attendance Pipeline"])

# Default Campus Coordinates (Adamas University / AIML Lab)
DEFAULT_CAMPUS_LAT = float(os.getenv("DEFAULT_CAMPUS_LAT", "22.5726"))
DEFAULT_CAMPUS_LON = float(os.getenv("DEFAULT_CAMPUS_LON", "88.3639"))
DEFAULT_RADIUS = float(os.getenv("DEFAULT_ALLOWED_RADIUS_METERS", "100.0"))


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class StartSessionRequest(BaseModel):
    subject: str = Field(..., min_length=2)
    class_id: Optional[str] = "CSE-AIML-SEM3"
    room_name: Optional[str] = "Main AIML Lab 402"
    duration_seconds: int = Field(300, ge=30, le=3600)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    allowed_radius_meters: Optional[float] = None


class VerifyLocationRequest(BaseModel):
    session_id: int
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


class VerifyQRRequest(BaseModel):
    session_token: str


class CompleteAttendanceRequest(BaseModel):
    session_token: str
    latitude: float
    longitude: float
    image_base64: str


# ============================================================
# TEACHER SESSION CONTROLLER
# ============================================================

@router.post("/attendance/session/start")
def start_attendance_session(
    payload: StartSessionRequest,
    current_user: Dict[str, Any] = Depends(require_teacher)
):
    teacher_id = current_user["teacher_id"]
    token = secrets.token_urlsafe(24)
    duration = payload.duration_seconds
    lat = payload.latitude if payload.latitude is not None else DEFAULT_CAMPUS_LAT
    lon = payload.longitude if payload.longitude is not None else DEFAULT_CAMPUS_LON
    radius = payload.allowed_radius_meters if payload.allowed_radius_meters is not None else DEFAULT_RADIUS

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Expire any previous active sessions for this teacher/subject
        cur.execute("""
            UPDATE attendance_sessions 
            SET status = 'ended' 
            WHERE status = 'active'
        """)

        # Insert new session with expiration
        cur.execute("""
            INSERT INTO attendance_sessions (
                teacher_id,
                subject,
                class_id,
                room_name,
                session_token,
                latitude,
                longitude,
                allowed_radius_meters,
                duration_seconds,
                session_date,
                start_time,
                expires_at,
                status
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                CURDATE(),
                CURTIME(),
                DATE_ADD(CURRENT_TIMESTAMP, INTERVAL %s SECOND),
                'active'
            )
        """, (
            teacher_id,
            payload.subject,
            payload.class_id,
            payload.room_name,
            token,
            lat,
            lon,
            radius,
            duration,
            duration
        ))
        conn.commit()
        session_id = cur.lastrowid

        cur.execute("SELECT * FROM attendance_sessions WHERE session_id = %s", (session_id,))
        session = cur.fetchone()

        # Format QR code payload
        qr_payload = {
            "vital_session_id": session_id,
            "token": token,
            "subject": payload.subject,
            "room": payload.room_name,
            "expires_in": duration
        }

        return {
            "message": "Attendance session started successfully",
            "session": session,
            "qr_payload": json_payload if (json_payload := qr_payload) else qr_payload,
            "session_token": token
        }
    finally:
        cur.close()
        conn.close()


@router.post("/attendance/session/end")
def end_attendance_session(current_user: Dict[str, Any] = Depends(require_teacher)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            UPDATE attendance_sessions 
            SET status = 'ended' 
            WHERE status = 'active'
        """)
        conn.commit()
        return {"message": "Active attendance session ended."}
    finally:
        cur.close()
        conn.close()


@router.get("/attendance/session/active")
def get_active_session(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                session_id,
                teacher_id,
                subject,
                class_id,
                room_name,
                session_token,
                latitude,
                longitude,
                allowed_radius_meters,
                duration_seconds,
                session_date,
                start_time,
                expires_at,
                status,
                TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, expires_at) AS seconds_remaining
            FROM attendance_sessions
            WHERE status = 'active'
            ORDER BY session_id DESC
            LIMIT 1
        """)
        session = cur.fetchone()

        if not session:
            return {"active": False, "session": None}

        # Check if session has expired
        if session["seconds_remaining"] is not None and session["seconds_remaining"] <= 0:
            cur.execute("UPDATE attendance_sessions SET status = 'expired' WHERE session_id = %s", (session["session_id"],))
            conn.commit()
            return {"active": False, "session": None}

        # Get list of verified students for this session
        cur.execute("""
            SELECT 
                a.attendance_id,
                a.student_id,
                s.name,
                s.roll_number,
                a.status,
                a.similarity_score,
                a.distance_meters,
                a.marked_at
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.session_id = %s
            ORDER BY a.marked_at DESC
        """, (session["session_id"],))
        attendees = cur.fetchall()

        # Count total students in class
        cur.execute("SELECT COUNT(*) AS total FROM students")
        total_class_students = cur.fetchone()["total"]

        return {
            "active": True,
            "session": session,
            "attendees_count": len(attendees),
            "total_class_students": total_class_students,
            "attendees": attendees
        }
    finally:
        cur.close()
        conn.close()


# ============================================================
# STUDENT ATTENDANCE VERIFICATION PIPELINE
# ============================================================

@router.post("/attendance/verify-location")
def api_verify_location(
    payload: VerifyLocationRequest,
    current_user: Dict[str, Any] = Depends(require_student)
):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT session_id, latitude, longitude, allowed_radius_meters, status,
                   TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, expires_at) AS seconds_remaining
            FROM attendance_sessions
            WHERE session_id = %s
        """, (payload.session_id,))
        session = cur.fetchone()

        if not session or session["status"] != "active":
            raise HTTPException(status_code=400, detail="Attendance session is no longer active")

        if session["seconds_remaining"] is not None and session["seconds_remaining"] <= 0:
            raise HTTPException(status_code=400, detail="Attendance session has expired")

        target_lat = float(session["latitude"]) if session["latitude"] else DEFAULT_CAMPUS_LAT
        target_lon = float(session["longitude"]) if session["longitude"] else DEFAULT_CAMPUS_LON
        radius = float(session["allowed_radius_meters"]) if session["allowed_radius_meters"] else DEFAULT_RADIUS

        is_valid, distance, msg = verify_location(
            payload.latitude,
            payload.longitude,
            target_lat,
            target_lon,
            radius
        )

        return {
            "verified": is_valid,
            "distance_meters": distance,
            "allowed_radius_meters": radius,
            "message": msg
        }
    finally:
        cur.close()
        conn.close()


@router.post("/attendance/verify-qr")
def api_verify_qr(
    payload: VerifyQRRequest,
    current_user: Dict[str, Any] = Depends(require_student)
):
    student_id = current_user["student_id"]
    token = payload.session_token.strip()

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                session_id,
                subject,
                class_id,
                room_name,
                latitude,
                longitude,
                allowed_radius_meters,
                status,
                TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, expires_at) AS seconds_remaining
            FROM attendance_sessions
            WHERE session_token = %s
        """, (token,))
        session = cur.fetchone()

        if not session:
            raise HTTPException(status_code=404, detail="Invalid QR Code: Session not found.")

        if session["status"] != "active" or (session["seconds_remaining"] is not None and session["seconds_remaining"] <= 0):
            raise HTTPException(status_code=400, detail="Attendance session has expired or ended.")

        # Check for duplicate attendance
        cur.execute("""
            SELECT attendance_id, marked_at FROM attendance
            WHERE student_id = %s AND session_id = %s
        """, (student_id, session["session_id"]))
        existing = cur.fetchone()

        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Attendance already marked for this session at {existing['marked_at']}."
            )

        return {
            "valid": True,
            "session_id": session["session_id"],
            "subject": session["subject"],
            "room_name": session["room_name"],
            "latitude": float(session["latitude"]),
            "longitude": float(session["longitude"]),
            "allowed_radius_meters": float(session["allowed_radius_meters"]),
            "message": "QR Session valid and ready for biometric verification."
        }
    finally:
        cur.close()
        conn.close()


@router.post("/attendance/complete")
def api_complete_multi_factor_attendance(
    payload: CompleteAttendanceRequest,
    current_user: Dict[str, Any] = Depends(require_student)
):
    """
    Final Atomic Attendance Verification Pipeline:
    1. Authenticated Student
    2. Session Token & Expiration Validation
    3. GPS Geofence Check
    4. Biometric Face Match (FaceEngine ONNX)
    5. Single-use Duplicate Prevention
    6. Record Attendance
    """
    student_id = current_user["student_id"]
    student_name = current_user["name"]
    token = payload.session_token.strip()

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # 1. Fetch & Validate Session
        cur.execute("""
            SELECT 
                session_id,
                subject,
                room_name,
                latitude,
                longitude,
                allowed_radius_meters,
                status,
                TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, expires_at) AS seconds_remaining
            FROM attendance_sessions
            WHERE session_token = %s
        """, (token,))
        session = cur.fetchone()

        if not session:
            raise HTTPException(status_code=404, detail="Invalid session token.")

        if session["status"] != "active":
            raise HTTPException(status_code=400, detail="Attendance session is no longer active.")

        if session["seconds_remaining"] is not None and session["seconds_remaining"] <= 0:
            cur.execute("UPDATE attendance_sessions SET status='expired' WHERE session_id=%s", (session["session_id"],))
            conn.commit()
            raise HTTPException(status_code=400, detail="Attendance session has expired.")

        session_id = session["session_id"]

        # 2. Check for Duplicate Attendance
        cur.execute("""
            SELECT attendance_id FROM attendance
            WHERE student_id = %s AND session_id = %s
        """, (student_id, session_id))
        if cur.fetchone():
            raise HTTPException(
                status_code=409,
                detail="Attendance has already been recorded for this student in this session."
            )

        # 3. Location Verification (GPS Geofence)
        target_lat = float(session["latitude"]) if session["latitude"] else DEFAULT_CAMPUS_LAT
        target_lon = float(session["longitude"]) if session["longitude"] else DEFAULT_CAMPUS_LON
        radius = float(session["allowed_radius_meters"]) if session["allowed_radius_meters"] else DEFAULT_RADIUS

        is_loc_valid, distance, loc_msg = verify_location(
            payload.latitude,
            payload.longitude,
            target_lat,
            target_lon,
            radius
        )

        if not is_loc_valid:
            raise HTTPException(
                status_code=403,
                detail=f"Location verification failed: {loc_msg}"
            )

        # 4. Face Verification Pipeline
        cur.execute("SELECT face_encoding FROM students WHERE student_id = %s", (student_id,))
        st_row = cur.fetchone()
        face_blob = st_row["face_encoding"] if st_row else None

        is_face_valid, similarity_score, face_msg = verify_student_face(
            payload.image_base64,
            student_name,
            face_blob
        )

        if not is_face_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Face verification failed: {face_msg}"
            )

        # 5. Atomic Insertion into Attendance Table
        cur.execute("""
            INSERT INTO attendance (
                student_id,
                session_id,
                status,
                location_verified,
                qr_verified,
                face_verified,
                similarity_score,
                distance_meters,
                verification_method,
                marked_at
            ) VALUES (
                %s, %s, 'Present', TRUE, TRUE, TRUE, %s, %s, 'multi-factor', CURRENT_TIMESTAMP
            )
        """, (
            student_id,
            session_id,
            similarity_score,
            distance
        ))
        conn.commit()
        attendance_id = cur.lastrowid

        return {
            "status": "success",
            "message": "✓ Attendance verified and marked successfully!",
            "attendance_id": attendance_id,
            "student": {
                "name": student_name,
                "roll_number": current_user.get("roll_number")
            },
            "session": {
                "subject": session["subject"],
                "room": session["room_name"]
            },
            "verification": {
                "location_verified": True,
                "distance_meters": distance,
                "qr_verified": True,
                "face_verified": True,
                "similarity_score": similarity_score,
                "confidence_percentage": round(similarity_score * 100, 1) if similarity_score else 100.0
            }
        }
    finally:
        cur.close()
        conn.close()
