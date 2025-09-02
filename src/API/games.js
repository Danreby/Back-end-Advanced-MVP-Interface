import api from "./axios";

export async function listMyGames({ skip = 0, limit = 50 } = {}) {
  const res = await api.get("/games", { params: { skip, limit } });
  return res.data;
}

export async function listAllGamesGrouped() {
  const res = await api.get("/games/all");
  return res.data;
}

export async function getGame(gameId) {
  const res = await api.get(`/games/${gameId}`);
  return res.data;
}

export async function createGame(payload) {
  const res = await api.post("/games", payload);
  return res.data;
}

export async function updateGame(gameId, payload) {
  const res = await api.put(`/games/${gameId}`, payload);
  return res.data;
}

export async function deleteGame(gameId) {
  await api.delete(`/games/${gameId}`);
  return true;
}

export async function loadAllMyGames({ pageSize = 200 } = {}) {
  let all = [];
  let skip = 0;
  while (true) {
    const { total, items } = await listMyGames({ skip, limit: pageSize });
    all = all.concat(items || []);
    if (all.length >= (total || 0)) break;
    if (!items || items.length === 0) break;
    skip += pageSize;
  }
  return all;
}

export async function updateGameStatus(gameId, status) {
const res = await api.patch(`/games/${gameId}/status`, { status });
return res.data;
}

export async function createGameWithStatus(payload) {
const res = await api.post("/games", payload);
return res.data;
}

export default {
  listMyGames,
  listAllGamesGrouped,
  getGame,
  createGame,
  updateGame,
};