"use client";

import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader.jsx";

const emptyForm = {
  title: "",
  description: "",
  city: "",
  address: "",
  pricePerNight: "",
  maxGuests: "",
  bedrooms: "",
  amenities: "",
  hostName: "",
};

export default function PropertyForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        city: initial.city || "",
        address: initial.address || "",
        pricePerNight: initial.pricePerNight || "",
        maxGuests: initial.maxGuests || "",
        bedrooms: initial.bedrooms || "",
        amenities: (initial.amenities || []).join(", "),
        hostName: initial.hostName || "",
      });
      setImages(initial.images || []);
    } else {
      setForm(emptyForm);
      setImages([]);
    }
  }, [initial]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms) || 1,
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      images,
    });
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input name="title" required value={form.title} onChange={handleChange} />
      </label>
      <label>
        Description
        <textarea name="description" required rows={3} value={form.description} onChange={handleChange} />
      </label>
      <div className="form-row">
        <label>
          City
          <input name="city" required value={form.city} onChange={handleChange} />
        </label>
        <label>
          Host name
          <input name="hostName" required value={form.hostName} onChange={handleChange} />
        </label>
      </div>
      <label>
        Address
        <input name="address" required value={form.address} onChange={handleChange} />
      </label>
      <div className="form-row three">
        <label>
          Price / night (Rs.)
          <input
            type="number"
            name="pricePerNight"
            min="0"
            required
            value={form.pricePerNight}
            onChange={handleChange}
          />
        </label>
        <label>
          Max guests
          <input
            type="number"
            name="maxGuests"
            min="1"
            required
            value={form.maxGuests}
            onChange={handleChange}
          />
        </label>
        <label>
          Bedrooms
          <input
            type="number"
            name="bedrooms"
            min="1"
            value={form.bedrooms}
            onChange={handleChange}
          />
        </label>
      </div>
      <label>
        Amenities (comma separated)
        <input
          name="amenities"
          placeholder="WiFi, AC, Parking"
          value={form.amenities}
          onChange={handleChange}
        />
      </label>

      <ImageUploader images={images} onChange={setImages} />

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Create listing"}
        </button>
        {onCancel && (
          <button type="button" className="ghost-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
