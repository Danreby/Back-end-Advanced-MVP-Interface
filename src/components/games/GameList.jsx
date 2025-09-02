import React, { useEffect, useState } from "react";
import RatingStars from "../ui/RatingStars";

export default function GameList({ games, onView, onEdit, loadAll }) {
  const [list, setList] = useState(() => Array.isArray(games) ? games : (games?.items || []));
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setList(Array.isArray(games) ? games : (games?.items || []));
  }, [games]);

  useEffect(() => {
    const isPaginated = !!(games && Array.isArray(games.items) && (typeof games.total !== "undefined" || typeof games.totalCount !== "undefined"));
    const total = isPaginated ? (games.total ?? games.totalCount) : null;
    if (!isPaginated || !total || !Array.isArray(games.items) || games.items.length >= total || typeof loadAll !== "function") return;

    let mounted = true;
    (async () => {
      try {
        setLoadingAll(true);
        setLoadError(null);
        const res = await loadAll();
        if (!mounted) return;
        setList(Array.isArray(res) ? res : (res?.items || []));
      } catch (err) {
        console.error("GameList loadAll error:", err);
        if (mounted) setLoadError(err.message || String(err));
      } finally {
        if (mounted) setLoadingAll(false);
      }
    })();
    return () => (mounted = false);
  }, [games, loadAll]);

  const computeRating = (g) => {
    try {
      const r =
        (g?.user_review?.rating != null ? g.user_review.rating :
         (g.rating != null ? g.rating :
           (g.avg_rating != null ? g.avg_rating :
             (g?.giantbomb?.rating != null ? g.giantbomb.rating : 0))));
      const n = Number(r || 0);
      return Number.isFinite(n) ? Math.round(n) : 0;
    } catch {
      return 0;
    }
  };

  const total = list.length;
  const sum = list.reduce((s, g) => s + (Number(computeRating(g)) || 0), 0);
  const avg = total ? sum / total : 0;
  const avgDisplay = total ? (Math.round(avg * 10) / 10).toFixed(1) : "—";

  const isPaginatedButNotAllShown = games && Array.isArray(games.items) && (typeof games.total !== "undefined" || typeof games.totalCount !== "undefined") && list.length < (games.total ?? games.totalCount);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        {isPaginatedButNotAllShown && (
          <div className="text-sm text-right">
            {loadingAll ? (
              <span className="text-gray-500">Carregando todos os jogos...</span>
            ) : (
              <div className="flex items-center gap-2">
                {loadError && <span className="text-xs text-red-500">Erro: {loadError}</span>}
                {typeof loadAll === "function" ? (
                  <button
                    onClick={async () => {
                      try {
                        setLoadingAll(true);
                        setLoadError(null);
                        const res = await loadAll();
                        setList(Array.isArray(res) ? res : (res?.items || []));
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
                  <span className="text-xs text-gray-500">Passe a prop <code>loadAll</code> para carregar tudo.</span>
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
          {list.map((g) => {
            const ratingValue = computeRating(g);
            return (
              <li
                key={g.id ?? g._id ?? g.name}
                onClick={() => onView && onView(g)}
                className="flex items-start justify-between gap-4 p-3 border rounded hover:shadow-sm dark:border-gray-700 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onView && onView(g); }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                      {(g.name || "-").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <a
                          href={`/games/${g.id ?? g._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium truncate hover:underline"
                          title={g.name}
                        >
                          {g.name}
                        </a>
                        <div className="text-xs text-gray-500">· {g.status || "—"}</div>
                      </div>
                      <div className="text-sm text-gray-500 truncate">{g.description || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <RatingStars value={ratingValue} />
                  <div className="text-xs text-gray-500">{ratingValue > 0 ? `${ratingValue}/10` : "—"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
