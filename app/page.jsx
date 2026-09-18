"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import BackgroundSlideshow from "../components/BackgroundSlideshow.jsx";
import { searchProperties } from "../lib/api.js";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function runSearch(params = {}) {
    setLoading(true);
    setError("");
    try {
      const cleaned = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v != null)
      );
      const res = await searchProperties(cleaned);
      setProperties(res.data.properties);
    } catch (err) {
      setError("Could not load properties. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
  }, []);

  return (
    <div>
      <section className="hero">
        <BackgroundSlideshow />
        <div className="hero-inner">
          <div className="hero-eyebrow">Booking No. 0192 — Confirmed instantly</div>
          <h1>Book the stay. Skip the guesswork.</h1>
          <p className="lead">
            Real-time availability across Lahore, Karachi, Islamabad and beyond —
            every date checked against existing bookings before you confirm.
          </p>
        </div>
      </section>

      <div className="container">
        <SearchBar onSearch={runSearch} />

        <div className="section-heading">
          <h2 style={{ margin: 0 }}>Available stays</h2>
          {!loading && !error && (
            <span className="count mono">{properties.length} listed</span>
          )}
        </div>

        {loading && <p className="muted">Loading properties…</p>}
        {error && <div className="error-banner">{error}</div>}
        {!loading && !error && properties.length === 0 && (
          <div className="empty-state">
            <p>No stays match those dates or filters.</p>
            <p className="muted">Try widening your search.</p>
          </div>
        )}

        <div className="grid">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
