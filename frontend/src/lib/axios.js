import axios from "axios";

// NOTE: this is now the ONLY axios instance in the app. The old
// src/app/lib/axios.js duplicate should be deleted from the repo --
// it had no auth interceptor and was silently causing every
// authenticated request to go out without a token.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically. Key must match what login/authStore/
// ProtectedRoute all use: "access_token".
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If a token is rejected/expired, clear it and bounce to login rather
// than leaving the user stuck on a silently-broken dashboard.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
