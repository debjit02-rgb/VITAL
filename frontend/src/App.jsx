import React, { useState } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

// Layout & Auth
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import LoginView from "./components/auth/LoginView";

// Student Views
import StudentDashboard from "./components/student/StudentDashboard";
import StudentAttendance from "./components/student/StudentAttendance";
import StudentQuizzes from "./components/student/StudentQuizzes";
import StudentAssignments from "./components/student/StudentAssignments";
import StudentAiInsights from "./components/student/StudentAiInsights";

// Teacher Views
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import TeacherLiveAttendance from "./components/teacher/TeacherLiveAttendance";
import TeacherStudentRoster from "./components/teacher/TeacherStudentRoster";
import TeacherEvaluationManager from "./components/teacher/TeacherEvaluationManager";
import TeacherAnalytics from "./components/teacher/TeacherAnalytics";

// Attendance Wizard Modal
import AttendanceWizard from "./components/AttendanceWizard";

function MainAppLayout() {
  const { user, isTeacher, isStudent, isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [showVerificationWizard, setShowVerificationWizard] = useState(false);

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--color-bg)" }}
      >
        <div
          className="w-10 h-10 rounded-full border-4"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-accent)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          Loading VITAL Platform...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const getPageTitle = () => {
    if (isTeacher) {
      switch (activePage) {
        case "dashboard":          return "Faculty Dashboard";
        case "teacher_attendance": return "Live Attendance";
        case "teacher_students":   return "Student Directory";
        case "teacher_evaluations":return "Grading & Assessments";
        case "teacher_analytics":  return "Class Analytics";
        default:                   return "Faculty Portal";
      }
    } else {
      switch (activePage) {
        case "dashboard":  return "Student Dashboard";
        case "attendance": return "Attendance Record";
        case "quizzes":    return "Quizzes";
        case "assignments":return "Assignments";
        case "ai":         return "AI Insights";
        default:           return "Student Portal";
      }
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Attendance Wizard Modal */}
      {showVerificationWizard && (
        <AttendanceWizard
          student={user}
          onClose={() => setShowVerificationWizard(false)}
          onSuccess={() => {}}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onSelectPage={(pageId) => setActivePage(pageId)}
        onTriggerVerify={() => setShowVerificationWizard(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activePageTitle={getPageTitle()}
          onTriggerVerify={() => setShowVerificationWizard(true)}
        />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "2rem" }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {/* Student Routes */}
            {isStudent && (
              <>
                {activePage === "dashboard"   && <StudentDashboard onTriggerVerify={() => setShowVerificationWizard(true)} />}
                {activePage === "attendance"  && <StudentAttendance onTriggerVerify={() => setShowVerificationWizard(true)} />}
                {activePage === "quizzes"     && <StudentQuizzes />}
                {activePage === "assignments" && <StudentAssignments />}
                {activePage === "ai"          && <StudentAiInsights />}
              </>
            )}

            {/* Teacher Routes */}
            {isTeacher && (
              <>
                {activePage === "dashboard"            && <TeacherDashboard onNavigate={(p) => setActivePage(p)} />}
                {activePage === "teacher_attendance"   && <TeacherLiveAttendance />}
                {activePage === "teacher_students"     && <TeacherStudentRoster />}
                {activePage === "teacher_evaluations"  && <TeacherEvaluationManager />}
                {activePage === "teacher_analytics"    && <TeacherAnalytics />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainAppLayout />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
