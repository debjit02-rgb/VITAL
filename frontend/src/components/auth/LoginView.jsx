import React, { useState } from "react";
import { GraduationCap, ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, ScanLine } from "lucide-react";
import { useAuth, DEMO_PRESETS } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const S = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "var(--color-bg)",
    position: "relative",
  },
  grid: {
    position: "absolute",
    inset: 0,
    opacity: 0.03,
    backgroundImage: "linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-2xl)",
    boxShadow: "var(--shadow-xl)",
    padding: "32px",
    position: "relative",
    zIndex: 1,
  },
  label: {
    display: "block",
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    color: "var(--color-text-primary)",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
};

export default function LoginView() {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("debjit2.modak@stu.adamasuniversity.ac.in");
  const [password, setPassword] = useState("student123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (r) => {
    setRole(r);
    setError("");
    if (r === "student") { setEmail("debjit2.modak@stu.adamasuniversity.ac.in"); setPassword("student123"); }
    else { setEmail("prof.sharma@vital.edu"); setPassword("teacher123"); }
  };

  const handleSelectPreset = (preset) => {
    setRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.password);
    setError("");
    addToast({ type: "info", title: "Preset Loaded", message: `Selected: ${preset.name}` });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password, role);
      addToast({ type: "success", title: "Welcome to VITAL", message: `Signed in as ${role === "student" ? "Student" : "Faculty"}` });
    } catch (err) {
      setError(err.message || "Invalid credentials");
      addToast({ type: "error", title: "Sign In Failed", message: err.message || "Check your credentials" });
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Subtle background grid */}
      <div style={S.grid} />

      <div style={S.card}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <ScanLine size={22} color="#0a0f1a" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            VITAL
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Academic Intelligence Platform
          </p>
        </div>

        {/* Role Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            padding: "5px",
            background: "var(--color-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            marginBottom: "24px",
          }}
        >
          {[
            { value: "student", label: "Student", Icon: GraduationCap },
            { value: "teacher", label: "Faculty",  Icon: ShieldCheck },
          ].map(({ value, label, Icon }) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRoleChange(value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: active ? "1px solid var(--color-accent-border)" : "1px solid transparent",
                  background: active ? "var(--color-accent-dim)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                  fontSize: "0.8125rem",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-error-dim)",
              border: "1px solid var(--color-error-border)",
              color: "var(--color-error)",
              fontSize: "0.8125rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label style={S.label}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={S.input}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--color-accent-dim)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={S.label}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...S.input, paddingRight: "42px" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--color-accent-dim)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: loading ? "var(--color-border)" : "var(--color-accent)",
              color: loading ? "var(--color-text-muted)" : "#0a0f1a",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s",
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(0,0,0,0.2)",
                    borderTopColor: "#0a0f1a",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Demo presets */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--color-border)" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "10px",
            }}
          >
            Demo Accounts
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {DEMO_PRESETS.map((preset) => {
              const selected = email === preset.email;
              return (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: selected ? "1px solid var(--color-accent-border)" : "1px solid var(--color-border)",
                    background: selected ? "var(--color-accent-dim)" : "var(--color-surface-elevated)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: selected ? "var(--color-accent)" : "var(--color-text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    {preset.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: selected ? "var(--color-accent)" : "var(--color-text-primary)" }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: "1px" }}>
                      {preset.description}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "9999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: preset.role === "teacher" ? "var(--color-purple-dim)" : "var(--color-accent-dim)",
                      color: preset.role === "teacher" ? "var(--color-purple)" : "var(--color-accent)",
                      border: `1px solid ${preset.role === "teacher" ? "var(--color-purple-border)" : "var(--color-accent-border)"}`,
                    }}
                  >
                    {preset.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
