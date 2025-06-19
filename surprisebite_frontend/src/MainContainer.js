import React, { useState } from "react";
import "./App.css";

/**
 * MainContainer: Stateful root component for the SurpriseBite web app.
 * Acts as the central hub for restaurant discovery, filtering, surprise selection, and UI.
 *
 * Brand colors can be used via App.css CSS variables (e.g., var(--base-light), var(--base-dark), etc.).
 *
 * Handles location: attempts to use geolocation; uses manual entry (ZIP/city) as fallback.
 */
// PUBLIC_INTERFACE
function MainContainer() {
  // Location state
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | success | manual | error
  const [location, setLocation] = useState(null); // { lat, lon } or { zip, city }
  const [manualInput, setManualInput] = useState({ zip: "", city: "" });
  const [error, setError] = useState(null);

  // For real code, this would go into a useEffect or be handled on load
  const handleLocationAccess = () => {
    setLocationStatus("requesting");
    setError(null);
    if (!navigator.geolocation) {
      // Geolocation not supported
      setLocationStatus("manual");
      setError("Geolocation not available. Please enter your city or ZIP code.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLocationStatus("success");
      },
      (e) => {
        setLocationStatus("manual");
        setError(
          "Couldn't fetch location. Please enter your city or ZIP code."
        );
      },
      { timeout: 10000 }
    );
  };

  // When user submits manual location input
  const handleManualInputSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.zip && !manualInput.city) {
      setError("Please enter a ZIP code or city.");
      return;
    }
    setLocation({
      ...(manualInput.zip ? { zip: manualInput.zip } : {}),
      ...(manualInput.city ? { city: manualInput.city } : {}),
    });
    setLocationStatus("success");
    setError(null);
  };

  // If the user changes the ZIP/city input fields
  const handleManualInputChange = (e) => {
    setManualInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Renders the location access UI and manual fallback
  const renderLocationSection = () => {
    if (locationStatus === "idle" || locationStatus === "error") {
      return (
        <div style={{ marginTop: 8 }}>
          <button
            className="btn"
            style={{ background: "var(--base-light)", color: "#fff", minWidth: 130 }}
            onClick={handleLocationAccess}
            data-testid="get-location-btn"
          >
            Use My Location
          </button>
          {error && (
            <div style={{ color: "#fa6464", fontSize: 13, marginTop: 8 }}>{error}</div>
          )}
        </div>
      );
    }
    if (locationStatus === "requesting") {
      return (
        <div style={{ color: "var(--base-light)", marginTop: 8 }}>
          Fetching your location...
        </div>
      );
    }
    if (locationStatus === "manual") {
      return (
        <form
          style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}
          onSubmit={handleManualInputSubmit}
          data-testid="manual-location-form"
        >
          <input
            type="text"
            placeholder="ZIP code"
            name="zip"
            value={manualInput.zip}
            onChange={handleManualInputChange}
            style={{
              borderRadius: 4,
              border: "1px solid var(--border-color)",
              padding: "7px 8px",
              fontSize: 15,
              width: 100
            }}
          />
          <span style={{ color: "var(--text-secondary)", alignSelf: "center" }}>or</span>
          <input
            type="text"
            placeholder="City"
            name="city"
            value={manualInput.city}
            onChange={handleManualInputChange}
            style={{
              borderRadius: 4,
              border: "1px solid var(--border-color)",
              padding: "7px 8px",
              fontSize: 15,
              width: 140
            }}
          />
          <button
            type="submit"
            className="btn"
            style={{ background: "var(--base-light)", color: "#fff" }}
          >
            Submit
          </button>
          <button
            type="button"
            className="btn"
            style={{
              background: "var(--base-dark)",
              color: "var(--base-light)",
              border: "1px solid var(--base-light)",
              marginLeft: 6
            }}
            onClick={() => {
              setManualInput({ zip: "", city: "" });
              setError(null);
              setLocationStatus("idle");
            }}
          >
            Cancel
          </button>
          {error && (
            <div style={{ color: "#fa6464", fontSize: 13, marginTop: 6, flexBasis: "100%" }}>{error}</div>
          )}
        </form>
      );
    }
    if (locationStatus === "success") {
      // Show the used location (city, zip, or lat/lon)
      return (
        <div style={{ marginTop: 10 }}>
          <span style={{ color: "var(--base-light)", fontWeight: 500 }}>
            {location
              ? location.city
                ? `Location: ${location.city}`
                : location.zip
                ? `ZIP: ${location.zip}`
                : `Using device location (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})`
              : ""}
          </span>
          <button
            className="btn"
            style={{
              background: "var(--base-dark)",
              color: "var(--base-light)",
              marginLeft: 16,
              border: "1px solid var(--base-light)"
            }}
            onClick={() => {
              setLocation(null);
              setLocationStatus("idle");
              setManualInput({ zip: "", city: "" });
              setError(null);
            }}
            data-testid="reset-location"
          >
            Change
          </button>
        </div>
      );
    }
    return null;
  };

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
        <h2 style={{ color: "var(--base-light)", margin: 0, fontSize: "1.15rem" }}>
          Filters
        </h2>
        {/* Location access UI with geolocation + fallback */}
        <div style={{ marginTop: 10, marginBottom: 8, fontSize: 15 }}>
          <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Where are you eating?
          </div>
          {renderLocationSection()}
        </div>
        {/* TODO: Filtering options (cuisine, price, rating) will be added here */}
        <div style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 12 }}>
          [Filter controls coming soon!]
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
          minHeight: 130,
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
        <button
          className="btn"
          style={{ background: "var(--base-dark)", color: "var(--base-light)" }}
        >
          Refresh
        </button>
        {/* Add additional action buttons as needed */}
      </section>
    </div>
  );
}

export default MainContainer;
