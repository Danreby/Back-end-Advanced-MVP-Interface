import api from "./axios";

// Registrar usuário
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Login
export const login = async (data) => {
  // aceita tanto data.email quanto data.username (mais tolerante)
  const usernameValue = data.email ?? data.username;

  const body = new URLSearchParams({
    username: usernameValue,
    password: data.password
  }).toString();

  const response = await api.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  localStorage.setItem("token", response.data.access_token);
  return response.data;
};


// Confirmar email
export const confirmEmail = async (token) => {
  const response = await api.get(`/confirm-email?token=${token}`);
  return response.data;
};
