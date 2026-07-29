import api from "../api/axios";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Helper to normalize Axios errors into standard Error objects
const normalizeError = (error: any): Error => {
  if (error.response?.data?.msg) {
    return new Error(error.response.data.msg);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
};

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
  } catch (error) {
    throw normalizeError(error);
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
  } catch (error) {
    throw normalizeError(error);
  }
};

export const handleUserLogout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    throw normalizeError(error);
  } finally {
    // Ensure local credentials are cleared even if the server request fails
    localStorage.removeItem("accessToken");
  }
};