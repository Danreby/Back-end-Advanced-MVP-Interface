import React, { useCallback } from "react";

export default function GbResultItem({ item, onView, onImport }) {
  const cover = item?.image?.medium_url || item?.image?.super_url || item?.image?.small_url;

  const handleView = useCallback((e) => {
    if (typeof onView === "function") {
      onView(item);
    }
  }, [onView, item]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      handleView();
    }
  }, [handleView]);

  const multilineClamp = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver ${item?.name ?? 'item'}`}
      onClick={handleView}
      onKeyDown={handleKeyDown}
      className="flex items-start gap-3 p-3 border rounded hover:shadow-sm dark:border-gray-700 cursor-pointer transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex-none">
        {cover ? (
          <img
            src={cover || "/fallback.png"}
            onError={(e) => { e.target.src = "/fallback.png"; }}
            alt={item.name ?? "cover"}
            className="h-16 w-12 sm:h-20 sm:w-14 md:h-24 md:w-16 object-cover rounded"
          />
        ) : (
          <div className="h-16 w-12 sm:h-20 sm:w-14 md:h-24 md:w-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate text-sm sm:text-base">{item.name}</div>

            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.original_release_date ? new Date(item.original_release_date).toLocaleDateString() : "—"}</div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[8rem] sm:max-w-[12rem]">
              {item.platforms ? item.platforms.map(p => p.name).slice(0,2).join(", ") : ""}
            </div>
          </div>
        </div>

        <div
          className="text-sm text-gray-500 dark:text-gray-400 mt-1"
          style={multilineClamp}
          title={item.deck || item.description}
        >
          {item.deck || item.description || "—"}
        </div>
      </div>
    </div>
  );
}
