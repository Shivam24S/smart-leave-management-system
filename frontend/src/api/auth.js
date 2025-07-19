import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const login = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed";
  }
};

export const register = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Registration failed";
  }
};

export const getCurrentUser = async (token) => {
  try {
    const response = await API.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch user";
  }
};
