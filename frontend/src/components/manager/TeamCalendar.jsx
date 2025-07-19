import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getTeamCalendar } from "../../api/leaves";
import {
  fetchCalendarSuccess,
  operationFailure,
} from "../../store/slices/leaveSlice";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const TeamCalendar = () => {
  let { calendarData } = useSelector((state) => state.leaves);
  if (!Array.isArray(calendarData)) calendarData = [];
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [year, setYear] = useState(date.getFullYear());

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const calendar = await getTeamCalendar({ month, year });
        dispatch(fetchCalendarSuccess(calendar));
      } catch (error) {
        dispatch(operationFailure(error));
        toast.error(error);
      }
    };
    fetchCalendar();
  }, [dispatch, month, year]);

  const onChange = (newDate) => {
    setDate(newDate);
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();
    if (newMonth !== month || newYear !== year) {
      setMonth(newMonth);
      setYear(newYear);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayLeaves = calendarData.filter((leave) => {
        const leaveDate = new Date(date).toDateString();
        const fromDate = new Date(leave.start).toDateString();
        const toDate = new Date(leave.end).toDateString();
        return leaveDate >= fromDate && leaveDate <= toDate;
      });

      if (dayLeaves.length > 0) {
        return (
          <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-center space-x-0.5">
            {dayLeaves.map((leave, index) => (
              <div
                key={index}
                className={`h-1 w-1 rounded-full ${
                  leave.type === "casual"
                    ? "bg-blue-500"
                    : leave.type === "sick"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Team Leave Calendar
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <Calendar
            onChange={onChange}
            value={date}
            tileContent={tileContent}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <div className="md:w-1/2">
          <h3 className="text-lg font-semibold mb-4">
            Leaves for{" "}
            {date.toLocaleDateString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          {calendarData.length === 0 ? (
            <p className="text-gray-500">No leaves scheduled this month</p>
          ) : (
            <div className="space-y-3">
              {calendarData.map((leave) => (
                <div key={leave.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{leave.userName}</p>
                      <p className="text-sm text-gray-600">
                        {leave.type} Leave ({leave.days} day
                        {leave.days > 1 ? "s" : ""})
                      </p>
                    </div>
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
                  </div>
                  <p className="mt-2 text-sm">
                    {new Date(leave.start).toLocaleDateString()} -{" "}
                    {new Date(leave.end).toLocaleDateString()}
                  </p>
                  {leave.managerComment && (
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Manager Note:</span>{" "}
                      {leave.managerComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
