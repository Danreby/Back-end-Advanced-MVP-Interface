import React, { useState } from "react";

export default function UserSearchForm({ onSearch = () => {} }) {
  const [q, setQ] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const val = q.trim();
    if (val) onSearch(val);
  }

  function handleChange(e) {
    setQ(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-full">
      <input
        type="search"
        value={q}
        onChange={handleChange}
        placeholder="Pesquisar por nome ou email..."
        className="
          flex-1 rounded-lg px-3 py-2 text-sm
          border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600
          transition
        "
      />
      <button
        type="submit"
        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
      >
        Buscar
      </button>
    </form>
  );
}
