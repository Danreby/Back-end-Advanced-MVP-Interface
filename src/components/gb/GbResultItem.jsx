// src/components/gb/GbResultItem.jsx
import React from "react";

export default function GbResultItem({ item, onView, onImport }) {
  const cover = item?.image?.medium_url || item?.image?.super_url || item?.image?.small_url;
  return (
    <li className="flex items-start gap-3 p-3 border rounded hover:shadow-sm dark:border-gray-700">
      <div className="flex-none">
        {cover ? (
          <img src={cover} alt={item.name} className="h-16 w-12 object-cover rounded" />
        ) : (
          <div className="h-16 w-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="font-medium truncate">{item.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.original_release_date ? new Date(item.original_release_date).toLocaleDateString() : "—"}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.platforms ? item.platforms.map(p => p.name).slice(0,2).join(", ") : ""}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onView(item)} className="text-sm px-2 py-1 border rounded text-gray-700 dark:text-gray-200 dark:border-gray-700">
                Ver
              </button>
              <button onClick={() => onImport(item)} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">
                Importar
              </button>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{item.deck || item.description || "—"}</div>
      </div>
    </li>
  );
}
