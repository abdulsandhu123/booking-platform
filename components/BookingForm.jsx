"use client";

import { useState } from "react";
import { createBooking } from "../lib/api.js";

// Same overlap rule as the backend: [checkIn, checkOut) ranges overlap if
// existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn.
function rangesOverlap(existingIn, existingOut, newIn, newOut) {
  return new Date(existingIn) < new Date(newOut) && new Date(existingOut) > new Date(newIn);
}

export default function BookingForm({ property, bookedRanges, onBooked }) {
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nights =
    form.checkIn && form.checkOut
      ? Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
      : 0;
  const total = nights > 0 ? nights * property.pricePerNight : 0;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (nights <= 0) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (Number(form.guests) > property.maxGuests) {
      setError(`Max ${property.maxGuests} guests allowed for this property.`);
      return;
    }

    // Instant client-side feedback before hitting the server.
    const hasClientConflict = bookedRanges.some((r) =>
      rangesOverlap(r.checkIn, r.checkOut, form.checkIn, form.checkOut)
    );
    if (hasClientConflict) {
      setError("These dates overlap with an existing booking. Please pick different dates.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({ property: property._id, ...form });
      onBooked(res.data);
    } catch (err) {
      // Server is the source of truth — it re-checks conflicts atomically
      // in case someone else booked in the meantime.
      setError(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h3>Book this place</h3>
      {error && <div className="error-banner">{error}</div>}

      <label>
        Name
        <input name="guestName" required value={form.guestName} onChange={handleChange} />
      </label>
      <label>
        Email
        <input
          type="email"
          name="guestEmail"
          required
          value={form.guestEmail}
          onChange={handleChange}
        />
      </label>
      <div className="date-row">
        <label>
          Check-in
          <input type="date" name="checkIn" required value={form.checkIn} onChange={handleChange} />
        </label>
        <label>
          Check-out
          <input type="date" name="checkOut" required value={form.checkOut} onChange={handleChange} />
        </label>
      </div>
      <label>
        Guests
        <input
          type="number"
          name="guests"
          min="1"
          max={property.maxGuests}
          value={form.guests}
          onChange={handleChange}
        />
      </label>

      {nights > 0 && (
        <p className="total-line">
          {nights} night{nights > 1 ? "s" : ""} × Rs. {property.pricePerNight.toLocaleString()} ={" "}
          <strong>Rs. {total.toLocaleString()}</strong>
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}
