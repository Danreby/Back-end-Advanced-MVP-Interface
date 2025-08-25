import React, { useEffect, useState, useMemo } from "react";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";

/*
  CONFIG
  Defina VITE_API_BASE no seu .env.local (ex: VITE_API_BASE=http://127.0.0.1:8000)
  ou deixe o fallback abaixo.
*/
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

/* -----------------------------------------------------------
   Helpers e pequenos componentes UI (reaproveitados/adaptados)
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
   Componente para resultados do GiantBomb (externos)
------------------------------------------------------------*/
function GbResultItem({ item, onView, onImport }) {
  const cover = item?.image?.medium_url || item?.image?.super_url || item?.image?.small_url;
  return (
    <li className="flex items-start gap-3 p-3 border rounded hover:shadow-sm dark:border-gray-700">
      <div className="flex-none">
        {cover ? (
          <img src={cover} alt={item.name} className="h-16 w-12 object-cover rounded" />
        ) : (
          <div className="h-16 w-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="font-medium truncate">{item.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.original_release_date ? new Date(item.original_release_date).toLocaleDateString() : "—"}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.platforms ? item.platforms.map(p => p.name).slice(0,2).join(", ") : ""}</div>
            <div className="flex gap-2">
              <button onClick={() => onView(item)} className="text-sm px-2 py-1 border rounded text-gray-700 dark:text-gray-200 dark:border-gray-700">
                Ver
              </button>
              <button onClick={() => onImport(item)} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">
                Importar
              </button>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{item.deck || item.description || "—"}</div>
      </div>
    </li>
  );
}

/* -----------------------------------------------------------
   Modal / Drawer simples para exibir detalhes do jogo
------------------------------------------------------------*/
function GameDetailDrawer({ game, onClose }) {
  if (!game) return null;
  const covers = game.image || {};
  const bestCover = covers.super_url || covers.medium_url || covers.small_url || null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative ml-auto w-full sm:w-3/4 md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 p-6 overflow-auto">
        <button onClick={onClose} className="text-sm text-gray-600 dark:text-gray-300 mb-4">Fechar</button>
        <div className="flex flex-col sm:flex-row gap-4">
          {bestCover ? (
            <img src={bestCover} alt={game.name} className="w-full sm:w-48 object-cover rounded" />
          ) : (
            <div className="w-full sm:w-48 h-48 rounded bg-gray-100 dark:bg-gray-700" />
          )}

          <div className="flex-1">
            <h3 className="text-xl font-semibold">{game.name}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{game.original_release_date ? new Date(game.original_release_date).toLocaleDateString() : "Data não disponível"}</div>
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: game.description || game.deck || "<i>Sem descrição</i>" }} />
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Plataformas: {game.platforms ? game.platforms.map(p => p.name).join(", ") : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Dashboard principal (com integração GB)
------------------------------------------------------------*/
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // user games (seu catálogo local)
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [stats, setStats] = useState({ total: 0, played: 0, wishlist: 0, avgRating: 0 });

  // GiantBomb / external search
  const [gbQuery, setGbQuery] = useState("");
  const [gbResults, setGbResults] = useState([]);
  const [gbLoading, setGbLoading] = useState(false);
  const [gbError, setGbError] = useState(null);
  const [selectedGbGame, setSelectedGbGame] = useState(null);

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
        window.location.href = "/";
      })
      .finally(() => mounted && setLoadingProfile(false));

    (async () => {
      try {
        setLoadingGames(true);
        // TODO: trocar fetchGamesStub por fetch do seu endpoint que retorna jogos do usuário
        const g = await fetchGamesStub(); // aqui mantém mock; substitua por fetch('/api/mygames')
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

  // ---------- GiantBomb search ----------
  async function gbSearch(q, limit = 10) {
    if (!q || q.trim().length < 1) {
      setGbResults([]);
      return;
    }
    setGbLoading(true);
    setGbError(null);
    try {
      const res = await fetch(`${API_BASE}/gb/search?q=${encodeURIComponent(q)}&limit=${limit}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      const data = await res.json();
      // data.results é a lista de jogos (conforme nosso backend)
      setGbResults(data.results || []);
    } catch (err) {
      console.error("GB search error:", err);
      setGbError(String(err));
    } finally {
      setGbLoading(false);
    }
  }

  async function viewGbGame(item) {
    // Se o objeto já contém muitos campos talvez não precise buscar de novo,
    // mas usaremos o endpoint /gb/games/{guid} para detalhes atualizados.
    try {
      setGbLoading(true);
      const res = await fetch(`${API_BASE}/gb/games/${encodeURIComponent(item.guid)}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      const data = await res.json();
      // backend retorna { game: {...}, covers: {...} }
      setSelectedGbGame(data.game || item);
    } catch (err) {
      console.error("GB detail error:", err);
      setGbError(String(err));
    } finally {
      setGbLoading(false);
    }
  }

  function importGbGame(item) {
    // Placeholder: aqui você pode chamar seu endpoint que cria um jogo no catálogo do usuário.
    // Exemplo (POST /api/games importando campos necessários):
    // fetch('/api/games', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ...'}, body: JSON.stringify(payload) })
    //  .then(...)
    alert(`Importar jogo: ${item.name}\nGUID: ${item.guid}\n(implemente o endpoint /api/games para salvar no catálogo)`);
  }

  // filtration of local games (unchanged)
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

  // Placeholders (mantenha ou substitua pelo seu fetch real)
  async function fetchGamesStub() {
    return new Promise((res) =>
      setTimeout(
        () =>
          res([
            { id: 1, title: "The Witcher 3: Wild Hunt", platform: "PC", status: "Played", rating: 9, notes: "Melhor história", playedAt: "2024-12-10" },
            { id: 2, title: "Hollow Knight", platform: "Switch", status: "Played", rating: 8, notes: "Desafio gostoso", playedAt: "2025-02-01" },
            { id: 3, title: "Elden Ring", platform: "PS5", status: "Wishlist", rating: null, notes: "", playedAt: null },
          ]),
        250
      )
    );
  }

  async function fetchStatsStub(games) {
    const total = games.length;
    const played = games.filter((g) => g.status === "Played").length;
    const wishlist = games.filter((g) => g.status === "Wishlist").length;
    const avgRating =
      (games.filter((g) => typeof g.rating === "number").reduce((s, g) => s + g.rating, 0) /
        Math.max(1, games.filter((g) => typeof g.rating === "number").length)) || 0;
    return { total, played, wishlist, avgRating: Math.round(avgRating * 10) / 10 };
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onLogout={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} />

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

        {/* Search + filters (mantém a busca local e adiciona busca externa) */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, plataforma ou nota..."
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-gray-700"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Ou pesquise na base pública: </div>
            <div className="mt-2 flex gap-2">
              <input
                type="search"
                value={gbQuery}
                onChange={(e) => setGbQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") gbSearch(gbQuery, 12); }}
                placeholder="Pesquisar na GiantBomb (ex: zelda)"
                className="flex-1 rounded-md border px-3 py-2 bg-white dark:bg-gray-800 shadow-sm focus:outline-none dark:border-gray-700"
              />
              <button
                onClick={() => gbSearch(gbQuery, 12)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Buscar
              </button>
            </div>
            {gbError && <div className="text-sm text-red-500 mt-2">{gbError}</div>}
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
            <h3 className="font-semibold">Resultados externos</h3>

            <div className="mt-3">
              {gbLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : gbResults.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Pesquise na GiantBomb para ver resultados aqui.</div>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {gbResults.map((item) => (
                    <GbResultItem
                      key={item.guid || item.id}
                      item={item}
                      onView={viewGbGame}
                      onImport={importGbGame}
                    />
                  ))}
                </ul>
              )}

              {gbError && <div className="text-sm text-red-500 mt-2">{gbError}</div>}
            </div>
          </aside>
        </section>

        <footer className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} GameCatalog
        </footer>
      </main>

      <GameDetailDrawer game={selectedGbGame} onClose={() => setSelectedGbGame(null)} />
    </div>
  );
}
