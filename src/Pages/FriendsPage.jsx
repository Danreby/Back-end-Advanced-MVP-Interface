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
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorRequests, setErrorRequests] = useState(null);

  const navigate = useNavigate();

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

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const data = await userApi.listMyFriends();
      const list = Array.isArray(data) ? data : data?.items ?? [];
      setFriends(list);
    } catch (err) {
      console.error("Erro ao carregar amigos:", err);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFriends();
  }, [user, loadFriends]);

  const loadFriendRequests = useCallback(async () => {
    setLoadingRequests(true);
    setErrorRequests(null);
    try {
      const data = await userApi.listMyFriendRequests();
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setFriendRequests(items || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setFriendRequests([]);
      } else {
        console.error("Erro ao buscar solicitações:", err);
        setErrorRequests("Não foi possível carregar solicitações");
        setFriendRequests([]);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFriendRequests();
  }, [user, loadFriendRequests]);

  async function doSearch(q, { page = 1 } = {}) {
    if (!q || String(q).trim().length === 0) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const data = await userApi.searchUsers(q, { page, pageSize: 20 });
      if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else if (data && data.items) {
        setItems(data.items);
        setTotal(data.total ?? data.items.length);
      } else {
        setItems([]);
        setTotal(0);
      }
      setPage(page);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(q) {
    setQuery(q);
    doSearch(q, { page: 1 });
  }

  function handleOpenUser(user) {
    navigate(`/users/${user.id}`);
  }

  async function handleAcceptRequest(request) {
    const id = request.id ?? request.request_id ?? request.requestId;
    if (!id) return;

    try {
      const res = await userApi.acceptFriendRequest(id);
      setFriendRequests((prev) => prev.filter((r) => (r.id ?? r.request_id) !== id));

      const possibleFriend =
        (res && res.friend) || (res && res.data) || (res && res.user) || null;

      if (possibleFriend && possibleFriend.id) {
        setFriends((prev) => {
          if (prev.some((f) => String(f.id) === String(possibleFriend.id))) return prev;
          return [possibleFriend, ...prev];
        });
      } else {
        await loadFriends();
      }
    } catch (err) {
      console.error("Erro ao aceitar solicitação:", err);
      throw err;
    }
  }

  async function handleRejectRequest(request) {
    const id = request.id ?? request.request_id ?? request.requestId;
    if (!id) return;

    try {
      await userApi.rejectFriendRequest(id);
      setFriendRequests((prev) => prev.filter((r) => (r.id ?? r.request_id) !== id));
    } catch (err) {
      console.error("Erro ao rejeitar solicitação:", err);
      throw err;
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
        <LoadingOverlay open={true} text={"Carregando perfil..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2">
          <motion.h1 className="text-2xl font-bold dark:text-white" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            Amigos & Buscar usuários
          </motion.h1>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <section className="md:col-span-3 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium dark:text-white">Meus amigos</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadFriends}
                  disabled={loadingFriends}
                  className="px-3 py-1 rounded-full dark:text-white bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50 text-sm"
                >
                  {loadingFriends ? "Atualizando..." : "Atualizar"}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <FriendRequestsSection
                requests={friendRequests}
                loading={loadingRequests}
                error={errorRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onRefresh={loadFriendRequests}
              />
            </div>

            <div className="mt-3 h-[60vh] overflow-auto">
              <UserList
                items={friends}
                onItemClick={handleOpenUser}
                emptyMessage={loadingFriends ? "Carregando amigos..." : "Você não tem amigos ainda."}
              />
            </div>
          </section>

          <aside className="md:col-span-1 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium dark:text-white">Buscar usuários</h3>

            <div className="mt-3">
              <UserSearchForm
                value={query}
                onChange={(v) => setQuery(v)}
                onSearch={() => doSearch(query, { page: 1 })}
                onSubmit={handleSearchSubmit}
              />
            </div>

            <div className="mt-4 h-[60vh] overflow-auto">
              <h4 className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Resultados {total !== null && `(${items.length}${total ? ` de ${total}` : ""})`}
              </h4>

              <UserList
                items={items}
                onItemClick={handleOpenUser}
                emptyMessage={query ? "Nenhum usuário encontrado." : "Digite um nome para buscar."}
              />

              {total !== null && total > 20 && (
                <div className="mt-3 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                  <button
                    onClick={() => doSearch(query, { page: Math.max(1, page - 1) })}
                    disabled={page <= 1}
                    className="px-2 py-1 rounded-full bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => doSearch(query, { page: page + 1 })}
                    disabled={items.length === 0}
                    className="px-2 py-1 rounded-full bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50"
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
      <LoadingOverlay open={loading || loadingFriends || loadingRequests} text={loading ? "Buscando usuários..." : loadingRequests ? "Carregando solicitações..." : "Carregando amigos..."} />
    </div>
  );
}
