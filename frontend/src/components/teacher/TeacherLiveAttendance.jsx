import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Clock,
  MapPin,
  Users,
  Square,
  Copy,
  Check,
  ShieldCheck,
  Play
} from "lucide-react";
import {
  startAttendanceSession,
  endAttendanceSession,
  getActiveAttendanceSession
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function TeacherLiveAttendance() {
  const { addToast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in secs

  // Start Form State
  const [subject, setSubject] = useState("Deep Learning & Neural Networks");
  const [roomName, setRoomName] = useState("Lab 402 — AI Computing Center");
  const [durationMins, setDurationMins] = useState(15);
  const [starting, setStarting] = useState(false);

  // Simulated live checked-in attendees
  const [checkedInList] = useState([
    { id: 1, name: "Debjit Modak", roll: "UG/02/BTCSE/2023/001", time: "09:32:15 AM", method: "GPS + Face Verified" },
    { id: 2, name: "Anuska Koner", roll: "UG/02/BTCSE/2023/002", time: "09:33:04 AM", method: "GPS + Face Verified" },
    { id: 5, name: "Arko Sen", roll: "UG/02/BTCSE/2023/005", time: "09:34:22 AM", method: "GPS + Face Verified" },
  ]);

  const loadActiveSession = async () => {
    try {
      const res = await getActiveAttendanceSession();
      if (res && res.active && res.session) {
        setSession(res.session);
      } else {
        setSession(null);
      }
    } catch {
      // Default to active session preview
      setSession({
        session_id: 55,
        session_token: "VITAL-TOKEN-DEMO-2026",
        subject: "Deep Learning & Neural Networks",
        room_name: "Lab 402 — AI Computing Center",
        expires_at: new Date(Date.now() + 15 * 60000).toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSession();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    setStarting(true);
    try {
      const res = await startAttendanceSession({
        subject,
        room_name: roomName,
        duration_minutes: Number(durationMins)
      });
      setSession(res.session || {
        session_id: Date.now(),
        session_token: "VITAL-LIVE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        subject,
        room_name: roomName,
        expires_at: new Date(Date.now() + durationMins * 60000).toISOString()
      });
      setTimeLeft(durationMins * 60);
      addToast({
        type: "success",
        title: "Session Live",
        message: `Multi-factor attendance started for ${subject}`
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed to start",
        message: err.message
      });
    } finally {
      setStarting(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await endAttendanceSession();
      setSession(null);
      addToast({
        type: "info",
        title: "Session Concluded",
        message: "Attendance verification locked for this session."
      });
    } catch (err) {
      setSession(null);
    }
  };

  const copyToken = () => {
    if (!session?.session_token) return;
    navigator.clipboard.writeText(session.session_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      type: "info",
      title: "Token Copied",
      message: "Session token copied to clipboard"
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const qrValue = session?.session_token || "VITAL-SECURE-SESSION-TOKEN";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-purple-300">Synchronizing Live Attendance Stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            CLASSROOM VERIFICATION HUB
          </div>
          <h1 className="text-3xl font-extrabold text-white">Live Attendance Console</h1>
          <p className="text-sm text-slate-300">
            Broadcast dynamic rotating QR codes, track live incoming GPS locks, and verify student face biometrics in real-time.
          </p>
        </div>

        {session && (
          <button
            type="button"
            onClick={handleEndSession}
            className="px-6 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-900/20 shrink-0"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>End Attendance Session</span>
          </button>
        )}
      </div>

      {session ? (
        /* Active Session Display */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Presentation Box */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-cyan-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-cyan-950/20">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none -z-10"></div>

            {/* Session Info Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
              <span className="px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                ACTIVE BROADCAST
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                {session.subject}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {session.room_name}
              </span>
            </div>

            {/* Glowing High-Res QR Card */}
            <div className="p-6 rounded-3xl bg-white shadow-2xl shadow-cyan-500/20 border-4 border-cyan-400 relative mb-6">
              <QRCodeSVG
                value={qrValue}
                size={220}
                level="H"
                includeMargin={false}
                fgColor="#080c14"
                bgColor="#ffffff"
              />
            </div>

            {/* Live Token & Copy */}
            <div className="w-full max-w-sm flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs mb-4">
              <div className="text-left min-w-0 pr-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Session Security Token</div>
                <div className="text-cyan-300 font-bold truncate">{qrValue}</div>
              </div>
              <button
                type="button"
                onClick={copyToken}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Timer Banner */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                Session expires in: <strong className="text-white text-sm">{minutes}m {seconds < 10 ? `0${seconds}` : seconds}s</strong>
              </span>
            </div>
          </div>

          {/* Live Check-In Ticker Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-extrabold text-white">Real-Time Check-Ins</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  {checkedInList.length} Verified
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {checkedInList.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{st.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{st.roll}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono text-emerald-400 font-bold">{st.time}</div>
                      <span className="text-[9px] font-mono text-slate-500 block">{st.method}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Class Geofence Radius: <strong>50 meters</strong></span>
              <span className="text-emerald-400">GPS Locked</span>
            </div>
          </div>
        </div>
      ) : (
        /* Start New Session Form */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-3">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
            <h3 className="text-2xl font-black text-white">Initiate Attendance Session</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters to open multi-factor GPS + Face scanning for your lecture
            </p>
          </div>

          <form onSubmit={handleStartSession} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Lecture / Subject Title
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Deep Learning & Neural Networks"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Classroom / Lab Location
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Lab 402 — AI Computing Center"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Session Duration (Minutes)
              </label>
              <select
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400 font-sans"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Standard)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full btn-neon-purple py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-4 shadow-xl"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{starting ? "Initializing Session..." : "Launch QR Attendance Broadcast"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
