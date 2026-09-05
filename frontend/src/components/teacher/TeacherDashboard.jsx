import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Award,
  BookOpen,
  QrCode,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import { getTeacherDashboard } from "../../services/api";

export default function TeacherDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherDashboard()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-purple-300">Loading Faculty Intelligence Command Center...</p>
      </div>
    );
  }

  const {
    teacher,
    metrics,
    active_session,
    understanding_distribution = {},
    students_needing_attention = [],
    recent_students = []
  } = data || {};

  const distData = Object.entries(understanding_distribution).map(([key, value]) => ({
    name: key,
    count: value,
    color:
      key === "Excellent"
        ? "#34d399"
        : key === "Good"
        ? "#38bdf8"
        : key === "Average"
        ? "#fbbf24"
        : "#f87171"
  }));

  const getTierBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case "excellent":
        return "badge-excellent";
      case "good":
        return "badge-good";
      case "average":
        return "badge-average";
      default:
        return "badge-poor";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Faculty Command Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            FACULTY COMMAND · {teacher?.department || "CSE AIML"}
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, <span className="gradient-text-purple">{teacher?.name || "Professor"}</span>.
          </h1>
          <p className="text-sm text-slate-300">
            Real-time biometric attendance monitor, predictive ML comprehension models, and student grading console.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("teacher_attendance")}
          className="btn-neon-purple px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-bold shadow-xl shadow-purple-500/25 shrink-0 group"
        >
          <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>{active_session ? "● Manage Live Attendance Session" : "▶ Start Attendance Session"}</span>
          <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Total Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{metrics?.total_students || 10}</div>
          <p className="text-xs text-slate-400 mt-1 font-mono">CSE AIML · Semester 3</p>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Class Attendance Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400">{metrics?.average_attendance || 86.4}%</div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Biometric GPS Verified</p>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Class Quiz Average
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-400">
            {metrics?.average_quiz_score || 16.8}
            <span className="text-sm font-normal text-slate-500">/20</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Across All Subjects</p>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Assignment Average
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {metrics?.average_assignment_score || 17.2}
            <span className="text-sm font-normal text-slate-500">/20</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Practical Lab Tasks</p>
        </div>
      </div>

      {/* Distribution & Risk Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Distribution Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-extrabold text-white">AI Comprehension Distribution</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300">Random Forest</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-recharts-tooltip text-xs">
                          <p className="font-bold text-white mb-1">{payload[0].payload.name} Tier</p>
                          <p className="text-cyan-400">{payload[0].value} Students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* At-Risk Students Matrix */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-900 via-rose-950/10 to-slate-900">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-extrabold text-white">Students Requiring Attention</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {students_needing_attention.length} Flagged
            </span>
          </div>

          <div className="space-y-3">
            {students_needing_attention.length > 0 ? (
              students_needing_attention.map((st) => (
                <div
                  key={st.student_id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-rose-500/40 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{st.name}</h4>
                    <p className="text-[10px] font-mono text-slate-400">{st.roll_number}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                      {st.reason}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-extrabold text-rose-400">
                      {st.attendance_pct}%
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Attendance</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                All enrolled students currently meet academic thresholds.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Roster Table Preview */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-extrabold text-white">Student Performance Roster</h3>
            <p className="text-xs text-slate-400">Real-time enrolled student academic overview</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("teacher_students")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <span>View Complete Roster</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Attendance</th>
                <th>Quiz Avg</th>
                <th>Assign Avg</th>
                <th className="text-right">ML Tier</th>
              </tr>
            </thead>
            <tbody>
              {recent_students.map((st) => (
                <tr key={st.student_id}>
                  <td className="font-semibold text-white">{st.name}</td>
                  <td className="font-mono text-xs text-slate-400">{st.roll_number}</td>
                  <td className="font-mono font-bold text-cyan-400">{st.attendance_pct}%</td>
                  <td className="font-mono text-xs text-blue-300">{st.quiz_avg}/20</td>
                  <td className="font-mono text-xs text-amber-300">{st.assign_avg}/20</td>
                  <td className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getTierBadge(st.understanding_level)}`}>
                      {st.understanding_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
