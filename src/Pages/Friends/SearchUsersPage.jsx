import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/common/NavBar";
import { Footer } from "../../components/common/Footer";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import UserSearchForm from "../../components/users/UserSearchForm";
import UserList from "../../components/users/UserList";
import userApi from "../../API/user";
import { useNavigate } from "react-router-dom";

export default function SearchUsersPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Buscar usuários</h1>

        <UserSearchForm
          value={query}
          onChange={(v) => setQuery(v)}
          onSearch={() => doSearch(query, { page: 1 })}
        />

        <div className="mt-6">
          <h2 className="text-lg font-medium">Resultados</h2>
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
                  className="px-3 py-2 rounded bg-white border"
                >
                  Anterior
                </button>
                <button
                  onClick={() => doSearch(query, { page: page + 1 })}
                  disabled={items.length === 0}
                  className="px-3 py-2 rounded bg-white border"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <LoadingOverlay open={loading} text="Buscando usuários..." />
    </div>
  );
}
