import React from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function MyGamesFilter({
  open,
  onClose,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
  clearFilters,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mg-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.aside
            key="mg-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:text-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl p-6 overflow-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Filtro de jogos"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Filtros</h3>
                <div className="text-sm text-gray-500 dark:text-gray-300 ">Refine sua lista</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm px-3 py-1 rounded-md border bg-white dark:text-white dark:bg-gray-800"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 dark:text-white">Pesquisar</label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome..."
                  className="mt-1 block w-full rounded-md p-2 border bg-white dark:text-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-white">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full rounded-md p-2 border bg-white dark:text-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="Wishlist">Wishlist</option>
                  <option value="Playing">Playing</option>
                  <option value="On_going">On Going</option>
                  <option value="Stand_by">Stand By</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-white">Avaliação mínima</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-24 rounded-md p-2 border bg-white dark:text-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-white">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1 block w-full rounded-md p-2 border bg-white dark:text-white dark:bg-gray-800 text-sm"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="oldest">Mais antigos</option>
                  <option value="rating_desc">Maior nota</option>
                  <option value="rating_asc">Menor nota</option>
                </select>
              </div>
            </div>

            {/* <div className="mt-6 text-sm text-gray-600 dark:text-white">
              <div className="font-medium">Observação</div>
              <div className="mt-2 text-xs text-gray-500">Os filtros são aplicados localmente. Para filtrar no servidor, exponha query params na API.</div>
            </div> */}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
