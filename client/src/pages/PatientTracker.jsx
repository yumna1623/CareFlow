import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function PatientTracker() {
  const [trackId, setTrackId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!trackId) {
      alert("Please enter a Tracking ID.");
      return;
    }
    setLoading(true);
    setStatus(null); // Clear previous status
    try {
      const res = await axios.get(`${API}/track/${trackId}`);
      setStatus(res.data);
    } catch (err) {
      alert("ID not found or an error occurred.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateWaitTime = () => {
    if (!status || !status.slot_time) return null;

    const now = new Date();
    const [time, period] = status.slot_time.split(" ");
    let [hours, mins] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const appointmentTime = new Date(status.appointment_date); // use actual appointment date
    appointmentTime.setHours(hours, mins, 0, 0);

    const diffMs = appointmentTime - now;

    // Use a small buffer (e.g., 5 minutes) before being overdue
    if (diffMs <= -300000) {
      return { hours: 0, mins: 0, isOverdue: true };
    }
    // If diffMs is negative but within the buffer, consider it current/imminent
    if (diffMs < 0) {
      return { hours: 0, mins: 0, isCurrent: true };
    }

    const totalMins = Math.floor(diffMs / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;

    return { hours: h, mins: m, isOverdue: false, isCurrent: false };
  };

  const waitTime = calculateWaitTime();

  // Helper function for the animated gradient button (Light Theme)
  const GradientButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 shadow-lg shadow-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed text-base"
    >
      {children}
    </button>
  );

  // Helper function for the Main Grid items (Light Theme)
  const MetricItem = ({ title, value, unit, colorClass, highlightText }) => (
    <div className="border-r border-gray-100 p-4 last:border-r-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className={`text-3xl font-extrabold ${colorClass}`}>
        {value}
        {unit && <span className="text-lg font-semibold ml-1">{unit}</span>}
      </p>
      {highlightText && (
        <p className="text-sm text-gray-600 mt-1">{highlightText}</p>
      )}
    </div>
  );

  // Custom Wait Time rendering based on logic
  const renderWaitTime = () => {
    if (!waitTime) return { color: "text-gray-500", text: "N/A" };

    if (waitTime.isOverdue) {
      return { color: "text-red-600", text: "Time Passed" };
    } else if (waitTime.isCurrent) {
      return { color: "text-green-600", text: "Your Turn!" };
    } else {
      return {
        color: "text-green-600",
        text: `${waitTime.hours}h ${waitTime.mins}m`,
      };
    }
  };
  const waitTimeStatus = renderWaitTime();

  return (
    // Light background for the entire page
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navigation Bar (Light Theme) */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
              <span className="text-xl font-bold">🩺</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              CareFlow Tracker
            </h1>
          </div>
          <p className="text-sm text-gray-600 hidden sm:block">
            Real-time Appointment Tracking
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-28 pb-12 max-w-7xl mx-auto w-full px-6">
        {/* Search State (Light Theme) */}
        {!status && (
          <div className="min-h-[60vh] flex flex-col justify-center items-center">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Live Appointment Tracker
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Enter your **unique tracking ID** to view your real-time
                position in the queue and estimated wait time.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-gray-100">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Tracking ID
              </label>
              <div className="flex gap-4">
                <input
                  // Light theme input styling
                  className="flex-1 border border-gray-300 bg-white text-gray-900 px-5 py-3 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition hover:border-gray-400"
                  placeholder="Enter your ID (e.g., APT123456)"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && checkStatus()}
                />
                <GradientButton
                  onClick={checkStatus}
                  disabled={loading || !trackId}
                >
                  {loading ? "Tracking..." : "Track Now"}
                </GradientButton>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                💡 ID can be found in your confirmation email or SMS.
              </p>
            </div>
          </div>
        )}

        {/* Status Display (Light Theme) */}
        {status && (
          <>
            {/* Back Button */}
            <button
              onClick={() => {
                setStatus(null);
                setTrackId("");
              }}
              className="mb-6 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 transition"
            >
              &larr; Search Another ID
            </button>

            {/* Terminal States: Completed/Cancelled */}
            {status.status === "completed" || status.status === "cancelled" ? (
              <div
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden border ${
                  status.status === "completed"
                    ? "border-green-200"
                    : "border-red-200"
                }`}
              >
                <div
                  className={`p-10 text-center text-white ${
                    status.status === "completed"
                      ? "bg-gradient-to-r from-green-600 to-emerald-700"
                      : "bg-gradient-to-r from-red-600 to-pink-700"
                  }`}
                >
                  <div className="text-6xl mb-4">
                    {status.status === "completed" ? "✅" : "❌"}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">
                    Appointment{" "}
                    {status.status.charAt(0).toUpperCase() +
                      status.status.slice(1)}
                  </h3>
                  <p className="text-base text-white/90">
                    {status.status === "completed"
                      ? "Thank you for visiting us. Your records are updated."
                      : "Please contact the office immediately to reschedule."}
                  </p>
                </div>
              </div>
            ) : (
              /* Active Status Dashboard */
              <>
                {/* Main Metrics Row */}
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
                    <h2 className="text-xl font-bold">
                      Appointment Status for **{status.patient_name}**
                    </h2>
                    <p className="text-blue-100 mt-1 text-sm">
                      Tracking ID: {trackId}
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-5 divide-x divide-gray-100 p-4 items-center">
                    {/* Patient Name */}
                    <MetricItem
                      title="Patient Name"
                      value={status.patient_name}
                      colorClass="text-gray-900"
                    />

                    {/* Scheduled Time */}
                    <MetricItem
                      title="Scheduled Time"
                      value={status.slot_time}
                      colorClass="text-indigo-600"
                    />

                    {/* Queue Position */}
                    <MetricItem
                      title="Queue Position"
                      value={`#${status.queue_number || 1}`}
                      colorClass="text-blue-600"
                      highlightText={`${
                        status.patients_ahead || 0
                      } patient(s) ahead`}
                    />

                    {/* Estimated Wait Time */}
                    <MetricItem
                      title="Time Remaining"
                      value={waitTimeStatus.text}
                      colorClass={waitTimeStatus.color}
                    />

                    {/* Doctor Status */}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Doctor Status
                      </p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm ${
                          status.delay_mins > 0
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            status.delay_mins > 0
                              ? "bg-orange-500 animate-pulse"
                              : "bg-green-500"
                          }`}
                        ></span>
                        {status.delay_mins > 0 ? "Delayed" : "On Time"}
                      </div>
                      {status.delay_mins > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          **{status.delay_mins} min** estimated delay
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secondary Information Cards (Light Theme) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Delay Card */}
                  <div
                    className={`p-6 rounded-2xl shadow-lg border border-l-4 ${
                      status.delay_mins > 0
                        ? "bg-red-50 border-red-500"
                        : "bg-green-50 border-green-500"
                    }`}
                  >
                    <p className="font-bold text-lg text-gray-800 mb-2">
                      {status.delay_mins > 0
                        ? "⚠️ Delay Alert"
                        : "Everything Clear"}
                    </p>
                    <p className="text-sm text-gray-700">
                      {status.delay_mins > 0
                        ? `Due to unforeseen circumstances, the doctor is running **${status.delay_mins} minutes** behind schedule. Please adjust your arrival time.`
                        : "The doctor is currently on time and running smoothly. Please plan to arrive shortly before your scheduled slot."}
                    </p>
                  </div>

                  {/* Next Steps Card */}
                  <div className="bg-blue-50 p-6 rounded-2xl shadow-lg border border-l-4 border-blue-500">
                    <p className="font-bold text-lg text-gray-800 mb-2">
                      Next Steps
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">→</span> Arrive 10
                        minutes prior to the estimated time.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">→</span> Have your
                        Tracking ID ({trackId}) ready at reception.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">→</span> Keep checking
                        this page for dynamic updates.
                      </li>
                    </ul>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-l-4 border-gray-400">
                    <p className="font-bold text-lg text-gray-800 mb-2">
                      Summary
                    </p>
                    <p className="text-sm text-gray-700">
                      **Status:** Scheduled
                      <br />
                      **Patients Ahead:** {status.patients_ahead || 0}
                      <br />
                      **Estimated Start:**{" "}
                      {waitTimeStatus.isCurrent
                        ? "Imminent"
                        : `${status.slot_time} (plus potential delay)`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer (Light Theme) */}
      <div className="text-center py-5 bg-white border-t border-gray-100 text-gray-500 text-xs">
        <p>
          © 2024 CareFlow Tracking System. For support, please contact{" "}
          <span className="font-semibold text-blue-600">
            support@careflow.com
          </span>
        </p>
      </div>
    </div>
  );
}