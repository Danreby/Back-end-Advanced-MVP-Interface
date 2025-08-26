import React from 'react';
import Modal from '../ui/Modal';
import GameCover from './GameCover';

export default function GameDetailModal({ isOpen, onClose, game, onImport }) {
  if (!game) return null;

  const date = game.original_release_date ? new Date(game.original_release_date).toLocaleDateString() : 'Data não disponível';
  const platforms = game.platforms ? game.platforms.map(p => p.name).join(', ') : '—';
  const publishers = game.publishers ? game.publishers.map(p => p.name).join(", ") : "—";
  const genres = game.genres ? game.genres.map(g => g.name).join(", ") : "—";

  const rawText = (game.deck || game.description || '').replace(/<[^>]+>/g, '').trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" ariaLabelledBy="game-title">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="game-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {game.name}
          </h2>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4">
          <GameCover image={game.image} alt={game.name} />

          <div className="min-w-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">Data de Lançamento: {date}</div>

            <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200 break-words">
              {rawText ? (
                <p className="line-clamp-6 md:line-clamp-8">{rawText}</p>
              ) : (
                <p className="italic text-gray-500">Sem descrição disponível.</p>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <strong className="font-medium">Plataformas:</strong> <span className="ml-1">{platforms}</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <div className="text-xs text-gray-500">Publisher</div>
              <div className="truncate">{publishers}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Gênero</div>
              <div className="truncate">{genres}</div>
            </div>

            </div>
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              {typeof onImport === 'function' && (
                <button
                  onClick={() => onImport(game)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Importar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
