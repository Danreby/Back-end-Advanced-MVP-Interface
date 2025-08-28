import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";
import { logout } from "../API/auth";
import GbResultItem from "../components/gb/GbResultItem";
import GameDetailModal from "../components/gb/GameDetailModal";
import GameList from "../components/games/GameList";
import { isAuthenticated } from "../API/auth";
import { searchGames, getGameDetails, importGameToCatalog } from "../API/gbApi";
import SearchBar from "../components/gb/SearchBar";
import LoadingOverlay from "../components/common/LoadingOverlay";
import ReviewList from "../components/games/ReviewList";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [gbResults, setGbResults] = useState([]);
  const [gbLoading, setGbLoading] = useState(false);
  const [gbError, setGbError] = useState(null);
  const [selectedGbGame, setSelectedGbGame] = useState(null);

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

    (async () => {
      setLoadingGames(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/reviews", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Erro ao carregar jogos");

        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((g) => ({
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

        if (mounted) setGames(normalized);
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
        if (mounted) setGames([]);
      } finally {
        if (mounted) setLoadingGames(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleGbSearch(q) {
    if (!q || q.trim().length < 1) {
      setGbResults([]);
      return;
    }
    setGbLoading(true);
    setGbError(null);
    try {
      const res = await searchGames(q, 12);
      setGbResults(res.results || []);
    } catch (err) {
      console.error(err);
      setGbError(err.message || "Erro desconhecido");
    } finally {
      setGbLoading(false);
    }
  }

  async function handleViewGb(item) {
    setGbLoading(true);
    setGbError(null);
    try {
      const res = await getGameDetails(item.guid);
      setSelectedGbGame(res?.game || item);
    } catch (err) {
      console.error(err);
      setGbError(err.message || "Erro ao buscar detalhes");
    } finally {
      setGbLoading(false);
    }
  }

  async function handleImportGb(item) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Faça login para importar jogos.");
      window.location.href = "/login";
      return;
    }
    try {
      const created = await importGameToCatalog(item, token);
      setGames((prev) => [created, ...prev]);
      // alert(`Jogo importado: ${created.name}`);
    } catch (err) {
      console.error("Import error", err);
      alert("Erro ao importar: " + (err.message || err));
    }
  }

  function handleCloseModal() {
    setSelectedGbGame(null);
  }

  // --- animações ---
  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
  };

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.28 } },
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

          <div className="ml-auto w-96">
            <SearchBar onSearch={handleGbSearch} placeholder="Pesquisar na GiantBomb" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700" variants={cardVariants} initial="hidden" animate="show">
            {/* <h2 className="font-semibold text-lg">Catálogo</h2> */}
            {loadingGames ? (
              <div className="mt-4 text-sm text-gray-500">Carregando jogos...</div>
            ) : (
              <motion.div variants={listVariants} initial="hidden" animate="show" className="">
                <motion.div variants={itemVariants}>
                  <ReviewList games={games} />
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.aside className="rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mt-3">
              {gbLoading ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ) : gbResults.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Pesquise na GiantBomb para ver resultados aqui.</div>
              ) : (
                <motion.ul className="space-y-2 max-h-96 overflow-auto custom-scrollbar" variants={listVariants} initial="hidden" animate="show">
                  {gbResults.map((item) => (
                    <motion.li key={item.guid || item.id} variants={itemVariants}>
                      <GbResultItem item={item} onView={handleViewGb} onImport={handleImportGb} />
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              {gbError && <div className="text-sm text-red-500 mt-2">{gbError}</div>}
            </div>
          </motion.aside>
        </div>
      </main>

      <GameDetailModal isOpen={!!selectedGbGame} onClose={handleCloseModal} game={selectedGbGame} onImport={handleImportGb} />

      <div className="pointer-events-none absolute inset-0 z-30">
        <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute left-8 top-20 w-6 h-6 rounded-full bg-gray-200/20 dark:bg-white/6 blur-sm" />
        <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} className="absolute right-24 top-40 w-8 h-8 rounded-full bg-gray-100/20 dark:bg-white/8 blur-sm" />
      </div>

      <LoadingOverlay open={gbLoading} text={"Carregando..."} />
    </div>
  );
}
