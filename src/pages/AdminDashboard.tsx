// src/pages/AdminDashboard.tsx

import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Application {
  row: string;
  facility: string;
  preferredDate: string;
  preferredTime: string;
  scheduleDate?: string;
  scheduleTime?: string;
  status?: string;
  assessor?: string;
  answers?: Record<string, { answer: string; remark: string }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Application[]>([]);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [details, setDetails] = useState<any[]>([]);

  const [stats, setStats] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);

  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [filterType, setFilterType] = useState("monthly");

  const [editingRow, setEditingRow] = useState<string | null>(null);

  interface Assessor {
    name: string;
    email: string;
  }

  const [assessors, setAssessors] = useState<Assessor[]>([]);

  const [schedule, setSchedule] = useState({
    date: "",
    time: "",
    assessor: "",
  });

  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  const statusColor: Record<string, string> = {
    Pending: "bg-gray-100 text-gray-700",
    Scheduled: "bg-green-100 text-green-700",
    Ongoing: "bg-blue-100 text-blue-700",
    "For Compliance": "bg-yellow-100 text-yellow-700",
    Failed: "bg-red-100 text-red-700",
    "Re-assigned": "bg-purple-100 text-purple-700",
    Rescheduled: "bg-orange-100 text-orange-700",
    Passed: "bg-green-100 text-green-700",
  };

  const fetchData = () => {
    apiCall("getApplicationsForAdmin").then((res: any) => {
      console.log("APPLICATIONS RAW:", res);

      if (Array.isArray(res)) {
        setData(res);
      } else if (Array.isArray(res?.data)) {
        setData(res.data);
      } else {
        console.error("Invalid data format", res);
        setData([]);
      }
    });
  };

  useEffect(() => {
    fetchData();

    apiCall("getAssessors").then((res: any) => {
      setAssessors(res);
    });

    apiCall("getAvailableDates").then((res: any) => {
      setUnavailableDates(res.unavailable || []);
    });

    apiCall("getAdminAnalytics").then(setStats);

    apiCall("getAdminMessages").then((res: any) => {
      setMessages(res);
    });
  }, []);

  useEffect(() => {
    if (!selectedFacility) return;

    apiCall("getChecklistByFacility", {
      facility: selectedFacility,
    }).then((res: any) => {
      console.log("DETAILS RAW:", res);

      if (Array.isArray(res)) {
        setDetails(res);
      } else if (Array.isArray(res?.data)) {
        setDetails(res.data);
      } else {
        setDetails([]);
      }
    });
  }, [selectedFacility]);

  const handleSchedule = async (row: string) => {
    try {
      await apiCall("scheduleFacility", {
        row,
        date: schedule.date,
        time: schedule.time,
        assessor: schedule.assessor,
      });

      alert("Scheduled successfully!");
      setSelectedRow(null);
      setEditingRow(null);
      // Fetch updated data from backend to ensure persistence
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // 🔥 FILTER LOGIC
  const filterByDate = (dateStr?: string) => {
  if (!filterDate || !dateStr) return true;

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return true; // 🔥 prevent crash

  const base = filterDate;

  if (filterType === "monthly") {
    return (
      parsed.getMonth() === base.getMonth() &&
      parsed.getFullYear() === base.getFullYear()
    );
  }

  if (filterType === "quarterly") {
    const q1 = Math.floor(parsed.getMonth() / 3);
    const q2 = Math.floor(base.getMonth() / 3);
    return parsed.getFullYear() === base.getFullYear() && q1 === q2;
  }

  if (filterType === "yearly") {
    return parsed.getFullYear() === base.getFullYear();
  }

  return true;
};

  const filteredData = data.filter((d) =>
    filterByDate(d.scheduleDate)
  );

  const filteredStats = stats;

  // Helper function to get assessor name from email
  const getAssessorName = (email: string) => {
    if (!email) return "-";
    const assessor = assessors.find(a => a.email === email);
    return assessor ? assessor.name : email;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-2xl font-bold text-teal-600 mb-4">
        Admin Dashboard
      </h2>

      {/* 🔥 DATE FILTER */}
      <div className="mb-4 flex gap-3 items-center">
        <DatePicker
          selected={filterDate}
          onChange={(d: Date | null) => setFilterDate(d)}
          placeholderText="Filter by date (optional)"
          className="border p-2 rounded"
        />

        <select
          className="border p-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* 🔥 ANALYTICS */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-xl font-bold">{filteredStats.total || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          😊
          <p className="font-bold">{filteredStats.passed || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center">
          😐
          <p className="font-bold">{filteredStats.compliance || 0}</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center">
          ☹️
          <p className="font-bold">{filteredStats.failed || 0}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded text-center">
          ⏳
          <p className="font-bold">{filteredStats.ongoing || 0}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <table className="w-full">
          <thead className="bg-teal-500 text-white">
            <tr>
              <th className="p-3">Facility</th>
              <th className="p-3">Preferred</th>
              <th className="p-3">Scheduled</th>
              <th className="p-3">Assessor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((d) => (
              <>
                <tr key={d.row} className="border-b">

                  {/* ✅ CLICKABLE FACILITY */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedFacility(d.facility)}
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      {d.facility}
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    {d.preferredDate}<br />{d.preferredTime}
                  </td>

                  <td className="p-3 text-center">
                    {d.scheduleDate || "-"}<br />{d.scheduleTime || "-"}
                  </td>

                  <td className="p-3 text-center">
                    {getAssessorName(d.assessor) || "-"}
                  </td>

                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded ${statusColor[d.status || "Pending"]}`}>
                      {d.status || "Pending"}
                    </span>
                  </td>

                  {/* ✅ ACTION BUTTONS */}
                  <td className="p-3 text-center space-x-2">
                    {d.status === "Passed" ? (
                      <button
                        onClick={() => {
                          // Handle certificate release logic here
                          alert("Certificate Release functionality not implemented yet");
                        }}
                        className="px-3 py-1 rounded bg-green-500 text-white"
                      >
                        For Certificate Release
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRow(d.row);
                            setEditingRow(d.row);

                            setSchedule({
                            date: "",
                            time: "",
                            assessor: "",
                          });
                          }}
                          className={`px-3 py-1 rounded text-white ${
                            d.status === "Scheduled" || d.status === "Rescheduled" || d.status === "Re-assigned" || d.status === "Re-Assigned" || d.status === "Pending"
                              ? "bg-orange-500"
                              : "bg-teal-500"
                          }`}
                        >
                          {d.status === "Scheduled" || d.status === "Rescheduled" || d.status === "Re-assigned" || d.status === "Re-Assigned" || d.status === "Pending"
                            ? "Reschedule"
                            : "Schedule"}
                        </button>

                        {(d.status === "Scheduled" || d.status === "Rescheduled" || d.status === "Re-assigned" || d.status === "Re-Assigned" || d.status === "Pending") && (
                          <button
                            onClick={() => {
                              setSelectedRow(d.row);
                              setEditingRow(d.row);

                              setSchedule({
                              date: "",
                              time: "",
                              assessor: "",
                            });
                            }}
                            className="px-3 py-1 rounded bg-blue-500 text-white"
                          >
                            Re-assign
                          </button>
                        )}
                      </>
                    )}
                  </td>

                </tr>

                {/* EXPAND */}
                {selectedRow === d.row && (
                  <tr>
                    <td colSpan={6} className="p-4 bg-gray-50">

                      <div className="grid md:grid-cols-4 gap-3">

                        <DatePicker
                          disabled={editingRow !== d.row}
                          selected={schedule.date ? new Date(schedule.date) : null}
                          onChange={(date: Date | null) => {
                            if (!date) return;
                            setSchedule({
                              ...schedule,
                              date: date.toISOString().split("T")[0],
                            });
                          }}
                          filterDate={(date) => date.getDay() >= 1 && date.getDay() <= 4} // Mon-Thu only
                          excludeDates={unavailableDates.map(dateStr => new Date(dateStr))}
                          className="border p-2 rounded"
                        />

                        <input
                          type="time"
                          disabled={editingRow !== d.row}
                          className="border p-2 rounded"
                          onChange={(e) =>
                            setSchedule({ ...schedule, time: e.target.value })
                          }
                        />

                        <select
                          disabled={editingRow !== d.row}
                          className="border p-2 rounded"
                          onChange={(e) =>
                            setSchedule({ ...schedule, assessor: e.target.value })
                          }
                        >
                          <option>Select Assessor</option>
                          {assessors.map((a) => (
                            <option key={a.email} value={a.email}>
                              {a.name}
                            </option>
                          ))}
                        </select>

                        <button
                          disabled={editingRow !== d.row}
                          onClick={() => handleSchedule(d.row)}
                          className={`text-white rounded ${
                            editingRow === d.row
                              ? "bg-green-500"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          Confirm
                        </button>

                      </div>

                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      
      {/* 🔥 CHAT */}
      <div className="mt-8 bg-white p-4 rounded-xl shadow-md">

        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowChat(!showChat)}
        >
          <h3 className="font-bold text-teal-600">
            💬 Conversations
          </h3>
          <span>{showChat ? "▲" : "▼"}</span>
        </div>

        {showChat && (
          <div className="max-h-64 overflow-y-auto mt-4 space-y-3">

            {messages.length === 0 && (
              <p className="text-gray-400 text-sm">No messages</p>
            )}

            {messages.map((m, i) => (
              <div key={i} className="border p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">
                  {m.from} → {m.to}
                </p>
                <p className="text-sm">{m.message}</p>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}