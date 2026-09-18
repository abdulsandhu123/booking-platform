"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [form, setForm] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      alert("Check-out date must be after check-in date");
      return;
    }
    onSearch(form);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        name="city"
        placeholder="Where to? (city)"
        value={form.city}
        onChange={handleChange}
      />
      <input
        type="date"
        name="checkIn"
        value={form.checkIn}
        onChange={handleChange}
      />
      <input
        type="date"
        name="checkOut"
        value={form.checkOut}
        onChange={handleChange}
      />
      <input
        type="number"
        name="guests"
        min="1"
        placeholder="Guests"
        value={form.guests}
        onChange={handleChange}
      />
      <button type="submit">Search</button>
    </form>
  );
}
