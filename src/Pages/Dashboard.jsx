// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";

import SearchBar from "../components/gb/SearchBar";
import GbResultItem from "../components/gb/GbResultItem";
import GameDetailDrawer from "../components/gb/GameDetailDrawer";
import GameList from "../components/games/GameList";

import { searchGames, getGameDetails, importGameToCatalog } from "../API/gbApi";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [games, setGames] = useState([]); // seu catálogo local (carregar via endpoint /games)
  const [loadingGames, setLoadingGames] = useState(true);

  // GiantBomb
  const [gbResults, setGbResults] = useState([]);
  const [gbLoading, setGbLoading] = useState(false);
  const [gbError, setGbError] = useState(null);
  const [selectedGbGame, setSelectedGbGame] = useState(null);

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((u) => { if (!mounted) return; setUser(u); })
      .catch(() => { window.location.href = "/"; })
      .finally(() => mounted && setLoadingProfile(false));

    // TODO: carregar catálogo do usuário real via GET /games (authed)
    (async () => {
      setLoadingGames(true);
      // placeholder: substitua por fetch('/games', {Authorization: Bearer ...})
      setGames([]);
      setLoadingGames(false);
    })();

    return () => { mounted = false; };
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
      setGbError(err.message);
    } finally {
      setGbLoading(false);
    }
  }

  async function handleViewGb(item) {
    setGbLoading(true);
    setGbError(null);
    try {
      const res = await getGameDetails(item.guid);
      setSelectedGbGame(res.game || item);
    } catch (err) {
      console.error(err);
      setGbError(err.message);
    } finally {
      setGbLoading(false);
    }
  }

  async function handleImportGb(item) {
    // pega token do localStorage (ajuste conforme seu fluxo de auth)
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Faça login para importar jogos.");
      return;
    }
    try {
      // opcional: desabilitar botão para evitar imports duplicados
      const created = await importGameToCatalog(item, token);
      // atualizar lista local (puxar do backend é melhor)
      setGames(prev => [created, ...prev]);
      alert(`Jogo importado: ${created.name}`);
    } catch (err) {
      console.error("Import error", err);
      alert("Erro ao importar: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onLogout={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} />

      <main className="max-w-7xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-bold">Meus Jogos</h1>
          <div className="ml-auto w-96">
            <SearchBar onSearch={handleGbSearch} placeholder="Pesquisar na GiantBomb (ex: zelda)" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold text-lg">Catálogo</h2>
            <GameList games={games} onView={(g) => console.log("view", g)} onEdit={(g) => console.log("edit", g)} />
          </div>

          <aside className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold">Resultados externos</h3>
            <div className="mt-3">
              {gbLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : gbResults.length === 0 ? (
                <div className="text-sm text-gray-500">Pesquise na GiantBomb para ver resultados aqui.</div>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {gbResults.map((item) => (
                    <GbResultItem key={item.guid || item.id} item={item} onView={handleViewGb} onImport={handleImportGb} />
                  ))}
                </ul>
              )}

              {gbError && <div className="text-sm text-red-500 mt-2">{gbError}</div>}
            </div>
          </aside>
        </div>
      </main>

      <GameDetailDrawer game={selectedGbGame} onClose={() => setSelectedGbGame(null)} />
    </div>
  );
}
