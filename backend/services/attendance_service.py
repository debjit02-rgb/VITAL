import os
import math
import json
import base64
import time
import secrets
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import cv2
import numpy as np

# Load settings from environment
FACE_SIMILARITY_THRESHOLD = float(os.getenv("FACE_SIMILARITY_THRESHOLD", "0.40"))
BASE_DIR = Path(__file__).resolve().parents[2]
FACE_DATABASE_FILE = BASE_DIR / "face_recognition" / "face_database.json"

# Load FaceEngine
_face_engine = None

def get_face_engine():
    global _face_engine
    if _face_engine is None:
        try:
            from face_engine import FaceEngine
            _face_engine = FaceEngine()
            print("VITAL FaceEngine initialized successfully.")
        except Exception as e:
            print("Warning: FaceEngine could not be loaded directly:", e)
            _face_engine = None
    return _face_engine


def load_face_database() -> Dict[str, List[Any]]:
    """Loads precomputed face database JSON."""
    if FACE_DATABASE_FILE.exists():
        try:
            with open(FACE_DATABASE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading face_database.json:", e)
    return {}


# ============================================================
# 1. HAVERSINE GEOLOCATION VERIFICATION
# ============================================================

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in meters.
    """
    R = 6371000.0  # Earth's radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return distance


def verify_location(
    student_lat: float,
    student_lon: float,
    target_lat: float,
    target_lon: float,
    allowed_radius_meters: float
) -> Tuple[bool, float, str]:
    """
    Verifies if student coordinates fall inside the allowed geofence.
    """
    distance = calculate_haversine_distance(student_lat, student_lon, target_lat, target_lon)
    is_inside = distance <= allowed_radius_meters
    
    if is_inside:
        return True, round(distance, 2), f"Location verified within {round(distance, 1)}m of classroom (limit: {allowed_radius_meters}m)"
    else:
        return False, round(distance, 2), f"Outside authorized zone: {round(distance, 1)}m away (limit: {allowed_radius_meters}m)"


# ============================================================
# 2. IMAGE DECODING & FACE VERIFICATION PIPELINE
# ============================================================

def decode_base64_image(image_base64: str) -> Optional[np.ndarray]:
    """Decodes base64 image data to OpenCV BGR numpy array."""
    try:
        if "," in image_base64:
            _, encoded = image_base64.split(",", 1)
        else:
            encoded = image_base64
            
        image_bytes = base64.b64decode(encoded)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print("Base64 decode error:", e)
        return None


def verify_student_face(
    image_base64: str,
    student_name: str,
    stored_embedding_blob: Optional[bytes] = None
) -> Tuple[bool, Optional[float], str]:
    """
    Verifies student face against stored embeddings using FaceEngine.
    Returns: (is_verified, similarity_score, message)
    """
    img = decode_base64_image(image_base64)
    if img is None:
        return False, None, "Invalid image data received from camera."

    engine = get_face_engine()
    if not engine:
        return False, None, "Face verification engine is currently unavailable."

    try:
        # Detect faces
        try:
            boxes, extra = engine.find_faces(img, limit=5)
        except Exception as det_err:
            if type(det_err).__name__ == "FaceNotFoundError":
                return False, None, "No face detected in camera frame. Please position your face clearly in good lighting."
            raise det_err

        face_count = len(boxes) if boxes is not None else 0

        if face_count == 0:
            return False, None, "No face detected in camera frame. Please position your face clearly in good lighting."
        
        # Compute live embedding
        live_result = engine.compute_embeddings(img, boxes, **extra)
        live_arr = np.asarray(live_result, dtype=np.float32)
        live_embedding = live_arr[0] if live_arr.ndim > 1 else live_arr

        # Load enrolled database
        face_db = load_face_database()
        if not face_db:
            return False, None, "Face biometric database is empty or not loaded."

        best_student = "Unknown"
        best_score = -1.0
        target_score = -1.0


        for name, embs in face_db.items():
            for stored_emb in embs:
                try:
                    score = float(engine.compare(live_embedding, stored_emb))
                    if score > best_score:
                        best_score = score
                        best_student = name
                    if (name.lower() == student_name.lower() or name.lower() in student_name.lower()) and score > target_score:
                        target_score = score
                except Exception:
                    continue

        target_score = round(max(target_score, 0.0), 4)
        best_score = round(best_score, 4)

        # Match condition: highest similarity belongs to target student and exceeds recognition threshold
        is_match = (
            (best_student.lower() == student_name.lower() or student_name.lower() in best_student.lower())
            and target_score >= FACE_SIMILARITY_THRESHOLD
        )

        if is_match:
            return True, target_score, f"Face verified successfully as {student_name} (Biometric Match: {round(target_score * 100, 1)}%)"
        else:
            if best_student != "Unknown" and best_score >= FACE_SIMILARITY_THRESHOLD and best_student.lower() != student_name.lower():
                return False, target_score, f"Biometric mismatch: Detected face matches '{best_student}' ({round(best_score * 100, 1)}%), not authenticated student '{student_name}'."
            return False, target_score, f"Face could not be verified for '{student_name}'. Similarity ({round(target_score * 100, 1)}%) is below the {round(FACE_SIMILARITY_THRESHOLD * 100, 1)}% threshold."



    except Exception as e:
        print("Face verification exception:", e)
        return False, None, f"Biometric verification error: {str(e)}"
