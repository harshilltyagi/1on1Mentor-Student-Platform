import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      setMessage("Signup successful");
      navigate("/");
    } catch (error) {
      console.log(error);
      setError("Server error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #111827, #1f2937)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#1f2937",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          color: "white",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: "8px", fontSize: "30px" }}>
          Create Account
        </h1>
        <p style={{ marginTop: 0, marginBottom: "24px", color: "#9ca3af" }}>
          Sign up to start your mentoring session
        </p>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #4b5563",
                background: "#111827",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #4b5563",
                background: "#111827",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #4b5563",
                background: "#111827",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #4b5563",
                background: "#111827",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            Sign Up
          </button>
        </form>

        {message && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px",
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
              marginBottom: "12px",
              padding: "10px",
              borderRadius: "8px",
              background: "#7f1d1d",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        <p style={{ marginTop: "16px", color: "#d1d5db" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#60a5fa", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
