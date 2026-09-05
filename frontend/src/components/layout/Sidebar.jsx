import React from "react";
import {
  LayoutDashboard,
  UserCheck,
  FileQuestion,
  BookOpen,
  Sparkles,
  Users,
  QrCode,
  Award,
  BarChart3,
  LogOut,
  GraduationCap,
  ShieldCheck,
  ScanLine
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_STUDENT = [
  { id: "dashboard",   label: "Dashboard",         icon: LayoutDashboard },
  { id: "attendance",  label: "Attendance",         icon: UserCheck },
  { id: "quizzes",     label: "Quizzes",            icon: FileQuestion },
  { id: "assignments", label: "Assignments",         icon: BookOpen },
  { id: "ai",          label: "AI Insights",        icon: Sparkles, tag: "ML" },
];

const NAV_TEACHER = [
  { id: "dashboard",            label: "Overview",        icon: LayoutDashboard },
  { id: "teacher_attendance",   label: "Live Attendance", icon: QrCode, tag: "Live" },
  { id: "teacher_students",     label: "Students",        icon: Users },
  { id: "teacher_evaluations",  label: "Grading",         icon: Award },
  { id: "teacher_analytics",    label: "Analytics",       icon: BarChart3 },
];

const S = {
  sidebar: {
    width: "var(--sidebar-width)",
    flexShrink: 0,
    height: "100vh",
    position: "sticky",
    top: 0,
    display: "flex",
    flexDirection: "column",
    background: "var(--color-surface)",
    borderRight: "1px solid var(--color-border)",
    zIndex: 30,
    userSelect: "none",
    overflow: "hidden",
  },
  brandArea: {
    padding: "20px 20px 16px",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoBox: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "var(--color-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontSize: "1.0625rem",
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: "var(--color-text-primary)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  brandSub: {
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    fontFamily: "'JetBrains Mono', monospace",
    marginTop: "1px",
  },
  roleChip: {
    margin: "12px 16px",
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-elevated)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navSection: {
    flex: 1,
    padding: "8px 12px",
    overflowY: "auto",
  },
  navLabel: {
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    padding: "6px 8px 4px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  profileArea: {
    padding: "12px 16px",
    borderTop: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export default function Sidebar({ activePage, onSelectPage, onTriggerVerify }) {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const nav = isTeacher ? NAV_TEACHER : NAV_STUDENT;

  return (
    <aside style={S.sidebar}>
      {/* Brand */}
      <div style={S.brandArea}>
        <div style={S.logoBox}>
          <ScanLine size={20} color="#0a0f1a" strokeWidth={2.5} />
        </div>
        <div>
          <div style={S.brandName}>VITAL</div>
          <div style={S.brandSub}>
            {isTeacher ? "Faculty Portal" : "Student Portal"}
          </div>
        </div>
      </div>

      {/* Role Chip */}
      <div style={S.roleChip}>
        {isTeacher ? (
          <ShieldCheck size={14} style={{ color: "var(--color-purple)", flexShrink: 0 }} />
        ) : (
          <GraduationCap size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
        )}
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
          {isTeacher ? "Faculty Access" : "Student Access"}
        </span>
        <span
          style={{
            marginLeft: "auto",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "var(--color-success)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Verify Attendance CTA — student only */}
      {isStudent && (
        <div style={{ padding: "0 12px 8px" }}>
          <button
            type="button"
            onClick={onTriggerVerify}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-accent-border)",
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.color = "#0a0f1a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent-dim)"; e.currentTarget.style.color = "var(--color-accent)"; }}
          >
            <UserCheck size={15} strokeWidth={2} />
            <span>Mark Attendance</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={S.navSection}>
        <div style={S.navLabel}>Navigation</div>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPage(item.id)}
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px 9px 14px",
                marginBottom: "2px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: isActive ? "var(--color-accent-dim)" : "transparent",
                color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--color-surface-elevated)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "3px",
                    background: "var(--color-accent)",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.tag && (
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "2px 6px",
                    borderRadius: "9999px",
                    fontFamily: "'JetBrains Mono', monospace",
                    background: item.tag === "Live" ? "var(--color-error-dim)" : "var(--color-purple-dim)",
                    color: item.tag === "Live" ? "var(--color-error)" : "var(--color-purple)",
                    border: `1px solid ${item.tag === "Live" ? "var(--color-error-border)" : "var(--color-purple-border)"}`,
                  }}
                >
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={S.profileArea}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-accent-dim)",
            border: "1px solid var(--color-accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--color-accent)",
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name || "User"}
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {isTeacher ? "Faculty" : (user?.roll_number || `ID ${user?.student_id}`)}
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            transition: "background 0.12s, color 0.12s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-error-dim)"; e.currentTarget.style.color = "var(--color-error)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
        >
          <LogOut size={15} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
