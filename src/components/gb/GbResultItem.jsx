import React, { useCallback, useState } from "react";

function GbResultItem({ item, onView, onImport }) {
  const cover = item?.image?.medium_url || item?.image?.super_url || item?.image?.small_url;
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleView = useCallback((e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (typeof onView === "function") onView(item);
  }, [onView, item]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      handleView();
    }
  }, [handleView]);

  const handleImport = useCallback(async (e) => {
    e.stopPropagation();
    if (importing || imported || typeof onImport !== "function") return;
    setImporting(true);
    try {
      await onImport(item);
      setImported(true);
    } catch {
      //
    } finally {
      setImporting(false);
    }
  }, [importing, imported, onImport, item]);

  const platforms = item?.platforms?.map(p => p.name).slice(0, 2).join(", ") || "";

  return (
    <article
      role="group"
      tabIndex={0}
      aria-label={`Ver ${item?.name ?? "item"}`}
      onClick={handleView}
      onKeyDown={handleKeyDown}
      className="relative flex items-start gap-3 p-3 rounded-2xl transition-all transform
        hover:shadow-lg hover:-translate-y-0.5 bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex-none">
        <div className="h-24 w-16 sm:h-28 sm:w-20 overflow-hidden rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {cover ? (
            <img
              src={cover}
              onError={(e) => { e.target.src = "/fallback.png"; }}
              alt={item.name ?? "cover"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 px-1 text-center leading-tight">
              Sem imagem
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm sm:text-base leading-tight truncate pr-8">
          {item.name}
        </div>

        {item.original_release_date && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {new Date(item.original_release_date).getFullYear()}
          </div>
        )}

        {platforms && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.platforms.slice(0, 2).map((p) => (
              <span
                key={p.name}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}

        {(item.deck || item.description) && (
          <p
            className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2"
            title={item.deck || item.description}
          >
            {item.deck || item.description}
          </p>
        )}
      </div>

      <button
        onClick={handleImport}
        disabled={importing || imported}
        aria-label={imported ? "Jogo importado" : "Importar jogo"}
        className={`absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-all
          ${imported
            ? "bg-green-500 text-white cursor-default"
            : importing
            ? "bg-indigo-300 text-white cursor-wait"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
      >
        {importing ? (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : imported ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span>+</span>
        )}
      </button>
    </article>
  );
}

export default React.memo(GbResultItem);
