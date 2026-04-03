import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [meetingCode, setMeetingCode] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user || !token) {
    return <h2>Please login first</h2>;
  }

  const handleCreateSession = async () => {
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/session/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Session creation failed");
        return;
      }

      setSessionData(data.session);
      setMessage("Session created successfully");
    } catch {
      setError("Server error");
    }
  };

  const handleJoinSession = async () => {
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/session/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ meetingCode: meetingCode.trim() }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Join failed");
        return;
      }

      setSessionData(data.session);
      setMessage("Joined session successfully");
      navigate(`/room/${data.session.meetingCode}`);
    } catch {
      setError("Server error");
    }
  };

  const handleGoToRoom = () => {
    if (sessionData?.meetingCode) {
      navigate(`/room/${sessionData.meetingCode}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1f2937",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>Dashboard</h1>
          <p style={{ margin: "6px 0 0 0", color: "#9ca3af" }}>
            Welcome, {user.name} ({user.role})
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          maxWidth: "700px",
          background: "#1f2937",
          borderRadius: "12px",
          padding: "24px",
          margin: "0 auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "18px" }}>Session Control</h2>

        {user.role === "mentor" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#d1d5db" }}>
              Create a new mentoring session and share the meeting code with
              your mentee.
            </p>

            <button
              onClick={handleCreateSession}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Create Session
            </button>
          </div>
        )}

        {user.role === "student" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#d1d5db" }}>
              Enter the meeting code shared by your mentor to join the session.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #4b5563",
                  background: "#374151",
                  color: "white",
                }}
              />

              <button
                onClick={handleJoinSession}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                Join Session
              </button>
            </div>
          </div>
        )}

        {sessionData && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: "10px",
              padding: "18px",
              marginTop: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Session Info</h3>
            <p>
              <strong>Meeting Code:</strong> {sessionData.meetingCode}
            </p>
            <p>
              <strong>Status:</strong> {sessionData.status}
            </p>

            {user.role === "mentor" && (
              <button
                onClick={handleGoToRoom}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Enter Room
              </button>
            )}
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#065f46",
              color: "#d1fae5",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#7f1d1d",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
