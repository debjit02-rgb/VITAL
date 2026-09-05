import json
import time
from pathlib import Path

import cv2
import numpy as np

from face_engine import FaceEngine
from face_engine.exceptions import FaceNotFoundError

# MySQL functions from your database.py
from database import get_connection, get_student_by_name


# ============================================================
# VITAL FACE RECOGNITION + ATTENDANCE SYSTEM
# ============================================================

print("=" * 70)
print("VITAL FACE RECOGNITION + ATTENDANCE")
print("=" * 70)


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
FACE_DATABASE_FILE = BASE_DIR / "face_database.json"


# ============================================================
# 2. SETTINGS
# ============================================================

# Minimum similarity required for recognition
RECOGNITION_THRESHOLD = 0.40

# How often the same person can be processed for attendance
# This prevents MySQL from being hit on every camera frame.
ATTENDANCE_COOLDOWN = 10


# ============================================================
# 3. LOAD FACE DATABASE
# ============================================================

if not FACE_DATABASE_FILE.exists():

    print("ERROR: Face database not found.")
    print(f"Expected location: {FACE_DATABASE_FILE}")

    raise SystemExit


try:

    with open(FACE_DATABASE_FILE, "r") as file:

        face_database = json.load(file)

    print("VITAL face database loaded.")
    print(f"Students enrolled: {len(face_database)}")


except Exception as error:

    print("ERROR: Could not load face database.")
    print("ERROR TYPE:", type(error).__name__)
    print("ERROR DETAILS:", repr(error))

    raise SystemExit


# ============================================================
# 4. DISPLAY KNOWN STUDENTS
# ============================================================

print()
print("=" * 70)
print("KNOWN FACES")
print("=" * 70)

for student_name, embeddings in face_database.items():

    print(
        f"{student_name}: "
        f"{len(embeddings)} embeddings"
    )

print("=" * 70)


# ============================================================
# 5. INITIALIZE FACE ENGINE
# ============================================================

try:

    engine = FaceEngine()

    print("Face engine initialized.")

except Exception as error:

    print("ERROR: Could not initialize FaceEngine.")
    print("ERROR TYPE:", type(error).__name__)
    print("ERROR DETAILS:", repr(error))

    raise SystemExit


# ============================================================
# 6. CONVERT EMBEDDINGS TO NUMPY
# ============================================================

known_embeddings = {}


for student_name, embeddings in face_database.items():

    converted_embeddings = []


    for embedding in embeddings:

        try:

            vector = np.asarray(
                embedding,
                dtype=np.float32
            ).reshape(-1)

            converted_embeddings.append(vector)

        except Exception as error:

            print(
                f"Warning: Could not load embedding "
                f"for {student_name}: {repr(error)}"
            )


    if converted_embeddings:

        known_embeddings[student_name] = converted_embeddings


if not known_embeddings:

    print("ERROR: No usable embeddings found.")

    raise SystemExit


# ============================================================
# 7. RECOGNIZE FACE
# ============================================================

def recognize_face(face_embedding):

    """
    Compare current face embedding with stored embeddings.

    Returns:
        student_name
        similarity_score
    """

    best_name = "Unknown"
    best_score = -1.0


    current_embedding = np.asarray(
        face_embedding,
        dtype=np.float32
    ).reshape(-1)


    for student_name, embeddings in known_embeddings.items():

        for stored_embedding in embeddings:

            try:

                score = float(
                    engine.compare(
                        current_embedding,
                        stored_embedding
                    )
                )


                if score > best_score:

                    best_score = score
                    best_name = student_name


            except Exception:

                continue


    if best_score >= RECOGNITION_THRESHOLD:

        return best_name, best_score


    return "Unknown", best_score


# ============================================================
# 8. GET / CREATE TODAY'S ATTENDANCE SESSION
# ============================================================

def get_or_create_session():

    """
    Gets today's latest attendance session.

    If today's session does not exist, creates one.

    Returns:
        session_id
    """

    connection = None
    cursor = None


    try:

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)


        # ----------------------------------------------------
        # Check whether today's session already exists
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT session_id
            FROM attendance_sessions
            WHERE session_date = CURDATE()
            ORDER BY session_id DESC
            LIMIT 1
            """
        )


        session = cursor.fetchone()


        if session:

            session_id = session["session_id"]

            print(
                f"Using existing attendance session: "
                f"{session_id}"
            )

            return session_id


        # ----------------------------------------------------
        # No session today
        # Create one
        # ----------------------------------------------------

        print("No attendance session found for today.")
        print("Creating today's VITAL face recognition session...")


        cursor.execute(
            """
            INSERT INTO attendance_sessions
            (
                subject,
                session_date,
                start_time
            )
            VALUES
            (
                %s,
                CURDATE(),
                CURTIME()
            )
            """,
            ("Face Recognition",)
        )


        connection.commit()


        session_id = cursor.lastrowid


        print(
            f"New attendance session created: "
            f"{session_id}"
        )


        return session_id


    except Exception as error:

        print()
        print("=" * 70)
        print("MYSQL SESSION ERROR")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR DETAILS:", repr(error))
        print("=" * 70)


        return None


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()


# ============================================================
# 9. MARK ATTENDANCE
# ============================================================

def mark_attendance(student_name, session_id):

    """
    Find the student in MySQL and mark attendance.

    Returns:
        True  -> attendance successfully marked/already marked
        False -> failed
    """

    connection = None
    cursor = None


    try:

        # ----------------------------------------------------
        # Find student in MySQL
        # ----------------------------------------------------

        student = get_student_by_name(student_name)


        if not student:

            print(
                f"Student '{student_name}' "
                f"was not found in MySQL."
            )

            return False


        student_id = student["student_id"]


        print()
        print("=" * 70)
        print("STUDENT FOUND IN MYSQL")
        print("=" * 70)

        print(
            f"Student ID : {student_id}"
        )

        print(
            f"Name       : {student.get('name', student_name)}"
        )

        print(
            f"Roll Number: {student.get('roll_number', 'N/A')}"
        )

        print(
            f"Department : {student.get('department', 'N/A')}"
        )

        print(
            f"Semester   : {student.get('semester', 'N/A')}"
        )

        print("=" * 70)


        # ----------------------------------------------------
        # Connect to MySQL
        # ----------------------------------------------------

        connection = get_connection()

        cursor = connection.cursor(dictionary=True)


        # ----------------------------------------------------
        # Check duplicate attendance
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT attendance_id, status, marked_at
            FROM attendance
            WHERE student_id = %s
              AND session_id = %s
            LIMIT 1
            """,
            (
                student_id,
                session_id
            )
        )


        existing = cursor.fetchone()


        if existing:

            print(
                f"Attendance already marked."
            )

            print(
                f"Attendance ID: "
                f"{existing['attendance_id']}"
            )

            print(
                f"Status: "
                f"{existing['status']}"
            )

            return True


        # ----------------------------------------------------
        # Insert attendance
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO attendance
            (
                student_id,
                session_id,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            """,
            (
                student_id,
                session_id,
                "Present"
            )
        )


        connection.commit()


        attendance_id = cursor.lastrowid


        print()
        print("=" * 70)
        print("ATTENDANCE MARKED SUCCESSFULLY")
        print("=" * 70)

        print(
            f"Student     : {student_name}"
        )

        print(
            f"Student ID  : {student_id}"
        )

        print(
            f"Session ID  : {session_id}"
        )

        print(
            f"Attendance ID: {attendance_id}"
        )

        print(
            "Status      : Present"
        )

        print("=" * 70)


        return True


    except Exception as error:

        print()
        print("=" * 70)
        print("MYSQL ATTENDANCE ERROR")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR DETAILS:", repr(error))
        print("=" * 70)

        return False


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()


# ============================================================
# 10. CREATE TODAY'S SESSION
# ============================================================

print()
print("=" * 70)
print("DATABASE INITIALIZATION")
print("=" * 70)


session_id = get_or_create_session()


if session_id is None:

    print(
        "WARNING: Could not create/get attendance session."
    )

    print(
        "Face recognition will continue, "
        "but attendance cannot be saved."
    )

else:

    print(
        f"Active attendance session: {session_id}"
    )


# ============================================================
# 11. ATTENDANCE COOLDOWN TRACKING
# ============================================================

last_attendance_time = {}


# ============================================================
# 12. START CAMERA
# ============================================================

camera = cv2.VideoCapture(0)


if not camera.isOpened():

    print("ERROR: Could not open webcam.")

    raise SystemExit


# Camera resolution
camera.set(
    cv2.CAP_PROP_FRAME_WIDTH,
    1280
)

camera.set(
    cv2.CAP_PROP_FRAME_HEIGHT,
    720
)


print()
print("=" * 70)
print("CAMERA STARTED")
print("=" * 70)

print("Look at the camera.")

print("Press Q to quit.")

print("=" * 70)


# ============================================================
# 13. MAIN RECOGNITION LOOP
# ============================================================

frame_count = 0
last_error = None


while True:

    ret, frame = camera.read()


    if not ret:

        print(
            "ERROR: Could not read webcam frame."
        )

        break


    # --------------------------------------------------------
    # Mirror webcam
    # --------------------------------------------------------

    display_frame = cv2.flip(
        frame,
        1
    )


    # --------------------------------------------------------
    # Detection frame
    # --------------------------------------------------------

    detection_frame = display_frame.copy()


    height, width = detection_frame.shape[:2]


    max_width = 1280


    if width > max_width:

        scale = max_width / width


        detection_frame = cv2.resize(
            detection_frame,
            (
                int(width * scale),
                int(height * scale)
            )
        )


    try:

        # ----------------------------------------------------
        # Detect faces
        # ----------------------------------------------------

        boxes, extra = engine.find_faces(
            detection_frame
        )


        boxes = np.asarray(
            boxes,
            dtype=np.float32
        )


        # ----------------------------------------------------
        # No face
        # ----------------------------------------------------

        if len(boxes) == 0:

            cv2.putText(
                display_frame,
                "No face detected",
                (30, 45),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2
            )


            cv2.imshow(
                "VITAL Face Recognition",
                display_frame
            )


            if cv2.waitKey(1) & 0xFF == ord("q"):

                break


            continue


        # ----------------------------------------------------
        # Compute embeddings
        # ----------------------------------------------------

        embeddings = engine.compute_embeddings(
            detection_frame,
            boxes,
            **extra
        )


        embeddings = np.asarray(
            embeddings
        )


        # ----------------------------------------------------
        # Process faces
        # ----------------------------------------------------

        for index, box in enumerate(boxes):


            if index >= len(embeddings):

                continue


            embedding = np.asarray(
                embeddings[index],
                dtype=np.float32
            ).reshape(-1)


            # ------------------------------------------------
            # Recognize
            # ------------------------------------------------

            name, score = recognize_face(
                embedding
            )


            # ------------------------------------------------
            # Coordinates
            # ------------------------------------------------

            coordinates = (
                np.asarray(box)
                .astype(np.int32)
                .reshape(-1)
            )


            if len(coordinates) < 4:

                continue


            x1, y1, x2, y2 = coordinates[:4]


            # ------------------------------------------------
            # Scale coordinates
            # ------------------------------------------------

            detection_height, detection_width = (
                detection_frame.shape[:2]
            )


            display_height, display_width = (
                display_frame.shape[:2]
            )


            scale_x = (
                display_width /
                detection_width
            )


            scale_y = (
                display_height /
                detection_height
            )


            x1 = int(x1 * scale_x)
            y1 = int(y1 * scale_y)

            x2 = int(x2 * scale_x)
            y2 = int(y2 * scale_y)


            # ------------------------------------------------
            # Keep coordinates inside frame
            # ------------------------------------------------

            x1 = max(
                0,
                min(
                    x1,
                    display_width - 1
                )
            )


            y1 = max(
                0,
                min(
                    y1,
                    display_height - 1
                )
            )


            x2 = max(
                0,
                min(
                    x2,
                    display_width - 1
                )
            )


            y2 = max(
                0,
                min(
                    y2,
                    display_height - 1
                )
            )


            # =================================================
            # KNOWN FACE
            # =================================================

            if name != "Unknown":

                color = (
                    0,
                    255,
                    0
                )


                # ---------------------------------------------
                # Mark attendance
                # ---------------------------------------------

                current_time = time.time()


                previous_time = (
                    last_attendance_time.get(
                        name,
                        0
                    )
                )


                if (
                    current_time -
                    previous_time
                    >= ATTENDANCE_COOLDOWN
                ):

                    if session_id is not None:

                        success = mark_attendance(
                            name,
                            session_id
                        )


                        if success:

                            last_attendance_time[
                                name
                            ] = current_time


                # ---------------------------------------------
                # Display
                # ---------------------------------------------

                label = (
                    f"{name} | "
                    f"{score:.2f} | Present"
                )


            # =================================================
            # UNKNOWN FACE
            # =================================================

            else:

                color = (
                    0,
                    0,
                    255
                )


                label = (
                    f"Unknown | "
                    f"{score:.2f}"
                )


            # ------------------------------------------------
            # Draw rectangle
            # ------------------------------------------------

            cv2.rectangle(
                display_frame,
                (x1, y1),
                (x2, y2),
                color,
                2
            )


            # ------------------------------------------------
            # Draw label
            # ------------------------------------------------

            text_y = max(
                y1 - 10,
                30
            )


            cv2.putText(
                display_frame,
                label,
                (x1, text_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                color,
                2
            )


            # ------------------------------------------------
            # Print recognition occasionally
            # ------------------------------------------------

            frame_count += 1


            if frame_count % 30 == 0:

                print(
                    f"Detected: {name} | "
                    f"Similarity: {score:.3f}"
                )


    # ========================================================
    # NO FACE FOUND
    # ========================================================

    except FaceNotFoundError:

        cv2.putText(
            display_frame,
            "No face detected",
            (30, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )


    # ========================================================
    # OTHER ERRORS
    # ========================================================

    except Exception as error:

        error_type = type(error).__name__


        if error_type != last_error:

            print()
            print("=" * 70)
            print("FACE PROCESSING ERROR")
            print(
                "ERROR TYPE:",
                error_type
            )
            print(
                "ERROR DETAILS:",
                repr(error)
            )
            print("=" * 70)


            last_error = error_type


        cv2.putText(
            display_frame,
            "Face processing error",
            (30, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )


    # ========================================================
    # SHOW CAMERA
    # ========================================================

    cv2.imshow(
        "VITAL Face Recognition",
        display_frame
    )


    # ========================================================
    # QUIT
    # ========================================================

    if cv2.waitKey(1) & 0xFF == ord("q"):

        break



camera.release()

cv2.destroyAllWindows()


print()
print("=" * 70)
print("VITAL FACE RECOGNITION STOPPED.")
print("=" * 70)