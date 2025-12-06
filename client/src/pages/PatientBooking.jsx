import { useEffect, useState } from "react";
import axios from "axios";

const Input = ({ placeholder, value, onChange, type = "text", min, className = "" }) => (
    <input
        className={`border-b border-gray-300 p-3 w-full rounded-none focus:border-blue-500 focus:outline-none text-base bg-white hover:border-gray-500 transition duration-150 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        min={min}
    />
);

const Select = ({ value, onChange, children }) => (
    <select
        className="border-b border-gray-300 p-3 w-full rounded-none focus:border-blue-500 focus:outline-none text-base bg-white appearance-none hover:border-gray-500 transition duration-150"
        value={value}
        onChange={onChange}
    >
        {children}
    </select>
);

export default function PatientBooking() {
    const [doctors, setDoctors] = useState([]);
    const [form, setForm] = useState({
        name: "",
        age: "",
        email: "",
        phone: "",
        doctor_id: "",
        date: "",
        slot_id: ""
    });
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingConfirm, setBookingConfirm] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/doctors").then((res) => {
            setDoctors(res.data);
        });
    }, []);

    const fetchSlots = async (doctor_id, date) => {
        if (!doctor_id || !date) return;
        setLoading(true);
        setSlots([]);
        try {
            await axios.post("http://localhost:5000/api/doctor/generate-slots", {
                doctor_id,
                date
            });
            const res = await axios.get(
                `http://localhost:5000/api/doctor/${doctor_id}/timeslots/${date}`
            );
            setSlots(res.data);
        } catch (err) {
            console.error("Error:", err);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const submitBooking = async () => {
        if (!form.name || !form.age || !form.email || !form.phone) {
            alert("Please fill all patient details!");
            return;
        }
        if (!form.doctor_id || !form.date || !form.slot_id) {
            alert("Please select a doctor, date, and time slot!");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/book/slot", {
                doctor_id: parseInt(form.doctor_id),
                slot_id: parseInt(form.slot_id),
                patient_name: form.name,
                patient_age: parseInt(form.age),
                patient_email: form.email,
                patient_phone: form.phone
            });

            setBookingConfirm({
                appointment_id: res.data.appointment_id,
                queue_number: res.data.queue_number,
                appointment_time: res.data.appointment_time,
                appointment_date: res.data.appointment_date,
                patient_name: form.name,
                patient_age: form.age,
                patient_email: form.email,
                patient_phone: form.phone,
                doctor_name: selectedDoctor?.name,
                doctor_specialization: selectedDoctor?.specialization
            });

            setForm({ name: "", age: "", email: "", phone: "", doctor_id: "", date: "", slot_id: "" });
            setSlots([]);
        } catch (err) {
            alert(err.response?.data?.error || "Booking failed!");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("✓ Copied!");
    };

    // --- Professional Confirmation View ---
    if (bookingConfirm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
                <div className="w-full max-w-5xl">
                    {/* Success Header Card */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-center text-white mb-8 shadow-2xl">
                        <div className="text-7xl mb-4">✅</div>
                        <h1 className="text-4xl font-bold mb-2">Appointment Confirmed</h1>
                        <p className="text-green-50 text-lg">Your booking has been successfully secured</p>
                    </div>

                    {/* Main Confirmation Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Appointment ID Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-blue-100 mb-1">APPOINTMENT ID</p>
                                <p className="text-3xl font-bold font-mono">{bookingConfirm.appointment_id}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(bookingConfirm.appointment_id)}
                                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition"
                            >
                                📋 Copy
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-3 gap-0">
                            {/* Left Section - Date & Time */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-r border-gray-200">
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">Appointment Details</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold mb-2">📅 DATE</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {new Date(bookingConfirm.appointment_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold mb-2">⏰ TIME</p>
                                        <p className="text-2xl font-bold text-gray-900">{bookingConfirm.appointment_time}</p>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                                        <p className="text-xs text-gray-600 font-semibold mb-2">🔢 QUEUE POSITION</p>
                                        <p className="text-3xl font-bold text-blue-600">#{bookingConfirm.queue_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Section - Patient Info */}
                            <div className="p-8 border-r border-gray-200">
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">Patient Information</h3>
                                
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold mb-1">👤 Name</p>
                                        <p className="text-lg font-bold text-gray-900">{bookingConfirm.patient_name}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold mb-1">🎂 Age</p>
                                        <p className="text-lg font-bold text-gray-900">{bookingConfirm.patient_age} years</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold mb-1">✉️ Email</p>
                                        <p className="text-sm font-mono text-gray-900 break-all">{bookingConfirm.patient_email}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-600 font-semibold mb-1">📱 Phone</p>
                                        <p className="text-lg font-bold text-gray-900">{bookingConfirm.patient_phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Doctor Info */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">Healthcare Provider</h3>
                                
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-6 mb-6">
                                    <p className="text-sm text-purple-100 mb-1">Doctor</p>
                                    <p className="text-2xl font-bold mb-3">Dr. {bookingConfirm.doctor_name}</p>
                                    <p className="text-sm text-purple-100">{bookingConfirm.doctor_specialization}</p>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-600 font-bold mb-3">Important</p>
                                    <ul className="space-y-2 text-xs text-gray-700">
                                        <li>✓ Arrive 10 min early</li>
                                        <li>✓ Bring valid ID</li>
                                        <li>✓ Save your ID</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 flex gap-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    const text = `APPOINTMENT CONFIRMATION\n================================\n\nAppointment ID: ${bookingConfirm.appointment_id}\nDate: ${bookingConfirm.appointment_date}\nTime: ${bookingConfirm.appointment_time}\nQueue: #${bookingConfirm.queue_number}\n\nPATIENT: ${bookingConfirm.patient_name}\nAge: ${bookingConfirm.patient_age}\nEmail: ${bookingConfirm.patient_email}\nPhone: ${bookingConfirm.patient_phone}\n\nDOCTOR: Dr. ${bookingConfirm.doctor_name}\nSpecialty: ${bookingConfirm.doctor_specialization}\n\nPlease arrive 10 minutes before your appointment.`;
                                    const el = document.createElement("a");
                                    el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
                                    el.setAttribute("download", `Appointment_${bookingConfirm.appointment_id}.txt`);
                                    el.click();
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
                            >
                                📥 Download Confirmation
                            </button>
                            <button
                                onClick={() => {
                                    setBookingConfirm(null);
                                    window.location.reload();
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
                            >
                                ➕ Book Another Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Booking Form View ---
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto pt-12">
                <div className="mb-10 text-center">
                    <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
                        🩺 Clinic Appointment Booking
                    </h1>
                    <p className="text-lg text-gray-500 mt-3">Secure your consultation time slot in three easy steps.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 pb-4 border-b">
                            Step 1 & 2: Patient Info & Selection
                        </h2>

                        <div className="space-y-6">
                            <Input
                                placeholder="Full Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Age"
                                    type="number"
                                    value={form.age}
                                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                                />
                                <Input
                                    placeholder="Phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>

                            <Input
                                placeholder="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <Select
                                    value={form.doctor_id}
                                    onChange={(e) => {
                                        const selected = doctors.find((d) => d.doctor_id == e.target.value);
                                        setSelectedDoctor(selected);
                                        setForm({ ...form, doctor_id: e.target.value, slot_id: "" });
                                        fetchSlots(e.target.value, form.date);
                                    }}
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d.doctor_id} value={d.doctor_id}>
                                            Dr. {d.name} — {d.specialization}
                                        </option>
                                    ))}
                                </Select>

                                <Input
                                    type="date"
                                    value={form.date}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => {
                                        setForm({ ...form, date: e.target.value, slot_id: "" });
                                        fetchSlots(form.doctor_id, e.target.value);
                                    }}
                                />
                            </div>

                            {selectedDoctor && (
                                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mt-4">
                                    <p className="text-sm text-gray-700 font-bold">
                                        Dr. {selectedDoctor.name} ({selectedDoctor.specialization})
                                    </p>
                                    <p className="text-xs text-indigo-600 mt-1">
                                        Availability: {selectedDoctor.start_time} - {selectedDoctor.end_time} | Slot Duration: {selectedDoctor.slot_duration} min
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b">
                            Step 3: Select Time Slot
                        </h2>

                        {loading ? (
                            <p className="text-center text-blue-600 font-bold py-12">Loading available slots...</p>
                        ) : slots.length > 0 ? (
                            <>
                                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setForm({ ...form, slot_id: slot.id })}
                                            className={`p-3 rounded-lg font-semibold transition text-sm shadow-sm ${
                                                form.slot_id === slot.id
                                                    ? "bg-blue-600 text-white border border-blue-700 shadow-md"
                                                    : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-blue-100 hover:border-blue-300"
                                            }`}
                                        >
                                            {slot.display_time}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-4">Available slots are displayed above.</p>
                            </>
                        ) : (
                            <div className="bg-red-50 p-6 rounded-lg text-center border border-red-200">
                                <p className="text-red-700 font-semibold">
                                    No slots available. Please select a doctor and a date.
                                </p>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={submitBooking}
                                disabled={loading || !form.slot_id}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl w-full transition disabled:opacity-50 text-xl shadow-lg hover:from-blue-700 hover:to-indigo-700"
                            >
                                {loading ? "Processing Booking..." : "Book Appointment Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}