// src/components/gb/GameDetailDrawer.jsx
import React from "react";

export default function GameDetailDrawer({ game, onClose }) {
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
