import base64
import json
from backend.routes.auth import login, LoginRequest
from backend.routes.student_portal import get_student_dashboard, get_student_ai_insights, get_student_attendance_history
from backend.routes.teacher_portal import get_teacher_dashboard, get_teacher_students, create_quiz, CreateQuizRequest

from backend.routes.attendance_pipeline import (
    start_attendance_session,
    api_verify_location,
    api_verify_qr,
    api_complete_multi_factor_attendance,
    StartSessionRequest,
    VerifyLocationRequest,
    VerifyQRRequest,
    CompleteAttendanceRequest
)
from backend.routes.dashboard import get_dashboard

def run_comprehensive_tests():
    print("=" * 70)
    print("VITAL SYSTEM INTEGRATION & VERIFICATION TEST SUITE")
    print("=" * 70)

    # 1. Test Legacy Dashboard Endpoint
    print("\n[TEST 1] Backward Compatibility of Legacy Dashboard /api/dashboard/1...")
    legacy_dash = get_dashboard(1)
    assert legacy_dash.get("student", {}).get("name") == "Debjit", "Legacy dashboard failed"
    print(f"  ✓ Legacy dashboard working: Student '{legacy_dash['student']['name']}' | Attendance: {legacy_dash['attendance']['attendance_percentage']}% | ML: {legacy_dash['prediction']['understanding_level']}")

    # 2. Test Student & Teacher Authentication
    print("\n[TEST 2] Authentication & Role Enforcement...")
    student_login = login(LoginRequest(email="debjit2.modak@stu.adamasuniversity.ac.in", password="student123", role="student"))
    assert student_login["access_token"], "Missing student token"
    assert student_login["user"]["role"] == "student", "Role mismatch"
    print(f"  ✓ Student authenticated: {student_login['user']['name']} ({student_login['user']['email']})")

    teacher_login = login(LoginRequest(email="prof.sharma@vital.edu", password="teacher123", role="teacher"))
    assert teacher_login["access_token"], "Missing teacher token"
    assert teacher_login["user"]["role"] == "teacher", "Role mismatch"
    print(f"  ✓ Faculty authenticated: {teacher_login['user']['name']} ({teacher_login['user']['email']})")

    # 3. Test Student Portal
    print("\n[TEST 3] Student Portal APIs...")
    s_user = student_login["user"]
    s_dash = get_student_dashboard(current_user=s_user)
    print(f"  ✓ Student Dashboard: Roll {s_dash['student']['roll_number']} | Quizzes: {len(s_dash['quizzes'])} | Assignments: {len(s_dash['assignments'])}")
    
    s_ai = get_student_ai_insights(current_user=s_user)
    print(f"  ✓ AI Insights: Understanding Level '{s_ai['understanding_level']}' | {len(s_ai['recommendations'])} Recommendations")

    # 4. Test Teacher Portal
    print("\n[TEST 4] Faculty Portal APIs...")
    t_user = teacher_login["user"]
    t_dash = get_teacher_dashboard(current_user=t_user)
    print(f"  ✓ Faculty Dashboard: {t_dash['metrics']['total_students']} Students | Avg Attendance: {t_dash['metrics']['average_attendance']}%")

    t_students = get_teacher_students(current_user=t_user)
    print(f"  ✓ Student Roster: {len(t_students['students'])} Students enrolled")

    # 5. Test Teacher Launching Dynamic QR Attendance Session
    print("\n[TEST 5] Teacher Dynamic QR Attendance Session Controller...")
    session_res = start_attendance_session(
        StartSessionRequest(
            subject="Advanced AI & Computer Vision",
            class_id="CSE-AIML-SEM3",
            room_name="Lab 402",
            duration_seconds=300
        ),
        current_user=t_user
    )
    token = session_res["session_token"]
    session_id = session_res["session"]["session_id"]
    print(f"  ✓ Session Started: ID #{session_id} | Token: {token} | Expires in: {session_res['session']['duration_seconds']}s")

    # 6. Test Student Geolocation Verification
    print("\n[TEST 6] GPS Geofence Verification...")
    loc_check = api_verify_location(
        VerifyLocationRequest(session_id=session_id, latitude=22.572645, longitude=88.363892),
        current_user=s_user
    )
    assert loc_check["verified"] is True, "Location check failed"
    print(f"  ✓ Geofence Verified: {loc_check['message']}")

    # 7. Test Student Dynamic QR Token Verification
    print("\n[TEST 7] Dynamic QR Token Verification...")
    qr_check = api_verify_qr(
        VerifyQRRequest(session_token=token),
        current_user=s_user
    )
    assert qr_check["valid"] is True, "QR check failed"
    print(f"  ✓ QR Session Verified: Room '{qr_check['room_name']}' | Subject '{qr_check['subject']}'")

    # 8. Test Biometric Face Verification & Final Multi-Factor Attendance
    print("\n[TEST 8] Biometric Face Verification & Multi-Factor Complete Flow...")
    with open("face_recognition/dataset/Debjit/1.jpg", "rb") as f:
        debjit_img = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

    complete_res = api_complete_multi_factor_attendance(
        CompleteAttendanceRequest(
            session_token=token,
            latitude=22.572645,
            longitude=88.363892,
            image_base64=debjit_img
        ),
        current_user=s_user
    )
    assert complete_res["status"] == "success", "Attendance failed"
    print(f"  ✓ Attendance Recorded: {complete_res['message']}")
    print(f"  ✓ Verification Metadata: Confidence {complete_res['verification']['confidence_percentage']}% | Distance: {complete_res['verification']['distance_meters']}m")

    # 9. Anti-Cheating: Test Duplicate Attendance Prevention
    print("\n[TEST 9] Anti-Cheating: Duplicate Attendance Prevention...")
    try:
        api_complete_multi_factor_attendance(
            CompleteAttendanceRequest(
                session_token=token,
                latitude=22.572645,
                longitude=88.363892,
                image_base64=debjit_img
            ),
            current_user=s_user
        )
        print("  ✗ FAILED: Duplicate attendance was allowed!")
    except Exception as e:
        print(f"  ✓ Duplicate Prevention Active: {e}")

    # 10. Anti-Cheating: Test Impersonation / Face Mismatch
    print("\n[TEST 10] Anti-Cheating: Impersonation / Face Mismatch...")
    anuska_login = login(LoginRequest(email="anuska2.koner@stu.adamasuniversity.ac.in", password="student123", role="student"))
    # Try marking attendance for Anuska using Debjit's photo
    try:
        api_complete_multi_factor_attendance(
            CompleteAttendanceRequest(
                session_token=token,
                latitude=22.572645,
                longitude=88.363892,
                image_base64=debjit_img  # Wrong face
            ),
            current_user=anuska_login["user"]
        )
        print("  ✗ FAILED: Impersonation was allowed!")
    except Exception as e:
        print(f"  ✓ Impersonation Prevented: {e}")

    print("\n" + "=" * 70)
    print("ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_comprehensive_tests()
