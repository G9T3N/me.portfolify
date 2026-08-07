import { useState } from "react";
import { authClient } from "@mrerr/auth/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const callbackUrl = searchParams.get("callbackUrl") || "/";

      if (isRegister) {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (signUpError) {
          setError(signUpError.message || "Registration failed");
        } else {
          setSuccess("Account created! Please check your console/email to verify your account.");
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || "Invalid credentials");
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "30px",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        fontFamily: "sans-serif",
      }}
    >
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}
      >
        {isRegister ? "Create Account" : "Sign In"}
      </h2>

      {error && (
        <div
          style={{
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: "#D1FAE5",
            color: "#065F46",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "5px" }}
            >
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "5px" }}
          >
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "5px" }}
          >
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          {loading ? "Processing..." : isRegister ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <div style={{ textAlign: "center", fontSize: "14px" }}>
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
            setSuccess(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#2563EB",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {isRegister ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
