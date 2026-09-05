import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Search
} from "lucide-react";
import { getStudentAssignments } from "../../services/api";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getStudentAssignments()
      .then((data) => {
        setAssignments(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-amber-300">Loading Practical Assignment Records...</p>
      </div>
    );
  }

  const avgScore =
    assignments.length > 0
      ? (assignments.reduce((acc, a) => acc + a.score, 0) / assignments.length).toFixed(1)
      : 0;

  const highestScore =
    assignments.length > 0
      ? Math.max(...assignments.map((a) => a.score))
      : 0;

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-amber-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-[11px] font-mono text-amber-300">
            <BookOpen className="w-3.5 h-3.5" />
            PRACTICAL & LAB ASSIGNMENTS
          </div>
          <h1 className="text-3xl font-extrabold text-white">Coursework & Lab Submissions</h1>
          <p className="text-sm text-slate-300">
            Monitor coursework grades, practical code implementations, and project evaluations.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Submissions</span>
          <div className="text-3xl font-black text-white mt-2">{assignments.length} Projects</div>
          <p className="text-xs text-slate-500 mt-1 font-mono">100% on-time completion</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-400">Practical Average</span>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {avgScore} <span className="text-sm font-normal text-slate-400">/ 20</span>
          </div>
          <p className="text-xs text-amber-500/80 mt-1 font-mono">
            {Math.round((avgScore / 20) * 100)}% Grade Rating
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-400">Top Evaluation</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {highestScore} <span className="text-sm font-normal text-slate-400">/ 20</span>
          </div>
          <p className="text-xs text-emerald-500/80 mt-1 font-mono">Highest Marks Awarded</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white">Graded Submissions Registry</h3>
            <p className="text-xs text-slate-400">Code repositories, lab reports, and evaluation outcomes</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assignment..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((a) => {
            const pct = Math.round((a.score / a.total_marks) * 100);
            return (
              <div
                key={a.assignment_id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      {a.subject}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                      {a.title}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black font-mono text-amber-400">
                      {a.score}
                      <span className="text-xs font-normal text-slate-500">/{a.total_marks}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{pct}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(a.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Graded & Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
