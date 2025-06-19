import React, { useState, useEffect, useCallback } from "react";
import styles from "./MainContainer.module.css";
import RestaurantCard from "./RestaurantCard";

/**
 * DEBUG NOTE:
 * This MainContainer is currently using a mock fetchRestaurants. If you experience a 400 error with a real API, please check:
 * - That none of the values (location/cuisine/price/rating) are null, undefined, or empty if required.
 * - If directly integrating a real API:
 *     - Do not send fields if their value is empty ("") or undefined/null, especially for required parameters.
 *     - Double-check endpoint docs: is location (lat/lon, city, or zip) required? Are filters required? Only include what the API expects.
 *     - Most APIs will return a 400 error if a required key (like "location") is empty, or if both city/zip and lat/lon are left blank.
 *     - Before sending your request, filter out keys in the payload (or URL params) with empty/undefined/null values. 
 *     - If using fetch(), use:
 *         Object.keys(payload).reduce((acc, k) => (payload[k] ? { ...acc, [k]: payload[k] } : acc), {})
 *     - If your API needs an API key, check that the key is defined at build/runtime via environment variable, not hardcoded.
 * - Logging the request body/URL as well as the real API's error message will help you diagnose 400 errors.
 * - Sample correction for fetch (pseudo-code):
 *     let filteredPayload = {};
 *     for (let k in payload) { if (payload[k] !== "" && payload[k] != null) filteredPayload[k] = payload[k]; }
 *     fetch(API_URL, { ..., body: JSON.stringify(filteredPayload), ... })
 *
 * USER ADVICE: A 400 Bad Request from a production API (e.g., Yelp/Google Places) ALMOST ALWAYS means:
 *   - you sent a required parameter as empty/undefined
 *   - or, you sent unknown parameters/typos
 *   - or, your API key or endpoint is wrong/missing
 *   - Always check the API docs for mandatory parameters!
 */

/**
 * PUBLIC_INTERFACE
 * This function is used as a placeholder. If you adapt a real API, see the guidelines at file top.
 * Recommended defensive pattern for fetch integrations:
 *
 * // Example payload construction for real API:
 * const payload = {
 *     ...(location && typeof location === "object" ? location : {}),
 *     ...(cuisine ? { cuisine } : {}),
 *     ...(price ? { price } : {}),
 *     ...(rating ? { rating } : {})
 * };
 * // Remove empty/undefined/null fields
 * const filteredPayload = Object.fromEntries(
 *   Object.entries(payload).filter(([_, v]) => v !== "" && v != null)
 * );
 * if (!filteredPayload.city && !filteredPayload.zip && (!filteredPayload.lat || !filteredPayload.lon)) {
 *   throw new Error("Missing required location information for API request");
 * }
 * // Do not call fetch until filteredPayload contains all required keys for your endpoint!
 * // fetch(<API_URL>, {..., body: JSON.stringify(filteredPayload), ...});
 */
async function fetchRestaurants({ location, cuisine, price, rating }) {
  /** 
   * This is a placeholder for a real API integration (e.g., Yelp/Google Places)
   * Accepts {location, cuisine, price, rating} as arguments.
   * Returns mock data for demonstration. To integrate a real API,
   * replace this function with actual fetch logic.
   * 
   * When integrating, ALWAYS:
   * - Remove empty/undefined string fields from payload before sending to API.
   * - Block calls (throw error / skip fetch) if required keys (like location) are missing or empty.
   * - Check API documentation for required vs optional filters.
   * - Ensure API key/environment variable is present if needed!
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
    // Always try to show demo content for first-time/blank state as a guard for blank UI
    if (!location || locationStatus !== "success") {
      // Load at least one demo restaurant for presentational guarantees
      setRestaurants([
        {
          id: 100,
          name: "Demo Eatery",
          cuisine: "american",
          price: "2",
          rating: 4.2,
          address: "555 Demo Rd",
          city: "Demoville",
          lat: 40.0,
          lon: -100.0
        }
      ]);
      setRestaurantsError("");
      setRandomSelection({
        id: 100,
        name: "Demo Eatery",
        cuisine: "american",
        price: "2",
        rating: 4.2,
        address: "555 Demo Rd",
        city: "Demoville",
        lat: 40.0,
        lon: -100.0
      });
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
        <div className={styles.locationSection}>
          <button
            className={styles.locationActionBtn}
            style={{ minWidth: 130 }}
            onClick={handleLocationAccess}
            data-testid="get-location-btn"
          >
            Use My Location
          </button>
          {error && (
            <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 6 }}>
              {error}
            </div>
          )}
        </div>
      );
    }
    if (locationStatus === "requesting") {
      return (
        <div className={styles.locationStatus}>
          Fetching your location...
        </div>
      );
    }
    if (locationStatus === "manual") {
      return (
        <form
          className={styles.locationSection}
          onSubmit={handleManualInputSubmit}
          data-testid="manual-location-form"
          style={{ gap: 8 }}
        >
          <input
            type="text"
            placeholder="ZIP code"
            name="zip"
            value={manualInput.zip}
            onChange={handleManualInputChange}
            className={styles.locationInput}
            style={{width: 100}}
          />
          <span style={{ color: "var(--text-secondary)", alignSelf: "center" }}>or</span>
          <input
            type="text"
            placeholder="City"
            name="city"
            value={manualInput.city}
            onChange={handleManualInputChange}
            className={styles.locationInput}
            style={{width: 140}}
          />
          <button
            type="submit"
            className={styles.locationActionBtn}
          >
            Submit
          </button>
          <button
            type="button"
            className={styles.locationCancelBtn}
            onClick={() => {
              setManualInput({ zip: "", city: "" });
              setError(null);
              setLocationStatus("idle");
            }}
          >
            Cancel
          </button>
          {error && (
            <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 6, flexBasis: "100%" }}>{error}</div>
          )}
        </form>
      );
    }
    if (locationStatus === "success") {
      // Show the used location (city, zip, or lat/lon)
      return (
        <div className={styles.locationSection}>
          <span className={styles.locationDisplay}>
            {location
              ? location.city
                ? `Location: ${location.city}`
                : location.zip
                ? `ZIP: ${location.zip}`
                : `Using device location (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})`
              : ""}
          </span>
          <button
            className={styles.locationChangeBtn}
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
    <div className={styles.container} style={{ marginTop: 56, marginBottom: 40 }}>
      {/* Filters Section */}
      <section className={styles.filterBar}>
        <h2>Filters</h2>
        {/* Surprise Mode Toggle */}
        <div className={styles.surpriseToggleRow}>
          <button
            className={`${styles.surpriseToggle} ${surpriseMode ? styles.active : ""}`}
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
        <div>
          <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Where are you eating?
          </div>
          {renderLocationSection()}
        </div>
        {/* Filtering options (cuisine, price, rating), hidden if surpriseMode */}
        {!surpriseMode && (
          <div className={styles.filterDetailRow}>
            {/* Cuisine Filter */}
            <div className={styles.filterEntry}>
              <label htmlFor="cuisine-filter">Cuisine</label>
              <select
                id="cuisine-filter"
                value={cuisineFilter}
                onChange={e => setCuisineFilter(e.target.value)}
                className={styles.selectInput}
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
            <div className={styles.filterEntry}>
              <label htmlFor="price-filter">Price</label>
              <select
                id="price-filter"
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Any</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className={styles.filterEntry}>
              <label htmlFor="rating-filter">Min. Rating</label>
              <select
                id="rating-filter"
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
                className={styles.selectInput}
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
      <section className={styles.restaurantSection}>
        <h2>Restaurant Info</h2>
        {/* Restaurant display */}
        <div style={{
          color: "var(--text-secondary)",
          fontSize: 16,
          minHeight: 48,
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {restaurantsLoading && (
            <span className={styles.restaurantLoadingSpin}>
              <span className={styles.spinLoader} />
              Loading restaurants...
            </span>
          )}

          {/* Error state */}
          {!restaurantsLoading && restaurantsError && (
            <span className={styles.restaurantError}>
              {restaurantsError || "Something went wrong fetching restaurants."}
            </span>
          )}

          {/* Show restaurant card if found */}
          {!restaurantsLoading && !restaurantsError && randomSelection && (
            <RestaurantCard restaurant={randomSelection} />
          )}

          {/* If there are restaurants but no current selection */}
          {!restaurantsLoading && !restaurantsError && restaurants && restaurants.length > 1 && !randomSelection && (
            <span className={styles.restaurantEmpty}>
              {restaurants.length} restaurants found. Click "Surprise Me" to pick one at random!
            </span>
          )}

          {/* Empty state: always show demo card if fallback populated */}
          {!restaurantsLoading && !restaurantsError && (!restaurants || restaurants.length === 0) && (
            <span className={styles.restaurantEmpty}>
              [No restaurants found for your search. Try different filters or location!]
            </span>
          )}

          {/* Fallback to show demo card if a demo is in restaurants (to avoid blank UI, even if filters fail) */}
          {!restaurantsLoading && !restaurantsError && Array.isArray(restaurants) && restaurants.length === 1 && restaurants[0].id === 100 && !randomSelection && (
            <RestaurantCard restaurant={restaurants[0]} />
          )}
        </div>
      </section>

      {/* Action Buttons Section */}
      <section className={styles.actionBar}>
        <button
          className={styles.modernBtn}
          onClick={() => {
            if (restaurants && restaurants.length > 0) {
              const idx = Math.floor(Math.random() * restaurants.length);
              setRandomSelection(restaurants[idx]);
            }
          }}
          style={{ minWidth: 150 }}
          disabled={restaurantsLoading || !restaurants || restaurants.length === 0}
        >
          {surpriseMode ? "SURPRISE ME! (ignore filters)" : "Surprise Me!"}
        </button>
        <button
          className={`${styles.modernBtn} ${styles.secondary}`}
          onClick={() => {
            // PUBLIC_INTERFACE
            if (restaurants && restaurants.length > 0) {
              let newIdx;
              if (restaurants.length === 1) {
                newIdx = 0;
              } else {
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
      </section>
    </div>
  );
}

export default MainContainer;
