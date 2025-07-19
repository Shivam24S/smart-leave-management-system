import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users";
import {
  setUsers,
  addUser,
  updateUser as updateUserStore,
  removeUser,
} from "../../store/slices/userSlice";

const UserCRUD = () => {
  let { users } = useSelector((state) => state.users);
  if (!Array.isArray(users)) users = [];
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    managerId: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers(token);
        dispatch(setUsers(users));
      } catch (error) {
        toast.error(error.message || "Failed to fetch users");
      }
    };
    fetchUsers();
  }, [dispatch, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!isEditing && !formData.password)
      newErrors.password = "Password is required";
    if (formData.role === "employee" && !formData.managerId) {
      newErrors.managerId = "Manager is required for employees";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (isEditing) {
        // Prepare payload for update
        const payload = { ...formData };
        if (payload.role !== "employee") {
          delete payload.managerId;
        } else {
          if (payload.managerId) {
            payload.managerId = Number(payload.managerId);
          } else {
            delete payload.managerId;
          }
        }
        const updatedUser = await updateUser(currentUserId, payload, token);
        dispatch(updateUserStore(updatedUser));
        toast.success("User updated successfully!");
      } else {
        // Prepare payload for create
        const payload = { ...formData };
        if (payload.role !== "employee") {
          delete payload.managerId;
        } else {
          if (payload.managerId) {
            payload.managerId = Number(payload.managerId);
          } else {
            delete payload.managerId;
          }
        }
        const newUser = await createUser(payload, token);
        dispatch(addUser(newUser));
        toast.success("User created successfully!");
      }
      resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      managerId: user.managerId || "",
    });
    setIsEditing(true);
    setCurrentUserId(user.id);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId, token);
        dispatch(removeUser(userId));
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "employee",
      managerId: "",
    });
    setIsEditing(false);
    setCurrentUserId(null);
    setErrors({});
  };

  const managers = users.filter((user) => user.role === "manager");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">
          {isEditing ? "Edit User" : "Create New User"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={isEditing ? "Leave blank to keep unchanged" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role === "employee" && (
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="managerId">
                  Manager
                </label>
                <select
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${
                    errors.managerId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
                {errors.managerId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.managerId}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update User"
                : "Create User"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">User List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, idx) => (
                <tr key={user.id || user._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "manager"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.managerId
                        ? users.find((u) => u.id === user.managerId)?.name ||
                          "N/A"
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.id === currentUserId}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserCRUD;
