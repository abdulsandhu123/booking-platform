"use client";

import { useEffect, useState } from "react";

// Curated scenic/architecture shots — swap these for real property photography
// in production. One image is visible at a time; it slowly zooms (Ken Burns
// effect) then cross-fades into the next after `intervalMs`.
const DEFAULT_IMAGES = [
  "https://picsum.photos/id/1018/1920/1080", // mountain valley
  "https://picsum.photos/id/1015/1920/1080", // river canyon
  "https://picsum.photos/id/1039/1920/1080", // lake at dusk
  "https://picsum.photos/id/1043/1920/1080", // misty peaks
  "https://picsum.photos/id/1074/1920/1080", // forest path
];

export default function BackgroundSlideshow({ images = DEFAULT_IMAGES, intervalMs = 6000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <div className="bg-slideshow" aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={`bg-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="bg-overlay" />
    </div>
  );
}
