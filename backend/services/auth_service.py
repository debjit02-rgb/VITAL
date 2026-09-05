import os
import time
import json
import base64
import hmac
import hashlib
import secrets
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.database.connection import get_connection

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vital_super_secret_jwt_key_academic_system_2026_secure")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_SECONDS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) * 60

security = HTTPBearer(auto_error=False)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        parts = stored_hash.split('$')
        if len(parts) != 3:
            return False
        _, salt, expected_hex = parts
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False


# ============================================================
# JWT TOKEN ENCODING / DECODING
# ============================================================

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _base64url_decode(s: str) -> bytes:
    padding = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + padding).encode('utf-8'))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    to_encode = data.copy()
    now = int(time.time())
    expire = now + (expires_delta if expires_delta else ACCESS_TOKEN_EXPIRE_SECONDS)
    to_encode.update({
        "iat": now,
        "exp": expire,
        "iss": "vital-platform"
    })
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_bytes = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')
    
    encoded_header = _base64url_encode(header_bytes)
    encoded_payload = _base64url_encode(payload_bytes)
    
    signature_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(JWT_SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
    encoded_signature = _base64url_encode(signature)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        encoded_header, encoded_payload, encoded_signature = parts
        
        signature_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
        actual_sig = _base64url_decode(encoded_signature)
        
        if not secrets.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_bytes = _base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if payload.get("exp") and int(payload["exp"]) < int(time.time()):
            return None
            
        return payload
    except Exception:
        return None


# ============================================================
# FASTAPI AUTH DEPENDENCIES
# ============================================================

def get_current_user(auth: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(auth.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload["sub"]
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                u.user_id,
                u.email,
                u.name,
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
            WHERE u.user_id = %s
        """, (user_id,))
        user = cur.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists"
            )
        return user
    finally:
        cur.close()
        conn.close()


def require_role(allowed_role: str):
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user["role"] != allowed_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires '{allowed_role}' role."
            )
        return current_user
    return role_checker


def require_student(current_user: Dict[str, Any] = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user.get("student_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to enrolled students"
        )
    return current_user


def require_teacher(current_user: Dict[str, Any] = Depends(get_current_user)):
    if current_user["role"] != "teacher" or not current_user.get("teacher_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to faculty members"
        )
    return current_user
