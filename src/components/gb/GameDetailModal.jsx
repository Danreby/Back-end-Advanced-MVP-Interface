import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Modal from "../ui/Modal";
import GameCover from "./GameCover";

export default function GameDetailModal({ isOpen, onClose, game, onImport }) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setImporting(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) contentRef.current.scrollTop = 0;
  }, [game, isOpen]);

  if (!isOpen) return null;

  const gb = game && game.giantbomb ? game.giantbomb : game || {};

  const title = gb.name || game?.name || "Detalhes do jogo";

  const rawDate = gb.original_release_date || gb.release_date || game?.original_release_date || game?.release_date || null;
  const date = rawDate ? (() => {
    try { return new Date(rawDate).toLocaleDateString(); } catch (e) { return rawDate; }
  })() : "Data não disponível";

  const platforms = (gb.platforms && Array.isArray(gb.platforms) ? gb.platforms.map((p) => p.name) : (game?.platforms && Array.isArray(game.platforms) ? game.platforms.map((p) => p.name) : []));
  const platformsStr = platforms.length ? platforms.join(", ") : "—";

  const publishers = (gb.publishers && Array.isArray(gb.publishers) ? gb.publishers.map((p) => p.name) : (game?.publishers && Array.isArray(game.publishers) ? game.publishers.map((p) => p.name) : []));
  const publishersStr = publishers.length ? publishers.join(", ") : "—";

  const genres = (gb.genres && Array.isArray(gb.genres) ? gb.genres.map((g) => g.name) : (game?.genres && Array.isArray(game.genres) ? game.genres.map((g) => g.name) : []));
  const genresStr = genres.length ? genres.join(", ") : "—";

  const imageObj =
    gb.image ||
    (Array.isArray(gb.images) && gb.images[0]) ||
    game?.image ||
    (game?.cover_url ? { super_url: game.cover_url, medium_url: game.cover_url, small_url: game.cover_url } : null) ||
    null;

  const rating =
    typeof game?.rating !== "undefined" ? Number(game.rating || 0) :
    typeof game?.avg_rating !== "undefined" ? Number(game.avg_rating || 0) :
    typeof gb?.rating !== "undefined" ? Number(gb.rating || 0) :
    null;

  const reviewsCount =
    typeof game?.reviews_count !== "undefined" ? Number(game.reviews_count || 0) :
    typeof gb?.reviews_count !== "undefined" ? Number(gb.reviews_count || 0) :
    null;

  const rawHtml = gb.deck || gb.description || game?.deck || game?.description || game?.summary || "";
  const sanitizedHtml = (rawHtml || "").replace(/<script[\s\S]*?<\/script>/gi, "").trim();

  async function handleImportClick() {
    if (typeof onImport !== "function") return;
    setImporting(true);
    setError(null);

    try {
      const importItem = {
        name: title,
        guid: gb.guid || gb.id || game?.external_guid || game?.externalGuid || game?.external_id || null,
        image: imageObj || null,
        deck: gb.deck || gb.description || game?.deck || game?.description || game?.summary || null,
        _raw: gb,
      };

      const maybePromise = onImport(importItem);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }

      onClose();
    } catch (err) {
      console.error("Erro ao importar:", err);
      setError(err?.message || String(err) || "Erro ao importar");
    } finally {
      setImporting(false);
    }
  }

  const entry = {
    initial: { opacity: 0, y: 8, scale: 0.996 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 20 } },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" ariaLabelledBy="game-title">
      <motion.div {...entry} className="p-0">
        <div
          ref={contentRef}
          className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-auto pr-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {!game ? (
            // skeleton
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                <div className="flex-shrink-0">
                  <div className="w-full h-44 sm:h-52 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>

                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                  <div className="mt-4 h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 id="game-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h2>

                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="flex-shrink-0">
                  <GameCover image={imageObj} alt={title} />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {rating !== null && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.785.57-1.84-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
                        </svg>
                        <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{Number(rating).toFixed(1)}</span>
                        {reviewsCount !== null && <span className="text-xs text-gray-500">· {reviewsCount} reviews</span>}
                      </div>
                    )}

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-gray-800 dark:bg-white/6 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v6a9 9 0 0018 0V7M3 7h18" />
                      </svg>
                      <span className="truncate max-w-[10rem]">{platformsStr}</span>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 w-full">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Data de Lançamento: {date}</div>

                  <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200 break-words">
                    {sanitizedHtml ? (
                      <div
                        className="line-clamp-6 md:line-clamp-8"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                      />
                    ) : (
                      <p className="italic text-gray-500">Sem descrição disponível.</p>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <strong className="font-medium">Plataformas:</strong> <span className="ml-1">{platformsStr}</span>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Publisher</div>
                      <div className="truncate max-w-[28rem]">{publishersStr}</div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Gênero</div>
                      <div className="truncate max-w-[28rem]">{genresStr}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 items-center">
                    {typeof onImport === "function" && (
                      <button
                        onClick={handleImportClick}
                        disabled={importing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {importing ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM2 14s1-1 6-1 6 1 6 1v3H2v-3z" />
                          </svg>
                        )}

                        <span>{importing ? "Importando..." : "Importar"}</span>
                      </button>
                    )}

                    {error && <div className="w-full sm:w-auto text-sm text-red-500">{error}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Modal>
  );
}
