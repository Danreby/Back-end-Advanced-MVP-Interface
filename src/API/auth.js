// src/API/auth.js
import api from "./axios";

// Registrar usuário
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  // Retorna inclusive o confirmation_url que o backend fornece
  return response.data;
};

// Login
export const login = async (data) => {
  const usernameValue = data.email ?? data.username;

  const body = new URLSearchParams({
    username: usernameValue,
    password: data.password,
  }).toString();

  try {
    const response = await api.post("/auth/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response?.data?.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }

    return response.data;
  } catch (err) {
    // Se a conta não estiver ativa, o backend retorna 400
    if (
      err.response?.status === 400 &&
      typeof err.response?.data?.detail === "string" &&
      err.response.data.detail.toLowerCase().includes("not active")
    ) {
      throw new Error("Conta ainda não confirmada. Reenviamos o e-mail de ativação.");
    }
    throw err;
  }
};

// Confirmar email (opcional — backend faz redirect quando o usuário clica no link)
export const confirmEmail = async (token) => {
  const response = await api.get(`/auth/confirm?token=${encodeURIComponent(token)}`);
  return response.data;
};

// Reenviar e-mail de confirmação
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
