import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RatingStars from "../ui/RatingStars";
import { listPublicReviews, loadAllPublicReviews } from "../../API/reviews";
import api from "../../API/axios";

function resolveAvatarUrl(avatar_url) {
  if (!avatar_url) return null;
  if (avatar_url.startsWith("http://") || avatar_url.startsWith("https://")) return avatar_url;
  const baseFromApi = api?.defaults?.baseURL ? String(api.defaults.baseURL).replace(/\/+$/, "") : null;
  const fallbackOrigin = typeof window !== "undefined" ? String(window.location.origin).replace(/\/+$/, "") : "";
  const base = baseFromApi?.startsWith("http") ? baseFromApi : fallbackOrigin;
  if (!base) return avatar_url;
  return avatar_url.startsWith("/") ? `${base}${avatar_url}` : `${base}/${avatar_url.replace(/^\/+/, "")}`;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900/40">
      <div className="flex items-center gap-3">
        <div className="w-12 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ r, index }) {
  const userName = r?.user?.name ?? r.user_name ?? "Usuário";
  const createdLabel = r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "";
  const avatarUrl = r?.user?.avatar_url ? resolveAvatarUrl(r.user.avatar_url) : null;
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
        {avatarUrl ? (
          <img src={avatarUrl} alt={initials} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
            {initials}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{userName}</span>
          {createdLabel && <span className="text-[11px] text-gray-400 dark:text-gray-500">· {createdLabel}</span>}
          <div className="ml-auto flex-shrink-0">
            <RatingStars value={Number(r.rating) || 0} size={12} />
          </div>
        </div>
        {r.review_text && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{r.review_text}</p>
        )}
      </div>
    </motion.div>
  );
}

function GameGroupCard({ group, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 24 }}
      className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Game header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-expanded={open}
      >
        {/* Cover */}
        <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
          {group.cover ? (
            <img src={group.cover} alt={group.gameName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 dark:text-gray-600">
              {group.gameName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{group.gameName}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <RatingStars value={Math.round(group.avg)} size={12} readOnly />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {group.count > 0 ? (Math.round(group.avg * 10) / 10).toFixed(1) : "—"}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">· {group.count} {group.count === 1 ? "review" : "reviews"}</span>
          </div>
        </div>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.355a.75.75 0 011.14.98l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </motion.svg>
      </button>

      {/* Reviews expandable */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="reviews"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-gray-700 px-3 pb-3 max-h-64 overflow-y-auto space-y-1 pt-2">
              {group.items.map((r, i) => (
                <ReviewItem key={r.id ?? `${r.user_id}_${r.game_id}`} r={r} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ReviewList() {
  const [page, setPage] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const limit = 5;

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
      const gameName = (r?.game?.name ?? r.game_name ?? `Jogo ${r.game_id ?? "?"}`).trim();
      const key = gameName || "—";
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([gameName, items]) => {
      const sum = items.reduce((s, it) => s + (Number(it.rating) || 0), 0);
      const avg = items.length ? sum / items.length : 0;
      return {
        gameName,
        gameId: items[0]?.game?.id ?? items[0]?.game_id ?? null,
        cover: items[0]?.game?.cover_url ?? null,
        items,
        count: items.length,
        avg,
      };
    }).sort((a, b) => b.count - a.count || b.avg - a.avg);
  }, [page]);

  async function handleLoadAll() {
    try {
      setLoadingAll(true);
      const all = await loadAllPublicReviews({ pageSize: 500 });
      setPage({ total: all.length, items: all });
      setSkip(0);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoadingAll(false);
    }
  }

  const totalGroups = page?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalGroups / limit));
  const currentPage = totalGroups === 0 ? 0 : Math.floor(skip / limit) + 1;
  const canGoPrev = currentPage > 1 && !loading;
  const canGoNext = currentPage < totalPages && !loading;

  function goPrev() {
    setSkip((prev) => Math.max(0, Math.floor(prev / limit) - 1) * limit);
  }
  function goNext() {
    const lastPageIndex = Math.max(0, Math.ceil(totalGroups / limit) - 1);
    setSkip(Math.min(lastPageIndex, Math.floor(skip / limit) + 1) * limit);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Reviews Públicas</h2>
          {totalGroups > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium">
              {totalGroups}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[48px] text-center">
            {totalGroups === 0 ? "0/0" : `${currentPage}/${totalPages}`}
          </span>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Próxima página"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleLoadAll}
            disabled={loadingAll}
            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loadingAll ? "..." : "Todos"}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nenhuma review pública ainda</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Importe jogos e deixe sua avaliação!</div>
        </motion.div>
      ) : (
        <motion.div
          key={skip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {groups.map((group, i) => (
            <GameGroupCard key={group.gameName} group={group} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
