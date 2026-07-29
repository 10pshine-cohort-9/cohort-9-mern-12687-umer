import api from "../api/axios";

export const handleUserSignup = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post("/auth/register", {
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
) => {
  try {
    const response = await api.post("/auth/login", {
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
  } finally {
    localStorage.removeItem("accessToken");
  }
};
