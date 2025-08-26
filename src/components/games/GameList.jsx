import React, { useEffect, useState } from "react";
import RatingStars from "../ui/RatingStars";

/**
 * GameList
 * Props:
 *  - games: Array | { items: Array, total?: number|totalCount }
 *  - onView(game)
 *  - onEdit(game)
 *  - loadAll: optional async function that returns all games (Array or { items: Array })
 */
export default function GameList({ games, onView, onEdit, loadAll }) {
  const [list, setList] = useState(() => {
    if (Array.isArray(games)) return games;
    if (games && Array.isArray(games.items)) return games.items;
    return [];
  });
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // normalize when games prop changes
    if (Array.isArray(games)) return setList(games);
    if (games && Array.isArray(games.items)) return setList(games.items);
    setList([]);
  }, [games]);

  useEffect(() => {
    // If the provided games object looks paginated and we have a loader, try to auto-load all games
    const isPaginated = games && Array.isArray(games.items) && (typeof games.total !== "undefined" || typeof games.totalCount !== "undefined");
    const total = isPaginated ? (games.total ?? games.totalCount) : null;

    if (isPaginated && total && Array.isArray(games.items) && games.items.length < total && typeof loadAll === "function") {
      let mounted = true;
      (async () => {
        try {
          setLoadingAll(true);
          setLoadError(null);
          const res = await loadAll();
          if (!mounted) return;
          if (Array.isArray(res)) setList(res);
          else if (res && Array.isArray(res.items)) setList(res.items);
        } catch (err) {
          console.error("GameList: falha ao carregar todos os jogos:", err);
          if (mounted) setLoadError(err.message || String(err));
        } finally {
          if (mounted) setLoadingAll(false);
        }
      })();
      return () => { mounted = false; };
    }
  }, [games, loadAll]);

  // compute average rating (ignore null/undefined, but treat non-number as 0)
  const total = list.length;
  const sum = list.reduce((s, g) => s + (Number(g && g.rating) || 0), 0);
  const avg = total ? sum / total : 0;
  const avgDisplay = total ? (Math.round(avg * 10) / 10).toFixed(1) : "—";

  const isPaginatedButNotAllShown = games && Array.isArray(games.items) && (typeof games.total !== "undefined" || typeof games.totalCount !== "undefined") && list.length < (games.total ?? games.totalCount);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <strong>{total}</strong> jogo{total !== 1 ? "s" : ""} • Média das notas: <strong>{avgDisplay}</strong>
        </div>
        {isPaginatedButNotAllShown && (
          <div className="text-sm text-right">
            {loadingAll ? (
              <span className="text-gray-500">Carregando todos os jogos...</span>
            ) : (
              <div className="flex items-center gap-2">
                {loadError && <span className="text-xs text-red-500">Erro ao carregar: {loadError}</span>}
                {typeof loadAll === "function" ? (
                  <button
                    onClick={async () => {
                      try {
                        setLoadingAll(true);
                        setLoadError(null);
                        const res = await loadAll();
                        if (Array.isArray(res)) setList(res);
                        else if (res && Array.isArray(res.items)) setList(res.items);
                      } catch (err) {
                        console.error(err);
                        setLoadError(err.message || String(err));
                      } finally {
                        setLoadingAll(false);
                      }
                    }}
                    className="text-sm px-2 py-1 border rounded"
                  >
                    Carregar todos
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">Nem todos os jogos foram carregados. Passe a prop <code>loadAll</code> para carregar todos.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {(!list || list.length === 0) ? (
        <div className="mt-4 text-sm text-gray-500">Nenhum jogo no catálogo.</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((g) => (
            <li key={g.id ?? g._id ?? g.name} className="flex items-start justify-between gap-4 p-3 border rounded hover:shadow-sm dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                    {(g.name || "").slice(0, 2).toUpperCase()
                  }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <a href={`/games/${g.id ?? g._id}`} className="font-medium truncate hover:underline" title={g.name}>{g.name}</a>
                      <div className="text-xs text-gray-500">· {g.status || "—"}</div>
                    </div>
                    <div className="text-sm text-gray-500 truncate">{g.description || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <RatingStars value={Number(g.rating) || 0} />
                <div className="flex gap-2">
                  <button onClick={() => onView && onView(g)} className="text-sm px-2 py-1 border rounded">Ver</button>
                  <button onClick={() => onEdit && onEdit(g)} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">Editar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
