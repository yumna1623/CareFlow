import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

// --- NEW HELPER FUNCTION ---
// Helper to format date for input type="date" and API query
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// --- Doctor Login & Registration ---
function DoctorLoginRegister({ setAuth }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!isLogin) {
                const data = {
                    ...formData,
                    start_time: formData.start_time || "09:00 AM",
                    end_time: formData.end_time || "05:00 PM",
                    slot_duration: formData.slot_duration || 15
                };
                await axios.post(`${API}/doctor/register`, data);
                alert("Registered! Please login now.");
                setIsLogin(true);
            } else {
                const res = await axios.post(`${API}/doctor/login`, formData);
                localStorage.setItem('docToken', res.data.token);
                setAuth(res.data.user);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Error during operation.");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-slate-800">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4">{isLogin ? "Doctor Login" : "Doctor Registration"}</h2>
                {!isLogin && (
                    <>
                        <input className="w-full p-2 border mb-2" placeholder="Full Name" onChange={e=>setFormData({...formData, name:e.target.value})} />
                        <input className="w-full p-2 border mb-2" placeholder="Specialization" onChange={e=>setFormData({...formData, specialization:e.target.value})} />
                        <input className="w-full p-2 border mb-2 bg-yellow-50" placeholder="Admin Passcode (HOSPITAL_SECRET)" onChange={e=>setFormData({...formData, admin_code:e.target.value})} />
                    </>
                )}
                <input className="w-full p-2 border mb-2" placeholder="Email" onChange={e=>setFormData({...formData, email:e.target.value})} />
                <input className="w-full p-2 border mb-4" type="password" placeholder="Password" onChange={e=>setFormData({...formData, password:e.target.value})} />
                <button className="w-full bg-slate-800 text-white p-2 rounded">{isLogin ? "Login" : "Register"}</button>
                <p onClick={() => setIsLogin(!isLogin)} className="text-blue-500 text-center mt-4 cursor-pointer text-sm">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </p>
            </form>
        </div>
    );
}

// --- Doctor Dashboard ---
function DoctorDashboard({ auth, setAuth }) {
    const [appointments, setAppointments] = useState([]);
    const [doctorDetails, setDoctorDetails] = useState({});
    // NEW STATE: Initialize to today's date in YYYY-MM-DD format
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date())); 

    const fetchAppointments = async () => {
        try {
            // UPDATED API CALL: Pass the selected date as a query parameter
            const url = `${API}/doctor/appointments/${auth.doctor_id}?target_date=${selectedDate}`;
            const res = await axios.get(url);
            
            setAppointments(res.data.allAppointments || []);
            setDoctorDetails(res.data.doctor || {});
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
            // Optional: reset appointments if doctor not found or error
            setAppointments([]); 
        }
    };

    const completeAppointment = async (id) => {
        try {
            await axios.put(`${API}/complete/${id}`);
            // After completion, refresh the list for the currently selected date
            fetchAppointments(); 
        } catch (err) {
            console.error("Error completing appointment:", err);
        }
    };

    // UPDATED useEffect: Refetch when selectedDate changes
    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 15000);
        return () => clearInterval(interval);
    }, [auth, selectedDate]); // ADD selectedDate to dependency array

    const nowServing = appointments.find(a => a.status === "scheduled");
    const waitingList = appointments.filter(a => a.status === "scheduled" && a.appointment_id !== nowServing?.appointment_id);
    const completedList = appointments.filter(a => a.status === "completed");

    const formatTime = (time) => {
        if (!time) return "N/A";
        // Assuming backend now returns 'HH12:MI AM' format for slot_time
        return time; 
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Dr. {auth.name}'s Dashboard</h1>
                <button onClick={() => { localStorage.removeItem('docToken'); setAuth(null); }} className="text-red-500 underline">Logout</button>
            </div>

            <div className="mb-8 p-4 bg-blue-100 rounded shadow flex justify-between items-center">
                {/* NEW DATE PICKER */}
                <p className="text-xl font-semibold text-blue-800">
                    Viewing Appointments For: 
                    <input 
                        type="date" 
                        value={selectedDate} 
                        // Update state and trigger re-fetch when date changes
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        className="ml-4 p-2 border rounded text-slate-800"
                    />
                </p>
                <p className="text-xl font-semibold text-blue-800">
                    Clinic Hours: <span className="text-green-600">{doctorDetails.start_time || 'N/A'} - {doctorDetails.end_time || 'N/A'}</span> (Consult Time: <strong>{doctorDetails.slot_duration || 15} min</strong>)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                    {nowServing ? (
                        <div className="bg-white p-8 rounded shadow-lg border-l-8 border-green-500">
                            <h2 className="text-gray-500 uppercase tracking-wide text-sm font-semibold">
                                Now Serving (Scheduled: {formatTime(nowServing.slot_time)})
                            </h2>
                            <div className="flex justify-between items-center mt-4">
                                <div>
                                    <h3 className="text-4xl font-bold">{nowServing.patient_name}</h3>
                                    <p className="text-xl text-gray-600">Age: {nowServing.patient_age || "N/A"}</p>
                                    <p className="text-indigo-600 font-mono mt-2">Scheduled: {formatTime(nowServing.slot_time)}</p>
                                </div>
                                <button
                                    onClick={() => completeAppointment(nowServing.appointment_id)}
                                    className="bg-green-600 text-white px-8 py-4 rounded shadow-lg hover:bg-green-700 text-xl font-bold"
                                >
                                    Complete & Call Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded shadow text-center text-gray-500">
                            <h3 className="text-xl">
                                {appointments.length === 0 
                                    ? "No appointments booked for this date. 🗓️" 
                                    : "All appointments completed for this date. ☕"}
                            </h3>
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 rounded shadow h-96 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2">Upcoming Appointments ({waitingList.length})</h3>
                    {waitingList.map((p) => (
                        <div key={p.appointment_id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border-b">
                            <div>
                                <span className="font-bold text-gray-700">{formatTime(p.slot_time)}</span>
                                <span className="text-sm text-gray-500 block">{p.patient_name} (Age: {p.patient_age || "N/A"})</span>
                            </div>
                        </div>
                    ))}
                    {waitingList.length === 0 && <p className="text-sm text-gray-400">No upcoming appointments.</p>}

                    <h3 className="font-bold text-md mt-4 border-t pt-2">Completed on Selected Date ({completedList.length})</h3>
                    {completedList.map((p) => (
                        <div key={p.appointment_id} className="text-xs text-gray-500 p-1 border-b">
                            <span className="font-semibold">{formatTime(p.slot_time)}</span> - {p.patient_name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Main Doctor Portal ---
export default function DoctorPortal() {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('docToken');
        
        if (token && !auth) {
            // Example: decode token or call backend to get doctor info
            axios.get(`${API}/doctor/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setAuth(res.data.doctor))
                .catch(err => localStorage.removeItem('docToken'));
        }
    }, [auth]);

    return auth ? <DoctorDashboard auth={auth} setAuth={setAuth} /> : <DoctorLoginRegister setAuth={setAuth} />;
}