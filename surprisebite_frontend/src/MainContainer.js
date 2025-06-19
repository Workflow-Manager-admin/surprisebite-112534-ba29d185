import React from "react";
import "./App.css";

/**
 * MainContainer: Stateful root component for the SurpriseBite web app.
 * Acts as the central hub for restaurant discovery, filtering, surprise selection, and UI.
 *
 * Sections:
 *  - Filters: User filter controls (cuisine, price, rating, etc.)
 *  - Info Display: Chosen restaurant info and results area
 *  - Actions: Main buttons (Surprise Me, Refresh, etc.)
 * 
 * Brand colors can be used via App.css CSS variables (e.g., var(--base-light), var(--base-dark), etc.).
 *
 * Future logic for: API calls, state handling, event handlers, etc.
 */
// PUBLIC_INTERFACE
function MainContainer() {
  return (
    <div className="container" style={{ marginTop: 56, marginBottom: 40 }}>
      {/* Filters Section */}
      <section
        style={{
          background: "var(--base-dark)",
          borderRadius: 8,
          padding: "24px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "var(--base-light)", margin: 0, fontSize: "1.15rem" }}>Filters</h2>
        {/* TODO: Filtering options (cuisine, price, rating, location input) */}
        <div style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
          [Filter controls here soon!]
        </div>
      </section>

      {/* Restaurant Info Section */}
      <section
        style={{
          background: "var(--base-light)",
          borderRadius: 10,
          color: "var(--text-color)",
          padding: "40px 26px",
          marginBottom: 24,
          boxShadow: "0 2px 18px rgba(60,202,240,0.09)",
          minHeight: 130
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Restaurant Info</h2>
        {/* TODO: Restaurant display goes here */}
        <div style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          [Your surprise restaurant will appear here!]
        </div>
      </section>

      {/* Action Buttons Section */}
      <section
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        {/* TODO: Main action buttons (Surprise Me, Try Another, etc.) */}
        <button className="btn btn-large" style={{ minWidth: 150 }}>
          Surprise Me!
        </button>
        <button className="btn" style={{ background: "var(--base-dark)", color: "var(--base-light)" }}>
          Refresh
        </button>
        {/* Add additional action buttons as needed */}
      </section>
    </div>
  );
}

export default MainContainer;
