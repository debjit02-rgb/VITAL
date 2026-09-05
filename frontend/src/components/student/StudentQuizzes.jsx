import React, { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Search
} from "lucide-react";
import { getStudentQuizzes } from "../../services/api";

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getStudentQuizzes()
      .then((data) => {
        setQuizzes(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-cyan-300">Loading Quiz Assessments...</p>
      </div>
    );
  }

  const avgScore =
    quizzes.length > 0
      ? (quizzes.reduce((acc, q) => acc + q.score, 0) / quizzes.length).toFixed(1)
      : 0;

  const highestScore =
    quizzes.length > 0
      ? Math.max(...quizzes.map((q) => q.score))
      : 0;

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-blue-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-blue-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[11px] font-mono text-blue-300">
            <Award className="w-3.5 h-3.5" />
            CONTINUOUS QUIZ EVALUATION
          </div>
          <h1 className="text-3xl font-extrabold text-white">Academic Quizzes & Checkpoints</h1>
          <p className="text-sm text-slate-300">
            Track performance metrics, question checkpoints, and cumulative scoring across all enrolled subjects.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Completed</span>
          <div className="text-3xl font-black text-white mt-2">{quizzes.length} Quizzes</div>
          <p className="text-xs text-slate-500 mt-1 font-mono">100% submission rate</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">Average Score</span>
          <div className="text-3xl font-black text-cyan-400 mt-2">
            {avgScore} <span className="text-sm font-normal text-slate-400">/ 20</span>
          </div>
          <p className="text-xs text-cyan-500/80 mt-1 font-mono">
            {Math.round((avgScore / 20) * 100)}% Cumulative Grade
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-purple-950/10">
          <span className="text-[11px] font-mono font-bold uppercase text-purple-400">Peak Performance</span>
          <div className="text-3xl font-black text-purple-400 mt-2">
            {highestScore} <span className="text-sm font-normal text-slate-400">/ 20</span>
          </div>
          <p className="text-xs text-purple-500/80 mt-1 font-mono">Highest Recorded Score</p>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white">Evaluated Quiz Registry</h3>
            <p className="text-xs text-slate-400">Detailed test outcomes and percentage rankings</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quiz or subject..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((q) => {
            const pct = Math.round((q.score / q.total_marks) * 100);
            return (
              <div
                key={q.quiz_id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                      {q.subject}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                      {q.title}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black font-mono text-cyan-400">
                      {q.score}
                      <span className="text-xs font-normal text-slate-500">/{q.total_marks}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{pct}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(q.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Evaluated
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
