import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function PatientBooking() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ name: "", age: "", doctor_id: "" });
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    axios.get(`${API}/doctors`).then(res => setDoctors(res.data));
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!formData.doctor_id) return alert("Select a doctor");
    
    try {
        const res = await axios.post(`${API}/book`, {
            doctor_id: formData.doctor_id,
            patient_name: formData.name,
            patient_age: formData.age
        });
        setTicket(res.data);
    } catch (error) {
        console.error("Booking Error:", error);
        alert("Failed to book appointment.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Book Appointment</h2>
      
      {!ticket ? (
        <form onSubmit={handleBook} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700">Select Doctor</label>
            <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, doctor_id: e.target.value})} defaultValue="">
              <option value="" disabled>-- Choose --</option>
              {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name} ({d.specialization})</option>)}
            </select>
          </div>
          <input className="w-full border p-2 mb-4 rounded" placeholder="Patient Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="w-full border p-2 mb-4 rounded" placeholder="Age" type="number" required onChange={e => setFormData({...formData, age: e.target.value})} />
          <button className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">Book Now</button>
        </form>
      ) : (
        <div className="bg-green-100 p-8 rounded border-2 border-green-500 text-center">
          <h3 className="text-2xl font-bold text-green-700">Booking Confirmed!</h3>
          <p className="mt-4 text-xl">Your Tracking ID: <span className="font-mono font-bold text-3xl block mt-2">{ticket.appointment_id}</span></p>
          <p className="text-sm text-gray-600 mt-2">Save this ID to track your queue status.</p>
          <div className="mt-6 flex gap-4 justify-center">
            <Link to="/track" className="bg-blue-600 text-white px-4 py-2 rounded">Track Now</Link>
            <button onClick={() => setTicket(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Book Another</button>
          </div>
        </div>
      )}
    </div>
  );
}