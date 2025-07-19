import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLeaveBalances } from "../../api/leaves";
import {
  fetchLeaveBalancesSuccess,
  operationFailure,
} from "../../store/slices/leaveSlice";

const LeaveBalances = () => {
  const { leaveBalances } = useSelector((state) => state.leaves);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const balances = await getLeaveBalances();
        if (!balances || Object.keys(balances).length === 0) {
          toast.error("No leave balances found");
        }
        dispatch(fetchLeaveBalancesSuccess(balances));
      } catch (error) {
        dispatch(operationFailure(error));
        toast.error(error);
      }
    };
    fetchBalances();
  }, [dispatch]);

  // Helper: is flat object (casual, sick, annual)
  const isFlat =
    leaveBalances &&
    typeof leaveBalances === "object" &&
    !Array.isArray(leaveBalances) &&
    Object.values(leaveBalances).every((v) => typeof v === "number");

  // Helper: is object of years
  const isYearObj =
    leaveBalances &&
    typeof leaveBalances === "object" &&
    !Array.isArray(leaveBalances) &&
    Object.values(leaveBalances).every(
      (v) => typeof v === "object" && v !== null && !Array.isArray(v)
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        My Leave Balances
      </h2>

      {!leaveBalances || Object.keys(leaveBalances).length === 0 ? (
        <p className="text-gray-500">No leave balances found</p>
      ) : isFlat ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Current Year</h3>
            <div className="space-y-2">
              {Object.entries(leaveBalances).map(([type, balance]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="capitalize">{type} Leave:</span>
                  <span className="font-medium">{balance} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isYearObj ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(leaveBalances).map(([year, balances]) => (
            <div key={year} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">{year}</h3>
              <div className="space-y-2">
                {Object.entries(balances).map(([type, balance]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type} Leave:</span>
                    <span className="font-medium">{balance} days</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Invalid leave balances data</p>
      )}
    </div>
  );
};

export default LeaveBalances;
