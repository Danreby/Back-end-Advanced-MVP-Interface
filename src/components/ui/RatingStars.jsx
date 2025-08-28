// src/components/ui/RatingStars.jsx
import React, { useState, useRef, useEffect } from "react";

export default function RatingStars({
  value = 0,
  onChange = null,
  readOnly = true,
  max = 10,
  size = 20,
  className = "",
  showTooltip = true,
}) {
  const stars = 5;
  const starValue = max / stars; // e.g. 10/5 = 2
  const [internalValue, setInternalValue] = useState(Math.round(value ?? 0));
  const [hoverValue, setHoverValue] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    setInternalValue(Math.round(value ?? 0));
  }, [value]);

  function fillPercentForIndex(i) {
    // v is integer (1..max) or 0
    const v = hoverValue !== null ? hoverValue : internalValue;
    const starMin = i * starValue;
    const starMax = (i + 1) * starValue;
    if (v <= starMin) return 0;
    if (v >= starMax) return 100;
    // v is integer; can produce partial fills when v is inside starMin..starMax
    const pct = ((v - starMin) / starValue) * 100;
    return Math.round(pct);
  }

  function valueFromPointer(event, starIndex) {
    // Compute fractional position across the entire stars block mapped to 0..max,
    // then round to integer 1..max (or 0)
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const clientX = event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX;
    const offsetX = clientX - rect.left;
    // fraction within this star element
    const fracWithinStar = Math.max(0, Math.min(1, offsetX / rect.width));
    // overall fraction across all stars = (starIndex + fracWithinStar) / stars
    const overallFraction = (starIndex + fracWithinStar) / stars;
    let raw = overallFraction * max;
    // Round to nearest integer (1..max). If raw < 0.5 => 0
    raw = Math.round(raw);
    raw = Math.max(0, Math.min(max, raw));
    return raw;
  }

  function handleClick(e, i) {
    if (readOnly || typeof onChange !== "function") return;
    const newVal = valueFromPointer(e, i);
    setInternalValue(newVal);
    onChange(newVal);
  }

  function handlePointerMove(e, i) {
    if (readOnly) return;
    const newVal = valueFromPointer(e, i);
    setHoverValue(newVal);
  }

  function handlePointerLeave() {
    if (readOnly) return;
    setHoverValue(null);
  }

  function handleKeyDown(e) {
    if (readOnly || typeof onChange !== "function") return;
    if (!["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let cur = hoverValue !== null ? hoverValue : internalValue;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") cur = Math.max(0, cur - 1);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") cur = Math.min(max, cur + 1);
    if (e.key === "Home") cur = 0;
    if (e.key === "End") cur = max;
    setInternalValue(cur);
    onChange(cur);
    setHoverValue(null);
  }

  const displayValue = hoverValue !== null ? hoverValue : internalValue;
  const ariaLabel = `Rating ${displayValue} de ${max}`;

  return (
    <div
      ref={rootRef}
      role={readOnly ? "img" : "slider"}
      aria-label={ariaLabel}
      aria-valuemin={readOnly ? undefined : 0}
      aria-valuemax={readOnly ? undefined : max}
      aria-valuenow={readOnly ? undefined : internalValue}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center gap-2 relative ${className}`}
      onMouseLeave={handlePointerLeave}
      style={{ touchAction: readOnly ? "manipulation" : "none" }}
    >
      {showTooltip && (
        <div
          aria-hidden
          className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs px-2 py-0.5 rounded bg-gray-900 text-white pointer-events-none select-none"
          style={{ opacity: displayValue === null ? 0 : 1, transition: "opacity 120ms" }}
        >
          {displayValue} / {max}
        </div>
      )}

      {Array.from({ length: stars }).map((_, i) => {
        const pct = fillPercentForIndex(i); // 0..100
        return (
          <button
            type="button"
            key={i}
            onClick={(e) => handleClick(e, i)}
            onMouseMove={(e) => handlePointerMove(e, i)}
            onTouchMove={(e) => handlePointerMove(e, i)}
            onTouchStart={(e) => handlePointerMove(e, i)}
            onFocus={() => setHoverValue(null)}
            className="p-0 m-0 border-0 bg-transparent"
            style={{ cursor: readOnly ? "default" : "pointer", lineHeight: 0 }}
            aria-hidden={readOnly ? "true" : "false"}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="presentation"
            >
              <defs>
                <linearGradient id={`grad-${i}`} x1="0" x2="1">
                  <stop offset={`${pct}%`} stopColor="currentColor" stopOpacity="1" />
                  <stop offset={`${pct}%`} stopColor="currentColor" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              <path
                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.167L12 18.896l-7.336 3.869 1.402-8.167L.132 9.21l8.2-1.192L12 .587z"
                fill={`url(#grad-${i})`}
                stroke="currentColor"
                strokeWidth="0.5"
                style={{ color: "#f59e0b" }}
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
