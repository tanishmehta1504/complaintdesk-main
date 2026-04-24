// src/lib/axios.ts
// Axios instance — automatically attaches JWT token to every request

import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Next.js API routes — same origin, no CORS needed!
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cd_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("cd_token");
      localStorage.removeItem("cd_user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
