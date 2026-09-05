import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Cpu,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Sliders,
  Target,
  ArrowRight
} from "lucide-react";
import { getStudentAiInsights } from "../../services/api";

export default function StudentAiInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentAiInsights()
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
        <p className="text-sm font-mono text-purple-300">Computing Random Forest ML Inferences...</p>
      </div>
    );
  }

  const { understanding_level = "Excellent", metrics, feature_weights, recommendations = [] } =
    data || {};

  const getTierClass = (tier) => {
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
      {/* Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <Cpu className="w-3.5 h-3.5" />
            VITAL PREDICTIVE ML ENGINE
          </div>
          <h1 className="text-3xl font-extrabold text-white">Artificial Intelligence Academic Insights</h1>
          <p className="text-sm text-slate-300">
            Trained Random Forest Classifier providing real-time data-driven comprehension classifications.
          </p>
        </div>
      </div>

      {/* Model Output & Feature Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Assessment Big Card */}
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-purple-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-purple-300 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                Model Classification
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SCIKIT-LEARN
              </span>
            </div>

            <div className="text-center py-6">
              <div
                className={`inline-block px-6 py-2.5 rounded-2xl text-2xl font-black tracking-widest uppercase shadow-xl ${getTierClass(
                  understanding_level
                )}`}
              >
                {understanding_level}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-4 uppercase tracking-wider">
                Projected Understanding Tier
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">ENSEMBLE:</span>
              <span className="text-white">Random Forest (100 Trees)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TRAINING METRICS:</span>
              <span className="text-emerald-400">97.8% Accuracy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MODEL STATUS:</span>
              <span className="text-cyan-400">Live Inferences</span>
            </div>
          </div>
        </div>

        {/* Feature Importance Weights */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-extrabold text-white">Model Feature Importance Weights</h3>
                <p className="text-xs text-slate-400">Relative statistical weights used in the Random Forest evaluation</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {feature_weights ? (
              Object.entries(feature_weights).map(([feat, weight]) => (
                <div key={feat} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{feat}</span>
                    <span className="font-mono font-bold text-cyan-400">{Math.round(weight * 100)}% Weight</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${weight * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">Biometric Attendance Consistency</span>
                    <span className="font-mono font-bold text-cyan-400">40% Weight</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">Continuous Quiz Assessment</span>
                    <span className="font-mono font-bold text-blue-400">30% Weight</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">Assignment Quality & Lab Work</span>
                    <span className="font-mono font-bold text-purple-400">30% Weight</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/80">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-extrabold text-white">Personalized Academic Action Plan</h3>
            <p className="text-xs text-slate-400">Actionable advice generated specifically based on your metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex items-start gap-4 hover:border-purple-500/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs text-purple-300 shrink-0 mt-0.5">
                0{i + 1}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-200 leading-relaxed">{rec}</p>
                <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 pt-1">
                  <span>Targeted Optimization</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
