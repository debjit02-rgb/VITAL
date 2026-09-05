from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import auth
from backend.routes import student_portal
from backend.routes import teacher_portal
from backend.routes import attendance_pipeline
from backend.routes import students
from backend.routes import attendance
from backend.routes import dashboard
from backend.routes import quizzes
from backend.routes import assignments
from backend.routes import assignment_results
from backend.routes import performance
from backend.routes import prediction


# ============================================================
# VITAL FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="VITAL API",
    description="VITAL Student & Faculty Intelligence Platform",
    version="2.0.0"
)

# Enable CORS for local Vite development and mobile testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CORE ROUTERS
# ============================================================

app.include_router(
    auth.router,
    prefix="/api"
)

app.include_router(
    student_portal.router,
    prefix="/api"
)

app.include_router(
    teacher_portal.router,
    prefix="/api"
)

app.include_router(
    attendance_pipeline.router,
    prefix="/api"
)




# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "VITAL Backend is running",
        "status": "online"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# STUDENTS
# ============================================================

app.include_router(
    students.router,
    prefix="/api"
)


# ============================================================
# ATTENDANCE
# ============================================================

app.include_router(
    attendance.router,
    prefix="/api"
)


# ============================================================
# DASHBOARD
# ============================================================

app.include_router(
    dashboard.router,
    prefix="/api"
)


# ============================================================
# QUIZZES
# ============================================================

app.include_router(
    quizzes.router,
    prefix="/api"
)


# ============================================================
# ASSIGNMENTS
# ============================================================

app.include_router(
    assignments.router,
    prefix="/api"
)


# ============================================================
# ASSIGNMENT RESULTS
# ============================================================

app.include_router(
    assignment_results.router,
    prefix="/api"
)


# ============================================================
# PERFORMANCE
# ============================================================

app.include_router(
    performance.router,
    prefix="/api"
)


# ============================================================
# ML PREDICTION
# ============================================================

app.include_router(
    prediction.router,
    prefix="/api"
)