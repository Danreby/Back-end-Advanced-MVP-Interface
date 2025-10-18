import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/common/NavBar";
import { Footer } from "../components/common/Footer";
import LoadingOverlay from "../components/common/LoadingOverlay";
import UserSearchForm from "../components/users/UserSearchForm";
import userApi, { getProfile } from "../API/user";
import { isAuthenticated, logout } from "../API/auth";
import { useNavigate } from "react-router-dom";
import UserList from "./Friends/UserList";

export default function FriendsPage() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
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

  if (loadingProfile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
        <motion.div
          className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60"
          animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40"
          animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <LoadingOverlay open={true} text={"Carregando perfil..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <motion.div
        className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60"
        animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40"
        animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-1/2 top-8 w-64 h-64 rounded-full filter blur-2xl opacity-25 bg-pink-200/30 dark:bg-violet-900/30 transform -translate-x-1/2"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <Navbar user={user} onLogout={logout} />

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2">
          <motion.h1 className="text-2xl font-bold dark:text-white" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            Buscar usuários
          </motion.h1>
        </div>

        <div className="mt-6 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <UserSearchForm
            value={query}
            onChange={(v) => setQuery(v)}
            onSearch={() => doSearch(query, { page: 1 })}
            onSubmit={handleSearchSubmit}
          />
        </div>

        <div className="mt-6 rounded-3xl p-4 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium dark:text-white">Resultados</h2>
          <div className="mt-3">
            <UserList
              items={items}
              onItemClick={handleOpenUser}
              emptyMessage={query ? "Nenhum usuário encontrado." : "Digite um nome para buscar."}
            />
          </div>

          {total !== null && total > 20 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">Mostrando {items.length} de {total}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => doSearch(query, { page: Math.max(1, page - 1) })}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-full bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => doSearch(query, { page: page + 1 })}
                  disabled={items.length === 0}
                  className="px-3 py-2 rounded-full bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="pointer-events-none absolute inset-0 z-30">
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute left-8 top-20 w-6 h-6 rounded-full bg-gray-200/20 dark:bg-white/6 blur-sm"
        />
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="absolute right-24 top-40 w-8 h-8 rounded-full bg-gray-100/20 dark:bg-white/8 blur-sm"
        />
      </div>

      <Footer variant="fixed"/>
      <LoadingOverlay open={loading} text="Buscando usuários..." />
    </div>
  );
}
