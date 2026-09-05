# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from backend.database.connection import get_connection
from backend.services.auth_service import (
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None  # optional hint, verified against DB


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    password = payload.password

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                u.user_id,
                u.email,
                u.name,
                u.password_hash,
                u.role,
                u.student_id,
                u.teacher_id,
                s.roll_number,
                s.department AS student_department,
                s.semester,
                t.department AS teacher_department
            FROM users u
            LEFT JOIN students s ON u.student_id = s.student_id
            LEFT JOIN teachers t ON u.teacher_id = t.teacher_id
            WHERE LOWER(u.email) = %s
        """, (email,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if payload.role and payload.role != user["role"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This account is registered as a {user['role']}, not a {payload.role}."
            )

        # Build clean user profile
        user_data = {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "student_id": user["student_id"],
            "teacher_id": user["teacher_id"],
            "roll_number": user["roll_number"],
            "department": user["student_department"] or user["teacher_department"] or "CSE AIML",
            "semester": user["semester"]
        }

        # Issue JWT token
        token_payload = {
            "sub": str(user["user_id"]),
            "role": user["role"],
            "name": user["name"],
            "student_id": user["student_id"],
            "teacher_id": user["teacher_id"]
        }
        token = create_access_token(token_payload)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_data
        }
    finally:
        cur.close()
        conn.close()


@router.get("/auth/me")
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "user": current_user
    }


@router.post("/auth/logout")
def logout():
    return {
        "message": "Logged out successfully"
    }
