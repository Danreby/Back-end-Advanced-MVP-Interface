// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";

import GbResultItem from "../components/gb/GbResultItem";
import GameDetailModal from "../components/gb/GameDetailModal";
import GameList from "../components/games/GameList";

import { searchGames, getGameDetails, importGameToCatalog } from "../API/gbApi";
import SearchBar from "../components/gb/SearchBar";

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

    // Validação rápida: se não tiver token, redireciona para /login
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return () => { mounted = false; }; // encerra efeito
    }

    // Tenta obter perfil (caso o token seja inválido, getProfile falhará)
    getProfile()
      .then((u) => { if (!mounted) return; setUser(u); })
      .catch(() => { if (mounted) window.location.href = "/login"; })
      .finally(() => mounted && setLoadingProfile(false));

    (async () => {
      setLoadingGames(true);
      try {
        // token já obtido acima
        const res = await fetch("http://127.0.0.1:8000/games/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Erro ao carregar jogos");

        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map(g => ({
              ...g,
              rating: (typeof g.avg_rating !== "undefined" && g.avg_rating !== null)
                ? Number(g.avg_rating)
                : (typeof g.rating !== "undefined" ? Number(g.rating || 0) : 0),
              reviews_count: typeof g.reviews_count !== "undefined" ? Number(g.reviews_count) : 0
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
      setGames(prev => [created, ...prev]);
      alert(`Jogo importado: ${created.name}`);
    } catch (err) {
      console.error("Import error", err);
      alert("Erro ao importar: " + (err.message || err));
    }
  }

  function handleCloseModal() {
    setSelectedGbGame(null);
  }

  // Evita renderizar a UI do dashboard enquanto o profile está carregando
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-300/30 dark:bg-gray-900">
        <div className="text-gray-700 dark:text-gray-200">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300/30 dark:bg-gray-900">
      <Navbar
        user={user}
        onLogout={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
      />

      <main className="max-w-7xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-bold">Meus Jogos</h1>
          <div className="ml-auto w-96">
            <SearchBar onSearch={handleGbSearch} placeholder="Pesquisar na GiantBomb (ex: zelda)" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="font-semibold text-lg">Catálogo</h2>
            <GameList games={games} onView={(g) => console.log("view", g)} onEdit={(g) => console.log("edit", g)} />
          </div>

          <aside className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
            <div className="mt-3">
              {gbLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : gbResults.length === 0 ? (
                <div className="text-sm text-gray-500">Pesquise na GiantBomb para ver resultados aqui.</div>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto custom-scrollbar">
                  {gbResults.map((item) => (
                    <GbResultItem
                      key={item.guid || item.id}
                      item={item}
                      onView={handleViewGb}
                      onImport={handleImportGb}
                    />
                  ))}
                </ul>
              )}

              {gbError && <div className="text-sm text-red-500 mt-2">{gbError}</div>}
            </div>
          </aside>
        </div>
      </main>

      <GameDetailModal
        isOpen={!!selectedGbGame}
        onClose={handleCloseModal}
        game={selectedGbGame}
        onImport={handleImportGb}
      />
    </div>
  );
}
