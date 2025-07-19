import React, { useState, useEffect } from "react";
import { getTeamLeaves, approveRejectLeave } from "../../api/leaves";

function LeaveApproval() {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch team leaves on mount
  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  const fetchTeamLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeamLeaves();
      setTeamLeaves(data.data || data); // handle both {data:[]} and []
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to fetch team leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (status) => {
    if (!selectedLeave) return;
    setIsProcessing(true);
    setError("");
    try {
      await approveRejectLeave(selectedLeave.id, {
        status,
        comment,
      });
      await fetchTeamLeaves();
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to process request");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Team Leave Requests
        </h2>
        {loading ? (
          <div className="text-center text-blue-600 py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamLeaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-400 text-lg"
                  >
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                teamLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {leave.User.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          leave.type === "casual"
                            ? "bg-blue-100 text-blue-800"
                            : leave.type === "sick"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setComment("");
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedLeave && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(0,0,0,0.01)" }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">Review Leave Request</h3>
            <div className="mb-4">
              <p className="font-medium">Employee: {selectedLeave.User.name}</p>
              <p>Type: {selectedLeave.type}</p>
              <p>
                Dates: {new Date(selectedLeave.fromDate).toLocaleDateString()} -{" "}
                {new Date(selectedLeave.toDate).toLocaleDateString()}
              </p>
              <p>Reason: {selectedLeave.reason}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              ></textarea>
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedLeave(null);
                  setComment("");
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleApproveReject("rejected");
                  setSelectedLeave(null);
                  setComment("");
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={async () => {
                  await handleApproveReject("approved");
                  setSelectedLeave(null);
                  setComment("");
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveApproval;
