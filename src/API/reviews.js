import api from "./axios";

const MAX_PAGE_SIZE = 500;

// Lista reviews de um game específico
export async function listReviewsByGame(gameId, { skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/games/${gameId}/reviews`, {
    params: { skip, limit },
  });
  return res.data;
}

// Lista reviews públicos (agrupados por jogos)
export async function listPublicReviews({ skip = 0, limit = 5, reviews_per_game_limit = 200 } = {}) {
  const res = await api.get(`/reviews/grouped`, {
    params: { skip, limit, reviews_per_game_limit },
  });
  return res.data;
}

// Lista somente os meus reviews
export async function listMyReviews({ skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/reviews/me`, { params: { skip, limit } });
  return res.data;
}

// Carrega todos os reviews de um jogo (com paginação automática)
export async function loadAllReviewsForGame(gameId, { pageSize = 200 } = {}) {
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  let all = [];
  let skip = 0;

  while (true) {
    const { total, items } = await listReviewsByGame(gameId, { skip, limit: pageSize });
    all = all.concat(items || []);
    if (!items || items.length === 0) break;
    if (all.length >= (total || 0)) break;
    skip += items.length;
  }

  return all;
}

// Carrega todos os reviews públicos agrupados
export async function loadAllPublicReviews({ pageSize = 5, reviews_per_game_limit = 200 } = {}) {
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  let all = [];
  let skip = 0;

  while (true) {
    const { total, items } = await listPublicReviews({ skip, limit: pageSize, reviews_per_game_limit });
    all = all.concat(items || []);
    if (!items || items.length === 0) break;
    if (all.length >= (total || 0)) break;
    skip += items.length;
  }

  return all;
}

// Criar review
export async function createReview(gameId, payload) {
  const res = await api.post(`/reviews/game/${gameId}`, payload);
  return res.data;
}

// Atualizar review
export async function updateReview(reviewId, payload) {
  const res = await api.put(`/reviews/${reviewId}`, payload);
  return res.data;
}

// Deletar review
export async function deleteReview(reviewId) {
  await api.delete(`/reviews/${reviewId}`);
  return true;
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
};
