import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUsers, updateLeaveBalance } from "../../api/users";
import {
  fetchUsersSuccess,
  operationFailure,
} from "../../store/slices/userSlice";

const UserLeaveBalances = () => {
  const { users } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState(null);
  const [balances, setBalances] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        dispatch(fetchUsersSuccess(users));
      } catch (error) {
        dispatch(operationFailure(error));
        toast.error(error);
      }
    };
    fetchUsers();
  }, [dispatch]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (user.leaveBalances) {
      const userBalances = {};
      user.leaveBalances.forEach((balance) => {
        if (!userBalances[balance.year]) {
          userBalances[balance.year] = {};
        }
        userBalances[balance.year][balance.type] = balance.balance;
      });
      setBalances(userBalances);
    } else {
      setBalances({});
    }
  };

  const handleBalanceChange = (year, type, value) => {
    setBalances((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [type]: parseInt(value) || 0,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      for (const [year, types] of Object.entries(balances)) {
        for (const [type, balance] of Object.entries(types)) {
          await updateLeaveBalance(selectedUser.id, {
            type,
            balance,
            year: parseInt(year),
          });
        }
      }
      toast.success("Leave balances updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update leave balances");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Manage Leave Balances
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={new Date().getFullYear()}>
                {new Date().getFullYear()}
              </option>
              <option value={new Date().getFullYear() - 1}>
                {new Date().getFullYear() - 1}
              </option>
              <option value={new Date().getFullYear() + 1}>
                {new Date().getFullYear() + 1}
              </option>
            </select>
          </div>

          <div className="border rounded-lg p-4 h-64 overflow-y-auto">
            <h3 className="font-medium mb-3">Select User</h3>
            {users.length === 0 ? (
              <p className="text-gray-500">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-2 rounded cursor-pointer ${
                      selectedUser?.id === user.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedUser ? (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">
                {selectedUser.name}'s Leave Balances for {year}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Casual Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={balances[year]?.casual || 0}
                    onChange={(e) =>
                      handleBalanceChange(year, "casual", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Sick Leave</label>
                  <input
                    type="number"
                    min="0"
                    value={balances[year]?.sick || 0}
                    onChange={(e) =>
                      handleBalanceChange(year, "sick", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Annual Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={balances[year]?.annual || 0}
                    onChange={(e) =>
                      handleBalanceChange(year, "annual", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Balances"}
              </button>
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-center h-full">
              <p className="text-gray-500">
                Select a user to manage their leave balances
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLeaveBalances;
