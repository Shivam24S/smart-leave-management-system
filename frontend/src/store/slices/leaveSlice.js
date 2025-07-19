import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leaves: [],
  teamLeaves: [],
  leaveBalances: {},
  calendarData: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    fetchLeavesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLeavesSuccess: (state, action) => {
      state.leaves = action.payload;
      state.loading = false;
    },
    fetchTeamLeavesSuccess: (state, action) => {
      state.teamLeaves = action.payload;
      state.loading = false;
    },
    fetchLeaveBalancesSuccess: (state, action) => {
      state.leaveBalances = action.payload;
      state.loading = false;
    },
    fetchCalendarSuccess: (state, action) => {
      state.calendarData = action.payload;
      state.loading = false;
    },
    addLeave: (state, action) => {
      state.leaves.unshift(action.payload);
    },
    updateLeave: (state, action) => {
      const index = state.leaves.findIndex(
        (leave) => leave.id === action.payload.id
      );
      if (index !== -1) {
        state.leaves[index] = action.payload;
      }
      const teamIndex = state.teamLeaves.findIndex(
        (leave) => leave.id === action.payload.id
      );
      if (teamIndex !== -1) {
        state.teamLeaves[teamIndex] = action.payload;
      }
    },
    removeLeave: (state, action) => {
      state.leaves = state.leaves.filter(
        (leave) => leave.id !== action.payload
      );
    },
    operationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchLeavesStart,
  fetchLeavesSuccess,
  fetchTeamLeavesSuccess,
  fetchLeaveBalancesSuccess,
  fetchCalendarSuccess,
  addLeave,
  updateLeave,
  removeLeave,
  operationFailure,
  clearLeaveError,
} = leaveSlice.actions;

export default leaveSlice.reducer;
