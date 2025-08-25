import React, { useEffect, useState, useMemo } from "react";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";

/* -----------------------------------------------------------
   API stubs / placeholders
------------------------------------------------------------*/
const mockGames = [
  { id: 1, title: "The Witcher 3: Wild Hunt", platform: "PC", status: "Played", rating: 9, notes: "Melhor história e sidequests excelentes. Revisitarei as dlcs.", playedAt: "2024-12-10" },
  { id: 2, title: "Hollow Knight", platform: "Switch", status: "Played", rating: 8, notes: "Desafio gostoso, ótima ambientação.", playedAt: "2025-02-01" },
  { id: 3, title: "Elden Ring", platform: "PS5", status: "Wishlist", rating: null, notes: "", playedAt: null },
];

async function fetchGamesStub() {
  return new Promise((res) => setTimeout(() => res(mockGames), 250));
}

async function fetchStatsStub(games) {
  const total = games.length;
  const played = games.filter((g) => g.status === "Played").length;
  const wishlist = games.filter((g) => g.status === "Wishlist").length;
  const avgRating =
    games.filter((g) => typeof g.rating === "number").reduce((s, g) => s + g.rating, 0) /
      Math.max(1, games.filter((g) => typeof g.rating === "number").length) || 0;
  return { total, played, wishlist, avgRating: Math.round(avgRating * 10) / 10 };
}

/* -----------------------------------------------------------
   Small UI helper components
------------------------------------------------------------*/
function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      {hint && <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function RatingStars({ value, max = 10 }) {
  const filled = Math.round((value || 0) / 2);
  return (
    <div className="flex items-center gap-1 text-yellow-500" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? "opacity-100" : "opacity-30"}>★</span>
      ))}
      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
        {value ? `${value}/10` : "—"}
      </span>
    </div>
  );
}

/* -----------------------------------------------------------
   Dashboard principal
------------------------------------------------------------*/
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [stats, setStats] = useState({ total: 0, played: 0, wishlist: 0, avgRating: 0 });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let mounted = true;

    getProfile()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => mounted && setLoadingProfile(false));

    (async () => {
      try {
        setLoadingGames(true);
        const g = await fetchGamesStub();
        if (!mounted) return;
        setGames(g);

        const s = await fetchStatsStub(g);
        if (!mounted) return;
        setStats(s);
      } finally {
        if (mounted) setLoadingGames(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    window.location.href = "/login";
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      if (statusFilter !== "All" && g.status !== statusFilter) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        (g.platform && g.platform.toLowerCase().includes(q)) ||
        (g.notes && g.notes.toLowerCase().includes(q))
      );
    });
  }, [games, query, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Meus Jogos{user ? ` — ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Catalogue seus jogos, adicione notas e registre suas avaliações.
            </p>
          </div>

          <div className="flex gap-2">
            <a href="/games/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm">
              Adicionar jogo
            </a>
            <a href="/games/import" className="px-4 py-2 border rounded-md text-sm dark:border-gray-700">
              Importar
            </a>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Total de jogos" value={loadingGames ? "..." : stats.total} />
          <StatCard label="Jogados" value={loadingGames ? "..." : stats.played} />
          <StatCard label="Wishlist" value={loadingGames ? "..." : stats.wishlist} />
          <StatCard label="Nota média" value={loadingGames ? "..." : stats.avgRating || "—"} hint="Baseado em jogos com nota" />
        </div>

        {/* Search + filters */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, plataforma ou nota..."
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border px-3 py-2 bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700"
            >
              <option value="All">Todos</option>
              <option value="Played">Jogados</option>
              <option value="Playing">Jogando</option>
              <option value="Wishlist">Wishlist</option>
            </select>
            <a href="/games" className="px-4 py-2 border rounded-md text-sm dark:border-gray-700">
              Ver tudo
            </a>
          </div>
        </div>

        {/* Content */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold text-lg">Últimos jogos</h2>

            {loadingGames ? (
              <div className="mt-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Nenhum jogo encontrado. Adicione seu primeiro jogo!
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {filtered.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-start justify-between gap-4 p-3 border rounded hover:shadow-sm dark:border-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          {g.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <a
                              href={`/games/${g.id}`}
                              className="font-medium truncate hover:underline"
                              title={g.title}
                            >
                              {g.title}
                            </a>
                            <div className="text-xs text-gray-500 dark:text-gray-400">· {g.platform}</div>
                            <div className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {g.status}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {g.notes || "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <RatingStars value={g.rating} />
                      <div className="flex gap-2">
                        <a href={`/games/${g.id}`} className="text-sm px-2 py-1 border rounded text-gray-700 dark:text-gray-200 dark:border-gray-700">
                          Ver
                        </a>
                        <a href={`/games/${g.id}/edit`} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">
                          Editar
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold">Atalhos</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/games/new" className="block px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Adicionar jogo</a></li>
              <li><a href="/games?filter=played" className="block px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Ver jogados</a></li>
              <li><a href="/games?filter=wishlist" className="block px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Ver wishlist</a></li>
              <li><a href="/settings" className="block px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Configurações</a></li>
            </ul>
          </aside>
        </section>

        <footer className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} GameCatalog
        </footer>
      </main>
    </div>
  );
}
