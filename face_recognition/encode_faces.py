import json
from pathlib import Path

import cv2
import numpy as np
from face_engine import FaceEngine


# ============================================
# VITAL FACE ENCODING
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
DATABASE_FILE = BASE_DIR / "face_database.json"


# ============================================
# Initialize Face Engine
# ============================================

engine = FaceEngine()

print("VITAL Face Engine loaded.")
print(f"Dataset: {DATASET_DIR}")


# ============================================
# Check dataset
# ============================================

if not DATASET_DIR.exists():
    print("ERROR: Dataset folder does not exist.")
    raise SystemExit


student_folders = [
    folder for folder in DATASET_DIR.iterdir()
    if folder.is_dir()
]


if not student_folders:
    print("No student folders found.")
    print("Example:")
    print("dataset/Debjit/")
    print("dataset/Member2/")
    print("dataset/Member3/")
    raise SystemExit


# ============================================
# Process students
# ============================================

face_database = {}

for student_folder in student_folders:

    student_name = student_folder.name

    print()
    print("=" * 50)
    print(f"Processing: {student_name}")
    print("=" * 50)

    embeddings = []

    image_files = []

    for extension in ["*.jpg", "*.jpeg", "*.png"]:
        image_files.extend(student_folder.glob(extension))

    if not image_files:
        print(f"No images found for {student_name}")
        continue


    # ========================================
    # Process each image
    # ========================================

    for image_path in image_files:

        try:

            print(f"Processing {image_path.name}...")

            # Load image using OpenCV
            image = cv2.imread(str(image_path))

            if image is None:
                print(f"Could not read {image_path.name}")
                continue


            # Detect face
            boxes, extra = engine.find_faces(
                image,
                limit=1
            )


            if len(boxes) == 0:
                print(f"No face found in {image_path.name}")
                continue


            # Generate face embedding
            result = engine.compute_embeddings(
                image,
                boxes,
                **extra
            )


            # Convert result to NumPy array
            result = np.asarray(result)


            if result.ndim == 1:
                embedding = result
            else:
                embedding = result[0]


            embeddings.append(embedding.tolist())

            print(f"Encoded: {image_path.name}")


        except Exception as error:
            print("ERROR TYPE:", type(error).__name__)
            print(
                f"Error processing {image_path.name}: {error}"
            )


    # ========================================
    # Save student's embeddings
    # ========================================

    if embeddings:

        face_database[student_name] = embeddings

        print()
        print(
            f"Saved {len(embeddings)} embedding(s) "
            f"for {student_name}"
        )

    else:

        print()
        print(f"No usable images for {student_name}")


# ============================================
# Save face database
# ============================================

with open(DATABASE_FILE, "w") as file:

    json.dump(
        face_database,
        file,
        indent=4
    )


print()
print("=" * 50)
print("VITAL FACE DATABASE CREATED")
print("=" * 50)

print(
    f"Students enrolled: {len(face_database)}"
)

print(
    f"Saved to: {DATABASE_FILE}"
)