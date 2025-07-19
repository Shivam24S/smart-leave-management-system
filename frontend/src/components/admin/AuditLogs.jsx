import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAuditLogs } from "../../api/users";
import {
  fetchAuditLogsSuccess,
  operationFailure,
} from "../../store/slices/userSlice";

const AuditLogs = () => {
  let { auditLogs } = useSelector((state) => state.users);
  if (!Array.isArray(auditLogs)) auditLogs = [];
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const result = await getAuditLogs({ page, limit });
        // result is { total, page, pages, logs }
        dispatch(fetchAuditLogsSuccess(result.logs || []));
      } catch (error) {
        dispatch(operationFailure(error));
        toast.error(error);
      }
    };
    fetchLogs();
  }, [dispatch, page, limit]);

  const getActionColor = (actionType) => {
    if (
      actionType.includes("approve") ||
      actionType.includes("create") ||
      actionType.includes("register")
    ) {
      return "bg-green-100 text-green-800";
    } else if (actionType.includes("reject") || actionType.includes("delete")) {
      return "bg-red-100 text-red-800";
    } else if (actionType.includes("update")) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Audit Logs</h2>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="block text-gray-700 mb-2">Items per page</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={auditLogs.length < limit}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <p className="text-gray-500">No audit logs found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log, idx) => (
                <tr key={log.id || log._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getActionColor(
                        log.actionType
                      )}`}
                    >
                      {log.actionType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.actionTarget}
                  </td>
                  <td className="px-6 py-4">{log.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
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

export default AuditLogs;
