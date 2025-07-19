import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-4">
      <div className="w-full max-w-xl bg-white bg-opacity-90 rounded-xl shadow-2xl p-8 flex flex-col items-center mb-8 mt-8">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2 tracking-tight text-center">
          Leave Management System
        </h1>
        <p className="text-lg text-blue-900 mb-6 text-center">
          Manage your leaves efficiently with our comprehensive leave management
          system.
        </p>
        <div className="flex gap-4 mb-6">
          <Link to="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all duration-200">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-white border border-blue-600 text-blue-700 font-bold py-2 px-6 rounded-lg shadow hover:bg-blue-50 transition-all duration-200">
              Register
            </button>
          </Link>
        </div>
      </div>
      <div className="w-full max-w-md z-20 mt-2">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
