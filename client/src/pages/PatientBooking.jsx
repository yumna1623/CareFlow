import { useEffect, useState } from "react";
import axios from "axios";

// --- Reusable Components ---

const Input = ({
  placeholder,
  value,
  onChange,
  type = "text",
  min,
  className = "",
}) => (
  <input
    className={`border border-gray-300 p-3 w-full rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm bg-white hover:border-gray-400 transition duration-150 shadow-sm ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    type={type}
    min={min}
  />
);

const Select = ({ value, onChange, children, className = "" }) => (
  <select
    className={`border border-gray-300 p-3 w-full rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm bg-white appearance-none hover:border-gray-400 transition duration-150 shadow-sm ${className}`}
    value={value}
    onChange={onChange}
  >
    {children}
  </select>
);

function DetailItem({ label, value, isMono = false }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
      <p
        className={`font-medium text-gray-800 ${
          isMono ? "font-mono text-xs break-all" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// --- Main Component ---
export default function PatientBooking() {
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState("booking"); // "booking" or "doctors"
  const [filter, setFilter] = useState("");

  

  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    doctor_id: "",
    date: "",
    slot_id: "",
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
    setForm((prev) => ({ ...prev, slot_id: "" }));
    try {
      await axios.post("http://localhost:5000/api/doctor/generate-slots", {
        doctor_id: parseInt(doctor_id),
        date,
      });
      const res = await axios.get(
        `http://localhost:5000/api/doctor/${doctor_id}/timeslots/${date}`
      );
      setSlots(res.data.filter((slot) => !slot.is_booked));
    } catch (err) {
      console.error("Error fetching slots:", err);
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
        patient_phone: form.phone,
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
        doctor_specialization: selectedDoctor?.specialization,
      });

      setForm({
        name: "",
        age: "",
        email: "",
        phone: "",
        doctor_id: "",
        date: "",
        slot_id: "",
      });
      setSlots([]);
      setSelectedDoctor(null);
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

  // --- Booking Confirmation View ---
  if (bookingConfirm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center font-sans">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl p-10 text-center mb-8 shadow-2xl border-t-8 border-green-500">
            <div className="text-4xl text-green-500 mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Appointment Confirmed
            </h1>
            <p className="text-gray-600 text-md">
              Your booking has been successfully secured. Please save your appointment ID.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-light text-blue-200 mb-1">APPOINTMENT ID</p>
                <p className="text-2xl font-mono tracking-wider">{bookingConfirm.appointment_id}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bookingConfirm.appointment_id)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                📋 Copy ID
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
              {/* Schedule */}
              <div className="p-8">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-6">Schedule</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">📅 DATE</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(bookingConfirm.appointment_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">⏰ TIME</p>
                    <p className="text-xl font-bold text-gray-900">{bookingConfirm.appointment_time}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-blue-700 font-semibold mb-2">🔢 QUEUE NUMBER</p>
                    <p className="text-2xl font-bold text-blue-600">#{bookingConfirm.queue_number}</p>
                  </div>
                </div>
              </div>

              {/* Patient */}
              <div className="p-8">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-6">Patient Details</h3>
                <div className="space-y-4 text-sm">
                  <DetailItem label="👤 Name" value={bookingConfirm.patient_name} />
                  <DetailItem label="🎂 Age" value={`${bookingConfirm.patient_age} years`} />
                  <DetailItem label="✉️ Email" value={bookingConfirm.patient_email} isMono />
                  <DetailItem label="📱 Phone" value={bookingConfirm.patient_phone} />
                </div>
              </div>

              {/* Doctor */}
              <div className="p-8">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-6">Healthcare Provider</h3>
                <div className="bg-slate-700 text-white rounded-lg p-5 mb-6 shadow-md">
                  <p className="text-sm text-slate-300 mb-1">Doctor</p>
                  <p className="text-xl font-bold mb-2">Dr. {bookingConfirm.doctor_name}</p>
                  <p className="text-sm text-slate-300">{bookingConfirm.doctor_specialization}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-bold mb-2">Important Notes</p>
                  <ul className="space-y-1 text-xs text-gray-600 list-inside">
                    <li>• Arrive 10 min early</li>
                    <li>• Bring valid ID</li>
                    <li>• Confirmation is not a receipt</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-6 flex gap-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const text = `APPOINTMENT CONFIRMATION\nAppointment ID: ${bookingConfirm.appointment_id}\nDate: ${new Date(bookingConfirm.appointment_date).toLocaleDateString()}\nTime: ${bookingConfirm.appointment_time}\nQueue: #${bookingConfirm.queue_number}\nPatient: ${bookingConfirm.patient_name}\nEmail: ${bookingConfirm.patient_email}\nPhone: ${bookingConfirm.patient_phone}\nDoctor: Dr. ${bookingConfirm.doctor_name}\nSpecialty: ${bookingConfirm.doctor_specialization}`;
                  const el = document.createElement("a");
                  el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
                  el.setAttribute("download", `Appointment_${bookingConfirm.appointment_id}.txt`);
                  el.click();
                }}
                className="flex-1 py-3 bg-green-500 text-white text-sm rounded-lg font-bold shadow-md hover:bg-green-600 transition"
              >
                📥 Download Confirmation
              </button>
              <button
                onClick={() => {
                  setBookingConfirm(null);
                  window.location.reload();
                }}
                className="flex-1 py-3 bg-blue-600 text-white text-sm rounded-lg font-bold shadow-md hover:bg-blue-700 transition"
              >
                ➕ Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Content Area ---
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white shadow-2xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-blue-400 mb-10">CareFlow Portal</h2>
        <nav className="space-y-2">
          <button
            className={`w-full text-left py-2 px-3 rounded-lg font-medium transition duration-150 ${
              view === "dashboard" ? "bg-slate-700 text-white" : "text-white/80 hover:bg-slate-700 hover:text-white"
            }`}
            onClick={() => setView("dashboard")}
          >
            🏠 Dashboard
          </button>
          <button
            className={`w-full text-left py-2 px-3 rounded-lg font-medium transition duration-150 ${
              view === "booking" ? "bg-blue-600 text-white shadow-lg" : "text-white/80 hover:bg-slate-700 hover:text-white"
            }`}
            onClick={() => setView("booking")}
          >
            📅 Book Appointment
          </button>
          <button
            className={`w-full text-left py-2 px-3 rounded-lg font-medium transition duration-150 ${
              view === "doctors" ? "bg-slate-700 text-white" : "text-white/80 hover:bg-slate-700 hover:text-white"
            }`}
            onClick={() => setView("doctors")}
          >
            👥 Doctors
          </button>
        </nav>
        <div className="mt-auto pt-10 space-y-2">
          <button className="w-full text-left py-2 px-3 rounded-lg text-white/80 font-medium transition duration-150 hover:bg-slate-700 hover:text-white">
            ⚙️ Settings
          </button>
          <button className="w-full text-left py-2 px-3 rounded-lg text-red-400 font-medium transition duration-150 hover:bg-slate-700 hover:text-red-300">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-10 max-w-7xl mx-auto w-full">
        {view === "booking" && (
          <BookingForm
            doctors={doctors}
            form={form}
            setForm={setForm}
            slots={slots}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            fetchSlots={fetchSlots}
            submitBooking={submitBooking}
            loading={loading}
          />
        )}

      {view === "doctors" && (
  <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-4xl mx-auto">
    <button
      onClick={() => setView("booking")}
      className="mb-6 px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
    >
      ← Back to Booking
    </button>

    <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
      👥 Doctors List
    </h2>

    {/* Filter Section */}
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <label className="text-gray-700 font-medium">Filter by Specialization:</label>
      <select
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="">All</option>
        {Array.from(new Set(doctors.map((d) => d.specialization))).map((spec) => (
          <option key={spec} value={spec}>{spec}</option>
        ))}
      </select>
    </div>

    {/* Doctors List */}
    <div className="grid md:grid-cols-2 gap-6">
      {doctors
        .filter((doc) => !filter || doc.specialization === filter)
        .map((doc) => (
          <div
            key={doc.doctor_id}
            className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition duration-300"
          >
            <p className="font-bold text-xl text-gray-800">Dr. {doc.name}</p>
            <p className="text-gray-600 mt-1">{doc.specialization}</p>
            <p className="text-gray-500 mt-2 text-sm">Hours: {doc.start_time} - {doc.end_time}</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Book Appointment
            </button>
          </div>
        ))}
    </div>
  </div>
)}

      </div>
    </div>
  );
}

// --- BookingForm Component ---
function BookingForm({ doctors, form, setForm, slots, selectedDoctor, setSelectedDoctor, fetchSlots, submitBooking, loading }) {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">🏥 Secure Appointment Booking</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-slate-700 mb-6 border-b border-gray-100 pb-3">
            1. Patient Information & Doctor Selection
          </h2>
          <div className="space-y-5">
            <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Age"
                min="1"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <Select
                className={!form.doctor_id ? "text-gray-500" : "text-gray-800"}
                value={form.doctor_id}
                onChange={(e) => {
                  const selected = doctors.find((d) => d.doctor_id == e.target.value);
                  setSelectedDoctor(selected);
                  setForm({ ...form, doctor_id: e.target.value, slot_id: "" });
                  fetchSlots(e.target.value, form.date);
                }}
              >
                <option value="" disabled>Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name} — {d.specialization}</option>
                ))}
              </Select>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value, slot_id: "" });
                  fetchSlots(form.doctor_id, e.target.value);
                }}
              />
            </div>
          </div>
          {selectedDoctor && (
            <div className="bg-blue-50 mt-6 p-4 rounded-lg border border-blue-200 shadow-sm">
              <p className="text-sm font-bold text-blue-800">Selected Doctor: Dr. {selectedDoctor.name}</p>
              <p className="text-xs text-blue-600">**{selectedDoctor.specialization}** | Regular Hours: {selectedDoctor.start_time} - {selectedDoctor.end_time}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-slate-700 mb-6 border-b border-gray-100 pb-3">2. Choose Time Slot</h2>
          {loading ? (
            <p className="text-center text-blue-600 font-semibold my-10 animate-pulse">Loading available slots...</p>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setForm({ ...form, slot_id: slot.id })}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                    form.slot_id == slot.id ? "bg-blue-600 text-white border-blue-700" : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm">No slots available. Select doctor and date.</p>
          )}
          <button
            onClick={submitBooking}
            disabled={loading}
            className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </>
  );
}
