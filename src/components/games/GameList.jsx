import React, { useEffect, useState } from "react";
import RatingStars from "../ui/RatingStars";

const STATUS_STYLE = {
  wishlist:  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  on_going:  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  stand_by:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  dropped:   "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const STATUS_LABEL = {
  wishlist: "Wishlist",
  on_going: "Jogando",
  stand_by: "Stand by",
  dropped: "Abandonado",
  completed: "Concluído",
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

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
        g?.user_review?.rating != null ? g.user_review.rating :
        g.rating != null ? g.rating :
        g.avg_rating != null ? g.avg_rating :
        g?.giantbomb?.rating != null ? g.giantbomb.rating : 0;
      const n = Number(r || 0);
      return Number.isFinite(n) ? Math.round(n) : 0;
    } catch {
      return 0;
    }
  };

  const isPaginatedButNotAllShown = games && Array.isArray(games.items) && (typeof games.total !== "undefined" || typeof games.totalCount !== "undefined") && list.length < (games.total ?? games.totalCount);

  return (
    <div>
      {isPaginatedButNotAllShown && (
        <div className="text-sm text-right mb-2">
          {loadingAll ? (
            <span className="text-gray-500">Carregando todos os jogos...</span>
          ) : (
            <div className="flex items-center gap-2 justify-end">
              {loadError && <span className="text-xs text-red-500">Erro: {loadError}</span>}
              {typeof loadAll === "function" && (
                <button
                  onClick={async () => {
                    try {
                      setLoadingAll(true);
                      setLoadError(null);
                      const res = await loadAll();
                      setList(Array.isArray(res) ? res : (res?.items || []));
                    } catch (err) {
                      setLoadError(err.message || String(err));
                    } finally {
                      setLoadingAll(false);
                    }
                  }}
                  className="text-sm px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Carregar todos
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {(!list || list.length === 0) ? (
        <div className="mt-4 text-sm text-gray-500">Nenhum jogo no catálogo.</div>
      ) : (
        <ul className="mt-2 space-y-2">
          {list.map((g) => {
            const ratingValue = computeRating(g);
            const statusKey = (g.status || "").toLowerCase().replace(" ", "_");
            const statusLabel = STATUS_LABEL[statusKey] || g.status || "—";
            const statusCls = STATUS_STYLE[statusKey] || STATUS_STYLE.wishlist;

            const dateInfo = g.finish_date
              ? `Concluído em ${formatDate(g.finish_date)}`
              : g.start_date
              ? `Iniciado em ${formatDate(g.start_date)}`
              : g.created_at
              ? `Adicionado em ${formatDate(g.created_at)}`
              : null;

            return (
              <li
                key={g.id ?? g._id ?? g.name}
                onClick={() => onView && onView(g)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 bg-white dark:bg-gray-900/40 cursor-pointer transition-all"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onView && onView(g); }}
              >
                {/* Capa */}
                <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
                  {g.cover_url ? (
                    <img
                      src={g.cover_url}
                      alt={g.name}
                      onError={(e) => { e.target.style.display = "none"; }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {(g.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={g.name}>
                    {g.name}
                  </div>

                  <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCls}`}>
                    {statusLabel}
                  </span>

                  {dateInfo && (
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {dateInfo}
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <RatingStars value={ratingValue} />
                  <div className="text-[11px] text-gray-400 dark:text-gray-500">
                    {ratingValue > 0 ? `${ratingValue}/10` : "Sem nota"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
