import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";
import { logout } from "../API/auth";
import GameList from "../components/games/GameList";
import GameDetailModal from "../components/gb/GameDetailModal";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { isAuthenticated } from "../API/auth";
import MyGamesFilter from "../components/games/MyGamesFilter";
import FilterButton from "../components/common/FilterButton";

export default function MyGames() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState(null);

  const [selectedGame, setSelectedGame] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recent");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;

    const token = isAuthenticated();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    getProfile()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      })
      .finally(() => mounted && setLoadingProfile(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function fetchMyGames() {
      setLoadingGames(true);
      setGamesError(null);

      function apiBase() {
        try {
          if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
            return String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");
          }
        } catch (e) {}
        try {
          if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) {
            return String(process.env.REACT_APP_API_URL).replace(/\/+$/, "");
          }
        } catch (e) {}
        if (typeof window !== "undefined") {
          const hostname = window.location.hostname;
          if (hostname === "localhost" || hostname === "127.0.0.1") {
            return "http://127.0.0.1:8000";
          }
          return window.location.origin.replace(/\/+$/, "");
        }
        return "";
      }

      const base = apiBase();
      const token = localStorage.getItem("token");
      const endpoints = [
        `${base}/games/my`,
        `${base}/games/user/${user.id}`,
        `${base}/users/${user.id}/games`,
        `${base}/games?user_id=${user.id}`,
        `${base}/games/all`,
      ];

      let got = null;
      let lastError = null;

      for (let i = 0; i < endpoints.length; i++) {
        const url = endpoints[i];
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) {
            lastError = `status ${res.status} (${url})`;
            continue;
          }
          const data = await res.json();
          if (Array.isArray(data)) {
            got = { url, data };
            break;
          }
          if (data && Array.isArray(data.results)) {
            got = { url, data: data.results };
            break;
          }
          if (data && Array.isArray(data.games)) {
            got = { url, data: data.games };
            break;
          }
          if (data && data.id) {
            got = { url, data: [data] };
            break;
          }
        } catch (err) {
          lastError = err.message || String(err);
        }
      }

      if (!got) {
        try {
          const res = await fetch(`${base}/games/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error(`status ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            const filtered = data.filter((g) => {
              return Number(g.user_id) === Number(user.id) || Number(g.owner_id) === Number(user.id) || (g.user && Number(g.user.id) === Number(user.id));
            });
            got = { url: `${base}/games/all (filtered)`, data: filtered };
          } else if (data && Array.isArray(data.results)) {
            const filtered = data.results.filter((g) => Number(g.user_id) === Number(user.id) || Number(g.owner_id) === Number(user.id));
            got = { url: `${base}/games/all.results (filtered)`, data: filtered };
          } else {
            throw new Error("Nenhum array retornado de /games/all");
          }
        } catch (err) {
          setGamesError(`Falha ao carregar jogos: ${lastError || err.message || err}`);
          setGames([]);
          setLoadingGames(false);
          return;
        }
      }

      const normalized = Array.isArray(got.data)
        ? got.data.map((g) => ({
            ...g,
            rating:
              typeof g.avg_rating !== "undefined" && g.avg_rating !== null
                ? Number(g.avg_rating)
                : typeof g.rating !== "undefined"
                ? Number(g.rating || 0)
                : 0,
            reviews_count:
              typeof g.reviews_count !== "undefined" ? Number(g.reviews_count) : 0,
          }))
        : [];

      if (mounted) {
        setGames(normalized);
        setLoadingGames(false);
      }
    }

    fetchMyGames();

    return () => {
      mounted = false;
    };
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

    if (sortBy === "recent") {
      list.sort((a, b) => (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime()));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => (new Date(a.created_at || 0).getTime()) - (new Date(b.created_at || 0).getTime()));
    } else if (sortBy === "rating_desc") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "rating_asc") {
      list.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
    }

    return list;
  }, [games, debouncedQuery, statusFilter, minRating, sortBy]);

  function handleViewGame(g) {
    setSelectedGame(g);
  }
  function handleCloseModal() {
    setSelectedGame(null);
  }
  function clearFilters() {
    setSearchQuery("");
    setDebouncedQuery("");
    setStatusFilter("all");
    setMinRating(0);
    setSortBy("recent");
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
        <motion.div className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60" animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40" animate={{ x: [0, -30, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} />

        <LoadingOverlay open={true} text={"Carregando perfil..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <motion.div className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60" animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40" animate={{ x: [0, -30, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div className="absolute left-1/2 top-8 w-64 h-64 rounded-full filter blur-2xl opacity-25 bg-pink-200/30 dark:bg-violet-900/30 transform -translate-x-1/2" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 7, repeat: Infinity }} />

      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <div className="flex gap-2 items-center">
          <motion.h1 className="text-2xl font-bold" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>Meus Jogos</motion.h1>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">Mostrando todos os jogos do seu perfil</div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700" variants={cardVariants} initial="hidden" animate="show">
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
                <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Nenhum jogo encontrado com os filtros atuais.</div>
            ) : (
              <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="mt-4">
                <motion.div>
                  <GameList games={filteredGames} onView={handleViewGame} onEdit={(g) => console.log("edit", g)} />
                </motion.div>
              </motion.div>
            )}

            {gamesError && <div className="text-sm text-red-500 mt-2">{gamesError}</div>}
          </motion.div>

          <motion.aside className="rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="font-semibold">Estatísticas</div>
              <div className="mt-2">Total de jogos: <strong>{games.length}</strong></div>
              <div className="mt-1">Filtrados: <strong>{filteredGames.length}</strong></div>
              <div className="mt-1">Último carregamento: <span className="text-xs text-gray-400">{new Date().toLocaleString()}</span></div>
            </div>
          </motion.aside>
        </div>
      </main>

      <GameDetailModal isOpen={!!selectedGame} onClose={handleCloseModal} game={selectedGame} onImport={() => {}} />

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

      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute left-8 top-20 w-6 h-6 rounded-full bg-gray-200/20 dark:bg-white/6 blur-sm" />
        <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} className="absolute right-24 top-40 w-8 h-8 rounded-full bg-gray-100/20 dark:bg-white/8 blur-sm" />
      </div>

      <LoadingOverlay open={loadingGames} text={"Carregando..."} />
    </div>
  );
}
