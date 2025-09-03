// src/API/auth.js
import api from "./axios";

// Registrar usuário
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Login
export const login = async (data) => {
  const usernameValue = data.email ?? data.username;

  const body = new URLSearchParams({
    username: usernameValue,
    password: data.password,
  }).toString();

  const response = await api.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // salva token somente se o login foi bem-sucedido
  if (response?.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

// Confirmar email (opcional — backend faz redirect quando o usuário clica no link)
export const confirmEmail = async (token) => {
  const response = await api.get(`/auth/confirm?token=${encodeURIComponent(token)}`);
  return response.data;
};

// Reenviar e-mail de confirmação (backend: POST /auth/resend-confirmation)
export const resendConfirmation = async (email) => {
  const response = await api.post("/auth/resend-confirmation", { email });
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

// Verifica se o usuário está autenticado
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Pega dados do usuário logado
export const getProfile = async () => {
  const response = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};
