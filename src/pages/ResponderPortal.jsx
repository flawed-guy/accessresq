import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../auth/AuthContext";

export default function ResponderPortal() {
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
          <span className="eyebrow">ACCESSRESQ</span>
          <h1>Responder Command Center</h1>
          <p>
            Welcome, {profile?.name || "Responder"}.
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
          <h2>🚨 Active Emergencies</h2>
          <p>
            Emergencies assigned to you will appear here.
          </p>

          <div className="emptyState">
            No emergencies assigned yet.
          </div>
        </div>

        <div className="card">
          <h2>📍 Navigation</h2>
          <p>
            Your fastest and accessibility-aware route
            will appear here when an emergency is accepted.
          </p>

          <button className="primary">
            Open Campus Map
          </button>
        </div>

        <div className="card">
          <h2>🏥 Hospital</h2>
          <p>
            After reaching the victim, AccessResQ will
            provide a route to the most suitable hospital.
          </p>
        </div>

        <div className="card">
          <h2>🔄 Response Status</h2>

          <div className="statusList">
            <div>Waiting for emergency</div>
            <div>Accept → En Route → Arrived → Hospital → Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
}