import api from "../api/axios";

export interface AuthResponse {
  accessToken: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const handleUserSignup = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.msg || err.message || "Signup failed"
    );
  }
};

export const handleUserLogin = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      identifier,
      password,
    });

    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.msg || err.message || "Login failed"
    );
  }
};

export const handleUserLogout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err: any) {
    throw new Error(
      err.response?.data?.msg || err.message || "Logout failed"
    );
  }
};
