"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProperty, getPropertyBookings } from "../../../lib/api.js";
import BookingForm from "../../../components/BookingForm.jsx";
import PropertyImageCarousel from "../../../components/PropertyImageCarousel.jsx";
import { useAuth } from "../../../components/AuthContext.jsx";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PropertyDetail({ params }) {
  const { id } = params;
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [propRes, bookingsRes] = await Promise.all([
      getProperty(id),
      getPropertyBookings(id),
    ]);
    setProperty(propRes.data);
    setBookedRanges(bookingsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function handleBooked(booking) {
    setConfirmation(booking);
    setBookedRanges((prev) => [...prev, { checkIn: booking.checkIn, checkOut: booking.checkOut }]);
  }

  if (loading) return <p className="muted container">Loading…</p>;
  if (!property) return <p className="container">Property not found.</p>;

  return (
    <div className="property-detail container">
      <h1>{property.title}</h1>
      <p className="muted">
        {property.address} · Hosted by {property.hostName}
      </p>

      <div className="property-detail-img">
        <PropertyImageCarousel images={property.images} />
      </div>

      <div className="property-detail-grid">
        <div>
          <h3>About this place</h3>
          <p>{property.description}</p>

          <h3>Amenities</h3>
          <ul className="amenities">
            {property.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>

          <h3>Booked dates</h3>
          {bookedRanges.length === 0 ? (
            <p className="muted">No bookings yet — fully available.</p>
          ) : (
            <ul className="booked-ranges">
              {bookedRanges.map((r, i) => (
                <li key={i}>
                  {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {user && property.owner === user._id ? (
            <div className="panel-card">
              <h3>This is your listing</h3>
              <p className="muted">Manage pricing, photos and details from your dashboard.</p>
              <Link href="/seller"><button type="button">Go to my listings</button></Link>
            </div>
          ) : confirmation ? (
            <div className="confirmation-box">
              <div className="tag">Booking confirmed</div>
              <h3 style={{ marginBottom: "0.3rem" }}>{property.title}</h3>
              <p className="dates">
                {formatDate(confirmation.checkIn)} → {formatDate(confirmation.checkOut)}
              </p>
              <p className="mono" style={{ fontSize: "1.05rem", color: "var(--rust)" }}>
                Rs. {confirmation.totalPrice.toLocaleString()}
              </p>
              <p className="muted">Confirmation sent to {confirmation.guestEmail}.</p>
            </div>
          ) : (
            <BookingForm property={property} bookedRanges={bookedRanges} onBooked={handleBooked} />
          )}
        </div>
      </div>
    </div>
  );
}
