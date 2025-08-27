import api from "./axios";

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const updateProfile = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await api.put("/users/me", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const changePassword = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/users/change-password", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
