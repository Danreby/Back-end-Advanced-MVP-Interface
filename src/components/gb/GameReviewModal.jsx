import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Modal from "../ui/Modal";
import GameCover from "./GameCover";
import RatingStars from "../ui/RatingStars";
import { toast } from "react-toastify";
import { createReview, updateReview } from "../../API/reviews";
import * as gamesApi from "../../API/games";

function getApiBase() {
  return import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeReviewPayload(data) {
  if (!data || typeof data !== "object") return null;
  const rating = typeof data.rating !== "undefined" && data.rating !== null ? safeNumber(data.rating, 0) : (data.review_text ? 0 : null);
  return {
    ...data,
    rating,
    review_text: data.review_text ?? data.text ?? data.body ?? null,
    is_public: typeof data.is_public === "boolean" ? data.is_public : (data.is_public ?? true),
  };
}

export default function GameReviewModal({ isOpen, onClose, game, onImport, onSavedReview = null, onStatusChange = null }) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftText, setDraftText] = useState("");
  const [draftIsPublic, setDraftIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveSuccess, setAutoSaveSuccess] = useState(false);
  const autoSaveRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const contentRef = useRef(null);

  const STATUS_OPTIONS = useMemo(() => [
    { key: "wishlist", label: "Wishlist" },
    { key: "on_going", label: "On going" },
    { key: "stand_by", label: "Stand by" },
    { key: "dropped", label: "Dropped" },
    { key: "completed", label: "Completed" },
  ], []);

  const STATUS_STYLES = useMemo(() => ({
    wishlist: ["bg-gray-400 text-black", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
    on_going: ["bg-blue-600 text-white", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
    stand_by: ["bg-yellow-400 text-black", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
    dropped: ["bg-red-600 text-white", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
    completed: ["bg-green-600 text-white", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
  }), []);

  const [status, setStatus] = useState(null);
  const [updatingStatusTo, setUpdatingStatusTo] = useState(null);

  // reset on close
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setReview(null);
      setError(null);
      setEditing(false);
      setDraftRating(0);
      setDraftText("");
      setDraftIsPublic(true);
      setSaving(false);
      setImporting(false);
      setImportError(null);
      setAutoSaving(false);
      setAutoSaveSuccess(false);
      setStatus(null);

      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;
      }

      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    }
  }, [isOpen]);

  // scroll to top when opening a new game
  useEffect(() => {
    if (isOpen && contentRef.current) contentRef.current.scrollTop = 0;
  }, [game, isOpen]);

  // initial status from game payload
  useEffect(() => {
    if (!game) return;
    const initial = game.status ?? game.user_status ?? game.user_game?.status ?? game.play_status ?? null;
    setStatus(initial);
  }, [game]);

  // derived/normalized giantbomb object and strings
  const gb = useMemo(() => {
    if (!game) return {};
    return (game.giantbomb && typeof game.giantbomb === "object") ? game.giantbomb : game;
  }, [game]);

  const title = useMemo(() => gb?.name ?? game?.name ?? "Detalhes do jogo", [gb, game]);

  const date = useMemo(() => {
    const rawDate = gb?.original_release_date ?? gb?.release_date ?? game?.original_release_date ?? game?.release_date ?? null;
    if (!rawDate) return "Data não disponível";
    try { return new Date(rawDate).toLocaleDateString(); } catch { return rawDate; }
  }, [gb, game]);

  const safeJoin = useCallback((arr, key = "name") => {
    if (!Array.isArray(arr)) return "—";
    return arr.map?.(i => i?.[key]).filter(Boolean).join(", ") || "—";
  }, []);

  const platformsStr = useMemo(() => safeJoin(gb?.platforms ?? game?.platforms ?? [], "name"), [gb, game, safeJoin]);
  const publishersStr = useMemo(() => safeJoin(gb?.publishers ?? game?.publishers ?? [], "name"), [gb, game, safeJoin]);
  const genresStr = useMemo(() => safeJoin(gb?.genres ?? game?.genres ?? [], "name"), [gb, game, safeJoin]);

  const imageObj = useMemo(() => {
    return gb?.image ?? (Array.isArray(gb?.images) ? gb.images[0] : null) ?? game?.image ?? (game?.cover_url ? { super_url: game.cover_url, medium_url: game.cover_url, small_url: game.cover_url } : null) ?? null;
  }, [gb, game]);

  const sanitizedHtml = useMemo(() => {
    const rawHtml = gb?.deck ?? gb?.description ?? game?.deck ?? game?.description ?? game?.summary ?? "";
    return (rawHtml || "").replace(/<script[\s\S]*?<\/script>/gi, "").trim();
  }, [gb, game]);

  // fetch user's review for this game
  useEffect(() => {
    if (!isOpen || !game) return;
    let mounted = true;

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
      fetchControllerRef.current = null;
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    (async () => {
      setLoading(true);
      setError(null);
      setReview(null);
      setEditing(false);
      setDraftRating(0);
      setDraftText("");
      setDraftIsPublic(true);

      try {
        const base = getApiBase();
        const token = localStorage.getItem("token");
        const ext = game?.external_guid ?? game?.externalGuid ?? game?.external_id ?? gb?.guid ?? gb?.id ?? null;
        const params = game?.id ? `?game_id=${encodeURIComponent(game.id)}` : (ext ? `?external_guid=${encodeURIComponent(ext)}` : "");

        const res = await fetch(`${base}/reviews/me${params}`, { headers: { "Content-Type":"application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, signal: controller.signal });
        if (!mounted) return;
        if (!res.ok) {
          if (res.status === 404) { setReview(null); return; }
          throw new Error(`status ${res.status}`);
        }
        const data = await res.json();
        const normalized = normalizeReviewPayload(data) || null;
        setReview(normalized);
        setDraftRating(Math.round(Number(normalized?.rating ?? 0)));
        setDraftText(normalized?.review_text ?? "");
        setDraftIsPublic(normalized?.is_public ?? true);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("fetchReview", err);
        setError(err.message || "Erro ao carregar sua review.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
      fetchControllerRef.current = null;
    };
  }, [isOpen, game, gb]);

  // save (create or update) review - defensive
  const saveReview = useCallback(async (overrides = {}) => {
    const payload = {
      rating: typeof overrides.rating !== "undefined" ? overrides.rating : draftRating,
      review_text: typeof overrides.text !== "undefined" ? (overrides.text?.trim() || null) : (draftText?.trim() || null),
      is_public: typeof overrides.is_public !== "undefined" ? overrides.is_public : draftIsPublic,
    };

    const creating = !review?.id;
    if (creating && !game?.id) throw new Error("game_id obrigatório para criar review.");

    const res = creating ? await createReview(game.id, payload) : await updateReview(review.id, payload);
    if (!res || typeof res !== "object") throw new Error("Resposta inválida do servidor ao salvar review.");

    const normalized = normalizeReviewPayload(res);
    setReview(normalized);
    setDraftText(normalized?.review_text ?? "");
    setDraftRating(Math.round(Number(normalized?.rating ?? 0)));
    setDraftIsPublic(normalized?.is_public ?? true);

    try { if (typeof onStatusChange === "function") onStatusChange({ ...game, id: game?.id, external_guid: game?.external_guid ?? game?.externalGuid ?? null, rating: normalized?.rating, review: normalized }); } catch (e) { console.warn(e); }
    try { if (typeof onSavedReview === "function") onSavedReview(normalized, creating); } catch (e) { console.warn(e); }

    return normalized;
  }, [draftRating, draftText, draftIsPublic, game, review, onSavedReview, onStatusChange]);

  const handleSaveReview = useCallback(async () => {
    if (!game) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveReview({ rating: draftRating, text: draftText, is_public: draftIsPublic });
      setReview(saved);
      setEditing(false);
      toast.success("Review salva");
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
      toast.error("Erro ao salvar review");
    } finally {
      setSaving(false);
    }
  }, [game, draftRating, draftText, draftIsPublic, saveReview]);

  // auto-save (debounced)
  const scheduleAutoSave = useCallback((newRating) => {
    if (!game) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    setAutoSaveSuccess(false);
    autoSaveRef.current = setTimeout(async () => {
      setAutoSaving(true);
      setAutoSaveSuccess(false);
      try {
        const saved = await saveReview({ rating: newRating, text: draftText || (review?.review_text || "") });
        setReview(saved);
        setAutoSaveSuccess(true);
        try { if (typeof onStatusChange === "function") onStatusChange({ ...game, id: game?.id, external_guid: game?.external_guid ?? game?.externalGuid ?? null, rating: saved?.rating, review: saved }); } catch (e) { console.warn(e); }
        setTimeout(() => setAutoSaveSuccess(false), 1500);
      } catch (err) {
        console.error("autosave", err);
        setError(err?.message || String(err));
        toast.error("Erro ao salvar review");
      } finally {
        setAutoSaving(false);
      }
    }, 800);
  }, [game, saveReview, draftText, review, onStatusChange]);

  useEffect(() => () => {
    // cleanup on unmount
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
  }, []);

  const handleStarsChange = useCallback((newVal) => {
    const v = Math.round(Number(newVal || 0));
    setDraftRating(v);
    scheduleAutoSave(v);
  }, [scheduleAutoSave]);

  const handleImportClick = useCallback(async () => {
    if (typeof onImport !== "function") return;
    setImporting(true);
    setImportError(null);
    try {
      const importItem = {
        name: title,
        guid: gb?.guid ?? gb?.id ?? game?.external_guid ?? game?.externalGuid ?? game?.external_id ?? null,
        image: imageObj ?? null,
        deck: gb?.deck ?? gb?.description ?? game?.deck ?? game?.description ?? game?.summary ?? null,
        _raw: gb,
      };
      const maybe = onImport(importItem);
      if (maybe && typeof maybe.then === "function") await maybe;
      onClose();
    } catch (err) {
      console.error("import", err);
      setImportError(err?.message || String(err));
    } finally {
      setImporting(false);
    }
  }, [onImport, title, gb, game, imageObj, onClose]);

  const handleChangeStatus = useCallback(async (newStatus) => {
    if (!game) return;
    if (String(status) === String(newStatus)) return;
    const previous = status;
    setStatus(newStatus);
    setUpdatingStatusTo(newStatus);
    try {
      const ext = game?.external_guid ?? game?.externalGuid ?? game?.external_id ?? gb?.guid ?? gb?.id ?? null;
      let saved = null;
      if (game?.id) saved = await gamesApi.updateGameStatus(game.id, newStatus);
      else if (ext) saved = await gamesApi.createGameWithStatus({ external_guid: ext, status: newStatus });
      else throw new Error("Não há game.id nem external_guid para atualizar status");

      const savedStatus = saved?.status ?? saved?.data?.status ?? newStatus;
      setStatus(savedStatus);
      try { if (typeof onStatusChange === "function") { if (saved && (saved.id || saved.game_id || saved.data)) onStatusChange(saved); else onStatusChange({ id: game?.id ?? null, external_guid: game?.external_guid ?? null, status: savedStatus }); } } catch (e) { console.warn(e); }
      toast.success(`Status atualizado: ${savedStatus}`);
    } catch (err) {
      console.error(err);
      setStatus(previous);
      toast.error("Não foi possível atualizar o status");
    } finally {
      setUpdatingStatusTo(null);
    }
  }, [game, status, gb, onStatusChange]);

  const entry = useMemo(() => ({ initial: { opacity:0, y:8, scale:0.996 }, animate: { opacity:1, y:0, scale:1, transition:{ type:"spring", stiffness:240, damping:20 } } }), []);

  const displayRating = useMemo(() => {
    if (typeof review?.rating !== "undefined" && review?.rating !== null) return Math.round(Number(review.rating));
    if (typeof gb?.rating !== "undefined" && gb?.rating !== null) return Math.round(Number(gb.rating));
    return 0;
  }, [review, gb]);

  const reviewRating = useMemo(() => review ? Math.round(Number(review?.rating ?? 0)) : null, [review]);

  const effectiveRating = useMemo(() => {
    if (editing) return draftRating;
    if (typeof reviewRating === "number" && reviewRating !== null) return (Number(draftRating) !== Number(reviewRating) ? draftRating : reviewRating);
    return Number(draftRating) !== 0 ? draftRating : displayRating;
  }, [editing, draftRating, reviewRating, displayRating]);

  return (
    <Modal key={game?.id ?? gb?.guid ?? 'game-modal'} isOpen={isOpen} onClose={onClose} size="lg" ariaLabelledBy="game-title">
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
                <h2 id="game-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h2>
                <button onClick={onClose} aria-label="Fechar" className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex gap-2 items-center flex-wrap">
                {STATUS_OPTIONS.map(s => {
                  const isActive = String(status) === String(s.key);
                  const [activeCls, inactiveCls] = STATUS_STYLES[s.key] || STATUS_STYLES.wishlist;
                  const base = "text-xs px-3 py-1 rounded border flex items-center gap-2 transition-colors";
                  const disabled = updatingStatusTo && String(updatingStatusTo) !== String(s.key);
                  const cls = `${base} ${isActive ? `${activeCls} ring-2 ring-offset-1 ring-opacity-60` : inactiveCls} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`;
                  return <button key={s.key} onClick={() => handleChangeStatus(s.key)} disabled={disabled} aria-pressed={isActive} title={`Alterar para ${s.label}`} className={cls}>{ (updatingStatusTo && String(updatingStatusTo) === String(s.key)) ? `${s.label}...` : s.label }</button>;
                })}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="flex-shrink-0">
                  <GameCover image={imageObj} alt={title} />
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <RatingStars value={effectiveRating ?? 0} onChange={handleStarsChange} readOnly={false} max={10} size={18} showTooltip />
                    <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">{autoSaving ? <span className="text-xs text-gray-500">Salvando...</span> : (autoSaveSuccess ? <span className="text-xs text-green-500">Salvo</span> : null)}</div>
                    <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">{ (review && typeof review?.rating !== "undefined") ? <span>· Sua nota: <strong>{Math.round(Number(review.rating || 0))}</strong></span> : (gb && typeof gb?.rating !== "undefined" ? <span>· GB: <strong>{Math.round(Number(gb.rating))}</strong></span> : null) }</div>
                    { (review && typeof review.reviews_count !== "undefined") && <div className="text-xs text-gray-500 ml-2">· {review.reviews_count} reviews</div> }
                    { (!review && typeof gb?.reviews_count !== "undefined") && <div className="text-xs text-gray-500 ml-2">· {gb.reviews_count} reviews</div> }
                  </div>
                </div>

                <div className="min-w-0 w-full">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Data de Lançamento: {date}</div>

                  <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200 break-words">
                    {sanitizedHtml ? <div className="line-clamp-6 md:line-clamp-8" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : <p className="italic text-gray-500">Sem descrição disponível.</p>}
                  </div>

                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300"><strong className="font-medium">Plataformas:</strong> <span className="ml-1">{platformsStr}</span></div>

                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="min-w-0"><div className="text-xs text-gray-500">Publisher</div><div className="truncate max-w-[28rem]">{publishersStr}</div></div>
                    <div className="min-w-0"><div className="text-xs text-gray-500">Gênero</div><div className="truncate max-w-[28rem]">{genresStr}</div></div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium dark:text-white">Sua review</div>
                      <div className="text-xs text-gray-500">{loading ? "Carregando..." : (review ? `Última: ${review.updated_at ? new Date(review.updated_at).toLocaleString() : (review.created_at ? new Date(review.created_at).toLocaleString() : "")}` : "Nenhuma review")}</div>
                    </div>

                    <div className="mt-3">
                      {loading ? (
                        <div className="text-sm text-gray-500">Buscando sua review...</div>
                      ) : error ? (
                        <div className="text-sm text-red-500">{error}</div>
                      ) : review && !editing ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700 dark:text-gray-200">{review.review_text ?? review.text ?? review.body ?? <em>Sem texto</em>}</div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500">Nota: <strong>{review.rating ?? "—"}</strong></div>
                            <button onClick={() => { setEditing(true); setDraftRating(Math.round(Number(review.rating || 0))); setDraftText(review.text || review.review_text || review.body || ""); setDraftIsPublic(review.is_public ?? true); }} className="text-xs px-2 py-1 border rounded dark:text-white">Editar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea rows={4} maxLength={255} value={draftText} onChange={(e) => setDraftText(e.target.value)} className="w-full p-2 dark:text-white dark:bg-transparent border rounded text-sm" placeholder="Escreva sua review..." />
                          {error && <div className="text-sm text-red-500">{error}</div>}
                          <div className="flex items-center gap-3">
                            <div className="ml-auto flex gap-2">
                              <button onClick={() => setEditing(false)} disabled={saving} className="text-xs px-2 py-1 border rounded dark:text-white">Cancelar</button>
                              <button onClick={handleSaveReview} disabled={saving} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded">{saving ? "Salvando..." : (review ? "Salvar" : "Criar")}</button>
                            </div>
                          </div>
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
