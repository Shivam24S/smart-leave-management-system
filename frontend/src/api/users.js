import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add authorization header to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin routes
export const getUsers = async () => {
  try {
    const response = await API.get("/admin/users");
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch users";
  }
};

export const createUser = async (userData) => {
  try {
    const response = await API.post("/admin/users", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to create user";
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await API.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to update user";
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to delete user";
  }
};

export const updateLeaveBalance = async (userId, balanceData) => {
  try {
    const response = await API.put(
      `/admin/users/${userId}/balance`,
      balanceData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to update leave balance";
  }
};

export const getAuditLogs = async (params = {}) => {
  try {
    const response = await API.get("/admin/audit-logs", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch audit logs";
  }
};
