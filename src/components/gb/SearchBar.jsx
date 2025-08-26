import React, { useState } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Pesquisar na GiantBomb...",
}) {
  const [q, setQ] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-400"
      />

      <button
        type="submit"
        aria-label="Buscar"
        title="Buscar"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-md text-gray-800 dark:text-white mr-2 hover:text-gray-950 focus:outline-none focus:ring-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}
