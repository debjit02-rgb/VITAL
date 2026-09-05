import React, { useState, useEffect } from "react";
import { UserCheck, TrendingUp, Award, BookOpen, Sparkles, AlertTriangle, CheckCircle2, ScanLine } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { getStudentDashboard } from "../../services/api";

function KpiCard({ label, value, sub, icon: Icon, color = "var(--color-accent)", ring }) {
  return (
    <div
      className="card card-hover"
      style={{ padding: "20px" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "var(--radius-md)",
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          <Icon size={15} strokeWidth={2} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "3px" }}>{sub}</div>}
        </div>
        {ring != null && (
          <div style={{ position: "relative", width: "54px", height: "54px", flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <path
                strokeWidth="3"
                stroke="var(--color-border)"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3"
                strokeDasharray={`${ring}, 100`}
                strokeLinecap="round"
                stroke={color}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.625rem", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "'JetBrains Mono', monospace"
            }}>
              {Math.round(ring)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="custom-recharts-tooltip" style={{ fontSize: "0.8125rem" }}>
      <p style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "6px" }}>{d.fullSubject}</p>
      <p style={{ color: "var(--color-accent)" }}>Quiz: {d.quizScore}/20</p>
      <p style={{ color: "var(--color-purple)" }}>Assignment: {d.assignScore}/20</p>
    </div>
  );
}

export default function StudentDashboard({ onTriggerVerify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentDashboard()
      .then((res) => { setData(res); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ padding: "32px", textAlign: "center", maxWidth: "400px", margin: "48px auto" }}>
        <AlertTriangle size={32} style={{ color: "var(--color-warning)", margin: "0 auto 12px" }} />
        <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>Unable to Load Dashboard</h3>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px", fontSize: "0.875rem" }}>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const { student, attendance, performance, quizzes = [], assignments = [], prediction } = data;
  const attendancePct = attendance?.attendance_percentage ?? 0;
  const quizAvg = performance?.quiz_average ?? 0;
  const assignAvg = performance?.assignment_average ?? 0;
  const tier = prediction?.understanding_level || "Good";

  const chartData = quizzes.slice(0, 5).map((q, i) => ({
    name: q.subject.length > 13 ? q.subject.substring(0, 11) + ".." : q.subject,
    quizScore: q.score,
    assignScore: assignments[i]?.score ?? q.score,
    fullSubject: q.subject
  }));

  const tierColors = { excellent: "var(--color-success)", good: "var(--color-accent)", average: "var(--color-warning)", poor: "var(--color-error)" };
  const tierColor = tierColors[tier.toLowerCase()] || "var(--color-accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome banner */}
      <div
        className="card"
        style={{ padding: "28px 32px", borderLeft: "4px solid var(--color-accent)" }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: "var(--color-accent-dim)",
                border: "1px solid var(--color-accent-border)",
                fontSize: "0.6875rem",
                color: "var(--color-accent)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Semester {student?.semester || 3} · {student?.department || "CSE AIML"}
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "6px" }}>
              Welcome back, {student?.name || "Student"}
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              Your attendance and academic performance are tracked in real time.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={onTriggerVerify}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <ScanLine size={15} strokeWidth={2.5} />
              Mark Attendance
            </button>
            <div
              className="card"
              style={{ padding: "10px 16px" }}
            >
              <div className="label-xs" style={{ marginBottom: "2px" }}>Roll Number</div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-accent)", fontFamily: "'JetBrains Mono', monospace" }}>
                {student?.roll_number || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <KpiCard
          label="Attendance Rate"
          value={`${attendancePct}%`}
          sub={`${attendance?.present_classes ?? 0} of ${attendance?.total_classes ?? 0} sessions`}
          icon={UserCheck}
          color="var(--color-accent)"
          ring={attendancePct}
        />
        <KpiCard
          label="Quiz Average"
          value={quizAvg}
          sub={`${Math.round((quizAvg / 20) * 100)}% cumulative`}
          icon={Award}
          color="var(--color-accent)"
        />
        <KpiCard
          label="Assignment Avg"
          value={assignAvg}
          sub={`${Math.round((assignAvg / 20) * 100)}% rating`}
          icon={BookOpen}
          color="var(--color-warning)"
        />
        <div
          className="card card-hover"
          style={{ padding: "20px", borderLeft: "3px solid var(--color-purple)" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <span className="label-xs" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Sparkles size={11} style={{ color: "var(--color-purple)" }} />
              ML Prediction
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                padding: "2px 7px",
                borderRadius: "9999px",
                background: "var(--color-purple-dim)",
                color: "var(--color-purple)",
                border: "1px solid var(--color-purple-border)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
              }}
            >
              RF Model
            </span>
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "var(--radius-md)",
              background: `color-mix(in srgb, ${tierColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${tierColor} 25%, transparent)`,
              color: tierColor,
              fontSize: "0.9375rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {tier}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
            Random Forest Classifier
          </p>
        </div>
      </div>

      {/* Chart + ML panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          {/* Bar Chart */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "2px" }}>Subject Performance</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Quiz scores vs assignment grades</p>
              </div>
              <div style={{ display: "flex", gap: "14px", fontSize: "0.6875rem", fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--color-text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--color-accent)", display: "inline-block" }} />
                  Quiz
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--color-text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--color-purple)", display: "inline-block" }} />
                  Assignment
                </span>
              </div>
            </div>
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 20]} stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-accent-dim)" }} />
                  <Bar dataKey="quizScore" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="assignScore" fill="var(--color-purple)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ML Weight Panel */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Sparkles size={15} style={{ color: "var(--color-purple)" }} />
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>ML Feature Weights</h3>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
              Random Forest model classification factors
            </p>
            {[
              { label: "Attendance (40%)", value: attendancePct, color: "var(--color-accent)" },
              { label: "Quiz Score (30%)", value: (quizAvg / 20) * 100, color: "var(--color-purple)" },
              { label: "Assignments (30%)", value: (assignAvg / 20) * 100, color: "var(--color-warning)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span className="label-xs">{label}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(value)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent-dim)",
                border: "1px solid var(--color-accent-border)",
                fontSize: "0.75rem",
                color: "var(--color-accent)",
              }}
            >
              <span style={{ fontWeight: 700 }}>Recommendation:</span> Maintain 90%+ attendance to preserve top-tier classification.
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {[
          { title: "Recent Quizzes", icon: Award, iconColor: "var(--color-accent)", items: quizzes.slice(0, 4), idKey: "quiz_id", scoreColor: "var(--color-accent)" },
          { title: "Recent Assignments", icon: BookOpen, iconColor: "var(--color-warning)", items: assignments.slice(0, 4), idKey: "assignment_id", scoreColor: "var(--color-warning)" },
        ].map(({ title, icon: Icon, iconColor, items, idKey, scoreColor }) => (
          <div key={title} className="card" style={{ padding: "20px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Icon size={15} style={{ color: iconColor }} strokeWidth={2} />
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700 }}>{title}</h3>
            </div>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th style={{ textAlign: "right" }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item[idKey]}>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                    <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{item.subject}</td>
                    <td style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: scoreColor }}>
                      {item.score}/{item.total_marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
