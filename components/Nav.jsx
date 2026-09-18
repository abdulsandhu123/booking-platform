"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext.jsx";

export default function Nav() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="nav">
        <Link href="/" className="logo" onClick={closeMenu}>
          <span className="mark">/</span>StayFinder
        </Link>

        <button
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <Link href="/" onClick={closeMenu}>Search</Link>
          {user?.role === "seller" && (
            <Link href="/seller" onClick={closeMenu}>My listings</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" onClick={closeMenu}>Admin</Link>
          )}
          {user?.role !== "seller" && (
            <Link href="/my-bookings" onClick={closeMenu}>My bookings</Link>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" onClick={closeMenu}>Log in</Link>
              <Link href="/signup" className="nav-cta" onClick={closeMenu}>Sign up</Link>
            </>
          )}
          {!loading && user && (
            <>
              <span className="nav-user">{user.name} · {user.role}</span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                Log out
              </a>
            </>
          )}
        </nav>
      </header>

      {menuOpen && <div className="nav-scrim" onClick={closeMenu} />}
    </>
  );
}
