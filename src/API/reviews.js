import api from "./axios";

const MAX_PAGE_SIZE = 500;

export async function listReviewsByGame(gameId, { publicOnly = true, skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/games/${gameId}/reviews`, {
    params: { public_only: publicOnly, skip, limit },
  });
  return res.data;
}

export async function listPublicReviews({ skip = 0, limit = 5, reviews_per_game_limit = 200 } = {}) {
  const res = await api.get(`/reviews/grouped`, { params: { skip, limit, reviews_per_game_limit } });
  return res.data;
}

export async function listMyReviews({ skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/reviews/my`, { params: { skip, limit } });
  return res.data;
}

export async function getMyReview({ game_id = null, external_guid = null } = {}) {
  const params = {};
  if (game_id) params.game_id = game_id;
  if (external_guid) params.external_guid = external_guid;
  const res = await api.get(`/reviews/me`, { params });
  const data = res.data;
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.length ? data[0] : null;
  }
  if (data.results && Array.isArray(data.results)) return data.results.length ? data.results[0] : null;
  return data;
}

export async function createReview(gameId, payload) {
  const res = await api.post(`/reviews/game/${gameId}`, payload);
  return res.data;
}

export async function updateReview(reviewId, payload) {
  const res = await api.put(`/reviews/${reviewId}`, payload);
  return res.data;
}

export async function deleteReview(reviewId) {
  await api.delete(`/reviews/${reviewId}`);
  return true;
}

export async function upsertReview(payload) {
  const res = await api.post(`/reviews/upsert`, payload);
  return res.data;
}

export async function autosaveReview(payload) {
  try {
    const res = await api.patch(`/reviews/autosave`, payload);
    return res.data;
  } catch (err) {
    return upsertReview(payload);
  }
}

export async function loadAllReviewsForGame(gameId, { publicOnly = true, pageSize = 200 } = {}) {
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  let all = [];
  let skip = 0;
  while (true) {
    const { total, items } = await listReviewsByGame(gameId, { publicOnly, skip, limit: pageSize });
    all = all.concat(items || []);
    if (!items || items.length === 0) break;
    if (all.length >= (total || 0)) break;
    skip += (items.length || 0);
  }
  return all;
}

export async function loadAllPublicReviews({ pageSize = 2 } = {}) {
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  let all = [];
  let skip = 0;
  while (true) {
    const { total, items } = await listPublicReviews({ skip, limit: pageSize });
    all = all.concat(items || []);
    if (!items || items.length === 0) break;
    if (all.length >= (total || 0)) break;
    skip += (items.length || 0);
  }
  return all;
}

export default {
  listReviewsByGame,
  listPublicReviews,
  listMyReviews,
  createReview,
  updateReview,
  deleteReview,
  loadAllReviewsForGame,
  loadAllPublicReviews,
  getMyReview,
  upsertReview,
  autosaveReview,
};
