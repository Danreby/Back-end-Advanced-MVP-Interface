import React from "react";

export default function FilterButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-20 inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      aria-label="Abrir filtros"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M10 18h4v-2h-4v2zm-7-6h18v-2H3v2zm3-6v2h12V6H6z" fill="currentColor" />
      </svg>
      <span>Filtros</span>
    </button>
  );
}
