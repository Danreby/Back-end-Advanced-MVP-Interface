import React, { useState } from "react";

export default function UserSearchForm({ value = "", onChange = () => {}, onSearch = () => {} }) {
  const [q, setQ] = useState(value);

  function submit(e) {
    e.preventDefault();
    onSearch(q.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-full">
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); }}
        placeholder="Pesquisar por nome ou email..."
        className="flex-1 rounded-md p-1 border bg-white dark:bg-gray-800 dark:text-white"
      />
      <button type="submit" className="p-1 rounded-md bg-indigo-600 text-white">Buscar</button>
    </form>
  );
}
