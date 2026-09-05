import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  startAttendanceSession,
  endAttendanceSession,
  getActiveAttendanceSession
} from "../services/api";

export default function TeacherAttendanceController({ onSessionUpdate }) {
  const [subject, setSubject] = useState("Machine Learning & Neural Networks");
  const [classId, setClassId] = useState("CSE-AIML-SEM3");
  const [roomName, setRoomName] = useState("Main AIML Lab 402");
  const [duration, setDuration] = useState(300); // 5 minutes default

  const [activeSession, setActiveSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [totalStudents, setTotalStudents] = useState(10);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Poll for active session status
  const fetchActiveStatus = async () => {
    try {
      const data = await getActiveAttendanceSession();
      if (data && data.active && data.session) {
        setActiveSession(data.session);
        setAttendees(data.attendees || []);
        setTotalStudents(data.total_class_students || 10);
        setSecondsRemaining(Math.max(0, data.session.seconds_remaining || 0));
      } else {
        setActiveSession(null);
        setAttendees([]);
      }
    } catch (err) {
      console.error("Active session fetch error:", err);
    }
  };

  useEffect(() => {
    fetchActiveStatus();
    const interval = setInterval(fetchActiveStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  // Live countdown timer ticker
  useEffect(() => {
    if (!activeSession || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchActiveStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, secondsRemaining]);

  const handleStartSession = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await startAttendanceSession({
        subject,
        class_id: classId,
        room_name: roomName,
        duration_seconds: duration,
        latitude: 22.572645,
        longitude: 88.363892,
        allowed_radius_meters: 100.0,
      });

      setActiveSession(res.session);
      setSecondsRemaining(duration);
      setAttendees([]);
      setLoading(false);
      if (onSessionUpdate) onSessionUpdate();
    } catch (err) {
      setError(err.message || "Failed to start attendance session");
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    try {
      await endAttendanceSession();
      setActiveSession(null);
      setAttendees([]);
      setSecondsRemaining(0);
      setLoading(false);
      if (onSessionUpdate) onSessionUpdate();
    } catch (err) {
      setError(err.message || "Failed to end session");
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!activeSession?.session_token) return;
    navigator.clipboard.writeText(activeSession.session_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmtTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const qrDataString = activeSession
    ? JSON.stringify({
        token: activeSession.session_token,
        session_id: activeSession.session_id,
        subject: activeSession.subject,
        room: activeSession.room_name,
        expires_at: activeSession.expires_at,
      })
    : "";

  return (
    <div className="teacher-attendance-container">
      {/* SECTION 1: ACTIVE SESSION OR START CONTROLLER */}
      {!activeSession ? (
        <div className="card-panel session-setup-card">
          <div className="panel-header">
            <div>
              <div className="badge-cyan">ATTENDANCE CONTROLLER</div>
              <h3>Launch Live Dynamic QR Attendance Session</h3>
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleStartSession} className="session-form">
            <div className="form-grid">
              <div className="form-group">
                <label>SUBJECT / COURSE</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Machine Learning Lab"
                  required
                />
              </div>

              <div className="form-group">
                <label>CLASS / BATCH</label>
                <input
                  type="text"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  placeholder="e.g. CSE-AIML-SEM3"
                  required
                />
              </div>

              <div className="form-group">
                <label>CLASSROOM / LAB ROOM</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Main AIML Lab 402"
                  required
                />
              </div>

              <div className="form-group">
                <label>SESSION DURATION</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  <option value={120}>2 Minutes (Fast Scan)</option>
                  <option value={300}>5 Minutes (Recommended)</option>
                  <option value={600}>10 Minutes</option>
                  <option value={900}>15 Minutes</option>
                </select>
              </div>
            </div>

            <div className="security-badges-bar">
              <span>✓ GPS Geofence Enforced (100m)</span>
              <span>✓ Single-Use Dynamic QR Token</span>
              <span>✓ Biometric Face Verification Active</span>
            </div>

            <button type="submit" className="btn-primary glow-cyan btn-lg" disabled={loading}>
              {loading ? "Initializing Secure Session..." : "▶ START ATTENDANCE SESSION"}
            </button>
          </form>
        </div>
      ) : (
        /* LIVE ATTENDANCE SESSION DISPLAY */
        <div className="live-session-grid">
          {/* LEFT: DYNAMIC QR CODE DISPLAY */}
          <div className="card-panel qr-display-card">
            <div className="live-indicator-bar">
              <div className="live-dot-pulse"></div>
              <span>LIVE ATTENDANCE SESSION IN PROGRESS</span>
            </div>

            <div className="qr-box-wrapper">
              <div className="qr-svg-container">
                <QRCodeSVG
                  value={qrDataString}
                  size={260}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#0a0e14"
                  includeMargin={true}
                />
              </div>
              <div className="qr-scan-hud-line"></div>
            </div>

            <div className="session-timer-display">
              <span className="timer-label">SESSION EXPIRES IN</span>
              <strong className={`timer-digits ${secondsRemaining < 60 ? "urgent" : ""}`}>
                {fmtTime(secondsRemaining)}
              </strong>
            </div>

            <div className="session-meta-info">
              <div><span>SUBJECT:</span><strong>{activeSession.subject}</strong></div>
              <div><span>ROOM:</span><strong>{activeSession.room_name}</strong></div>
              <div><span>CLASS:</span><strong>{activeSession.class_id}</strong></div>
            </div>

            <div className="qr-actions">
              <button type="button" className="btn-secondary" onClick={copyToken}>
                {copied ? "✓ Token Copied" : "Copy Session Token"}
              </button>
              <button type="button" className="btn-danger" onClick={handleEndSession} disabled={loading}>
                End Session Early
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE VERIFIED ATTENDEES LIST */}
          <div className="card-panel attendees-stream-card">
            <div className="panel-header">
              <div>
                <h3>Real-Time Verified Students</h3>
                <p>Live stream of biometrically authenticated students</p>
              </div>
              <div className="attendee-counter-badge">
                <span className="verified-num">{attendees.length}</span>
                <span className="total-num">/ {totalStudents} Verified</span>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, (attendees.length / totalStudents) * 100)}%` }}
              ></div>
            </div>

            <div className="attendees-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>ROLL</th>
                    <th>CONFIDENCE</th>
                    <th>GPS DISTANCE</th>
                    <th>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a) => (
                    <tr key={a.attendance_id} className="attendee-row-enter">
                      <td className="font-semibold text-cyan">{a.name}</td>
                      <td className="font-mono text-xs">{a.roll_number}</td>
                      <td>
                        <span className="badge-confidence">
                          {a.similarity_score ? `${Math.round(a.similarity_score * 100)}%` : "100%"}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {a.distance_meters !== null ? `${a.distance_meters}m` : "0m"}
                      </td>
                      <td className="font-mono text-xs">
                        {new Date(a.marked_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {attendees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="empty-table-cell">
                        <div className="waiting-spinner"></div>
                        <p>Waiting for students to scan QR and verify face...</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
