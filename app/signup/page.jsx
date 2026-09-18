"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext.jsx";
import BackgroundSlideshow from "../../components/BackgroundSlideshow.jsx";

export default function Signup() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "guest" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      router.push(user.role === "seller" ? "/seller" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <BackgroundSlideshow />
      <div className="auth-page-inner">
        <h1>Create your account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <label>
            Full name
            <input
              required
              placeholder="e.g. Ahmed Raza"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          <label>Sign up as</label>
          <div className="role-toggle">
            <button
              type="button"
              className={form.role === "guest" ? "active" : ""}
              onClick={() => setForm({ ...form, role: "guest" })}
            >
              Customer — book stays
            </button>
            <button
              type="button"
              className={form.role === "seller" ? "active" : ""}
              onClick={() => setForm({ ...form, role: "seller" })}
            >
              Seller — list properties
            </button>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="muted-on-dark" style={{ marginTop: "1rem" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
