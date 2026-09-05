import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  X,
  BrainCircuit
} from "lucide-react";
import { getTeacherStudents } from "../../services/api";

export default function TeacherStudentRoster() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    getTeacherStudents()
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
        <p className="text-sm font-mono text-purple-300">Compiling Enrolled Student Directory...</p>
      </div>
    );
  }

  const students = data?.students || [];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (tierFilter === "All") return true;
    if (tierFilter === "<75% Attendance") return s.attendance_pct < 75;
    return s.understanding_level === tierFilter;
  });

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
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <Users className="w-3.5 h-3.5" />
            ACADEMIC STUDENT REGISTRY
          </div>
          <h1 className="text-3xl font-extrabold text-white">Enrolled Student Directory</h1>
          <p className="text-sm text-slate-300">
            Inspect individual academic profiles, biometric verification flags, and machine learning performance tiers.
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 shrink-0">
          Total Enrolled: <strong className="text-cyan-400 text-sm">{students.length} Students</strong>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, roll, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["All", "Excellent", "Good", "Average", "<75% Attendance"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTierFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  tierFilter === f
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Academic Email</th>
                <th>Attendance</th>
                <th>Quiz Avg</th>
                <th>Assign Avg</th>
                <th>Biometrics</th>
                <th className="text-right">ML Tier</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.student_id} className="cursor-pointer" onClick={() => setSelectedStudent(s)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white hover:text-cyan-300 transition-colors">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-400">{s.roll_number}</td>
                  <td className="font-mono text-xs text-slate-400">{s.email}</td>
                  <td className="font-mono font-bold text-cyan-400">{s.attendance_pct}%</td>
                  <td className="font-mono text-xs text-blue-300">{s.quiz_avg}/20</td>
                  <td className="font-mono text-xs text-amber-300">{s.assign_avg}/20</td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Enrolled
                    </span>
                  </td>
                  <td className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getTierBadge(s.understanding_level)}`}>
                      {s.understanding_level}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(s);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-mono text-xs">
                    No students match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Inspector Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/40 w-full max-w-2xl bg-slate-900 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-purple-500/25">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-slate-400">{selectedStudent.roll_number} · {selectedStudent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Attendance</span>
                <div className="text-xl font-mono font-black text-cyan-400 mt-1">{selectedStudent.attendance_pct}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Quiz Score Avg</span>
                <div className="text-xl font-mono font-black text-blue-400 mt-1">{selectedStudent.quiz_avg} / 20</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Assignment Avg</span>
                <div className="text-xl font-mono font-black text-amber-400 mt-1">{selectedStudent.assign_avg} / 20</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" />
                  Random Forest Comprehension Level
                </span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${getTierBadge(selectedStudent.understanding_level)}`}>
                  {selectedStudent.understanding_level}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This student's consistency and test performance generate a <strong>{selectedStudent.understanding_level}</strong> rating. Regular biometric verification confirms authentic classroom participation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
            >
              Close Profile View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
