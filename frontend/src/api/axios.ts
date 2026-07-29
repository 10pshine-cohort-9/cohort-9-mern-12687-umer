import axios from "axios";

let inMemoryToken: string | null = null;

export const setAxiosToken = (token: string | null) => {
  inMemoryToken = token;
};

// Export a getter so App.tsx can check if a token exists in memory
export const getAxiosToken = () => inMemoryToken;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", 
  withCredentials: true, // Crucial for sending the HttpOnly refresh token cookie
});

// Use in-memory token for authorization header
api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

export default api;