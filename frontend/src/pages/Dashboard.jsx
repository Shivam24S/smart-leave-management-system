import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/common/Navbar";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      // Only redirect if at /dashboard root
      if (location.pathname === "/dashboard") {
        if (user.role === "employee")
          navigate("/dashboard/apply-leave", { replace: true });
        else if (user.role === "manager")
          navigate("/dashboard/team-leaves", { replace: true });
        else if (user.role === "admin")
          navigate("/dashboard/users", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
