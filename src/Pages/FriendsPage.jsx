import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/common/NavBar";
import { Footer } from "../components/common/Footer";
import LoadingOverlay from "../components/common/LoadingOverlay";
import UserSearchForm from "../components/users/UserSearchForm";
import userApi, { getProfile } from "../API/user";
import { isAuthenticated, logout } from "../API/auth";
import { useNavigate } from "react-router-dom";
import UserList from "../components/Friends/UserList";
import FriendRequestsSection from "../components/Friends/FriendRequestsSection";

export default function FriendsPage() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState([]);
  const [searchTotal, setSearchTotal] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorRequests, setErrorRequests] = useState(null);

  const [sentRequests, setSentRequests] = useState([]);
  const [loadingSent, setLoadingSent] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    getProfile()
      .then((u) => mounted && setUser(u))
      .catch(() => {
        if (mounted) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      })
      .finally(() => mounted && setLoadingProfile(false));

    return () => { mounted = false; };
  }, []);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const data = await userApi.listMyFriends();
      setFriends(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    setErrorRequests(null);
    try {
      const data = await userApi.listMyFriendRequests();
      setFriendRequests(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setErrorRequests("Não foi possível carregar solicitações");
      }
      setFriendRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const loadSentRequests = useCallback(async () => {
    setLoadingSent(true);
    try {
      const data = await userApi.listMySentRequests();
      setSentRequests(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setSentRequests([]);
    } finally {
      setLoadingSent(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadFriends();
    loadRequests();
    loadSentRequests();
  }, [user, loadFriends, loadRequests, loadSentRequests]);

  async function doSearch(q, page = 1) {
    if (!q) {
      setSearchItems([]);
      setSearchTotal(0);
      return;
    }
    setLoadingSearch(true);
    try {
      const data = await userApi.searchUsers(q, { page, pageSize: 20 });
      if (Array.isArray(data)) {
        setSearchItems(data);
        setSearchTotal(data.length);
      } else {
        setSearchItems(data?.items ?? []);
        setSearchTotal(data?.total ?? 0);
      }
      setQuery(q);
      setSearchPage(page);
    } catch {
      setSearchItems([]);
      setSearchTotal(0);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleAcceptRequest(request) {
    const id = request.id;
    if (!id) return;
    try {
      await userApi.acceptFriendRequest(id);
      setFriendRequests((prev) => prev.filter((r) => r.id !== id));
      await loadFriends();
    } catch (err) {
      console.error("Erro ao aceitar solicitação:", err);
      throw err;
    }
  }

  async function handleRejectRequest(request) {
    const id = request.id;
    if (!id) return;
    try {
      await userApi.rejectFriendRequest(id);
      setFriendRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Erro ao rejeitar solicitação:", err);
      throw err;
    }
  }

  async function handleCancelSent(request) {
    const id = request.id;
    if (!id) return;
    try {
      await userApi.cancelFriendRequest(id);
      setSentRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Erro ao cancelar pedido:", err);
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black">
        <LoadingOverlay open text="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.h1
          className="text-2xl font-bold dark:text-white mb-6"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Amigos & Usuários
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* --- Painel principal: amigos + solicitações --- */}
          <section className="md:col-span-3 flex flex-col gap-4">
            {/* Solicitações recebidas */}
            <FriendRequestsSection
              requests={friendRequests}
              loading={loadingRequests}
              error={errorRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onRefresh={loadRequests}
            />

            {/* Pedidos enviados pendentes */}
            {(loadingSent || sentRequests.length > 0) && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium dark:text-white">Pedidos enviados</h3>
                  {sentRequests.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
                      {sentRequests.length}
                    </span>
                  )}
                </div>
                {loadingSent ? (
                  <div className="text-sm text-gray-500">Carregando...</div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {sentRequests.map((r) => {
                      const who = r.to_user ?? {};
                      return (
                        <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm shrink-0">
                            {who.avatar_url ? (
                              <img src={who.avatar_url} alt={who.name || "U"} className="w-full h-full object-cover" />
                            ) : (
                              (who.name ?? who.email ?? "U").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium dark:text-white truncate">{who.name || who.email || "Usuário"}</div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">Aguardando resposta</div>
                          </div>
                          <button
                            onClick={() => handleCancelSent(r)}
                            className="text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Lista de amigos */}
            <div className="rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium dark:text-white">
                  Meus amigos
                  {friends.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">({friends.length})</span>
                  )}
                </h2>
                <button
                  onClick={loadFriends}
                  disabled={loadingFriends}
                  className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {loadingFriends ? "Atualizando..." : "Atualizar"}
                </button>
              </div>

              <div className="max-h-[50vh] overflow-auto">
                <UserList
                  items={friends}
                  onItemClick={(u) => navigate(`/users/${u.id}`)}
                  emptyMessage={loadingFriends ? "Carregando..." : "Você ainda não tem amigos."}
                />
              </div>
            </div>
          </section>

          {/* --- Sidebar: busca de usuários --- */}
          <aside className="rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium dark:text-white mb-3">Buscar usuários</h3>

            <UserSearchForm onSearch={(val) => doSearch(val, 1)} />

            <div className="mt-4">
              {searchTotal !== null && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {searchItems.length} resultado{searchItems.length !== 1 ? "s" : ""}{searchTotal > searchItems.length ? ` de ${searchTotal}` : ""}
                </p>
              )}

              <div className="max-h-[50vh] overflow-auto">
                {loadingSearch ? (
                  <div className="text-sm text-gray-500 p-2">Buscando...</div>
                ) : (
                  <UserList
                    items={searchItems}
                    onItemClick={(u) => navigate(`/users/${u.id}`)}
                    emptyMessage={query ? "Nenhum usuário encontrado." : "Digite um nome para buscar."}
                  />
                )}
              </div>

              {searchTotal !== null && searchTotal > 20 && (
                <div className="mt-3 flex justify-between text-sm">
                  <button
                    onClick={() => doSearch(query, Math.max(1, searchPage - 1))}
                    disabled={searchPage <= 1}
                    className="px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-500 text-xs self-center">Pág. {searchPage}</span>
                  <button
                    onClick={() => doSearch(query, searchPage + 1)}
                    disabled={searchItems.length < 20}
                    className="px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer variant="fixed" />
      <LoadingOverlay
        open={loadingFriends || loadingRequests}
        text={loadingRequests ? "Carregando solicitações..." : "Carregando amigos..."}
      />
    </div>
  );
}
