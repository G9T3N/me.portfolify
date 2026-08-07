export default function Forbidden() {
  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#E11D48", fontSize: "36px" }}>403 - Forbidden</h1>
      <p style={{ color: "#4B5563", fontSize: "18px", margin: "20px 0" }}>
        You do not have the required administrative permissions to access this area.
      </p>
      <a href="/" style={{ color: "#2563EB", textDecoration: "underline" }}>
        Return Home
      </a>
    </div>
  );
}
