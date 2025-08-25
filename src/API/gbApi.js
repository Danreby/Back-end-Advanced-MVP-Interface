// src/api/gbApi.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

async function _fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) {
    let msg = text || res.statusText;
    try { msg = JSON.parse(text).detail || msg; } catch (e) {}
    throw new Error(`${res.status} ${msg}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function searchGames(query, limit = 12) {
  const url = `${API_BASE}/gb/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  return _fetchJson(url);
}

export async function getGameDetails(guid) {
  const url = `${API_BASE}/gb/games/${encodeURIComponent(guid)}`;
  return _fetchJson(url);
}

/**
 * Importa um jogo para o catálogo do usuário.
 * - item: objeto retornado pela GiantBomb (ou objeto com campos name, external_guid, cover_url, description)
 * - token: Bearer token JWT (string) — pode ser obtido de localStorage
 */
export async function importGameToCatalog(item, token) {
  const payload = {
    name: item.name,
    external_guid: item.guid || item.external_guid || null,
    cover_url: (item.image && (item.image.super_url || item.image.medium_url || item.image.small_url)) || item.cover_url || null,
    description: item.deck || item.description || item.summary || null,
    status: "Wishlist"
  };

  const url = `${API_BASE}/games`;
  return _fetchJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}
