import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Modal from "../ui/Modal";
import GameCover from "./GameCover";
import RatingStars from "../ui/RatingStars";
import { toast } from "react-toastify";
import { createReview, updateReview } from "../../API/reviews";

function getApiBase() {
  return import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
}

export default function GameReviewModal({ isOpen, onClose, game, onImport, onSavedReview = null }) {
  const [loadingReview, setLoadingReview] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftText, setDraftText] = useState("");
  const [draftIsPublic, setDraftIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveSuccess, setAutoSaveSuccess] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setLoadingReview(false);
      setReview(null);
      setReviewError(null);
      setEditing(false);
      setDraftRating(0);
      setDraftText("");
      setDraftIsPublic(true);
      setSaving(false);
      setImporting(false);
      setImportError(null);
      setAutoSaving(false);
      setAutoSaveSuccess(false);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) contentRef.current.scrollTop = 0;
  }, [game, isOpen]);

  const gb = game && game.giantbomb ? game.giantbomb : game || {};
  const title = gb.name || game?.name || "Detalhes do jogo";
  const rawDate = gb.original_release_date || gb.release_date || game?.original_release_date || game?.release_date || null;
  const date = rawDate ? (() => { try { return new Date(rawDate).toLocaleDateString(); } catch (e) { return rawDate; } })() : "Data não disponível";

  const platforms = (gb.platforms && Array.isArray(gb.platforms) ? gb.platforms.map(p => p.name) : (game?.platforms && Array.isArray(game.platforms) ? game.platforms.map(p => p.name) : []));
  const platformsStr = platforms.length ? platforms.join(", ") : "—";

  const publishers = (gb.publishers && Array.isArray(gb.publishers) ? gb.publishers.map(p => p.name) : (game?.publishers && Array.isArray(game.publishers) ? game.publishers.map(p => p.name) : []));
  const publishersStr = publishers.length ? publishers.join(", ") : "—";

  const genres = (gb.genres && Array.isArray(gb.genres) ? gb.genres.map(g => g.name) : (game?.genres && Array.isArray(game.genres) ? game.genres.map(g => g.name) : []));
  const genresStr = genres.length ? genres.join(", ") : "—";

  const imageObj = gb.image || (Array.isArray(gb.images) && gb.images[0]) || game?.image || (game?.cover_url ? { super_url: game.cover_url, medium_url: game.cover_url, small_url: game.cover_url } : null) || null;

  const rawHtml = gb.deck || gb.description || game?.deck || game?.description || game?.summary || "";
  const sanitizedHtml = (rawHtml || "").replace(/<script[\s\S]*?<\/script>/gi, "").trim();

  useEffect(() => {
    if (!isOpen || !game) return;
    let mounted = true;
    setLoadingReview(true);
    setReview(null);
    setReviewError(null);

    async function fetchReview() {
      const base = getApiBase();
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const attempts = [];
      if (game.id) attempts.push(`${base}/reviews/me?game_id=${encodeURIComponent(game.id)}`);
      const ext = game.external_guid || game.externalGuid || game.external_id || gb.guid || gb.id || null;
      if (ext) attempts.push(`${base}/reviews/me?external_guid=${encodeURIComponent(ext)}`);
      attempts.push(`${base}/reviews/me`);

      let got = null;
      let lastErr = null;
      for (let url of attempts) {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) {
            lastErr = `status ${res.status} (${url})`;
            continue;
          }
          const data = await res.json();
          if (!data) {
            lastErr = `empty response (${url})`;
            continue;
          }

          if (Array.isArray(data)) {
            if (data.length === 0) {
              lastErr = `no reviews in array (${url})`;
              continue;
            }
            let found = null;
            if (game.id) found = data.find(r => String(r.game_id) === String(game.id));
            if (!found && ext) found = data.find(r => String(r.external_guid) === String(ext) || String(r.guid) === String(ext));
            found = found || data[0];
            got = found;
            break;
          } else if (data.results && Array.isArray(data.results) && data.results.length) {
            const candidate = data.results.find(r => String(r.game_id) === String(game.id)) || data.results[0];
            got = candidate;
            break;
          } else if (data.items && Array.isArray(data.items) && data.items.length) {
            const candidate = data.items.find(r => String(r.game_id) === String(game.id)) || data.items[0];
            got = candidate;
            break;
          } else {
            got = data;
            break;
          }
        } catch (err) {
          lastErr = err.message || String(err);
        }
      }

      if (!mounted) return;
      if (!got) {
        setReview(null);
        setReviewError(lastErr || "Nenhuma review encontrada.");
        setDraftRating(0);
        setDraftText("");
        setDraftIsPublic(true);
      } else {
        const normalized = {
          ...got,
          rating: typeof got.rating !== "undefined" ? Number(got.rating) : (got.review_text ? 0 : null),
          review_text: got.review_text ?? got.text ?? got.body ?? null,
          is_public: got.is_public ?? true,
        };
        setReview(normalized);
        setDraftRating(Math.round(Number(normalized.rating || 0)));
        setDraftText(normalized.review_text || "");
        setDraftIsPublic(normalized.is_public ?? true);
      }
      setLoadingReview(false);
    }

    fetchReview();
    return () => { mounted = false; };
  }, [isOpen, game]);

  async function saveReview(overrides = {}) {
    const payload = {
      rating: typeof overrides.rating !== "undefined" ? overrides.rating : draftRating,
      review_text: typeof overrides.text !== "undefined" ? (overrides.text?.trim() || null) : (draftText?.trim() || null),
      is_public: typeof overrides.is_public !== "undefined" ? overrides.is_public : draftIsPublic,
    };

    const creating = !review?.id;

    try {
      let saved = null;
      if (!creating) {
        const res = await updateReview(review.id, payload);
        saved = res;
      } else {
        if (!game?.id) {
          throw new Error("game_id obrigatório para criar review.");
        }
        const res = await createReview(game.id, payload);
        saved = res;
      }

      if (saved) {
        const normalized = {
          ...saved,
          rating: typeof saved.rating !== "undefined" ? Number(saved.rating) : (saved.review_text ? 0 : null),
          review_text: saved.review_text ?? saved.text ?? saved.body ?? null,
          is_public: saved.is_public ?? true,
        };

        setReview(normalized);
        setDraftText(normalized.review_text || "");
        setDraftRating(Math.round(Number(normalized.rating ?? 0)));
        setDraftIsPublic(normalized.is_public ?? true);

        try {
          if (typeof onSavedReview === "function") {
            onSavedReview(normalized, creating);
          }
        } catch (cbErr) {
          console.warn("onSavedReview threw:", cbErr);
        }
      }

      return saved;
    } catch (err) {
      console.error("Erro ao autosave:", err);
      throw err;
    }
  }

  async function handleSaveReview() {
    if (!game) return;
    setSaving(true);
    setReviewError(null);
    try {
      const saved = await saveReview({ rating: draftRating, text: draftText, is_public: draftIsPublic });
      setReview(saved);
      setEditing(false);
      toast.success("Review salva");
    } catch (err) {
      console.error("Erro ao salvar review:", err);
      setReviewError(err.message || String(err));
      toast.error("Erro ao salvar review");
    } finally {
      setSaving(false);
    }
  }

  async function scheduleAutoSave(newRating) {
    if (!game) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    setAutoSaveSuccess(false);

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaving(true);
      setAutoSaveSuccess(false);
      try {
        const saved = await saveReview({ rating: newRating, text: draftText || (review?.review_text || "") });
        setReview(saved);
        setDraftText((saved && (saved.review_text ?? saved.text ?? saved.body)) || draftText || "");
        setAutoSaveSuccess(true);
        setTimeout(() => setAutoSaveSuccess(false), 1500);
      } catch (err) {
        console.error("Erro ao autosave:", err);
        setReviewError(err.message || String(err));
        toast.error("Erro ao salvar review");
      } finally {
        setAutoSaving(false);
      }
    }, 800);
  }

  function handleStarsChange(newVal) {
    const intVal = Math.round(Number(newVal || 0));
    setDraftRating(intVal);
    scheduleAutoSave(intVal);
  }

  async function handleImportClick() {
    if (typeof onImport !== "function") return;
    setImporting(true);
    setImportError(null);
    try {
      const importItem = {
        name: title,
        guid: gb.guid || gb.id || game?.external_guid || game?.externalGuid || game?.external_id || null,
        image: imageObj || null,
        deck: gb.deck || gb.description || game?.deck || game?.description || game?.summary || null,
        _raw: gb,
      };
      const maybePromise = onImport(importItem);
      if (maybePromise && typeof maybePromise.then === "function") await maybePromise;
      onClose();
    } catch (err) {
      console.error("Erro ao importar:", err);
      setImportError(err?.message || String(err));
    } finally {
      setImporting(false);
    }
  }

  const entry = {
    initial: { opacity: 0, y: 8, scale: 0.996 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 20 } },
  };
  const displayRating = (review && typeof review.rating !== "undefined") ? Math.round(Number(review.rating)) : (gb && typeof gb.rating !== "undefined" ? Math.round(Number(gb.rating)) : 0);

  const reviewRating = review ? Math.round(Number(review.rating || 0)) : null;

  const effectiveRating = editing
    ? draftRating
    : (typeof reviewRating === "number" && reviewRating !== null
        ? (Number(draftRating) !== Number(reviewRating) ? draftRating : reviewRating)
        : (Number(draftRating) !== 0 ? draftRating : displayRating)
      );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" ariaLabelledBy="game-title">
      <motion.div {...entry} className="p-0">
        <div ref={contentRef} className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-auto pr-3" style={{ WebkitOverflowScrolling: "touch" }}>
          {!game ? (
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                <div className="w-full h-44 sm:h-52 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 id="game-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h2>
                <button onClick={onClose} aria-label="Fechar" className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="flex-shrink-0">
                  <GameCover image={imageObj} alt={title} />

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <RatingStars
                      value={effectiveRating}
                      onChange={handleStarsChange}
                      readOnly={false}
                      max={10}
                      size={18}
                      showTooltip={true}
                    />

                    <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      {autoSaving ? <span className="text-xs text-gray-500">Salvando...</span> : (autoSaveSuccess ? <span className="text-xs text-green-500">Salvo</span> : null)}
                    </div>

                    <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      { (review && typeof review.rating !== "undefined") ? <span>· Sua nota: <strong>{Math.round(Number(review.rating || 0))}</strong></span> : (gb && typeof gb.rating !== "undefined" ? <span>· GB: <strong>{Math.round(Number(gb.rating))}</strong></span> : null) }
                    </div>

                    { (review && typeof review.reviews_count !== "undefined") && <div className="text-xs text-gray-500 ml-2">· {review.reviews_count} reviews</div> }
                    { (!review && typeof gb?.reviews_count !== "undefined") && <div className="text-xs text-gray-500 ml-2">· {gb.reviews_count} reviews</div> }
                  </div>
                </div>

                <div className="min-w-0 w-full">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Data de Lançamento: {date}</div>

                  <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200 break-words">
                    {sanitizedHtml ? <div className="line-clamp-6 md:line-clamp-8" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : <p className="italic text-gray-500">Sem descrição disponível.</p>}
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

                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium dark:text-white">Sua review</div>
                      <div className="text-xs text-gray-500">
                        {loadingReview ? "Carregando..." : (review ? `Última: ${review.updated_at ? new Date(review.updated_at).toLocaleString() : (review.created_at ? new Date(review.created_at).toLocaleString() : "")}` : "Nenhuma review")}
                      </div>
                    </div>

                    <div className="mt-3">
                      {loadingReview ? (
                        <div className="text-sm text-gray-500">Buscando sua review...</div>
                      ) : reviewError ? (
                        <div className="text-sm text-red-500">{reviewError}</div>
                      ) : review && !editing ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700 dark:text-gray-200">{review.review_text || review.text || review.body || <em>Sem texto</em>}</div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500">Nota: <strong>{review.rating ?? "—"}</strong></div>
                            <button
                              onClick={() => {
                                setEditing(true);
                                setDraftRating(Math.round(Number(review.rating || 0)));
                                setDraftText(review.text || review.review_text || review.body || "");
                                setDraftIsPublic(review.is_public ?? true);
                              }}
                              className="text-xs px-2 py-1 border rounded dark:text-white"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-500">Nota</label>
                            <RatingStars
                              value={draftRating}
                              onChange={(v) => setDraftRating(Math.round(Number(v || 0)))}
                              readOnly={false}
                              max={10}
                              size={20}
                              showTooltip={true}
                            />
                            <div className="ml-auto flex gap-2">
                              <button onClick={() => setEditing(false)} disabled={saving} className="text-xs px-2 py-1 border rounded dark:text-white">Cancelar</button>
                              <button onClick={handleSaveReview} disabled={saving} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded">
                                {saving ? "Salvando..." : (review ? "Salvar" : "Criar")}
                              </button>
                            </div>
                          </div>

                          <textarea rows={4} value={draftText} onChange={(e) => setDraftText(e.target.value)} className="w-full p-2 dark:text-white dark:bg-transparent border rounded text-sm" placeholder="Escreva sua review..." />
                          {reviewError && <div className="text-sm text-red-500">{reviewError}</div>}
                        </div>
                      )}
                    </div>
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
