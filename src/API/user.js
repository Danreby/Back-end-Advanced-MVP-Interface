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
  formData.append("avatar", file);

  const response = await api.post("/users/me/avatar", formData, {
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const percent = Math.round((evt.loaded * 100) / evt.total);
      if (typeof onUploadProgress === "function") onUploadProgress(percent);
    },
  });

  return response.data; 
};
