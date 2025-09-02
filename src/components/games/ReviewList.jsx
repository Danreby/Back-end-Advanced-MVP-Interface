import React, { useEffect, useMemo, useState } from "react";
import RatingStars from "../ui/RatingStars";
import { listPublicReviews, loadAllPublicReviews } from "../../API/reviews";

export default function ReviewList() {
  const [page, setPage] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState(null);

  const [skip, setSkip] = useState(0);
  const limit = 5; // quantos grupos (jogos) por página

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listPublicReviews({ skip, limit });
        if (!mounted) return;
        setPage({ total: data?.total ?? 0, items: data?.items ?? [] });
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [skip, limit]); // garantir refetch se limit mudar

  useEffect(() => {
    const total = page?.total ?? 0;
    if (total <= 0) return;
    if (skip >= total) {
      const lastPageStart = Math.max(0, Math.floor((total - 1) / limit) * limit);
      if (lastPageStart !== skip) setSkip(lastPageStart);
    }
  }, [page?.total, skip, limit]);

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
      const cover = items[0]?.game?.cover_url ?? items[0]?.game?.cover ?? null;
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
      setSkip(0);
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoadingAll(false);
    }
  }

  // --- paginação por grupos robusta ---
  const totalGroups = page?.total ?? 0; // deve ser número de jogos/grupos
  const totalPages = Math.max(1, Math.ceil(totalGroups / limit));
  const currentPage = totalGroups === 0 ? 0 : Math.floor(skip / limit) + 1;

  function goPrev() {
    setSkip((prev) => {
      const prevPageIndex = Math.max(0, Math.floor(prev / limit) - 1);
      const nextSkip = prevPageIndex * limit;
      return nextSkip;
    });
  }

  function goNext() {
    setSkip((prev) => {
      // cálculo simples e seguro: pular um bloco de `limit`, mas não passar do último bloco
      const lastPageIndex = Math.max(0, Math.ceil(totalGroups / limit) - 1);
      const nextPageIndex = Math.min(lastPageIndex, Math.floor(prev / limit) + 1);
      const nextSkip = nextPageIndex * limit;
      return nextSkip;
    });
  }

  const canGoPrev = currentPage > 1 && !loading;
  const canGoNext = currentPage < totalPages && !loading;

  // debug: descomente se quiser ver valores no console ao clicar
  console.debug({ skip, totalGroups, totalPages, currentPage, itemsReturned: page.items.length });

  const itemsLength = page?.items?.length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl font-semibold">Reviews</h2>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            Mostrando {itemsLength} de {totalGroups ?? "?"}
          </div>

          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className="px-2 py-1 border rounded text-sm dark:border-gray-600"
            title="Página anterior"
          >
            ←
          </button>

          <span className="text-sm text-gray-600 px-2">
            Página {totalGroups === 0 ? 0 : currentPage} / {totalGroups === 0 ? 0 : totalPages}
          </span>

          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="px-2 py-1 border rounded text-sm dark:border-gray-600"
            title="Próxima página"
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
            <div key={g.gameName} className="p-4 border rounded dark:border-gray-700">
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
              </div>

              <ul className="mt-3 space-y-2">
                <details>
                  <summary className="text-sm dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer hover:underline">
                    Mostrar {g.count} {g.count === 1 ? "avaliação" : "avaliações"}
                  </summary>
                  {g.items.map((r) => {
                    const userName = r?.user?.name ?? r.user_name ?? "—";
                    const createdLabel = r.created_at ? (new Date(r.created_at)).toLocaleDateString() : "";
                    return (
                      <li
                        key={r.id ?? `${r.user_id}_${r.game_id}`}
                        className="flex items-start border-t dark:border-gray-700 justify-between gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-50/10"
                      >
                        <div className="flex-1 min-w-0">
                          <details className="group">
                            <summary className="flex items-center gap-3 cursor-pointer list-none">
                              <div className="h-8 w-8 rounded bg-gray-700 text-white dark:bg-gray-100 flex items-center justify-center text-xs font-medium dark:text-gray-700 shrink-0">
                                {(userName || "-").slice(0, 2).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <div className="text-sm font-medium truncate">{userName}</div>
                                  <div className="text-xs text-gray-500">· {createdLabel}</div>
                                </div>
                              </div>
                            </summary>

                            <div className="mt-2 text-sm text-gray-800 dark:text-gray-300">
                              {r.review_text || "—"}
                            </div>
                          </details>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <RatingStars value={Number(r.rating) || 0} />
                        </div>
                      </li>
                    );
                  })}
                </details>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
