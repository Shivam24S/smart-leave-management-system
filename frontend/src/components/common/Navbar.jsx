import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            Leave Management
          </Link>
          {user.role === "employee" && (
            <>
              <Link
                to="/dashboard/apply-leave"
                className="text-gray-700 hover:text-blue-600"
              >
                Apply Leave
              </Link>
              <Link
                to="/dashboard/leave-balances"
                className="text-gray-700 hover:text-blue-600"
              >
                My Balances
              </Link>
              <Link
                to="/dashboard/leave-history"
                className="text-gray-700 hover:text-blue-600"
              >
                My History
              </Link>
            </>
          )}
          {user.role === "manager" && (
            <>
              <Link
                to="/dashboard/team-leaves"
                className="text-gray-700 hover:text-blue-600"
              >
                Team Leaves
              </Link>
              <Link
                to="/dashboard/team-calendar"
                className="text-gray-700 hover:text-blue-600"
              >
                Team Calendar
              </Link>
            </>
          )}
          {user.role === "admin" && (
            <>
              <Link
                to="/dashboard/users"
                className="text-gray-700 hover:text-blue-600"
              >
                User Management
              </Link>
              <Link
                to="/dashboard/audit-logs"
                className="text-gray-700 hover:text-blue-600"
              >
                Audit Logs
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Welcome, {user.name}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
