"use client";

import { useState } from "react";
import { getGuestBookings, cancelBooking } from "../../lib/api.js";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e) {
    e.preventDefault();
    setLoading(true);
    const res = await getGuestBookings(email);
    setBookings(res.data);
    setLoading(false);
  }

  async function handleCancel(id) {
    await cancelBooking(id);
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
    );
  }

  return (
    <div className="container">
      <h1>My bookings</h1>
      <form className="lookup-form" onSubmit={lookup}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">{loading ? "Loading..." : "Find bookings"}</button>
      </form>

      {bookings && bookings.length === 0 && (
        <div className="empty-state">
          <p>No bookings found for that email.</p>
        </div>
      )}

      <div className="bookings-list">
        {bookings?.map((b) => (
          <div className="booking-item" key={b._id}>
            <div>
              <h4 style={{ marginBottom: "0.3rem" }}>{b.property?.title || "Property removed"}</h4>
              <p className="dates muted">
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.guests} guest(s)
              </p>
              <p className="amount">Rs. {b.totalPrice.toLocaleString()}</p>
              <span className={`status-badge ${b.status}`}>{b.status}</span>
            </div>
            {b.status === "confirmed" && (
              <button className="cancel-btn" onClick={() => handleCancel(b._id)}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
