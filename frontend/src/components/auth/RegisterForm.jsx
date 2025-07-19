import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { register } from "../../api/auth";
import {
  registerStart,
  registerSuccess,
  registerFailure,
} from "../../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    managerId: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch managers from backend
    const fetchManagers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`);
        const users = await res.json();
        setManagers(users.filter((u) => u.role === "manager"));
      } catch {
        setManagers([]);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!userData.name) newErrors.name = "Name is required";
    if (!userData.email) newErrors.email = "Email is required";
    if (!userData.password) newErrors.password = "Password is required";
    if (userData.role === "employee" && !userData.managerId) {
      newErrors.managerId = "Manager is required for employees";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    dispatch(registerStart());
    try {
      // Only include managerId if role is employee and managerId is selected
      const payload = { ...userData };
      if (payload.role !== "employee") {
        delete payload.managerId;
      } else {
        // Convert managerId to number if present, else remove
        if (payload.managerId) {
          payload.managerId = Number(payload.managerId);
        } else {
          delete payload.managerId;
        }
      }
      const { user, token } = await register(payload);
      dispatch(registerSuccess({ user, token }));
      navigate("/dashboard");
    } catch (error) {
      dispatch(registerFailure(error));
      setErrors({ form: error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Register
      </h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {userData.role === "employee" && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="managerId">
              Manager
            </label>
            <select
              id="managerId"
              name="managerId"
              value={userData.managerId}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.managerId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={managers.length === 0}
            >
              <option value="">
                {managers.length === 0 ? "No managers found" : "Select Manager"}
              </option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
            {managers.length === 0 && (
              <p className="text-red-500 text-sm mt-1">
                No managers available. Please contact admin.
              </p>
            )}
            {errors.managerId && (
              <p className="text-red-500 text-sm mt-1">{errors.managerId}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
