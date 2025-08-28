// src/API/axios.js
import axios from "axios";

function resolveBaseUrl() {
  // 1) Create React App style env
  try {
    if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) {
      return String(process.env.REACT_APP_API_URL).replace(/\/+$/, "");
    }
  } catch (e) {
    /* ignore */
  }

  // 2) Vite: import.meta.env (acessado dentro de try/catch para evitar quebrar em alguns ambientes)
  try {
    // import.meta pode não existir em todos os ambientes; se não existir, cai no catch
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
      return String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");
    }
  } catch (e) {
    /* ignore */
  }

  // 3) fallback: se estiver em localhost use 127.0.0.1:8000 (útil em dev), senão use origem atual
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://127.0.0.1:8000";
    return window.location.origin.replace(/\/+$/, "");
  }

  // último recurso
  return "http://127.0.0.1:8000";
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000, // ajuste se quiser
  // NÃO setar Content-Type global para evitar quebrar uploads FormData
});

// Injetar token automaticamente (com segurança)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // localStorage pode falhar em alguns ambientes; não bloquear request
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Tratar 401 globalmente (opcional)
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    try {
      const status = err?.response?.status;
      if (status === 401) {
        try { localStorage.removeItem("token"); } catch (e) {}
        // opcional: window.location.href = "/login";
      }
    } catch (e) { /* ignore */ }
    return Promise.reject(err);
  }
);

export default api;
