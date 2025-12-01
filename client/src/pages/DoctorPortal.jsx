import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function DoctorLoginRegister({ setAuth }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const res = await axios.post(`${API}/doctor/login`, formData);
                localStorage.setItem('docToken', res.data.token);
                setAuth(res.data.user);
            } else {
                const res = await axios.post(`${API}/doctor/register`, formData);
                alert("Registered! Please login now.");
                setIsLogin(true);
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

function DoctorDashboard({ auth, setAuth }) {
    const [queue, setQueue] = useState([]);
    
    const fetchQueue = async () => {
        try {
            const res = await axios.get(`${API}/doctor/queue/${auth.doctor_id}`);
            setQueue(res.data);
        } catch (error) {
            console.error("Failed to fetch queue.");
        }
    };

    const nextPatient = async (apptId) => {
        await axios.put(`${API}/complete/${apptId}`);
        fetchQueue();
    };

    useEffect(() => { 
        fetchQueue(); 
        const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [auth]);

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Dr. {auth.name}'s Dashboard</h1>
                <button onClick={() => setAuth(null)} className="text-red-500 underline">Logout</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CURRENT PATIENT CARD */}
                <div className="col-span-2">
                    {queue.length > 0 ? (
                        <div className="bg-white p-8 rounded shadow-lg border-l-8 border-green-500">
                            <h2 className="text-gray-500 uppercase tracking-wide text-sm font-semibold">Now Serving (Token #{queue[0].queue_number})</h2>
                            <div className="flex justify-between items-center mt-4">
                                <div>
                                    <h3 className="text-4xl font-bold">{queue[0].patient_name}</h3>
                                    <p className="text-xl text-gray-600">Age: {queue[0].patient_age}</p>
                                    <p className="text-indigo-600 font-mono mt-2">Ticket ID: {queue[0].appointment_id}</p>
                                </div>
                                <button 
                                    onClick={() => nextPatient(queue[0].appointment_id)}
                                    className="bg-green-600 text-white px-8 py-4 rounded shadow-lg hover:bg-green-700 text-xl font-bold"
                                >
                                    Call Next Patient
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded shadow text-center text-gray-500">
                            <h3 className="text-xl">No patients in queue. Time for a coffee! ☕</h3>
                        </div>
                    )}
                </div>

                {/* UP NEXT LIST */}
                <div className="bg-white p-4 rounded shadow h-96 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2">Up Next ({queue.length > 1 ? queue.length - 1 : 0} Waiting)</h3>
                    {queue.slice(1).map((p, index) => (
                        <div key={p.appointment_id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border-b">
                            <div>
                                <span className="font-bold text-gray-700">#{p.queue_number}. {p.patient_name}</span>
                                <span className="text-xs text-gray-400 block">ID: {p.appointment_id}</span>
                            </div>
                        </div>
                    ))}
                    {queue.length <= 1 && <p className="text-sm text-gray-400">Queue empty.</p>}
                </div>
            </div>
        </div>
    );
}

export default function DoctorPortal() {
    const [auth, setAuth] = useState(null);

    // Simple persistence check (optional)
    useEffect(() => {
        const token = localStorage.getItem('docToken');
        if (token && !auth) {
            // In a real app, you would validate the token on the backend
            // Here we just skip the token check for simplicity
            // You might load user data from token payload or local storage here
        }
    }, [auth]);

    return auth ? <DoctorDashboard auth={auth} setAuth={setAuth} /> : <DoctorLoginRegister setAuth={setAuth} />;
}