import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";
import { logout } from "../API/auth";
import GameList from "../components/games/GameList";
import GameReviewModal from "../components/gb/GameReviewModal";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { isAuthenticated } from "../API/auth";
import MyGamesFilter from "../components/games/MyGamesFilter";
import FilterButton from "../components/common/FilterButton";
import { getGameDetails, importGameToCatalog } from "../API/gbApi";
import * as gamesApi from "../API/games";
import * as reviewsApi from "../API/reviews";

function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function MyGames() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState(null);

  const [selectedGame, setSelectedGame] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery, 250);
  const [statusFilter, setStatusFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recent");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [loadingGb, setLoadingGb] = useState(false);
  const [gbError, setGbError] = useState(null);

  useEffect(() => {
    const token = isAuthenticated();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    let mounted = true;
    getProfile()
      .then((u) => mounted && setUser(u))
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      })
      .finally(() => mounted && setLoadingProfile(false));
    return () => (mounted = false);
  }, []);

  const handleGameUpdated = useCallback((updated) => {
    if (!updated) return;
    setGames((prev = []) => {
      const id = updated.id ?? updated.game_id ?? null;
      const ext = updated.external_guid ?? updated.externalGuid ?? null;
      if (id !== null) {
        const exists = prev.some((g) => Number(g.id) === Number(id));
        return exists ? prev.map((g) => (Number(g.id) === Number(id) ? { ...g, ...updated } : g)) : [{ ...updated }, ...prev];
      }
      if (ext) {
        const exists = prev.some((g) => (g.external_guid || g.externalGuid) === ext);
        return exists ? prev.map((g) => ((g.external_guid || g.externalGuid) === ext ? { ...g, ...updated } : g)) : [{ ...updated }, ...prev];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoadingGames(true);
    setGamesError(null);

    (async () => {
      try {
        const myGames = await gamesApi.loadAllMyGames({ pageSize: 200 });
        const reviewsPage = await reviewsApi.listMyReviews({ skip: 0, limit: 1000 });
        const myReviews = reviewsPage?.items || [];

        const reviewsByGame = {};
        myReviews.forEach((r) => {
          if (r.game_id) reviewsByGame[Number(r.game_id)] = r;
          else if (r.external_guid) reviewsByGame[`ext:${r.external_guid}`] = r;
        });

        const normalized = (myGames || []).map((g) => {
          const rating = typeof g.avg_rating !== "undefined" && g.avg_rating !== null ? Number(g.avg_rating) : (typeof g.rating !== "undefined" ? Number(g.rating || 0) : 0);
          const review = (g.id && reviewsByGame[g.id]) || (g.external_guid && reviewsByGame[`ext:${g.external_guid}`]) || null;
          return { ...g, rating, reviews_count: Number(g.reviews_count || 0), user_review: review || undefined };
        });

        if (!mounted) return;
        setGames(Array.isArray(normalized) ? normalized : []);
      } catch (err) {
        console.error("Erro ao carregar jogos:", err);
        if (mounted) {
          setGamesError(String(err?.message || err));
          setGames([]);
        }
      } finally {
        mounted && setLoadingGames(false);
      }
    })();

    return () => (mounted = false);
  }, [user]);

  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? [...games] : [];

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((g) => (g.name || g.title || "").toString().toLowerCase().includes(q));
    }

    if (statusFilter && statusFilter !== "all") {
      list = list.filter((g) => ((g.status || "") + "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (minRating && Number(minRating) > 0) {
      const min = Number(minRating);
      list = list.filter((g) => Number(g.rating || 0) >= min);
    }

    if (sortBy === "recent") list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    else if (sortBy === "oldest") list.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    else if (sortBy === "rating_desc") list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    else if (sortBy === "rating_asc") list.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));

    return list;
  }, [games, debouncedQuery, statusFilter, minRating, sortBy]);

  const handleViewGame = useCallback(
    async (g) => {
      setSelectedGame(null);
      setGbError(null);
      setLoadingGb(true);
      try {
        let backendGame = null;
        if (g.id) {
          backendGame = await gamesApi.getGameWithMyReview(g.id).catch(() => null);
        }
        const external =
          backendGame?.external_guid || null;
        if (!external) throw new Error("external_guid do GiantBomb não encontrado para este jogo.");
        const gbData = await getGameDetails(external);
        setSelectedGame({ ...(backendGame ?? g), giantbomb: gbData });
        setDrawerOpen(false);
      } catch (err) {
        console.error("Erro ao carregar detalhes do GiantBomb:", err);
        setGbError(err.message || String(err));
      } finally {
        setLoadingGb(false);
      }
    },
    []
  );

  const handleCloseModal = useCallback(() => setSelectedGame(null), []);

  const handleImport = useCallback(
    async (item) => {
      try {
        const newGame = await importGameToCatalog(item);
        if (!newGame) return;
        setGames((prev = []) => [newGame, ...prev.filter((g) => g.id !== newGame.id)]);
        setSelectedGame(null);
      } catch (err) {
        console.error("Falha ao importar jogo:", err);
      }
    },
    []
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setMinRating(0);
    setSortBy("recent");
  }, []);

  if (loadingProfile) {
    return <LoadingOverlay open text="Carregando perfil..." />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <div className="flex gap-2 items-center">
          <motion.h1 className="text-2xl font-bold">Games</motion.h1>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">Mostrando todos os jogos do seu perfil</div>

        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Seus Jogos</h2>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Mostrando <strong>{filteredGames.length}</strong> de <strong>{games.length}</strong></div>
                <FilterButton onClick={() => setDrawerOpen(true)} />
              </div>
            </div>

            {loadingGames ? (
              <div className="mt-4 space-y-3">
                <div className="animate-pulse grid grid-cols-3 gap-3">
                  <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg col-span-1" />
                  <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg col-span-1" />
                  <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg col-span-1" />
                </div>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Nenhum jogo encontrado com os filtros atuais.</div>
            ) : (
              <div className="mt-4">
                <GameList games={filteredGames} onView={handleViewGame} onEdit={(g) => console.log("edit", g)} />
              </div>
            )}

            {gamesError && <div className="text-sm text-red-500 mt-2">{gamesError}</div>}
            {gbError && <div className="text-sm text-red-500 mt-2">{gbError}</div>}
          </motion.div>

          <aside className="rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="font-semibold">Estatísticas</div>
              <div className="mt-2">Total de jogos: <strong>{games.length}</strong></div>
              <div className="mt-1">Filtrados: <strong>{filteredGames.length}</strong></div>
              <div className="mt-1">Último carregamento: <span className="text-xs text-gray-400">{new Date().toLocaleString()}</span></div>
            </div>
          </aside>
        </div>
      </main>

      <GameReviewModal isOpen={!!selectedGame} onClose={handleCloseModal} game={selectedGame} onImport={handleImport} onStatusChange={handleGameUpdated} />

      <MyGamesFilter
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        minRating={minRating}
        setMinRating={setMinRating}
        sortBy={sortBy}
        setSortBy={setSortBy}
        clearFilters={clearFilters}
      />

      <LoadingOverlay open={loadingGames || loadingProfile || loadingGb} text={loadingGb ? "Buscando detalhes..." : "Carregando..."} />
    </div>
  );
}
