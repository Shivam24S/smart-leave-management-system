import React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/common/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { getCurrentUser } from "./api/auth";
import { loginSuccess, logout } from "./store/slices/authSlice";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ApplyLeave from "./components/employee/ApplyLeave";
import LeaveBalances from "./components/employee/LeaveBalances";
import LeaveHistory from "./components/employee/LeaveHistory";
import LeaveApproval from "./components/manager/LeaveApproval";
import TeamCalendar from "./components/manager/TeamCalendar";
import UserCRUD from "./components/admin/UserCRUD";
import UserLeaveBalances from "./components/admin/UserLeaveBalances";
import AuditLogs from "./components/admin/AuditLogs";

function App() {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (token) {
          const user = await getCurrentUser(token);
          dispatch(loginSuccess({ user, token }));
        }
      } catch (error) {
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, token]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* Employee routes */}
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="leave-balances" element={<LeaveBalances />} />
            <Route path="leave-history" element={<LeaveHistory />} />
            {/* Manager routes */}
            <Route path="team-leaves" element={<LeaveApproval />} />
            <Route path="team-calendar" element={<TeamCalendar />} />
            {/* Admin routes */}
            <Route path="users" element={<UserCRUD />} />
            <Route path="user-leave-balances" element={<UserLeaveBalances />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
