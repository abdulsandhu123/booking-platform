"use client";

import { useEffect, useState } from "react";
import {
  getMyProperties,
  createProperty,
  updatePropertyRequest,
  deletePropertyRequest,
  getSellerBookings,
} from "../../lib/api.js";
import PropertyForm from "../../components/PropertyForm.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SellerDashboardInner() {
  const [tab, setTab] = useState("listings"); // "listings" | "bookings"

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await getMyProperties();
    setProperties(res.data.properties);
    setLoading(false);
  }

  async function loadBookings() {
    setBookingsLoading(true);
    const res = await getSellerBookings();
    setBookings(res.data.bookings);
    setBookingsLoading(false);
  }

  useEffect(() => {
    load();
    loadBookings();
  }, []);

  async function handleCreate(data) {
    setSubmitting(true);
    setError("");
    try {
      await createProperty(data);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create listing.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(data) {
    setSubmitting(true);
    setError("");
    try {
      await updatePropertyRequest(editing._id, data);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await deletePropertyRequest(id);
    setProperties((prev) => prev.filter((p) => p._id !== id));
  }

  const newBookingsCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="container">
      <div className="section-heading">
        <h1 style={{ margin: 0 }}>Seller dashboard</h1>
        {tab === "listings" && !showForm && !editing && (
          <button onClick={() => setShowForm(true)}>+ New listing</button>
        )}
      </div>

      <div className="tab-bar">
        <button
          className={tab === "listings" ? "" : "ghost-btn"}
          onClick={() => setTab("listings")}
        >
          Listings
        </button>
        <button
          className={tab === "bookings" ? "" : "ghost-btn"}
          onClick={() => setTab("bookings")}
        >
          Bookings
          {newBookingsCount > 0 && <span className="tab-badge">{newBookingsCount}</span>}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {tab === "listings" && (
        <>
          {showForm && (
            <div className="panel-card">
              <h3>New listing</h3>
              <PropertyForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
              />
            </div>
          )}

          {editing && (
            <div className="panel-card">
              <h3>Edit listing</h3>
              <PropertyForm
                initial={editing}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(null)}
                submitting={submitting}
              />
            </div>
          )}

          {loading && <p className="muted">Loading your listings…</p>}

          {!loading && properties.length === 0 && !showForm && (
            <div className="empty-state">
              <p>You haven&apos;t listed any properties yet.</p>
              <p className="muted">Create your first listing to start receiving bookings.</p>
            </div>
          )}

          <div className="seller-list">
            {properties.map((p) => (
              <div className="seller-row" key={p._id}>
                <div>
                  <h4 style={{ margin: 0 }}>{p.title}</h4>
                  <p className="muted" style={{ margin: "0.2rem 0" }}>
                    {p.city} · Rs. {p.pricePerNight.toLocaleString()}/night
                  </p>
                </div>
                <div className="seller-row-actions">
                  <button className="ghost-btn" onClick={() => { setEditing(p); setShowForm(false); }}>
                    Edit
                  </button>
                  <button className="cancel-btn" onClick={() => handleDelete(p._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "bookings" && (
        <>
          {bookingsLoading && <p className="muted">Loading bookings…</p>}

          {!bookingsLoading && bookings.length === 0 && (
            <div className="empty-state">
              <p>No bookings yet.</p>
              <p className="muted">You&apos;ll see them here as soon as a customer books a stay.</p>
            </div>
          )}

          <div className="bookings-list">
            {bookings.map((b) => (
              <div className="booking-item" key={b._id}>
                <div>
                  <h4 style={{ margin: 0 }}>{b.property?.title || "Listing removed"}</h4>
                  <p className="muted" style={{ margin: "0.2rem 0" }}>
                    Booked by <strong>{b.guestName}</strong> · {b.guestEmail}
                  </p>
                  <p className="dates muted">
                    {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.guests} guest(s)
                  </p>
                  <p className="amount">Rs. {b.totalPrice.toLocaleString()}</p>
                  <span className={`status-badge ${b.status}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute roles={["seller", "admin"]}>
      <SellerDashboardInner />
    </ProtectedRoute>
  );
}
