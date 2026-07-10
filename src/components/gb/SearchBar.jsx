import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({ onSearch, placeholder = "Pesquisar jogos...", loading = false }) {
  const [query, setQuery] = useState("");
  const timerRef = useRef(null);

  const triggerSearch = useCallback((val) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { onSearch(""); return; }
    timerRef.current = setTimeout(() => onSearch(val.trim()), 480);
  }, [onSearch]);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    triggerSearch(val);
  }, [triggerSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch("");
  }, [onSearch]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim()) onSearch(query.trim());
  }, [query, onSearch]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      {/* Left icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.svg key="spinner" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </motion.svg>
          ) : (
            <motion.svg key="search" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      <input
        type="search"
        value={query}
        maxLength={255}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
      />

      {/* Clear button */}
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Limpar busca"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
}
