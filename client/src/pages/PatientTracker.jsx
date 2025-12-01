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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Track Your Queue</h2>
        <div className="flex gap-2 mb-6">
          <input className="border p-2 rounded w-full text-center text-lg" placeholder="Enter Tracking ID" value={trackId} onChange={e => setTrackId(e.target.value)} />
          <button onClick={checkStatus} className="bg-indigo-600 text-white px-6 rounded font-bold">Go</button>
        </div>

        {status && (
          <div className="animate-fade-in">
            {status.status === 'completed' ? (
              <div className="text-green-600 font-bold text-xl">Appointment Completed ✅</div>
            ) : status.status === 'cancelled' ? (
              <div className="text-red-600 font-bold text-xl">Appointment Cancelled ❌</div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-700">Hello, {status.patient_name}</h3>
                <div className="my-4 py-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-4xl font-bold text-blue-600">Queue #{status.queue_number}</p>
                  <p className="text-sm text-gray-500 mt-1">Your Position</p>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-600 px-4">
                  <span>People Ahead: {status.people_ahead}</span>
                  <span className="text-orange-500">Wait: ~{status.estimated_wait} mins</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}