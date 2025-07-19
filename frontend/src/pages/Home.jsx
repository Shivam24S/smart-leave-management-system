import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const Home = () => {
  const [show, setShow] = useState(null);

  if (show === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-4">
        <div className="w-full max-w-md bg-white bg-opacity-90 rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fade-in">
          <LoginForm />
          <button
            className="mt-4 text-blue-600 hover:underline w-full"
            onClick={() => setShow(null)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  if (show === "register") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-4">
        <div className="w-full max-w-md bg-white bg-opacity-90 rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fade-in">
          <RegisterForm />
          <button
            className="mt-4 text-blue-600 hover:underline w-full"
            onClick={() => setShow(null)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-4">
      <div className="w-full max-w-2xl bg-white bg-opacity-90 rounded-2xl shadow-2xl p-12 flex flex-col items-center mb-8 mt-8 animate-fade-in">
        <div className="mb-6 flex flex-col items-center">
          <span
            className="inline-block animate-bounce text-blue-500 mb-2"
            style={{ fontSize: 60 }}
          >
            🗓️
          </span>
          <h1 className="text-5xl font-extrabold text-blue-800 mb-2 tracking-tight text-center drop-shadow">
            Leave Management System
          </h1>
        </div>
        <p className="text-2xl text-blue-900 mb-8 text-center font-medium">
          Manage your leaves efficiently with our comprehensive leave management
          system.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 mb-2 w-full justify-center">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg text-lg transition-all duration-200 mb-4 sm:mb-0 sm:mr-4"
            onClick={() => setShow("login")}
          >
            Login
          </button>
          <button
            className="w-full bg-white border-2 border-blue-600 text-blue-700 font-bold py-3 px-10 rounded-lg shadow-lg text-lg hover:bg-blue-50 transition-all duration-200"
            onClick={() => setShow("register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
