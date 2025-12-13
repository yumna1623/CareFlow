import { useEffect, useState } from "react";
import axios from "axios";


const API = "http://localhost:5000/api";

/* -------------------- Reusable small UI pieces -------------------- */

const Icon = ({ name, className = "w-5 h-5" }) => {
  const svgs = {
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"></path>
        <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle>
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
        <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v5l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return svgs[name] || svgs.user;
};

const TextInput = ({ label, ...props }) => (
  <label className="block">
    <span className="text-xs text-gray-600 font-medium mb-1 inline-block">{label}</span>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
    />
  </label>
);
const Select = ({ label, children, ...props }) => (
  <label className="block">
    <span className="text-xs text-gray-600 font-medium mb-1 inline-block">{label}</span>
    <select
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
    >
      {children}
    </select>
  </label>
);

/* -------------------- Main Component -------------------- */

export default function PatientBookingProfessional() {
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState("booking"); // booking | doctors
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

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
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [bookingConfirm, setBookingConfirm] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    // fetch doctors
    let mounted = true;
    axios
      .get(`${API}/doctors`)
      .then((res) => {
        if (!mounted) return;
        setDoctors(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
      });
    return () => (mounted = false);
  }, []);

  // helper to get today's date for min
  const today = new Date().toISOString().split("T")[0];

  // fetch time slots (calls generate-slots then gets timeslots)
  const fetchSlots = async (doctor_id, date) => {
    if (!doctor_id || !date) return;
    setLoadingSlots(true);
    setSlots([]);
    setForm((p) => ({ ...p, slot_id: "" }));
    try {
      await axios.post(`${API}/doctor/generate-slots`, {
        doctor_id: parseInt(doctor_id),
        date,
      });
      const res = await axios.get(`${API}/doctor/${doctor_id}/timeslots/${date}`);
      // backend returns array where is_booked may be missing/false; keep original filter
      setSlots(Array.isArray(res.data) ? res.data.filter((s) => !s.is_booked) : res.data);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const submitBooking = async () => {
    // simple validation
    if (!form.name || !form.age || !form.phone || !form.email) {
      alert("Please fill all patient details.");
      return;
    }
    if (!form.doctor_id || !form.date || !form.slot_id) {
      alert("Select doctor, date and time slot.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await axios.post(`${API}/book/slot`, {
        doctor_id: parseInt(form.doctor_id),
        slot_id: parseInt(form.slot_id),
        patient_name: form.name,
        patient_age: parseInt(form.age) || null,
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
        doctor_name: selectedDoctor?.name || doctors.find(d => d.doctor_id == form.doctor_id)?.name,
        doctor_specialization: selectedDoctor?.specialization || doctors.find(d => d.doctor_id == form.doctor_id)?.specialization,
      });

      // reset form
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
      alert(err.response?.data?.error || "Booking failed.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  /* -------------------- filtered doctors list -------------------- */
  const filteredDoctors = doctors
    .filter((d) => (filter ? d.specialization === filter : true))
    .filter((d) => (search ? d.name.toLowerCase().includes(search.toLowerCase()) || (d.specialization || "").toLowerCase().includes(search.toLowerCase()) : true));

  /* -------------------- UI: Booking Confirmation -------------------- */
/* -------------------- UI: Booking Confirmation (Enhanced) -------------------- */
  if (bookingConfirm) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">

            {/* Confirmation Header Banner */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white flex items-center justify-center">
              <div className="text-center">
                {/* Checkmark Icon */}
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-sm uppercase tracking-widest font-medium opacity-90">Booking Successful</p>
                <h2 className="text-3xl font-extrabold mt-1">Your Appointment is Confirmed</h2>
              </div>
            </div>

            {/* Main Details Section */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Patient & Appointment Summary</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {/* Queue Number Card (Highlight) */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center col-span-1">
                    <p className="text-xs text-blue-600 uppercase font-medium tracking-wider">Your Queue Number</p>
                    <div className="text-4xl font-extrabold text-blue-700 mt-1">#{bookingConfirm.queue_number}</div>
                </div>

                {/* Patient Name */}
                <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Patient</p>
                  <div className="text-base font-semibold text-gray-900">{bookingConfirm.patient_name}</div>
                  <div className="text-sm text-gray-600">{bookingConfirm.patient_age} Years Old</div>
                </div>

                {/* Doctor Name */}
                <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Doctor</p>
                  <div className="text-base font-semibold text-gray-900">Dr. {bookingConfirm.doctor_name}</div>
                  <div className="text-sm text-blue-600">{bookingConfirm.doctor_specialization}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-6">
                {/* Date & Time Block */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <Icon name="calendar" className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-yellow-700 font-bold">Appointment Time</p>
                        <div className="text-lg font-extrabold text-gray-900 mt-1">{new Date(bookingConfirm.appointment_date).toLocaleDateString()}</div>
                        <div className="text-base font-medium text-gray-700">{bookingConfirm.appointment_time}</div>
                    </div>
                </div>

                {/* Appointment ID Block */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-100 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Unique Appointment ID</p>
                    <div className="font-mono text-sm text-gray-900 break-words bg-white p-2 rounded border border-dashed border-gray-300 flex justify-between items-center">
                        <span className="truncate">{bookingConfirm.appointment_id}</span>
                        <button 
                          onClick={() => copy(bookingConfirm.appointment_id)} 
                          className="ml-3 px-3 py-1 bg-white rounded-md text-xs font-medium text-blue-600 border border-blue-300 hover:bg-blue-100 transition flex-shrink-0"
                        >
                            Copy ID
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">Please keep this ID for check-in.</p>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 text-center py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
                onClick={() => {
                  // download simple text confirmation
                  const text = `Appointment ID: ${bookingConfirm.appointment_id}\nDate: ${bookingConfirm.appointment_date}\nTime: ${bookingConfirm.appointment_time}\nQueue: #${bookingConfirm.queue_number}\nDoctor: Dr. ${bookingConfirm.doctor_name}\nPatient: ${bookingConfirm.patient_name}\n\nNote: Please arrive 15 minutes early.`;
                  const el = document.createElement("a");
                  el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
                  el.setAttribute("download", `CareFlow_Appointment_${bookingConfirm.appointment_id}.txt`);
                  el.click();
                }}
              >
                Download Confirmation
              </button>
              <button
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                onClick={() => {
                  setBookingConfirm(null);
                  setView("booking");
                }}
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- Main UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">CareFlow — Book an Appointment</h1>
            <p className="mt-1 text-sm text-gray-600">
              Find specialists, choose a convenient time and get an instant appointment ID.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Need help?</p>
              <p className="text-sm font-medium text-gray-700">support@careflow.local</p>
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-700">Patient Portal</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Form */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Patient Details</h2>
              <div className="text-xs text-gray-500">All fields required</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Full name" placeholder="e.g. Aisha Khan" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <TextInput label="Age" type="number" min="0" placeholder="e.g. 28" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} />
              <TextInput label="Phone" placeholder="e.g. +92 300 0000000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <TextInput label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Select label="Doctor" value={form.doctor_id} onChange={(e) => {
                    const val = e.target.value;
                    setForm((p) => ({ ...p, doctor_id: val, slot_id: "" }));
                    const doc = doctors.find(d => d.doctor_id == val);
                    setSelectedDoctor(doc || null);
                    if (val && form.date) fetchSlots(val, form.date);
                  }}>
                  <option value="">Choose a doctor</option>
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      Dr. {d.name} — {d.specialization}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <TextInput label="Date" type="date" min={today} value={form.date} onChange={(e) => {
                  const date = e.target.value;
                  setForm((p) => ({ ...p, date, slot_id: "" }));
                  if (form.doctor_id) fetchSlots(form.doctor_id, date);
                }} />
              </div>

              <div>
                <Select label="Available slots" value={form.slot_id} onChange={(e) => setForm((p) => ({ ...p, slot_id: e.target.value }))}>
                  <option value="">{loadingSlots ? "Loading..." : "Select a slot"}</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>{s.display_time || s.time || s.time_24 || s}</option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedDoctor && (
              <div className="mt-6 p-4 rounded-lg border border-blue-100 bg-blue-50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon name="user" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-700 font-semibold">Dr. {selectedDoctor.name}</div>
                  <div className="text-xs text-gray-600">{selectedDoctor.specialization} • Hours: {selectedDoctor.start_time || "N/A"} - {selectedDoctor.end_time || "N/A"}</div>
                </div>
                <div className="ml-auto text-sm text-gray-500">Slot duration: {selectedDoctor.slot_duration || 15} min</div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitBooking}
                disabled={loadingSubmit || !form.name || !form.age || !form.phone || !form.email || !form.doctor_id || !form.date || !form.slot_id}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${loadingSubmit ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loadingSubmit ? "Booking..." : "Confirm Appointment"}
              </button>

              <button
                onClick={() => {
                  // clear patient form area quickly
                  setForm({ ...form, name: "", age: "", email: "", phone: "" });
                }}
                className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear details
              </button>
            </div>
          </div>

          {/* Right: Doctors Directory */}
          <aside className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Find a Specialist</h3>
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or specialty"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Icon name="search" className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Select label="Filter by specialization" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All specializations</option>
                {Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean))).map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {filteredDoctors.slice(0, 6).map((doc) => (
                <div key={doc.doctor_id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Icon name="user" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Dr. {doc.name}</div>
                    <div className="text-xs text-gray-500">{doc.specialization}</div>
                  </div>
                  <button
                    onClick={() => {
                      // quick select
                      setSelectedDoctor(doc);
                      setForm((p) => ({ ...p, doctor_id: doc.doctor_id, date: today, slot_id: "" }));
                      fetchSlots(doc.doctor_id, today);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm"
                  >
                    Select
                  </button>
                </div>
              ))}
              {filteredDoctors.length === 0 && <div className="text-xs text-gray-500">No results.</div>}
            </div>

            <div className="mt-6 text-xs text-gray-500">
              Tip: you can search by doctor's name or specialization and then pick a date to view available slots.
            </div>
          </aside>
        </div>

        {/* Directory full-page view (doctors) */}
        {view === "doctors" && (
          <div className="mt-10 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">All Doctors</h2>
              <div className="text-sm text-gray-500">Showing {filteredDoctors.length} results</div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc) => (
                <div key={doc.doctor_id} className="p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50">
                      <Icon name="user" className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">Dr. {doc.name}</div>
                      <div className="text-sm text-blue-600">{doc.specialization}</div>
                      <div className="text-xs text-gray-500 mt-2">Hours: {doc.start_time || "N/A"} - {doc.end_time || "N/A"}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setForm((p) => ({ ...p, doctor_id: doc.doctor_id, date: today, slot_id: "" }));
                        fetchSlots(doc.doctor_id, today);
                        setView("booking");
                      }}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                    >
                      Book
                    </button>
                    <button
                      onClick={() => alert(`Dr. ${doc.name}\nSpecialization: ${doc.specialization}`)}
                      className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
