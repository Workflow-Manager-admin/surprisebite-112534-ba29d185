import React from "react";

// PUBLIC_INTERFACE
/**
 * RestaurantCard: shows the details of a restaurant and a link to Google Maps
 * @param {object} props - restaurant: {name, cuisine, price, rating, address, city, lat, lon}
 */
function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  // Format cuisine nicely
  const cuisine =
    restaurant.cuisine.charAt(0).toUpperCase() +
    restaurant.cuisine.slice(1);

  // Price as repeated dollar signs
  const priceDisplay = "$".repeat(Number(restaurant.price) || 1);

  // Build a Google Maps query string
  let mapsQuery = "";
  if (restaurant.lat && restaurant.lon) {
    mapsQuery = `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`;
  } else if (restaurant.address && restaurant.city) {
    const q = encodeURIComponent(
      `${restaurant.name}, ${restaurant.address}, ${restaurant.city}`
    );
    mapsQuery = `https://www.google.com/maps/search/?api=1&query=${q}`;
  } else {
    mapsQuery = undefined; // fallback: just open blank maps maybe
  }

  return (
    <div
      style={{
        background: "rgba(19,15,47, 0.09)",
        borderRadius: 9,
        padding: "24px 18px 18px 18px",
        marginBottom: 4,
        color: "#222",
        boxShadow: "0 2px 16px #00b9ff11",
      }}
      data-testid="restaurant-card"
    >
      <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 6 }}>
        {restaurant.name}
      </div>
      <div style={{ color: "#168", fontWeight: 500 }}>
        {cuisine} &bull; {priceDisplay} &bull; <span style={{ color: "#365" }}>{restaurant.rating}★</span>
      </div>
      <div style={{ fontSize: 15, margin: "8px 0 6px 0" }}>
        {restaurant.address}
        {restaurant.city ? `, ${restaurant.city}` : ""}
      </div>
      {mapsQuery && (
        <a
          href={mapsQuery}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: "var(--base-dark)",
            color: "var(--base-light)",
            border: "1px solid var(--base-light)",
            display: "inline-block",
            marginTop: 8,
            fontWeight: 600,
            textDecoration: "none",
            padding: "9px 20px",
            borderRadius: 4,
            fontSize: 16,
          }}
          data-testid="open-maps-btn"
        >
          Open in Google Maps →
        </a>
      )}
    </div>
  );
}

export default RestaurantCard;
