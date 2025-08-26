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

  localStorage.setItem("token", response.data.access_token);

  return response.data;
};

// Confirmar email
export const confirmEmail = async (token) => {
  const response = await api.get(`/confirm-email?token=${token}`);
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
