import cv2
from pathlib import Path



print("=" * 60)
print("VITAL FACE CAPTURE")
print("=" * 60)



while True:

    student_name = input("Enter student name: ").strip()

    if student_name:
        break

    print("Name cannot be empty. Please enter a valid name.")


# ============================================================
# 2. CREATE STUDENT DATASET FOLDER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = BASE_DIR / "dataset" / student_name

DATASET_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print()
print(f"Student: {student_name}")
print(f"Photos will be saved to:")
print(DATASET_DIR)


# ============================================================
# 3. OPEN CAMERA
# ============================================================

camera = cv2.VideoCapture(0)

if not camera.isOpened():

    print()
    print("ERROR: Could not open camera.")
    raise SystemExit


# ============================================================
# 4. CAMERA SETTINGS
# ============================================================

camera.set(
    cv2.CAP_PROP_FRAME_WIDTH,
    1280
)

camera.set(
    cv2.CAP_PROP_FRAME_HEIGHT,
    720
)


print()
print("=" * 60)
print("CAMERA STARTED")
print("=" * 60)

print(f"Student: {student_name}")
print()
print("Look at the camera.")
print("Press SPACE to capture a photo.")
print("Press Q to quit.")
print("=" * 60)


# ============================================================
# 5. FIND NEXT PHOTO NUMBER
# ============================================================

existing_images = list(DATASET_DIR.glob("*.jpg"))

photo_number = len(existing_images) + 1

captured_count = 0

TARGET_PHOTOS = 5


# ============================================================
# 6. CAMERA LOOP
# ============================================================

while captured_count < TARGET_PHOTOS:

    ret, frame = camera.read()

    if not ret:

        print("ERROR: Could not read camera frame.")
        break


    # Mirror camera
    display_frame = cv2.flip(frame, 1)


    # --------------------------------------------------------
    # Information shown on camera
    # --------------------------------------------------------

    cv2.putText(
        display_frame,
        f"Student: {student_name}",
        (30, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (0, 255, 0),
        2
    )

    cv2.putText(
        display_frame,
        f"Photos: {captured_count}/{TARGET_PHOTOS}",
        (30, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        display_frame,
        "SPACE = Capture | Q = Quit",
        (30, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )


    # --------------------------------------------------------
    # Show camera
    # --------------------------------------------------------

    cv2.imshow(
        "VITAL Face Capture",
        display_frame
    )


    # --------------------------------------------------------
    # Keyboard
    # --------------------------------------------------------

    key = cv2.waitKey(1) & 0xFF


    # --------------------------------------------------------
    # SPACE = CAPTURE
    # --------------------------------------------------------

    if key == ord(" "):

        filename = DATASET_DIR / f"{photo_number}.jpg"

        # Save original camera frame
        cv2.imwrite(
            str(filename),
            frame
        )

        captured_count += 1
        photo_number += 1

        print(
            f"Saved: {filename}"
        )


    # --------------------------------------------------------
    # Q = QUIT
    # --------------------------------------------------------

    elif key == ord("q"):

        print("Capture cancelled.")
        break


# ============================================================
# 7. CLEANUP
# ============================================================

camera.release()

cv2.destroyAllWindows()


# ============================================================
# 8. RESULT
# ============================================================

print()
print("=" * 60)

if captured_count == TARGET_PHOTOS:

    print(
        f"Captured {captured_count} photos for {student_name}."
    )

    print()
    print("Next step:")
    print("Run encode_faces.py")

else:

    print(
        f"Captured {captured_count} photos for {student_name}."
    )

print("=" * 60)