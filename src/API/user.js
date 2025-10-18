import api from "./axios";

export const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put("/users/me", payload);
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await api.post("/users/change-password", payload);
  return response.data;
};

export const updateAvatar = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/users/me/avatar", formData, {
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const percent = Math.round((evt.loaded * 100) / evt.total);
      if (typeof onUploadProgress === "function") onUploadProgress(percent);
    },
  });

  return response.data;
};

export const createMySession = async (payload) => {
  const res = await api.post("/users/me/sessions", payload);
  return res.data;
};

export const listMySessions = async () => {
  const res = await api.get("/users/me/sessions");
  return res.data;
};

export const updateMySession = async (sessionId, payload) => {
  const res = await api.put(`/users/me/sessions/${sessionId}`, payload);
  return res.data;
};

export const deleteMySession = async (sessionId) => {
  await api.delete(`/users/me/sessions/${sessionId}`);
  return true;
};

export const getCoplayersForMySession = async (sessionId) => {
  const res = await api.get(`/users/sessions/${sessionId}/coplayers`);
  return res.data;
};

export const sendFriendRequest = async (payload) => {
  const res = await api.post("/users/me/friends", payload);
  return res.data;
};

export const listMyFriends = async () => {
  const res = await api.get("/users/me/friends");
  return res.data;
};

export const listMyFriendRequests = async (params = {}) => {
  const res = await api.get("/users/me/friends/requests", { params });
  return res.data;
};

export const acceptFriendRequest = async (requestId) => {
  const res = await api.post(`/users/me/friends/${requestId}/accept`);
  return res.data;
};

export const rejectFriendRequest = async (requestId) => {
  const res = await api.post(`/users/me/friends/${requestId}/reject`);
  return res.data;
};

export const blockUser = async (userId) => {
  const res = await api.post(`/users/me/friends/${userId}/block`);
  return res.data;
};

export const searchUsers = async (q, { page = 1, pageSize = 20 } = {}) => {
  const res = await api.get("/users/search", {
    params: { q, page, page_size: pageSize },
  });
  return res.data;
};

export const getUserById = async (userId) => {
  const res = await api.get(`/users/id/${userId}`);
  return res.data;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
  createMySession,
  listMySessions,
  updateMySession,
  deleteMySession,
  getCoplayersForMySession,
  sendFriendRequest,
  listMyFriends,
  listMyFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  searchUsers,
  getUserById,
};
