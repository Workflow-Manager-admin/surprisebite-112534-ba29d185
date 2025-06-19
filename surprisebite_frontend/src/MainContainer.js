import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

import RestaurantCard from "./RestaurantCard";
// Mock restaurant fetcher (simulates an API call)
// PUBLIC_INTERFACE
async function fetchRestaurants({ location, cuisine, price, rating }) {
  /** 
   * This is a placeholder for a real API integration (e.g., Yelp/Google Places)
   * Accepts {location, cuisine, price, rating} as arguments.
   * Returns mock data for demonstration. To integrate a real API,
   * replace this function with actual fetch logic.
   */
  // Mock restaurant DB
  const sampleRestaurants = [
    {
      id: 1,
      name: "Bella Italia",
      cuisine: "italian",
      price: "2",
      rating: 4.5,
      address: "123 Main St",
      city: "San Francisco",
      lat: 37.78,
      lon: -122.41,
    },
    {
      id: 2,
      name: "Sushi Zen",
      cuisine: "japanese",
      price: "3",
      rating: 4.6,
      address: "129 Market St",
      city: "San Francisco",
      lat: 37.7844,
      lon: -122.4076,
    },
    {
      id: 3,
      name: "Taco Veloz",
      cuisine: "mexican",
      price: "1",
      rating: 4.3,
      address: "450 Castro St",
      city: "San Francisco",
      lat: 37.7609,
      lon: -122.435,
    },
    {
      id: 4,
      name: "Curry House",
      cuisine: "indian",
      price: "2",
      rating: 4.1,
      address: "600 Van Ness Ave",
      city: "San Francisco",
      lat: 37.7814,
      lon: -122.4196,
    },
    {
      id: 5,
      name: "Vegan Table",
      cuisine: "vegan",
      price: "2",
      rating: 4.8,
      address: "870 Mission St",
      city: "San Francisco",
      lat: 37.7837,
      lon: -122.4090,
    },
    {
      id: 6,
      name: "Panda Express",
      cuisine: "chinese",
      price: "1",
      rating: 4.0,
      address: "1 Dr Carlton B Goodlett Pl",
      city: "San Francisco",
      lat: 37.7793,
      lon: -122.4192,
    },
    // Add more as wanted...
  ];

  function isNearby(mock, loc) {
    // If user supplied city/zip, just filter by city string
    if (loc?.city) {
      return mock.city.toLowerCase().includes(loc.city.toLowerCase());
    }
    // For device lat/lon, crude radius (in production use great circle distance)
    if (loc?.lat && loc?.lon) {
      const dx = (mock.lat - loc.lat);
      const dy = (mock.lon - loc.lon);
      return (dx*dx + dy*dy) < 0.03; // ~close to <7km for SF mock, adjust for real API
    }
    return true;
  }

  // Simulate API latency
  await new Promise((res) => setTimeout(res, 600));

  // Filtering logic: location, cuisine, price, rating
  let result = [...sampleRestaurants];
  if (location) result = result.filter(r => isNearby(r, location));
  if (cuisine) result = result.filter(r => r.cuisine === cuisine);
  if (price) result = result.filter(r => r.price === price);
  if (rating) result = result.filter(r => r.rating >= parseFloat(rating));

  // Simulate empty result sometimes
  if (result.length === 0 && location) {
    // Fallback to any location if none found
    result = sampleRestaurants.filter(r =>
      (!cuisine || r.cuisine === cuisine) &&
      (!price || r.price === price) &&
      (!rating || r.rating >= parseFloat(rating))
    );
  }

  return result;
}

// PUBLIC_INTERFACE
function MainContainer() {
  // Location state
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | success | manual | error
  const [location, setLocation] = useState(null); // { lat, lon } or { zip, city }
  const [manualInput, setManualInput] = useState({ zip: "", city: "" });
  const [error, setError] = useState(null);

  // Filter state
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Surprise Mode state: if true, ignore all filters (except location)
  const [surpriseMode, setSurpriseMode] = useState(false);

  // Restaurant list + fetch states
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState("");
  const [randomSelection, setRandomSelection] = useState(null); // Holds randomly picked restaurant

  // Fetch restaurants logic (API integration)
  const getRestaurants = useCallback(async () => {
    if (!location || locationStatus !== "success") {
      setRestaurants([]);
      setRestaurantsError("");
      setRandomSelection(null);
      return;
    }
    setRestaurantsLoading(true);
    setRestaurantsError("");
    setRandomSelection(null);
    try {
      let data;

      // If surpriseMode is ON, ignore filters for fetch (only pass location)
      if (surpriseMode) {
        data = await fetchRestaurants({
          location,
          // ignore all filters
          cuisine: "",
          price: "",
          rating: "",
        });
      } else {
        data = await fetchRestaurants({
          location,
          cuisine: cuisineFilter,
          price: priceFilter,
          rating: ratingFilter,
        });
      }

      setRestaurants(data);
      if (!data.length) {
        setRestaurantsError("No restaurants found for your criteria.");
        setRandomSelection(null);
      } else {
        // pick a random one from the entire data (always random on new fetches)
        const idx = Math.floor(Math.random() * data.length);
        setRandomSelection(data[idx]);
      }
    } catch (err) {
      setRestaurants([]);
      setRestaurantsError("Failed to fetch restaurants.");
      setRandomSelection(null);
    } finally {
      setRestaurantsLoading(false);
    }
  }, [
    location,
    cuisineFilter,
    priceFilter,
    ratingFilter,
    locationStatus,
    surpriseMode
  ]);

  // Fetch when location/filter changes or if surpriseMode changes
  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

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
        {/* Surprise Mode Toggle */}
        <div style={{ marginTop: 8, marginBottom: 10 }}>
          <button
            className="btn"
            style={{
              background: surpriseMode ? "var(--base-light)" : "var(--base-dark)",
              color: surpriseMode ? "#fff" : "var(--base-light)",
              border: "1px solid var(--base-light)",
              padding: "8px 22px",
              fontWeight: 600,
              marginRight: 8,
              boxShadow: surpriseMode ? "0 2px 8px #00ffff44" : "none",
              transition: "all 0.1s"
            }}
            onClick={() => setSurpriseMode(sm => !sm)}
            type="button"
            title={
              surpriseMode
                ? "Surprise Mode is ON: All filters ignored"
                : "Activate Surprise Mode: Pick totally random restaurant"
            }
            data-testid="surprise-mode-toggle"
          >
            {surpriseMode ? "Surprise Mode: ON 🎲" : "Surprise Mode: OFF"}
          </button>
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {surpriseMode
              ? "All filters disabled. Full randomness activated."
              : "Enable for a truly random pick (ignores filters)."}
          </span>
        </div>
        {/* Location access UI with geolocation + fallback */}
        <div style={{ marginTop: 10, marginBottom: 8, fontSize: 15 }}>
          <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Where are you eating?
          </div>
          {renderLocationSection()}
        </div>
        {/* Filtering options (cuisine, price, rating), hidden if surpriseMode */}
        {!surpriseMode && (
          <div style={{ display: "flex", gap: 24, marginTop: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
            {/* Cuisine Filter */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="cuisine-filter" style={{ color: "var(--text-secondary)", marginBottom: 5, fontSize: 14 }}>
                Cuisine
              </label>
              <select
                id="cuisine-filter"
                value={cuisineFilter}
                onChange={e => setCuisineFilter(e.target.value)}
                style={{
                  borderRadius: 4,
                  border: "1px solid var(--border-color)",
                  padding: "7px 8px",
                  fontSize: 15,
                  minWidth: 110,
                  background: "#130f2f",
                  color: "#fff"
                }}
              >
                <option value="">Any</option>
                <option value="italian">Italian</option>
                <option value="japanese">Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
                <option value="american">American</option>
                <option value="thai">Thai</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="chinese">Chinese</option>
                <option value="vegan">Vegan</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Price Filter */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="price-filter" style={{ color: "var(--text-secondary)", marginBottom: 5, fontSize: 14 }}>
                Price
              </label>
              <select
                id="price-filter"
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                style={{
                  borderRadius: 4,
                  border: "1px solid var(--border-color)",
                  padding: "7px 8px",
                  fontSize: 15,
                  minWidth: 80,
                  background: "#130f2f",
                  color: "#fff"
                }}
              >
                <option value="">Any</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="rating-filter" style={{ color: "var(--text-secondary)", marginBottom: 5, fontSize: 14 }}>
                Min. Rating
              </label>
              <select
                id="rating-filter"
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
                style={{
                  borderRadius: 4,
                  border: "1px solid var(--border-color)",
                  padding: "7px 8px",
                  fontSize: 15,
                  minWidth: 90,
                  background: "#130f2f",
                  color: "#fff"
                }}
              >
                <option value="">Any</option>
                <option value="4.5">4.5★+</option>
                <option value="4.0">4.0★+</option>
                <option value="3.5">3.5★+</option>
                <option value="3.0">3.0★+</option>
              </select>
            </div>
          </div>
        )}
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
        {/* Restaurant display */}
        <div style={{ color: "var(--text-secondary)", fontSize: 16, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {restaurantsLoading && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--base-dark)',
              fontWeight: 500,
              fontSize: 17
            }}>
              <span 
                style={{
                  border: "3px solid var(--base-dark)",
                  borderTop: "3px solid var(--base-light)",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  marginRight: 7,
                  animation: "spin 1s linear infinite",
                  display: 'inline-block'
                }}
              />
              Loading restaurants...
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg);}
                  100% { transform: rotate(360deg);}
                }
              `}</style>
            </span>
          )}

          {/* Error state */}
          {!restaurantsLoading && restaurantsError && (
            <span style={{ color: "#fa6464", fontWeight: 500 }}>
              {restaurantsError || "Something went wrong fetching restaurants."}
            </span>
          )}

          {/* Show restaurant card if found */}
          {!restaurantsLoading && !restaurantsError && randomSelection && (
            <RestaurantCard restaurant={randomSelection} />
          )}

          {/* If there are restaurants but no current selection (shouldn't normally happen, but fallback) */}
          {!restaurantsLoading && !restaurantsError && restaurants && restaurants.length > 1 && !randomSelection && (
            <span>
              {restaurants.length} restaurants found. Click "Surprise Me" to pick one at random!
            </span>
          )}

          {/* Empty state: no restaurants found */}
          {!restaurantsLoading && !restaurantsError && (!restaurants || restaurants.length === 0) && (
            <span style={{
              fontStyle: "italic",
              color: '#1A1A1A',
              opacity: 0.74
            }}>[No restaurants found for your search. Try different filters or location!]</span>
          )}
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
        {/* Main action buttons */}
        <button
          className="btn btn-large"
          style={{
            minWidth: 150,
            background: surpriseMode ? "var(--base-dark)" : "var(--base-light)",
            color: surpriseMode ? "var(--base-light)" : "#fff",
            border: "1px solid var(--base-light)"
          }}
          onClick={() => {
            // Pick from all restaurants if surpriseMode, otherwise from filtered
            if (restaurants && restaurants.length > 0) {
              const idx = Math.floor(Math.random() * restaurants.length);
              setRandomSelection(restaurants[idx]);
            }
          }}
          disabled={restaurantsLoading || !restaurants || restaurants.length === 0}
        >
          {surpriseMode ? "SURPRISE ME! (ignore filters)" : "Surprise Me!"}
        </button>
        <button
          className="btn"
          style={{ background: "var(--base-dark)", color: "var(--base-light)" }}
          onClick={() => {
            // PUBLIC_INTERFACE
            // Only reshuffle among current valid dataset (don't re-fetch from API)
            if (restaurants && restaurants.length > 0) {
              let newIdx;
              if (restaurants.length === 1) {
                newIdx = 0;
              } else {
                // Try to avoid picking same restaurant if possible
                do {
                  newIdx = Math.floor(Math.random() * restaurants.length);
                } while (restaurants.length > 1 && restaurants[newIdx] === randomSelection);
              }
              setRandomSelection(restaurants[newIdx]);
            }
          }}
          disabled={restaurantsLoading || !restaurants || restaurants.length === 0}
        >
          Refresh
        </button>
        {/* Add additional action buttons as needed */}
      </section>
    </div>
  );
}

export default MainContainer;
