import React from "react";
import styles from "./RestaurantCard.module.css";

/**
 * RestaurantCard: shows the details of a restaurant and a link to Google Maps
 * @param {object} props - restaurant: {name, cuisine, price, rating, address, city, lat, lon}
 */
// PUBLIC_INTERFACE
function RestaurantCard({ restaurant }) {
  if (!restaurant) {
    // Fallback in development to avoid blank UI completely
    return (
      <div className={styles.card} data-testid="restaurant-card">
        <div className={styles.header} style={{color: "#f00"}}>[No restaurant data provided]</div>
      </div>
    );
  }

  // Format cuisine nicely
  const cuisine =
    (restaurant.cuisine && restaurant.cuisine.charAt(0).toUpperCase() + (restaurant.cuisine.slice(1) || "")) ||
    "Unknown";

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
    mapsQuery = undefined;
  }

  return (
    <div className={styles.card} data-testid="restaurant-card">
      <div className={styles.header}>{restaurant.name || "Unknown Restaurant"}</div>
      <div className={styles.detailsRow}>
        <span className={styles.badge}>{cuisine}</span>
        <span className={styles.price}>{priceDisplay}</span>
        <span className={styles.rating}>{restaurant.rating ? `${restaurant.rating}★` : "N/A"}</span>
      </div>
      <div className={styles.address}>
        {restaurant.address || ""}
        {restaurant.city ? `, ${restaurant.city}` : ""}
      </div>
      {mapsQuery ? (
        <a
          href={mapsQuery}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapBtn}
          data-testid="open-maps-btn"
        >
          Open in Google Maps →
        </a>
      ) : (
        <span style={{fontSize:"0.92em", color:"#888",marginTop:8}}>No map link available</span>
      )}
    </div>
  );
}

export default RestaurantCard;
