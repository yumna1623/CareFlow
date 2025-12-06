import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function PatientTracker() {
  const [trackId, setTrackId] = useState("");
  const [status, setStatus] = useState(null);

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API}/track/${trackId}`);
      setStatus(res.data);
    } catch (err) {
      alert("ID not found or an error occurred.");
      setStatus(null);
    }
  };

  // Calculate wait time until appointment
  const calculateWaitTime = () => {
    if (!status || !status.slot_time) return null;

    // Parse slot_time (format: "2:30 PM" or "02:30 PM")
    const now = new Date();
    const [time, period] = status.slot_time.split(" ");
    let [hours, mins] = time.split(":").map(Number);

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Create appointment time for today
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, mins, 0);

    // Calculate difference in milliseconds
    const diffMs = appointmentTime - now;

    if (diffMs <= 0) {
      return { hours: 0, mins: 0, isOverdue: true };
    }

    const totalMins = Math.floor(diffMs / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;

    return { hours: h, mins: m, isOverdue: false };
  };

  const waitTime = calculateWaitTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-slate-800 text-center">
          📍 Track Your Appointment
        </h2>

        {/* Search Input */}
        <div className="flex gap-2 mb-8">
          <input
            className="border-2 border-slate-300 p-3 rounded-lg w-full text-center text-lg focus:border-blue-500 focus:outline-none"
            placeholder="Enter Tracking ID (e.g., APT1234567890)"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && checkStatus()}
          />
          <button
            onClick={checkStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg font-bold transition"
          >
            Track
          </button>
        </div>

        {/* Status Display */}
        {status && (
          <div className="space-y-6">
            {status.status === "completed" ? (
              <div className="text-center p-6 bg-green-100 rounded-lg">
                <div className="text-6xl mb-2">✅</div>
                <div className="text-green-700 font-bold text-2xl">
                  Appointment Completed
                </div>
              </div>
            ) : status.status === "cancelled" ? (
              <div className="text-center p-6 bg-red-100 rounded-lg">
                <div className="text-6xl mb-2">❌</div>
                <div className="text-red-700 font-bold text-2xl">
                  Appointment Cancelled
                </div>
              </div>
            ) : (
              <>
                {/* Patient Name */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="text-sm text-gray-600 mb-1">Patient Name</p>
                  <p className="text-2xl font-bold text-blue-800">
                    👤 {status.patient_name}
                  </p>
                </div>

                {/* Queue Position */}
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                  <p className="text-sm text-gray-600 mb-2">Queue Position</p>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-purple-600">
                      #{status.queue_number || 1}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Patients Ahead: {status.patients_ahead || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {status.patients_ahead === 0
                          ? "You're first! 🎉"
                          : `${status.patients_ahead} patient${
                              status.patients_ahead > 1 ? "s" : ""
                            } before you`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointment Time */}
                <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-sm text-gray-600 mb-2">Scheduled Appointment Time</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    🕐 {status.slot_time}
                  </p>
                </div>

                {/* Wait Time Calculation */}
                {waitTime && (
                  <div
                    className={`p-4 rounded-lg border-l-4 ${
                      waitTime.isOverdue
                        ? "bg-red-50 border-red-600"
                        : waitTime.hours >= 1
                        ? "bg-yellow-50 border-yellow-600"
                        : "bg-green-50 border-green-600"
                    }`}
                  >
                    <p className="text-sm text-gray-600 mb-2">Time Until Your Appointment</p>
                    <div className="text-3xl font-bold mb-3">
                      {waitTime.isOverdue ? (
                        <span className="text-red-700">
                          ⏰ Appointment time has passed
                        </span>
                      ) : waitTime.hours > 0 ? (
                        <span className="text-yellow-700">
                          ⏳ {waitTime.hours}h {waitTime.mins}m remaining
                        </span>
                      ) : (
                        <span className="text-green-700">
                          ✅ {waitTime.mins}m remaining
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Delay Status */}
                <div
                  className={`p-4 rounded-lg ${
                    status.delay_mins > 0
                      ? "bg-orange-100 border-2 border-orange-400"
                      : "bg-green-100 border-2 border-green-400"
                  }`}
                >
                  <p className="text-sm text-gray-700 mb-2 font-semibold">Doctor Status</p>
                  {status.delay_mins > 0 ? (
                    <div>
                      <p className="text-lg font-bold text-orange-700 mb-2">
                        ⚠️ Doctor Running Late
                      </p>
                      <p className="text-orange-700">
                        <strong>Expected Wait:</strong> {status.delay_mins} minutes
                        {status.patients_ahead > 0 && (
                          <>
                            <br />
                            <strong>Breakdown:</strong>
                            <br />
                            • {status.patients_ahead} patient{status.patients_ahead > 1 ? "s" : ""} ahead of you
                            <br />
                            • Estimated additional wait: {status.delay_mins} minutes
                          </>
                        )}
                      </p>
                      <p className="text-sm text-orange-600 mt-2">
                        Please arrive when notified
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-bold text-green-700 mb-2">
                        ✅ Doctor On Time
                      </p>
                      <p className="text-green-700">
                        Please arrive 10 minutes before {status.slot_time}
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary Card */}
                <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-300">
                  <p className="font-bold text-slate-800 mb-3">📋 Summary</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>
                      ✓ <strong>Appointment ID:</strong> {trackId}
                    </li>
                    <li>
                      ✓ <strong>Queue Position:</strong> {status.queue_number}
                    </li>
                    <li>
                      ✓ <strong>Patients Ahead:</strong> {status.patients_ahead || 0}
                    </li>
                    <li>
                      ✓ <strong>Scheduled Time:</strong> {status.slot_time}
                    </li>
                    <li>
                      ✓ <strong>Status:</strong>{" "}
                      <span className="font-bold text-blue-600">
                        {status.status.charAt(0).toUpperCase() +
                          status.status.slice(1)}
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}