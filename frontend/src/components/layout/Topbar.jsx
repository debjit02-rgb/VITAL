import React, { useState, useEffect } from "react";
import { Bell, ScanLine, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeSwitcher from "../ui/ThemeSwitcher";

export default function Topbar({ activePageTitle, subtitle, onTriggerVerify }) {
  const { user, isStudent } = useAuth();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
      setDateStr(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const barStyle = {
    height: "60px",
    background: "var(--color-surface)",
    borderBottom: "1px solid var(--color-border)",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 20,
    gap: "16px",
  };

  return (
    <header style={barStyle}>
      {/* Page title */}
      <div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {activePageTitle}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "1px" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Date/time — desktop only */}
        <div
          className="hidden lg:flex"
          style={{
            alignItems: "center",
            gap: "6px",
            padding: "5px 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{timeStr}</span>
          <span style={{ color: "var(--color-border)" }}>·</span>
          <span>{dateStr}</span>
        </div>

        {/* Verify button — student only */}
        {isStudent && (
          <button
            type="button"
            onClick={onTriggerVerify}
            className="hidden sm:flex"
            style={{
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-accent-border)",
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.color = "#0a0f1a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent-dim)"; e.currentTarget.style.color = "var(--color-accent)"; }}
          >
            <ScanLine size={14} strokeWidth={2} />
            <span>Mark Attendance</span>
          </button>
        )}

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-elevated)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              position: "relative",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent-border)"; e.currentTarget.style.color = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          >
            <Bell size={15} strokeWidth={2} />
            <span
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                border: "1.5px solid var(--color-surface)",
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "300px",
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px 10px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  Notifications
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    padding: "2px 7px",
                    borderRadius: "9999px",
                    background: "var(--color-accent-dim)",
                    color: "var(--color-accent)",
                    border: "1px solid var(--color-accent-border)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                  }}
                >
                  2 new
                </span>
              </div>
              <div style={{ padding: "10px" }}>
                {[
                  { Icon: CheckCircle2, color: "var(--color-success)", title: "Attendance Session Active", desc: "Lab 402 Deep Learning session is open for verification." },
                  { Icon: Sparkles, color: "var(--color-purple)", title: "ML Insights Updated", desc: "Random Forest model updated with latest quiz scores." },
                ].map(({ Icon, color, title, desc }) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "4px",
                      background: "var(--color-surface)",
                    }}
                  >
                    <Icon size={14} style={{ color, marginTop: "2px", flexShrink: 0 }} strokeWidth={2.5} />
                    <div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
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
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
