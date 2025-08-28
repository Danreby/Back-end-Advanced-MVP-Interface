import React, { useEffect, useMemo, useState } from "react";
import RatingStars from "../ui/RatingStars";
import { listPublicReviews, loadAllPublicReviews } from "../../API/reviews";

export default function ReviewList() {
  const [page, setPage] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState(null);

  const [skip, setSkip] = useState(0);
  const limit = 50;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listPublicReviews({ skip, limit });
        if (!mounted) return;
        setPage(data);
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [skip]);

  const groups = useMemo(() => {
    const items = page?.items ?? [];
    const map = new Map();

    for (const r of items) {
      const gameName = (r?.game?.name ?? r.game_name ?? `Game ${r.game_id ?? "?"}`).trim();
      const key = gameName || "—";
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }

    const out = Array.from(map.entries()).map(([gameName, items]) => {
      const sum = items.reduce((s, it) => s + (Number(it.rating) || 0), 0);
      const avg = items.length ? (sum / items.length) : 0;
      const gameId = items[0]?.game?.id ?? items[0]?.game_id ?? null;
      const cover = items[0]?.game?.cover_url ?? items[0]?.game?.cover_url ?? null;
      return {
        gameName,
        gameId,
        cover,
        items,
        count: items.length,
        avg,
      };
    });

    out.sort((a, b) => b.count - a.count || b.avg - a.avg);
    return out;
  }, [page]);

  async function handleLoadAll() {
    try {
      setLoadingAll(true);
      setError(null);
      const all = await loadAllPublicReviews({ pageSize: 500 });
      setPage({ total: all.length, items: all });
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoadingAll(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl font-semibold">Reviews</h2>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Mostrando {page.items?.length ?? 0} de {page.total ?? "?"}</div>
          <button
            onClick={() => setSkip((s) => Math.max(0, s - limit))}
            disabled={skip === 0 || loading}
            className="px-2 py-1 border rounded text-sm dark:border-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => setSkip((s) => s + limit)}
            disabled={loading || (page.items?.length < limit)}
            className="px-2 py-1 border rounded text-sm dark:border-gray-600"
          >
            →
          </button>

          <button
            onClick={handleLoadAll}
            disabled={loadingAll}
            className="text-sm px-3 py-1 border rounded dark:border-gray-600"
          >
            {loadingAll ? "Carregando..." : "Carregar todos"}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

      {loading ? (
        <div className="text-sm text-gray-500">Carregando reviews...</div>
      ) : groups.length === 0 ? (
        <div className="text-sm text-gray-500">Nenhuma review pública encontrada.</div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.gameName} className="p-4 border rounded">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700 dark:bg-gray-700">
                    {g.cover ? <img src={g.cover} alt={g.gameName} className="h-full w-full object-cover"/> : (g.gameName.slice(0,2).toUpperCase())}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <a href={`/games/${g.gameId ?? ""}`} className="font-semibold truncate hover:underline" title={g.gameName}>{g.gameName}</a>
                      <div className="text-xs text-gray-500">· {g.count} {g.count === 1 ? "review" : "reviews"}</div>
                    </div>
                    <div className="text-sm text-gray-500">Média: <strong>{g.count ? (Math.round(g.avg * 10) / 10).toFixed(1) : "—"}</strong></div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">Mostrar avaliações</div>
              </div>

              <ul className="mt-3 space-y-2">
                {g.items.map((r) => {
                  const userName = r?.user?.name ?? r.user_name ?? "—";
                  const createdLabel = r.created_at ? (new Date(r.created_at)).toLocaleDateString() : "";
                  return (
                    <li key={r.id ?? `${r.user_id}_${r.game_id}`} className="flex items-start justify-between gap-4 p-2 rounded hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                            {(userName || "-").slice(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <div className="text-sm font-medium truncate">{userName}</div>
                              <div className="text-xs text-gray-500">· {createdLabel}</div>
                            </div>
                            <div className="text-sm text-gray-700 truncate">{r.review_text || "—"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <RatingStars value={Number(r.rating) || 0} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
