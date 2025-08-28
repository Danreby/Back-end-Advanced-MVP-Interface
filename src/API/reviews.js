import api from "./axios";

export async function listReviewsByGame(gameId, { publicOnly = true, skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/games/${gameId}/reviews`, {
    params: { public_only: publicOnly, skip, limit },
  });
  return res.data; 
}

export async function listPublicReviews({ skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/reviews/`, { params: { skip, limit } });
  return res.data;
}

export async function listMyReviews({ skip = 0, limit = 50 } = {}) {
  const res = await api.get(`/reviews/me`, { params: { skip, limit } });
  return res.data;
}

// export async function createReview(gameId, payload) {
//   const res = await api.post(`/games/${gameId}/reviews`, payload);
//   return res.data;
// }

// export async function updateReview(gameId, reviewId, payload) {
//   const res = await api.put(`/games/${gameId}/reviews/${reviewId}`, payload);
//   return res.data;
// }

// export async function deleteReview(gameId, reviewId) {
//   await api.delete(`/games/${gameId}/reviews/${reviewId}`);
//   return true;
// }

export async function loadAllReviewsForGame(gameId, { publicOnly = true, pageSize = 200 } = {}) {
  let all = [];
  let skip = 0;
  while (true) {
    const { total, items } = await listReviewsByGame(gameId, { publicOnly, skip, limit: pageSize });
    all = all.concat(items || []);
    if (all.length >= (total || 0)) break;
    if (!items || items.length === 0) break; // segurança
    skip += pageSize;
  }
  return all;
}

export async function loadAllPublicReviews({ pageSize = 200 } = {}) {
  let all = [];
  let skip = 0;
  while (true) {
    const { total, items } = await listPublicReviews({ skip, limit: pageSize });
    all = all.concat(items || []);
    if (all.length >= (total || 0)) break;
    if (!items || items.length === 0) break;
    skip += pageSize;
  }
  return all;
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
