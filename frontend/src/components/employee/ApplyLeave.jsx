import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { applyLeave } from "../../api/leaves";
import { addLeave } from "../../store/slices/leaveSlice";

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    type: "casual",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fromDate) newErrors.fromDate = "From date is required";
    if (!formData.toDate) newErrors.toDate = "To date is required";
    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      newErrors.toDate = "To date must be after from date";
    }
    if (!formData.reason) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Ensure payload matches backend: fromDate, toDate, type, reason
      const payload = {
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        type: formData.type,
        reason: formData.reason,
      };
      const leave = await applyLeave(payload, token);
      if (!leave || leave.error) {
        toast.error(leave?.error || "Failed to apply for leave");
      } else {
        dispatch(addLeave(leave));
        toast.success("Leave application submitted successfully!");
        setFormData({
          fromDate: "",
          toDate: "",
          type: "casual",
          reason: "",
        });
      }
    } catch (error) {
      if (typeof error === "string") {
        toast.error(error);
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to apply for leave");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Apply for Leave</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="fromDate">
            From Date
          </label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.fromDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fromDate && (
            <p className="text-red-500 text-sm mt-1">{errors.fromDate}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="toDate">
            To Date
          </label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.toDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.toDate && (
            <p className="text-red-500 text-sm mt-1">{errors.toDate}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="type">
            Leave Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="annual">Annual Leave</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="reason">
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="3"
            className={`w-full p-2 border rounded ${
              errors.reason ? "border-red-500" : "border-gray-300"
            }`}
          ></textarea>
          {errors.reason && (
            <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Apply for Leave"}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;
