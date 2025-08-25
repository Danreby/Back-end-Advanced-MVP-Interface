import React from "react";
import RatingStars from "../ui/RatingStars";

export default function GameList({ games, onView, onEdit }) {
  const list = Array.isArray(games)
    ? games
    : (games && Array.isArray(games.items) ? games.items : []);

  if (!list || list.length === 0) {
    return <div className="mt-4 text-sm text-gray-500">Nenhum jogo no catálogo.</div>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {list.map((g) => (
        <li key={g.id} className="flex items-start justify-between gap-4 p-3 border rounded hover:shadow-sm dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                {g.name.slice(0,2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <a href={`/games/${g.id}`} className="font-medium truncate hover:underline" title={g.name}>{g.name}</a>
                  <div className="text-xs text-gray-500">· {g.status}</div>
                </div>
                <div className="text-sm text-gray-500 truncate">{g.description || "—"}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <RatingStars value={g.rating} />
            <div className="flex gap-2">
              <button onClick={() => onView(g)} className="text-sm px-2 py-1 border rounded">Ver</button>
              <button onClick={() => onEdit(g)} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">Editar</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
