import React, { useState } from "react";
import {
  Award,
  BookOpen,
  PlusCircle,
  Save
} from "lucide-react";
import {
  createTeacherQuiz,
  createTeacherAssignment,
  recordQuizScore,
  recordAssignmentScore
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function TeacherEvaluationManager() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz' | 'assignment'

  // Create Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Deep Learning & Neural Networks");
  const [totalMarks, setTotalMarks] = useState(20);
  const [creating, setCreating] = useState(false);

  // Score Entry State
  const [studentId, setStudentId] = useState(1);
  const [itemId, setItemId] = useState(1);
  const [score, setScore] = useState(18.5);
  const [recording, setRecording] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (activeTab === "quiz") {
        await createTeacherQuiz({ title, subject, total_marks: Number(totalMarks) });
        addToast({
          type: "success",
          title: "Quiz Created",
          message: `Published "${title}" for ${subject}`
        });
      } else {
        await createTeacherAssignment({ title, subject, total_marks: Number(totalMarks) });
        addToast({
          type: "success",
          title: "Assignment Published",
          message: `Created assignment "${title}"`
        });
      }
      setTitle("");
    } catch (err) {
      addToast({
        type: "error",
        title: "Creation Error",
        message: err.message
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRecordScore = async (e) => {
    e.preventDefault();
    setRecording(true);
    try {
      if (activeTab === "quiz") {
        await recordQuizScore({
          student_id: Number(studentId),
          item_id: Number(itemId),
          score: Number(score)
        });
        addToast({
          type: "success",
          title: "Quiz Score Saved",
          message: `Recorded ${score}/20 for student #${studentId}`
        });
      } else {
        await recordAssignmentScore({
          student_id: Number(studentId),
          item_id: Number(itemId),
          score: Number(score)
        });
        addToast({
          type: "success",
          title: "Assignment Score Saved",
          message: `Recorded ${score}/20 for student #${studentId}`
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Error Saving Score",
        message: err.message
      });
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <Award className="w-3.5 h-3.5" />
            ACADEMIC EVALUATION & GRADING
          </div>
          <h1 className="text-3xl font-extrabold text-white">Grading & Assessment Hub</h1>
          <p className="text-sm text-slate-300">
            Create new continuous evaluation modules and input student score records to feed the Random Forest ML pipeline.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "quiz"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Quiz Manager</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assignment")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "assignment"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Assignment Manager</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creator Form */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/80">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">
                Create New {activeTab === "quiz" ? "Quiz Module" : "Coursework Assignment"}
              </h3>
              <p className="text-xs text-slate-400">Publish item to students for continuous assessment</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                {activeTab.toUpperCase()} Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  activeTab === "quiz"
                    ? "e.g. Convolutional Neural Networks Architecture Quiz"
                    : "e.g. Fine-Tuning ResNet-50 on ImageNet Dataset"
                }
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full btn-neon-cyan py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-4 shadow-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{creating ? "Publishing..." : `Publish ${activeTab === "quiz" ? "Quiz" : "Assignment"}`}</span>
            </button>
          </form>
        </div>

        {/* Grade Entry Console */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/80">
            <Save className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Record Student Marks</h3>
              <p className="text-xs text-slate-400">Update student grades and trigger real-time AI recalibration</p>
            </div>
          </div>

          <form onSubmit={handleRecordScore} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Select Student
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400 font-sans"
              >
                <option value={1}>Debjit Modak (Roll 1)</option>
                <option value={2}>Anuska Koner (Roll 2)</option>
                <option value={3}>Argha Dutta (Roll 3)</option>
                <option value={4}>Afroj Mallick (Roll 4)</option>
                <option value={5}>Arko Sen (Roll 5)</option>
                <option value={6}>Mrittika Roy (Roll 6)</option>
                <option value={7}>Utsab Banerjee (Roll 7)</option>
                <option value={8}>Azad Mondal (Roll 8)</option>
                <option value={9}>Norchen Tamang (Roll 9)</option>
                <option value={10}>Rangon Das (Roll 10)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                {activeTab.toUpperCase()} Module ID
              </label>
              <input
                type="number"
                value={itemId}
                onChange={(e) => setItemId(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Score Awarded (Max 20)
              </label>
              <input
                type="number"
                step="0.5"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                min="0"
                max="20"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={recording}
              className="w-full btn-neon-purple py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-4 shadow-xl"
            >
              <Save className="w-4 h-4" />
              <span>{recording ? "Saving Score..." : "Commit Score to Ledger"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
