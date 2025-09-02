import axios from "axios";

function resolveBaseUrl() {
  try {
    if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) {
      return String(process.env.REACT_APP_API_URL).replace(/\/+$/, "");
    }
  } catch (e) {
    //
  }

  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
      return String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");
    }
  } catch (e) {
    //
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://127.0.0.1:8000";
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:8000";
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      //
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    try {
      const status = err?.response?.status;
      if (status === 401) {
        try { localStorage.removeItem("token"); } catch (e) {}
      }
    } catch (e) {  }
    return Promise.reject(err);
  }
);

export default api;
