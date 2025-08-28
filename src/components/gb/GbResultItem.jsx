import React, { useCallback } from "react";

function GbResultItem({ item, onView, onImport }) {
  const cover = item?.image?.medium_url || item?.image?.super_url || item?.image?.small_url;

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


  const handleImportKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.stopPropagation();
      e.preventDefault();
      if (typeof onImport === "function") onImport(item);
    }
  }, [onImport, item]);

  const multilineClamp = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <article
      role="group"
      tabIndex={0}
      aria-label={`Ver ${item?.name ?? "item"}`}
      onClick={handleView}
      onKeyDown={handleKeyDown}
      className="relative flex items-start gap-3 p-3 rounded-2xl transition-transform transition-shadow transform 
        hover:shadow-lg hover:-translate-y-0.5 bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex-none">
        <div className="h-24 w-16 sm:h-28 sm:w-20 md:h-32 md:w-24 overflow-hidden rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {cover ? (
            <img
              src={cover}
              onError={(e) => { e.target.src = "/fallback.png"; }}
              alt={item.name ?? "cover"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-300">
              No image
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate text-sm sm:text-base">{item.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {item.original_release_date ? new Date(item.original_release_date).toLocaleDateString() : "—"}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[8rem] sm:max-w-[12rem]">
              {item.platforms ? item.platforms.map(p => p.name).slice(0, 2).join(", ") : ""}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1" style={multilineClamp} title={item.deck || item.description}>
          {item.deck || item.description || "—"}
        </div>
      </div>
    </article>
  );
}

export default React.memo(GbResultItem);
