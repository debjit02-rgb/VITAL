import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  QrCode,
  ScanFace
} from "lucide-react";
import { getStudentAttendance } from "../../services/api";

export default function StudentAttendance({ onTriggerVerify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getStudentAttendance()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-cyan-300">Loading Biometric Verification Ledger...</p>
      </div>
    );
  }

  const records = data?.records || [];
  const summary = data?.summary || {
    total: records.length,
    present: records.filter((r) => r.status === "Present").length,
    absent: records.filter((r) => r.status === "Absent").length,
    rate: 91.7,
  };

  const filteredRecords =
    filter === "All" ? records : records.filter((r) => r.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-cyan-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            MULTI-FACTOR BIOMETRIC LEDGER
          </div>
          <h1 className="text-3xl font-extrabold text-white">Attendance Verification Ledger</h1>
          <p className="text-sm text-slate-300">
            Session-by-session cryptographically verified attendance secured by Geolocation, Dynamic QR, and Face Encodings.
          </p>
        </div>

        <button
          type="button"
          onClick={onTriggerVerify}
          className="btn-neon-cyan px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-cyan-500/25 shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Launch Verification Wizard</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">
            Total Enrolled Sessions
          </span>
          <div className="text-3xl font-black text-white mt-2">{summary.total}</div>
          <p className="text-xs text-slate-500 mt-1 font-mono">Academic Semester 3</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Present
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{summary.present}</div>
          <p className="text-xs text-emerald-500/80 mt-1 font-mono">Full Biometric Match</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Sessions Absent
          </span>
          <div className="text-3xl font-black text-rose-400 mt-2">{summary.absent}</div>
          <p className="text-xs text-rose-500/80 mt-1 font-mono">Missed or Unverified</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-cyan-300">
            Attendance Rate
          </span>
          <div className="text-3xl font-black text-cyan-400 mt-2">{summary.rate}%</div>
          <p className="text-xs text-cyan-500/80 mt-1 font-mono">
            {summary.rate >= 75 ? "Above 75% Threshold (Good)" : "Warning: Below 75%"}
          </p>
        </div>
      </div>

      {/* Attendance Ledger Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white">Biometric Attendance History</h3>
            <p className="text-xs text-slate-400">Timestamped verification logs with security pipeline status</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {["All", "Present", "Absent"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Verification Method</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.attendance_id}>
                  <td className="font-mono text-xs text-slate-400">#{r.session_id || r.attendance_id}</td>
                  <td className="font-semibold text-white">{r.subject || "CSE AIML Lecture"}</td>
                  <td className="font-mono text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(r.marked_at).toLocaleDateString()}</span>
                      <span className="text-slate-500">·</span>
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(r.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <QrCode className="w-3 h-3 text-purple-400" />
                      <ScanFace className="w-3 h-3 text-emerald-400" />
                      <span>{r.method || "GPS + QR + Face"}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        r.status === "Present"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {r.status === "Present" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 font-mono text-xs">
                    No attendance records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
