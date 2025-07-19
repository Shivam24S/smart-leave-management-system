import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLeaveHistory, cancelLeave } from "../../api/leaves";
import {
  fetchLeavesSuccess,
  operationFailure,
  removeLeave,
} from "../../store/slices/leaveSlice";

const LeaveHistory = () => {
  let { leaves } = useSelector((state) => state.leaves);
  if (!Array.isArray(leaves)) leaves = [];
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    status: "",
    type: "",
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getLeaveHistory(filters);
        if (!history || history.length === 0) {
          toast.error("No leave history found");
        }
        dispatch(fetchLeavesSuccess(history));
      } catch (error) {
        dispatch(operationFailure(error));
        toast.error(error);
      }
    };
    fetchHistory();
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        My Leave History
      </h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value={new Date().getFullYear()}>
              {new Date().getFullYear()}
            </option>
            <option value={new Date().getFullYear() - 1}>
              {new Date().getFullYear() - 1}
            </option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">All Types</option>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>

      {leaves.length === 0 ? (
        <p className="text-gray-500">No leave history found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave, idx) => (
                <tr key={leave.id || leave._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                    {new Date(leave.toDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {leave.type}
                  </td>
                  <td className="px-6 py-4">{leave.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(leave.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave.status === "pending" && (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        onClick={async () => {
                          if (window.confirm("Cancel this leave request?")) {
                            try {
                              await cancelLeave(leave.id);
                              dispatch(removeLeave(leave.id));
                              toast.success("Leave cancelled successfully");
                            } catch (err) {
                              toast.error(
                                err.message || "Failed to cancel leave"
                              );
                            }
                          }
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
