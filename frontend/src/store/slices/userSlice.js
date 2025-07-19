import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  auditLogs: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.users = action.payload;
      state.loading = false;
    },
    fetchAuditLogsSuccess: (state, action) => {
      state.auditLogs = action.payload;
      state.loading = false;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
    operationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchAuditLogsSuccess,
  addUser,
  updateUser,
  removeUser,
  operationFailure,
  clearUserError,
  setUsers,
} = userSlice.actions;

export default userSlice.reducer;
