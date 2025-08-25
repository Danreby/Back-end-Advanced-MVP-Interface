// src/components/ui/RatingStars.jsx
import React, { useState, useRef, useEffect } from "react";

/**
 * RatingStars
 *
 * Props:
 * - value: number (0..max)
 * - onChange: function(newValue)  // se fornecido, o componente fica interativo
 * - readOnly: boolean (default true)
 * - max: number (default 10)  -- escala total (ex.: 10)
 * - step: number (default 1)  -- incrementos (1 or 0.5)
 * - size: number (px) tamanho do ícone (default 20)
 * - className: string (opcional)
 *
 * O componente renderiza 5 estrelas (UI usual). Cada estrela representa max/5 pontos.
 * Se `step` for 0.5, permite seleção de meio-estrela.
 */
export default function RatingStars({
  value = 0,
  onChange = null,
  readOnly = true,
  max = 10,
  step = 1,
  size = 20,
  className = "",
}) {
  const stars = 5;
  const starValue = max / stars; // ex: 10/5 = 2 points per star
  const [internalValue, setInternalValue] = useState(value ?? 0);
  const [hoverValue, setHoverValue] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    setInternalValue(value ?? 0);
  }, [value]);

  // calcula preenchimento da estrela i (0..4) em %, considerando hover se presente
  function fillPercentForIndex(i) {
    const v = hoverValue !== null ? hoverValue : internalValue;
    const starMin = i * starValue; // pontos já cobertos antes desta estrela
    const starMax = (i + 1) * starValue;
    if (v <= starMin) return 0;
    if (v >= starMax) return 100;
    // parcial
    const pct = ((v - starMin) / starValue) * 100;
    return Math.round(pct);
  }

  // converte posição do clique/hover em valor (considera step)
  function valueFromPointer(event, starIndex) {
    const target = event.currentTarget; // star element
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const half = x < rect.width / 2;
    // pontos base para esta estrela
    const base = starIndex * starValue;
    let addition;
    if (step >= starValue) {
      // step equals starValue (e.g. max=5), coarse mapping
      addition = starValue;
    } else {
      // decide 50% or 100% for half step, otherwise compute according to exact pointer
      if (step < starValue && step >= starValue / 2) {
        // typical: step 1, starValue 2 -> left=1 right=2
        addition = half ? starValue / 2 : starValue;
      } else {
        // fallback: compute precise fraction then round to nearest step
        const fraction = Math.max(0, Math.min(1, x / rect.width));
        let raw = base + fraction * starValue;
        // round to nearest step
        raw = Math.round(raw / step) * step;
        return Math.max(0, Math.min(max, raw));
      }
    }
    const raw = base + addition;
    // round to step
    const rounded = Math.round(raw / step) * step;
    return Math.max(0, Math.min(max, rounded));
  }

  // handle click on a star
  function handleClick(e, i) {
    if (readOnly || typeof onChange !== "function") return;
    const newVal = valueFromPointer(e, i);
    setInternalValue(newVal);
    onChange(newVal);
  }

  function handleMouseMove(e, i) {
    if (readOnly) return;
    const newVal = valueFromPointer(e, i);
    setHoverValue(newVal);
  }
  function handleMouseLeave() {
    if (readOnly) return;
    setHoverValue(null);
  }

  // keyboard support when interactive: Left/Right arrows adjust by step
  function handleKeyDown(e) {
    if (readOnly || typeof onChange !== "function") return;
    if (!["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let cur = hoverValue !== null ? hoverValue : internalValue;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") cur = Math.max(0, cur - step);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") cur = Math.min(max, cur + step);
    if (e.key === "Home") cur = 0;
    if (e.key === "End") cur = max;
    cur = Math.round(cur / step) * step;
    setInternalValue(cur);
    onChange(cur);
    setHoverValue(null);
  }

  // accessible label
  const ariaLabel = `Rating ${internalValue} de ${max}`;

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
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: stars }).map((_, i) => {
        const pct = fillPercentForIndex(i); // 0..100
        return (
          <button
            type="button"
            key={i}
            onClick={(e) => handleClick(e, i)}
            onMouseMove={(e) => handleMouseMove(e, i)}
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
