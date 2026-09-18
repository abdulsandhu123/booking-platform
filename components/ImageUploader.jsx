"use client";

import { useRef, useState } from "react";
import api from "../lib/api.js";

const MAX_IMAGES = 6;

export default function ImageUploader({ images, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function uploadFiles(fileList) {
    setError("");
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;

    const invalid = files.find((f) => !f.type.startsWith("image/"));
    if (invalid) {
      setError("Only image files are allowed.");
      return;
    }
    const tooBig = files.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setError("Each image must be under 5MB.");
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    setUploading(true);
    try {
      const res = await api.post("/uploads", formData);
      onChange([...images, ...res.data.urls]);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (images.length >= MAX_IMAGES) return;
    uploadFiles(e.dataTransfer.files);
  }

  function removeImage(url) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div className="image-uploader">
      <label>Property photos</label>

      {error && <div className="error-banner">{error}</div>}

      {images.length < MAX_IMAGES && (
        <div
          className={`dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <p className="dropzone-text">
            {uploading
              ? "Uploading…"
              : "Drag photos here, or click to browse"}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: "0.78rem" }}>
            JPG, PNG, WebP or GIF · up to 5MB · {MAX_IMAGES - images.length} more allowed
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((url) => (
            <div className="image-preview" key={url}>
              <img src={url} alt="Property" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(url)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
