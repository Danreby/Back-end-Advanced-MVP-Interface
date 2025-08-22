import api from "./axios";

// Registrar usuário
export const register = async (data) => {
  const response = await api.post("/register", data);
  return response.data;
};

// Login
export const login = async (data) => {
  const response = await api.post("/login", data);
  // salvar token no localStorage
  localStorage.setItem("token", response.data.access_token);
  return response.data;
};

// Confirmar email
export const confirmEmail = async (token) => {
  const response = await api.get(`/confirm-email?token=${token}`);
  return response.data;
};
