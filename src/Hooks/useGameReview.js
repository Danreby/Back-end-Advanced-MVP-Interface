// src/hooks/useGameReview.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { normalizeReviewPayload, tryParseJsonIfString, formatDateRaw, safeJoinAny } from "../utils/gameHelpers";
import { getApiBase } from "../utils/gameHelpers";
import { createReview, updateReview } from "../API/reviews";
import * as gamesApi from "../API/games";

export default function useGameReview({ isOpen, game, onImport, onSavedReview, onStatusChange, onClose }) {
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

  const [status, setStatus] = useState(null);
  const [updatingStatusTo, setUpdatingStatusTo] = useState(null);

  const gb = useMemo(() => {
    if (!game) return {};
    let raw = game.giantbomb ?? game;
    raw = tryParseJsonIfString(raw);
    if (raw && typeof raw === "object" && raw._raw) raw = raw._raw;
    return raw || {};
  }, [game]);

  const title = useMemo(() => game?.name ?? gb?.name ?? gb?.title ?? "Detalhes do jogo", [game, gb]);

  const date = useMemo(() => {
    const rawDate =
      gb?.original_release_date ??
      gb?.release_date ??
      gb?.first_release_date ??
      gb?.original_release_date_string ??
      gb?.released ??
      gb?.release ??
      game?.original_release_date ??
      game?.release_date ??
      game?.start_date ??
      null;
    return formatDateRaw(rawDate);
  }, [gb, game]);

  const sanitizedHtml = useMemo(() => {
    const rawHtml =
      gb?.deck ?? "";
    return (rawHtml || "").replace(/<script[\s\S]*?<\/script>/gi, "").trim();
  }, [gb, game]);

  const platformsStr = useMemo(
    () => safeJoinAny(gb?.platforms ?? [], ["name", "title", "platform"]),
    [gb, game]
  );
  const publishersStr = useMemo(
    () => safeJoinAny(gb?.publishers ?? [], ["name", "company", "publisher"]),
    [gb, game]
  );
  const genresStr = useMemo(
    () => safeJoinAny(gb?.genres ?? [], ["name", "title", "label", "genre"]),
    [gb, game]
  );

  const imageObj = useMemo(() => {
    let img = null;
    if (gb?.image) img = gb.image;
    else if (Array.isArray(gb?.images) && gb.images.length) img = gb.images[0];
    else if (gb?.image_super_url || gb?.image_medium_url || gb?.image_small_url) {
      img = {
        super_url: gb.image_super_url,
        medium_url: gb.image_medium_url ?? gb.image_super_url,
        small_url: gb.image_small_url ?? gb.image_medium_url ?? gb.image_super_url,
      };
    } else if (gb?.thumb_url || gb?.thumbnail) {
      const url = gb.thumb_url ?? gb.thumbnail;
      img = { super_url: url, medium_url: url, small_url: url };
    } else if (game?.cover_url) {
      img = { super_url: game.cover_url, medium_url: game.cover_url, small_url: game.cover_url };
    } else if (game?.image) {
      img = game.image;
    }
    return img || null;
  }, [gb, game]);

  useEffect(() => {
    if (!game) return;
    const initial = game.status ?? game.user_status ?? game.user_game?.status ?? game.play_status ?? null;
    setStatus(initial);
  }, [game]);

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
        const ext =
          game?.external_guid ?? null;
        const params = game?.id ? `?game_id=${encodeURIComponent(game.id)}` : ext ? `?external_guid=${encodeURIComponent(ext)}` : "";

        const res = await fetch(`${base}/reviews/me${params}`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: controller.signal,
        });
        if (!mounted) return;
        if (!res.ok) {
          if (res.status === 404) {
            setReview(null);
            return;
          }
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

  const saveReview = useCallback(
    async (overrides = {}) => {
      const payload = {
        rating: typeof overrides.rating !== "undefined" ? overrides.rating : draftRating,
        review_text:
          typeof overrides.text !== "undefined" ? (overrides.text?.trim() || null) : draftText?.trim() || null,
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

      try {
        if (typeof onStatusChange === "function")
          onStatusChange({
            ...game,
            id: game?.id,
            external_guid: game?.external_guid ?? game?.externalGuid ?? null,
            rating: normalized?.rating,
            review: normalized,
          });
      } catch (e) {
        console.warn(e);
      }
      try {
        if (typeof onSavedReview === "function") onSavedReview(normalized, creating);
      } catch (e) {
        console.warn(e);
      }

      return normalized;
    },
    [draftRating, draftText, draftIsPublic, game, review, onSavedReview, onStatusChange]
  );

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

  const scheduleAutoSave = useCallback(
    (newRating) => {
      if (!game) return;
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      setAutoSaveSuccess(false);
      autoSaveRef.current = setTimeout(async () => {
        setAutoSaving(true);
        setAutoSaveSuccess(false);
        try {
          const saved = await saveReview({ rating: newRating, text: draftText || review?.review_text || "" });
          setReview(saved);
          setAutoSaveSuccess(true);
          try {
            if (typeof onStatusChange === "function")
              onStatusChange({
                ...game,
                id: game?.id,
                external_guid: game?.external_guid ?? game?.externalGuid ?? null,
                rating: saved?.rating,
                review: saved,
              });
          } catch (e) {
            console.warn(e);
          }
          setTimeout(() => setAutoSaveSuccess(false), 1500);
        } catch (err) {
          console.error("autosave", err);
          setError(err?.message || String(err));
          toast.error("Erro ao salvar review");
        } finally {
          setAutoSaving(false);
        }
      }, 800);
    },
    [game, saveReview, draftText, review, onStatusChange]
  );

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (fetchControllerRef.current) fetchControllerRef.current.abort();
    };
  }, []);

  const handleStarsChange = useCallback(
    (newVal) => {
      const v = Math.round(Number(newVal || 0));
      setDraftRating(v);
      scheduleAutoSave(v);
    },
    [scheduleAutoSave]
  );

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
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("import", err);
      setImportError(err?.message || String(err));
    } finally {
      setImporting(false);
    }
  }, [onImport, title, gb, game, imageObj, onClose]);

  const handleChangeStatus = useCallback(
    async (newStatus) => {
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
        try {
          if (typeof onStatusChange === "function") {
            if (saved && (saved.id || saved.game_id || saved.data)) onStatusChange(saved);
            else onStatusChange({ id: game?.id ?? null, external_guid: game?.external_guid ?? null, status: savedStatus });
          }
        } catch (e) {
          console.warn(e);
        }
        toast.success(`Status atualizado: ${savedStatus}`);
      } catch (err) {
        console.error(err);
        setStatus(previous);
        toast.error("Não foi possível atualizar o status");
      } finally {
        setUpdatingStatusTo(null);
      }
    },
    [game, status, gb, onStatusChange]
  );

  const displayRating = useMemo(() => {
    if (typeof review?.rating !== "undefined" && review?.rating !== null) return Math.round(Number(review.rating));
    if (typeof gb?.rating !== "undefined" && gb?.rating !== null) return Math.round(Number(gb.rating));
    if (typeof game?.avg_rating !== "undefined" && game?.avg_rating !== null) return Math.round(Number(game.avg_rating));
    if (typeof game?.rating !== "undefined" && game?.rating !== null) return Math.round(Number(game.rating));
    return 0;
  }, [review, gb, game]);

  const reviewRating = useMemo(() => (review ? Math.round(Number(review?.rating ?? 0)) : null), [review]);

  const effectiveRating = useMemo(() => {
    if (editing) return draftRating;
    if (typeof reviewRating === "number" && reviewRating !== null) return Number(draftRating) !== Number(reviewRating) ? draftRating : reviewRating;
    return Number(draftRating) !== 0 ? draftRating : displayRating;
  }, [editing, draftRating, reviewRating, displayRating]);

  return {
    loading,
    review,
    error,
    editing,
    setEditing,
    draftRating,
    setDraftRating,
    draftText,
    setDraftText,
    draftIsPublic,
    setDraftIsPublic,
    saving,
    importing,
    importError,
    autoSaving,
    autoSaveSuccess,
    status,
    updatingStatusTo,
    gb,
    title,
    date,
    sanitizedHtml,
    platformsStr,
    publishersStr,
    genresStr,
    imageObj,
    displayRating,
    effectiveRating,
    reviewRating,
    saveReview,
    handleSaveReview,
    handleStarsChange,
    scheduleAutoSave,
    handleImportClick,
    handleChangeStatus,
    setError,
  };
}
