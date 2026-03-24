// src/pages/AssessorDashboard.tsx

import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import { useAuth } from "../auth/useAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Assessment {
  row: string;
  facility: string;
  type: string;
  types: string[]; // Array of types from Sheet1 Column O (can be multiple)
  scheduleDate: string;
  scheduleTime: string;
  status: string;
  assessor?: string;
}

interface ChecklistAnswer {
  question: string;
  answer: string;
  remark: string;
}

export default function AssessorDashboard() {
  const { user } = useAuth();

  // State for analytics
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
  });

  // State for assessments
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  // State for checklist form
  const [selectedType, setSelectedType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [existingStatus, setExistingStatus] = useState<string | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, { answer: string; remark: string }>>({});

  // State for chat
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatFacility, setChatFacility] = useState<string>("");
  const [messages, setMessages] = useState<{from: string; to: string; message: string}[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // State for calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");

  // State for tracked assessed types per facility (to prevent duplicate assessments)
  const [assessedTypes, setAssessedTypes] = useState<Record<string, string[]>>({});

  // Format date to "Month Day, Year" (e.g., "January 1, 2023")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date not set";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Generate colors for facility TYPES (not individual facilities)
  const facilityTypeColors: Record<string, string> = {};
  const facilityTypeHexColors: Record<string, string> = {};
  const getFacilityTypeColor = (type: string) => {
    const key = type || "Other";
    if (!facilityTypeColors[key]) {
      const colors = [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
        "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-red-500"
      ];
      const hexColors = [
        "#3b82f6", "#22c55e", "#a855f7", "#f97316",
        "#ec4899", "#6366f1", "#14b8a6", "#ef4444"
      ];
      const index = Object.keys(facilityTypeColors).length % colors.length;
      facilityTypeColors[key] = colors[index];
      facilityTypeHexColors[key] = hexColors[index];
    }
    return facilityTypeColors[key];
  };
  
  // Get hex color for calendar highlighting
  const getTypeColorHex = (type: string): string => {
    const key = type || "Other";
    if (!facilityTypeHexColors[key]) {
      getFacilityTypeColor(type);
    }
    return facilityTypeHexColors[key] || "#14b8a6";
  };

  // Checklists
  const checklists: Record<string, string[]> = {
    Hospital: [
      "Has breastfeeding policy",
      "Staff trained on lactation",
      "Rooming-in practiced",
    ],
    Workplace: [
      "Has lactation station",
      "Break time for breastfeeding",
      "Storage for milk",
    ],
    "Lying-In Clinic": [
      "Skilled birth attendance",
      "Breastfeeding support",
      "Postnatal care",
    ],
  };

  // Fetch assessments and stats
  useEffect(() => {
    if (!user?.email) return;

    // Use getApplicationsForAdmin to get all data including scheduled dates/times
    apiCall("getApplicationsForAdmin", {})
      .then((res: any) => {
        const allData = Array.isArray(res) ? res : (res?.data || []);
        
        // Debug: log the data structure
        console.log("User email:", user.email);
        console.log("API Response Sample:", allData[0]);
        console.log("All keys in first record:", allData[0] ? Object.keys(allData[0]) : "No data");
        
        // Log a few records to see the type data
        console.log("First 3 records type values:", allData.slice(0, 3).map((f: any) => ({ facility: f.facility, ...f })));
        
        // Log all unique assessor values to debug
        const uniqueAssessors = [...new Set(allData.map((f: any) => f.assessor).filter(Boolean))];
        console.log("Unique assessors in data:", uniqueAssessors);
        
        // Filter to only show applications assigned to this assessor (case-insensitive)
        // Try multiple possible column names for assessor
        const assessorData = allData.filter((f: any) => {
          const assessorField = f.assessor || f.Assessor || f.assessorEmail || f.assessor_email || f.AssignedAssessor || "";
          return assessorField && assessorField.toLowerCase().includes(user.email.toLowerCase());
        });
        
        // Only use data that matches the specific assessor
        // For debugging: show all data if filter returns empty
        const finalData = assessorData.length > 0 ? assessorData : allData;
        
        console.log("Filtered data count:", finalData.length);
        
        // Convert to assessments format with schedule info
        // Split types by comma if multiple (from Sheet1 Column O)
        const mappedAssessments: Assessment[] = finalData.map((f: any, index: number) => {
          // Debug: log ALL keys and the type field value
          console.log("Facility:", f.facility, "All keys:", Object.keys(f));
          console.log("f.type:", f.type, "f.Type:", f.Type);
          
          // Try multiple possible column names for type (case insensitive)
          const typeStr = f.type || f.Type || f.t || f.typee || "Hospital";
          const typesArray = typeStr.split(",").map((t: string) => t.trim()).filter((t: string) => t);
          
          console.log("Types array:", typesArray);
          
          return {
            row: f.row || `row-${index}`,
            facility: f.facility,
            type: typeStr, // Keep original for display
            types: typesArray, // Array of all types
            // Use scheduleDate/scheduleTime (set by admin) OR preferredDate/preferredTime
            // Also try "Admin Schedule Date" and "Admin Schedule Time" as mentioned by user
            scheduleDate: f.scheduleDate || f.adminScheduleDate || f.AdminScheduleDate || f.preferredDate || "",
            scheduleTime: f.scheduleTime || f.adminScheduleTime || f.AdminScheduleTime || f.preferredTime || "",
            status: f.status || "Pending",
            assessor: f.assessor,
          };
        });
        
        setAssessments(mappedAssessments);
        
        // Calculate stats
        const pending = mappedAssessments.filter((a: Assessment) => 
          a.status === "Pending" || a.status === "Scheduled" || a.status === "For Compliance"
        ).length;
        const completed = mappedAssessments.filter((a: Assessment) => 
          a.status === "Passed" || a.status === "Failed"
        ).length;
        
        setStats({
          pending,
          completed,
          total: mappedAssessments.length,
        });
      })
      .catch((err) => {
        console.error("Error fetching facilities:", err);
        setAssessments([]);
        setStats({ pending: 0, completed: 0, total: 0 });
      });

    // Fetch assessed types from Sheet5 to track which types have been assessed
    // Using getChecklistByFacility which has the checklist data
    apiCall("getChecklistByFacility", {})
      .then((res: any) => {
        const checklistData = Array.isArray(res) ? res : (res?.data || []);
        
        // Debug: log the checklist data structure
        console.log("Checklist data sample:", checklistData[0]);
        console.log("Checklist keys:", checklistData[0] ? Object.keys(checklistData[0]) : "No data");
        
        // Build a map of facility -> array of types already assessed from Sheet5
        const assessedMap: Record<string, string[]> = {};
        
        // Check if there's existing checklist status in the data
        checklistData.forEach((item: any) => {
          const facility = item.facility;
          const type = item.type;
          const checklistStatus = item.checklistStatus || item.status;
          
          // If there's a checklist status that's not "For Compliance", consider it assessed
          if (facility && type && checklistStatus && 
              (checklistStatus === "Passed" || checklistStatus === "Failed")) {
            if (!assessedMap[facility]) {
              assessedMap[facility] = [];
            }
            if (!assessedMap[facility].includes(type)) {
              assessedMap[facility].push(type);
            }
          }
        });
        
        console.log("Assessed types per facility:", assessedMap);
        setAssessedTypes(assessedMap);
      })
      .catch((err) => {
        console.error("Error fetching assessed types:", err);
        // Set empty on error - will allow all assessments
        setAssessedTypes({});
      });

    // Fetch chat messages
    apiCall("getAssessorMessages", { email: user?.email }).then((res: any) => {
      setMessages(res || []);
      
      // Calculate unread counts from messages
      if (res && Array.isArray(res)) {
        const counts: Record<string, number> = {};
        res.forEach((m: any) => {
          // Messages sent TO the assessor (not from them) are unread
          if (m.to === user?.email && m.from !== user?.email) {
            // Try to find facility from sender email
            // For now, we'll just show a total count
          }
        });
        setUnreadCounts(counts);
      }
    });
  }, [user]);

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem("assessorDraft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setAnswers(parsed.answers || {});
      setSelectedType(parsed.selectedType || "");
      setStatus(parsed.status || "");
    }
    //* eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto save draft
  useEffect(() => {
    localStorage.setItem(
      "assessorDraft",
      JSON.stringify({ answers, selectedType, status })
    );
  }, [answers, selectedType, status]);

  // Filter assessments by tab
  // Group assessments by facility to check if ALL types are completed
  const facilityGroups = assessments.reduce((acc, a) => {
    if (!acc[a.facility]) {
      acc[a.facility] = { allTypes: [] as string[], assessedTypes: [] as string[] };
    }
    // Get all types from Sheet1 (e.g., ["Hospital", "Workplace"])
    acc[a.facility].allTypes = a.types || [];
    // Track which types have been assessed (Passed or Failed)
    if (a.status === "Passed" || a.status === "Failed") {
      // Add each type from the combined string
      const types = (a.type || "").split(",").map((t: string) => t.trim()).filter(Boolean);
      types.forEach((t: string) => {
        if (!acc[a.facility].assessedTypes.includes(t)) {
          acc[a.facility].assessedTypes.push(t);
        }
      });
    }
    return acc;
  }, {} as Record<string, { allTypes: string[], assessedTypes: string[] }>);

  // A facility is "completed" only if ALL its types have been assessed
  const completedFacilityNames = new Set(
    Object.entries(facilityGroups).filter(([_, data]) => {
      // Check if every type in the facility has been assessed
      return data.allTypes.length > 0 && 
             data.allTypes.every((t: string) => data.assessedTypes.includes(t));
    }).map(([facility]) => facility)
  );

  const upcomingAssessments = assessments.filter((a) => 
    !completedFacilityNames.has(a.facility) && 
    (a.status === "Scheduled" || a.status === "Rescheduled" || a.status === "Re-assigned")
  );
  
  // Only show facilities where ALL types are completed in completed tab
  const completedAssessments = assessments.filter((a) => 
    completedFacilityNames.has(a.facility)
  );

  // Get calendar dates for display
  const calendarDates = assessments
    .filter((a) => a.scheduleDate && a.scheduleDate.trim() !== "")
    .map((a) => ({
      date: a.scheduleDate,
      facility: a.facility,
      time: a.scheduleTime,
      status: a.status,
      type: a.type,
    }));
  
  // Debug log
  console.log("Assessments:", assessments.length, "CalendarDates:", calendarDates.length);

  // Handle assess button
  const handleAssess = (assessment: Assessment) => {
    handleAssessWithType(assessment, assessment.type);
  };
  
  // Handle assess with specific type
  const handleAssessWithType = (assessment: Assessment, type: string) => {
    setSelectedAssessment(assessment);
    setSelectedType(type);
    setStatus("");
    setExistingStatus(assessment.status === "For Compliance" ? "For Compliance" : undefined);
    
    // Load existing answers if any
    apiCall("getChecklistStatus", {
      facility: assessment.facility,
      assessor: user?.email,
      type: type,
    }).then((res: any) => {
      if (res.answers) {
        const formattedAnswers: Record<string, { answer: string; remark: string }> = {};
        res.answers.forEach((a: ChecklistAnswer) => {
          formattedAnswers[a.question] = { answer: a.answer, remark: a.remark };
        });
        setAnswers(formattedAnswers);
      }
    });
  };

  // Submit checklist
  const submitChecklist = async () => {
    if (!selectedAssessment || !selectedType) {
      alert("Please select facility and type");
      return;
    }

    if (!status) {
      alert("Please select status");
      return;
    }

    if (existingStatus && existingStatus !== "For Compliance") {
      alert("Already submitted. Cannot submit again.");
      return;
    }

    const formatted = Object.keys(answers).map((q) => ({
      question: q,
      answer: answers[q]?.answer || "",
      remark: answers[q]?.remark || "",
    }));

    const res = await apiCall("saveChecklist", {
      facility: selectedAssessment.facility,
      assessor: user?.email,
      type: selectedType,
      status,
      answers: formatted,
    });

    if (res.success === false) {
      alert(res.message);
      return;
    }

    alert("Checklist saved!");
    setAnswers({});
    setStatus("");
    setSelectedAssessment(null);
    localStorage.removeItem("assessorDraft");
    
    // Refresh data
    window.location.reload();
  };

  // Send chat message
  const sendChat = async () => {
    if (!chatMessage.trim() || !chatFacility) return;
    
    // Find user's email from facility
    const facilityData = assessments.find((a: any) => a.facility === chatFacility);
    const userEmail = facilityData?.userEmail || facilityData?.email || chatFacility;
    
    // Save message to Sheet3
    await apiCall("saveChatMessage", {
      from: user?.email, // Assessor's email
      to: userEmail, // User's email (recipient)
      message: chatMessage,
    });
    
    setChatMessage("");
    
    // Refresh messages
    const res = await apiCall("getAssessorMessages", { email: user?.email, facility: chatFacility });
    setMessages(res || []);
  };

  // Handle chat button - open chat for specific facility
  const handleChatClick = (facility: string) => {
    setChatFacility(facility);
    setShowChat(true);
    setMessages([]);
    
    // Load existing messages for this facility
    const facilityData = assessments.find((a: any) => a.facility === facility);
    const userEmail = facilityData?.userEmail || facilityData?.email || facility;
    
    apiCall("getAssessorMessages", { email: user?.email, facility: facility }).then((res: any) => {
      setMessages(res || []);
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-teal-600 mb-4">
        Assessor Dashboard
      </h2>

      {/* =============================
          ANALYTICS CARDS
      ============================= */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded-xl text-center shadow-md">
          <p className="text-gray-600 text-sm font-medium">Pending Assessment</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl text-center shadow-md">
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl text-center shadow-md">
          <p className="text-gray-600 text-sm font-medium">Total Assessment</p>
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
        </div>
      </div>

      {/* =============================
          ASSESSMENT CALENDAR
      ============================= */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-teal-600 flex items-center gap-2">
            📅 Assessment Calendar
          </h3>
          <span className="text-sm text-gray-500">
            {calendarDates.length} scheduled
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-2">
              <DatePicker
                selected={selectedCalendarDate}
                onChange={(date: Date | null) => setSelectedCalendarDate(date)}
                inline
                calendarClassName="w-full border-0 shadow-none"
                className="w-full text-sm"
                highlightDates={calendarDates
                  .filter(d => d.date)
                  .map(d => {
                    const date = new Date(d.date);
                    if (isNaN(date.getTime())) return null;
                    return {
                      date,
                      style: {
                        backgroundColor: getTypeColorHex(d.type),
                        borderRadius: '50%',
                        color: 'white'
                      }
                    };
                  })
                  .filter(d => d !== null) as any}
                dayClassName={(date) => {
                  const assessmentForDay = calendarDates.find(d => {
                    if (!d.date) return false;
                    const dDate = new Date(d.date);
                    return dDate.toDateString() === date.toDateString();
                  });
                  if (assessmentForDay) {
                    const typeColor = getFacilityTypeColor(assessmentForDay.type);
                    return `${typeColor} text-white rounded-full`;
                  }
                  return "";
                }}
              />
            </div>
            
            {/* Mini Legend - by Facility Type */}
            <div className="mt-4 p-3 bg-linear-to-r from-teal-50 to-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">🏥 Facility Types Legend</h4>
              <div className="flex flex-wrap gap-2">
                {[...new Set(calendarDates.map(d => d.type))].slice(0, 6).map((type, index) => (
                  <div key={index} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full shadow-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${getFacilityTypeColor(type)}`}></div>
                    <span className="text-xs font-medium text-gray-700">{type || "Other"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Scheduled Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">📋 Upcoming Schedule</h4>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                {calendarDates.filter(d => d.status === "Scheduled" || d.status === "Pending").length} pending
              </span>
            </div>
            
            {calendarDates.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {calendarDates
                  .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
                  .map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                      item.status === "Scheduled" ? "border-green-500 bg-green-50" : 
                      item.status === "Passed" ? "border-blue-500 bg-blue-50" :
                      item.status === "Failed" ? "border-red-500 bg-red-50" :
                      "border-yellow-500 bg-yellow-50"
                    }`}
                  >
                    {/* Date Box */}
                    <div className="text-center min-w-15 bg-white rounded-lg p-2 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase">
                        {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short' }) : '-'}
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {item.date ? new Date(item.date).getDate() : '-'}
                      </p>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${getFacilityTypeColor(item.type)}`}></div>
                        <p className="font-semibold text-gray-800">{item.facility}</p>
                      </div>
                      <p className="text-sm text-gray-600 ml-4">
                        🕒 {item.time || "Time not set"} • {item.type || "Assessment"}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Scheduled" ? "bg-green-100 text-green-700" : 
                      item.status === "Passed" ? "bg-blue-100 text-blue-700" :
                      item.status === "Failed" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="text-4xl">📭</span>
                <p className="text-gray-500 mt-2">No scheduled assessments</p>
                <p className="text-sm text-gray-400">Admin will assign facilities soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =============================
          TABS
      ============================= */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "upcoming"
              ? "bg-teal-500 text-white"
              : "bg-white text-gray-600"
          }`}
        >
          Upcoming Assessment ({upcomingAssessments.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "completed"
              ? "bg-teal-500 text-white"
              : "bg-white text-gray-600"
          }`}
        >
          Completed Assessment ({completedAssessments.length})
        </button>
      </div>

      {/* =============================
          UPCOMING ASSESSMENTS
      ============================= */}
      {activeTab === "upcoming" && (
        <div className="space-y-3">
          {upcomingAssessments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              No upcoming assessments
            </div>
          ) : (
            upcomingAssessments.map((assessment) => (
              <div
                key={assessment.row}
                className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-lg">{assessment.facility}</h4>
                  <p className="text-sm text-gray-600">
                    {assessment.type} • {formatDate(assessment.scheduleDate)} • {assessment.scheduleTime || "Time not set"}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                    assessment.status === "Scheduled" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {assessment.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Show dropdown with all types from Sheet1 Column O - disable already assessed ones */}
                  <select
                    title="Select Assessment Type"
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      if (selectedType) {
                        handleAssessWithType(assessment, selectedType);
                      }
                    }}
                    className="border rounded px-2 py-2 text-sm bg-white"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Type</option>
                    {assessment.types?.map((t, idx) => {
                      const isAssessed = assessedTypes[assessment.facility]?.includes(t);
                      return (
                        <option key={idx} value={t} disabled={isAssessed}>
                          {t} {isAssessed ? "(Assessed)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleChatClick(assessment.facility)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg relative"
                  >
                    💬 Chat
                    {unreadCounts[assessment.facility] > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCounts[assessment.facility]}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =============================
          COMPLETED ASSESSMENTS
      ============================= */}
      {activeTab === "completed" && (
        <div className="space-y-3">
          {completedAssessments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              No completed assessments
            </div>
          ) : (
            completedAssessments.map((assessment) => (
              <div
                key={assessment.row}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{assessment.facility}</h4>
                    <p className="text-sm text-gray-600">{assessment.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    assessment.status === "Passed" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {assessment.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Scheduled:</strong> {formatDate(assessment.scheduleDate)} at {assessment.scheduleTime || "-"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =============================
          ASSESSMENT FORM MODAL
      ============================= */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-600">
                {selectedType} Checklist - {selectedAssessment.facility}
              </h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {existingStatus && existingStatus !== "For Compliance" && (
              <div className="text-red-500 mb-3 font-medium">
                Already submitted ({existingStatus})
              </div>
            )}

            {existingStatus === "For Compliance" && (
              <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded mb-3">
                For Compliance - Please reassess
              </div>
            )}

            {/* Checklist Questions */}
            {checklists[selectedType]?.map((q, i) => (
              <div key={i} className="mb-4 border-b pb-3">
                <p className="text-sm font-medium">{q}</p>
                <div className="flex gap-4 mb-2 mt-2">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={q}
                        value={opt}
                        checked={answers[q]?.answer === opt}
                        disabled={!!existingStatus && existingStatus !== "For Compliance"}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [q]: { answer: opt, remark: answers[q]?.remark || "" },
                          })
                        }
                        className="w-4 h-4 text-teal-600"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add remark..."
                  className="w-full border p-2 rounded mt-1"
                  value={answers[q]?.remark || ""}
                  disabled={!!existingStatus && existingStatus !== "For Compliance"}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q]: { answer: answers[q]?.answer || "", remark: e.target.value },
                    })
                  }
                />
              </div>
            ))}

            {/* Status Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                disabled={!!existingStatus && existingStatus !== "For Compliance"}
                onClick={() => setStatus("Passed")}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  status === "Passed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span>😊</span> Passed
              </button>
              <button
                disabled={!!existingStatus && existingStatus !== "For Compliance"}
                onClick={() => setStatus("For Compliance")}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  status === "For Compliance"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span>😐</span> For Compliance
              </button>
              <button
                disabled={!!existingStatus && existingStatus !== "For Compliance"}
                onClick={() => setStatus("Failed")}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  status === "Failed"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span>☹️</span> Failed
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitChecklist}
              disabled={!!existingStatus && existingStatus !== "For Compliance"}
              className="bg-green-500 text-white px-4 py-2 rounded w-full mt-4 font-medium disabled:bg-gray-300"
            >
              Submit Checklist
            </button>
          </div>
        </div>
      )}

      {/* =============================
          CHAT MODAL - MODERN UI
      ============================= */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#2EB8C4] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663453286137/fm4CbqEeDTmvKMP2tfgiZu/mbfhi-logo-2xgCJNTNscbXsHCSx9jSUx.webp" 
                    alt="MBFHI" 
                    className="h-8 w-8 rounded-full object-cover border-2 border-white/30"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#2EB8C4] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold">Chat with {chatFacility}</h3>
                  <span className="text-xs text-teal-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-700 mb-1">No messages yet</h4>
                  <p className="text-sm text-gray-500">Start a conversation with this facility</p>
                </div>
              ) : (
                messages.map((m: any, i: number) => {
                  const isMe = m.from === user?.email || m.from === user?.email?.toLowerCase();
                  const showTime = i === 0 || (messages[i-1] && new Date(m.time).getTime() - new Date(messages[i-1].time).getTime() > 300000);
                  
                  return (
                    <div key={i}>
                      {showTime && (
                        <div className="flex justify-center my-3">
                          <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                            {m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-[#2EB8C4] flex items-center justify-center text-white text-xs font-semibold mr-2 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe 
                            ? "bg-gradient-to-r from-[#2EB8C4] to-teal-500 text-white rounded-br-md" 
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                        }`}>
                          <p className="wrap-break-words">{m.message}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-teal-100" : "text-gray-400"}`}>
                            {m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-[#2EB8C4] focus:ring-2 focus:ring-teal-100 transition-all"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatMessage.trim()}
                  className="bg-[#2EB8C4] text-white p-2.5 rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
