// src/components/gb/SearchBar.jsx
import React, { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Pesquisar na GiantBomb..." }) {
  const [q, setQ] = useState("");

  return (
    <div className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSearch(q); }}
        placeholder={placeholder}
        className="flex-1 rounded-md border px-3 py-2 bg-white dark:bg-gray-800 shadow-sm focus:outline-none"
      />
      <button onClick={() => onSearch(q)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Buscar</button>
    </div>
  );
}
