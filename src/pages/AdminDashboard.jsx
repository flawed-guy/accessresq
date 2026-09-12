import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../auth/AuthContext";

export default function AdminDashboard() {
  const { profile } = useAuth();

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <span className="eyebrow">ACCESSRESQ ADMIN</span>

          <h1>Admin Command Center</h1>

          <p>
            Welcome, {profile?.name || "Administrator"}.
          </p>
        </div>

        <button
          className="secondary"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>

      <div className="grid">
        <div className="card">
          <h2>🚨 Emergencies</h2>
          <h3>0</h3>
          <p>Active emergencies</p>
        </div>

        <div className="card">
          <h2>🚑 Responders</h2>
          <h3>0</h3>
          <p>Responders currently online</p>
        </div>

        <div className="card">
          <h2>🛣️ Road Management</h2>

          <p>
            Open or close campus roads and paths.
          </p>

          <button className="primary">
            Manage Roads
          </button>
        </div>

        <div className="card">
          <h2>🗺️ Campus Map</h2>

          <p>
            Manage VIT buildings, roads,
            accessibility paths and closures.
          </p>

          <button className="primary">
            Manage Campus Map
          </button>
        </div>

        <div className="card">
          <h2>🏥 Hospitals</h2>

          <p>
            Manage emergency-capable hospitals
            used for routing.
          </p>

          <button className="primary">
            Manage Hospitals
          </button>
        </div>

        <div className="card">
          <h2>👥 User Management</h2>

          <p>
            Manage responders and administrator access.
          </p>

          <button className="primary">
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
}