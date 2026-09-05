# VITAL

### Intelligent Academic Management & Secure Attendance Platform

VITAL is a full-stack academic management platform designed to bring
**student performance tracking, academic analytics, secure attendance,
assessments, and intelligent insights** into one unified system.

Instead of treating attendance, marks, assignments, quizzes, and
performance analysis as separate activities, VITAL connects them into a
single academic workflow for both **students and teachers**.

------------------------------------------------------------------------

## Why VITAL?

Traditional academic systems often record information without turning it
into useful insight.

A student's attendance may live in one place, marks in another,
assignments somewhere else, and meaningful performance analysis may
require manual work.

VITAL is designed around a simpler idea:

> **Collect academic data once, connect it intelligently, and turn it
> into actionable academic insight.**

The platform combines:

-   🎓 Student and teacher portals
-   📊 Academic performance analytics
-   🤖 ML-based performance insights
-   📱 Dynamic QR attendance
-   📍 Location-based attendance verification
-   👤 Face verification
-   📝 Quiz management
-   📚 Assignment management
-   📈 Progress tracking
-   🔐 Authentication and role-based access

------------------------------------------------------------------------

## Core Features

### 🎓 Student Portal

Students get a centralized view of their academic activity.

-   View academic dashboard
-   View attendance
-   View quiz results
-   View assignment results
-   Track academic performance
-   View performance insights
-   Participate in secure attendance sessions
-   Complete QR, location, and face verification when required

------------------------------------------------------------------------

### 👨‍🏫 Teacher Portal

Teachers can manage academic activities from a single interface.

-   Start and manage attendance sessions
-   Display a dynamic attendance QR
-   Monitor verified attendance
-   Create quizzes
-   Manage quiz questions
-   Record and review quiz results
-   Create assignments
-   Record assignment results
-   View student performance
-   Analyze academic trends

------------------------------------------------------------------------

# 🔐 Secure Multi-Step Attendance

Attendance is one of VITAL's key components.

Instead of relying on a permanent QR code, VITAL is designed around a
**short-lived, server-validated attendance session**.

### Attendance Flow

``` text
Teacher starts attendance session
              ↓
Server creates active session
              ↓
Dynamic QR token is generated
              ↓
QR changes periodically
              ↓
Student scans current QR
              ↓
Server validates session + token
              ↓
Location verification
              ↓
Camera / face verification
              ↓
Identity and attendance validation
              ↓
Attendance recorded
```

### Why multiple checks?

A QR code by itself does not prove that the correct student is
physically present.

VITAL combines multiple signals:

  Verification        Purpose
  ------------------- ------------------------------------------------
  Authentication      Confirms the student's account
  Dynamic QR          Confirms participation in the active session
  Location            Verifies presence near the registered location
  Face verification   Helps verify the student's identity
  Server validation   Enforces the rules centrally

This layered approach is intended to make attendance more resistant to
simple QR sharing or remote marking.

> **Note:** GPS and face recognition are practical verification
> mechanisms, not perfect guarantees. Accuracy depends on device,
> environment, permissions, and implementation conditions.

------------------------------------------------------------------------

# 📊 Academic Performance Intelligence

VITAL includes a machine-learning component for academic performance
analysis.

The project uses academic indicators such as:

-   Attendance
-   Quiz performance
-   Assignment performance

These features can be processed by the ML pipeline to generate
performance-related predictions or insights.

### ML Pipeline

``` text
Academic Data
     ↓
Data Preparation
     ↓
Feature Processing
     ↓
Model Training
     ↓
Trained Model
     ↓
Student Data
     ↓
Prediction / Insight
     ↓
Dashboard
```

The ML component is intended to support academic analysis and early
insight rather than replace teacher judgment.

------------------------------------------------------------------------

# 📝 Assessments

## Quizzes

Teachers can create and manage quizzes containing questions and marks.

Students can receive quiz results through their academic portal.

## Assignments

Teachers can create assignments and record student results.

Assignment performance contributes to the broader academic picture
displayed by VITAL.

------------------------------------------------------------------------

# 📈 Unified Academic View

VITAL brings multiple academic signals together:

``` text
                ┌───────────────┐
                │   Attendance  │
                └───────┬───────┘
                        │
┌───────────────┐       │       ┌───────────────┐
│     Quizzes   │───────┼───────│  Assignments  │
└───────────────┘       │       └───────────────┘
                        ↓
              ┌──────────────────┐
              │ Academic Analysis │
              └────────┬─────────┘
                       ↓
              ┌──────────────────┐
              │ ML-Based Insight │
              └────────┬─────────┘
                       ↓
              ┌──────────────────┐
              │ Student/Teacher  │
              │    Dashboard     │
              └──────────────────┘
```

The goal is to give teachers a broader understanding of student
performance while giving students a clearer picture of their own
progress.

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
┌──────────────────────────────────────────────┐
│                 VITAL Frontend                │
│              React + Vite                    │
│                                              │
│   Student Portal       Teacher Portal        │
└───────────────────────┬──────────────────────┘
                        │
                     REST API
                        │
                        ▼
┌──────────────────────────────────────────────┐
│                FastAPI Backend               │
│                                              │
│ Authentication   Attendance   Quizzes        │
│ Assignments      Dashboard   Performance     │
│ Prediction       Students                     │
└──────────────┬───────────────┬───────────────┘
               │               │
               ▼               ▼
        ┌────────────┐   ┌───────────────┐
        │   MySQL    │   │ ML / Computer │
        │  Database  │   │    Vision     │
        └────────────┘   └───────────────┘
```

------------------------------------------------------------------------

# 🧰 Technology Stack

## Frontend

-   React
-   Vite
-   JavaScript
-   CSS / UI component system used by the project

## Backend

-   Python
-   FastAPI
-   Uvicorn
-   REST APIs

## Database

-   MySQL

## Machine Learning

-   Python
-   pandas
-   NumPy
-   scikit-learn
-   joblib

## Computer Vision

-   OpenCV
-   InsightFace / face-engine based recognition pipeline

## Development

-   Git
-   GitHub
-   VS Code / compatible IDEs

------------------------------------------------------------------------

# 📁 Project Structure

``` text
VITAL/
│
├── backend/
│   ├── app.py
│   ├── database/
│   ├── routes/
│   ├── models/
│   └── services/
│
├── database/
│
├── face_recognition/
│
├── frontend/
│
├── ml/
│
├── models/
│
├── test/
│
├── .env.example
├── README.md
├── requirements.txt
└── ...
```

### Backend

Contains the FastAPI application, API routes, database connectivity,
services, and backend logic.

### Frontend

Contains the React + Vite application and the student/teacher
interfaces.

### Database

Contains database-related files and schema resources.

### ML

Contains machine-learning training and prediction components.

### Face Recognition

Contains the computer-vision and face-verification components.

### Models

Contains model-related project artifacts.

### Test

Contains integration and testing resources.

------------------------------------------------------------------------

# 🗄️ Database

VITAL uses a MySQL database named:

``` text
vital
```

The application works with academic entities including:

-   Students
-   Attendance sessions
-   Attendance records
-   Quizzes
-   Quiz questions
-   Quiz results
-   Assignments
-   Assignment results
-   Predictions

The database provides the persistent layer connecting the frontend,
backend, attendance system, assessments, and analytics.

------------------------------------------------------------------------

# ⚙️ Local Development

## Requirements

Install the following before running VITAL:

-   Python 3.14+
-   Node.js
-   npm
-   MySQL
-   Git

------------------------------------------------------------------------

## 1. Clone the Repository

``` bash
git clone https://github.com/debjit02-rgb/VITAL.git
cd VITAL
```

------------------------------------------------------------------------

## 2. Configure Environment Variables

Create a local `.env` file based on:

``` text
.env.example
```

Never commit the real `.env` file to GitHub.

Environment variables should contain local database credentials and
other private configuration.

------------------------------------------------------------------------

## 3. Backend Setup

Create and activate a Python virtual environment.

Example:

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Start the FastAPI backend:

``` bash
python3 -m uvicorn backend.app:app --reload
```

The API will normally be available at:

``` text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

``` text
http://127.0.0.1:8000/docs
```

------------------------------------------------------------------------

## 4. Frontend Setup

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite will provide the local development URL shown in the terminal.

------------------------------------------------------------------------

# 🔄 Frontend ↔ Backend

The Vite development server is configured to proxy API requests
beginning with:

``` text
/api
```

to the FastAPI backend.

This allows the frontend to communicate with the backend without
hardcoding separate development API URLs throughout the application.

------------------------------------------------------------------------

# 🔒 Security Principles

VITAL handles authentication, academic records, and face-verification
components, so security is an important part of the architecture.

The project follows these principles:

-   Keep secrets in environment variables
-   Never commit `.env`
-   Do not expose database credentials
-   Validate sensitive operations on the backend
-   Do not rely on frontend authorization alone
-   Use server-side attendance validation
-   Use short-lived attendance tokens
-   Avoid exposing biometric data through normal APIs
-   Use only necessary student information
-   Keep real biometric datasets out of the public repository

------------------------------------------------------------------------

# 🧪 Testing

The repository contains testing resources under:

``` text
test/
```

Tests should be used to verify important components such as:

-   Backend APIs
-   Database operations
-   Attendance logic
-   QR validation
-   Prediction functionality
-   Authentication and authorization

------------------------------------------------------------------------

# 🚀 Development Workflow

A typical development workflow is:

``` text
Create / update feature
        ↓
Run frontend
        ↓
Run backend
        ↓
Test functionality
        ↓
Review changes
        ↓
Commit
        ↓
Push to GitHub
```

Useful Git commands:

``` bash
git status
git add .
git commit -m "Describe the change"
git push
```

------------------------------------------------------------------------

# 🗺️ Project Roadmap

The VITAL architecture can be extended with additional capabilities such
as:

-   More advanced academic analytics
-   Improved performance forecasting
-   More detailed teacher analytics
-   Attendance history and reporting
-   Classroom/location management
-   Improved face-verification and liveness checks
-   Additional assessment types
-   Mobile-focused experience
-   Stronger anti-cheating mechanisms
-   Notifications and academic alerts

These are future directions rather than claims about the current
implementation.

------------------------------------------------------------------------

# 🎯 Project Vision

VITAL aims to move academic management beyond simple record keeping.

The long-term vision is to create a system where:

**Academic data → becomes insight → becomes action.**

Students can understand where they stand.

Teachers can identify where attention may be needed.

Institutions can have a more connected view of academic activity.

------------------------------------------------------------------------

# 👥 Project

**VITAL**\
Intelligent Academic Management & Secure Attendance Platform

Built as a full-stack academic technology project combining web
development, databases, machine learning, and computer vision.

------------------------------------------------------------------------

## ⚠️ Disclaimer

VITAL is an academic project and should be properly security-tested,
privacy-reviewed, and validated before being used with real
institutional or biometric data in a production environment.

Face recognition, GPS, and machine-learning predictions can have
limitations and should be treated as supporting mechanisms rather than
infallible decisions.
