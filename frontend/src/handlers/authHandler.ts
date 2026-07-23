import api from "../api/axios";

export const handleUserSignup = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return response.data;
};

export const handleUserLogin = async (
  identifier: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });

  return response.data;
};

// src/handlers/authHandler.ts

export const handleUserLogout = async () => {
  await api.post("/auth/logout");

  localStorage.removeItem("accessToken");
};