import api from "./axios";

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:8000";

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

export async function importGameToCatalog(item) {
  const payload = {
    name: item.name,
    external_guid: item.guid || item.external_guid || null,
    cover_url:
      (item.image &&
        (item.image.super_url || item.image.medium_url || item.image.small_url)) ||
      item.cover_url ||
      null,
    description: item.deck || item.description || item.summary || null,
    status: "Wishlist",
  };

  const res = await api.post("/games", payload);
  return res.data;
}
