"use client";

import { useState } from "react";

export default function PropertyImageCarousel({ images = [] }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="img-placeholder">No photo</div>;
  }

  function goPrev(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function goNext(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function goTo(e, i) {
    e.preventDefault();
    e.stopPropagation();
    setIndex(i);
  }

  return (
    <div className="carousel">
      <img src={images[index]} alt={`Photo ${index + 1} of ${images.length}`} />

      {images.length > 1 && (
        <>
          <button className="carousel-arrow left" onClick={goPrev} aria-label="Previous photo">
            ‹
          </button>
          <button className="carousel-arrow right" onClick={goNext} aria-label="Next photo">
            ›
          </button>

          <div className="carousel-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === index ? "active" : ""}`}
                onClick={(e) => goTo(e, i)}
              />
            ))}
          </div>

          <span className="carousel-count">{index + 1}/{images.length}</span>
        </>
      )}
    </div>
  );
}
