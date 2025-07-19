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

// Employee routes
export const applyLeave = async (leaveData) => {
  try {
    const response = await API.post("/employee/leaves", leaveData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to apply leave";
  }
};

export const cancelLeave = async (leaveId) => {
  try {
    const response = await API.delete(`/employee/leaves/${leaveId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to cancel leave";
  }
};

export const getLeaveBalances = async () => {
  try {
    const response = await API.get("/employee/balances");
    // Return only the balances array/object
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch leave balances";
  }
};

export const getLeaveHistory = async (params = {}) => {
  try {
    const response = await API.get("/employee/leaves/history", { params });
    // Return only the history array/object
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch leave history";
  }
};

// Manager routes
export const getTeamLeaves = async (params = {}) => {
  try {
    const response = await API.get("/manager/team/leaves", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch team leaves";
  }
};

export const approveRejectLeave = async (leaveId, decision) => {
  try {
    const response = await API.put(`/manager/leaves/${leaveId}`, decision);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to process leave request";
  }
};

export const getTeamCalendar = async (params = {}) => {
  try {
    const response = await API.get("/manager/team/calendar", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch team calendar";
  }
};
