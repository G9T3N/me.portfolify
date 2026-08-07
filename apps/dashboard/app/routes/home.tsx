import { useLoaderData } from "react-router";
import { protectLoader } from "@mrerr/auth";
import { authClient } from "@mrerr/auth/client";
// @ts-ignore
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | MRERR" },
    { name: "description", content: "MRERR Platform Dashboard" },
  ];
}

// Server loader protecting the dashboard route (Section 13, 22 & Decision #5)
export async function loader({ request }: { request: Request }) {
  const session = await protectLoader(request);
  return {
    user: session.user,
    session: session.session,
  };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const user = data.user;

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div
      style={{ maxWidth: "600px", margin: "40px auto", padding: "30px", fontFamily: "sans-serif" }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          paddingBottom: "15px",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>MRERR Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#EF4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </header>

      <main
        style={{
          backgroundColor: "#F9FAFB",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "15px" }}>
          Active Session State
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <span style={{ fontWeight: "600", color: "#4B5563", marginRight: "10px" }}>
              User ID:
            </span>
            <code style={{ backgroundColor: "#E5E7EB", padding: "2px 6px", borderRadius: "4px" }}>
              {user.id}
            </code>
          </div>
          <div>
            <span style={{ fontWeight: "600", color: "#4B5563", marginRight: "10px" }}>Name:</span>
            <span>{user.name}</span>
          </div>
          <div>
            <span style={{ fontWeight: "600", color: "#4B5563", marginRight: "10px" }}>Email:</span>
            <span>{user.email}</span>
          </div>
          <div>
            <span style={{ fontWeight: "600", color: "#4B5563", marginRight: "10px" }}>
              Verified:
            </span>
            <span style={{ color: user.emailVerified ? "#059669" : "#D97706", fontWeight: "600" }}>
              {user.emailVerified ? "Yes" : "Pending Verification"}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: "600", color: "#4B5563", marginRight: "10px" }}>Role:</span>
            <span
              style={{
                textTransform: "uppercase",
                backgroundColor: user.role === "admin" ? "#FEE2E2" : "#DBEAFE",
                color: user.role === "admin" ? "#991B1B" : "#1E40AF",
                padding: "2px 8px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {user.role}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
