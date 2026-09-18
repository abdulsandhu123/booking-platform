"use client";

import { useEffect, useState } from "react";
import { getOverview, getAllUsers, updateUserRole, deleteUserRequest } from "../../lib/api.js";
import { useAuth } from "../../components/AuthContext.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";

const ROLES = ["guest", "seller", "admin"];

function AdminDashboardInner() {
  const { user: me } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    const [overviewRes, usersRes] = await Promise.all([getOverview(), getAllUsers()]);
    setOverview(overviewRes.data);
    setUsers(usersRes.data.users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(id, role) {
    setError("");
    try {
      const updated = await updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: updated.data.role } : u)));
    } catch (err) {
      setError(err.response?.data?.error || "Could not update role.");
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete ${name}'s account? This also removes their listings.`)) return;
    setError("");
    try {
      await deleteUserRequest(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete user.");
    }
  }

  const visibleUsers = filter === "all" ? users : users.filter((u) => u.role === filter);

  if (!me) return null;

  return (
    <div className="container">
      <h1>Admin</h1>
      {error && <div className="error-banner">{error}</div>}

      {loading && <p className="muted">Loading…</p>}

      {overview && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{overview.users}</div>
            <div className="stat-label">Total users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.sellers}</div>
            <div className="stat-label">Sellers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.properties}</div>
            <div className="stat-label">Listings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overview.bookings}</div>
            <div className="stat-label">Confirmed bookings</div>
          </div>
        </div>
      )}

      <div className="section-heading">
        <h2 style={{ margin: 0 }}>Manage users</h2>
        <div className="role-filter">
          {["all", "guest", "seller", "admin"].map((r) => (
            <button
              key={r}
              className={filter === r ? "" : "ghost-btn"}
              onClick={() => setFilter(r)}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-user-list">
        {visibleUsers.map((u) => (
          <div className="admin-user-row" key={u._id}>
            <div className="admin-user-info">
              <div className="admin-user-name">{u.name}</div>
              <div className="muted mono" style={{ fontSize: "0.8rem" }}>{u.email}</div>
            </div>

            <select
              value={u.role}
              disabled={u._id === me._id}
              onChange={(e) => handleRoleChange(u._id, e.target.value)}
              className="role-select"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button
              className="cancel-btn"
              disabled={u._id === me._id}
              onClick={() => handleDelete(u._id, u.name)}
            >
              Delete
            </button>
          </div>
        ))}

        {!loading && visibleUsers.length === 0 && (
          <div className="empty-state">
            <p>No users in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminDashboardInner />
    </ProtectedRoute>
  );
}
