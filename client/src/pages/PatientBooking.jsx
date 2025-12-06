import { useEffect, useState } from "react";
import axios from "axios";

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

  // Load all doctors
  useEffect(() => {
    axios.get("http://localhost:5000/api/doctors").then((res) => {
      setDoctors(res.data);
    });
  }, []);

  // Generate & fetch slots
  const fetchSlots = async (doctor_id, date) => {
    if (!doctor_id || !date) return;

    // Generate slots if not present
    await axios.post("http://localhost:5000/api/doctor/generate-slots", {
      doctor_id,
      date
    });

    // Fetch available slots
    const res = await axios.get(
      `http://localhost:5000/api/doctor/${doctor_id}/timeslots/${date}`
    );
    setSlots(res.data);
  };

  const submitBooking = async () => {
    if (!form.slot_id) return alert("Please select a time slot!");

    const res = await axios.post("http://localhost:5000/api/book/slot", {
      doctor_id: form.doctor_id,
      slot_id: form.slot_id,
      patient_name: form.name,
      patient_age: form.age,
      patient_email: form.email,
      patient_phone: form.phone
    });

    alert(
      `Appointment Booked!\nAppointment ID: ${res.data.appointment_id}\nTime: ${res.data.appointment_time}`
    );

    // Reset form
    setForm({ ...form, slot_id: "" });
    setSlots([]);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>

      <input
        className="border p-3 w-full mb-4"
        placeholder="Patient Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border p-3 w-full mb-4"
        placeholder="Age"
        type="number"
        value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })}
      />

      {/* Email */}
      <input
        className="border p-3 w-full mb-4"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {/* Phone */}
      <input
        className="border p-3 w-full mb-4"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <select
        className="border p-3 w-full mb-4"
        value={form.doctor_id}
        onChange={(e) => {
          setForm({ ...form, doctor_id: e.target.value, slot_id: "" });
          fetchSlots(e.target.value, form.date);
        }}
      >
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.doctor_id} value={d.doctor_id}>
            {d.name} — {d.specialization}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="border p-3 w-full mb-4"
        min={new Date().toISOString().split("T")[0]}
        value={form.date}
        onChange={(e) => {
          setForm({ ...form, date: e.target.value, slot_id: "" });
          fetchSlots(form.doctor_id, e.target.value);
        }}
      />

      {slots.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Available Time Slots</h2>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setForm({ ...form, slot_id: slot.id })}
                className={`p-2 border rounded ${
                  form.slot_id === slot.id
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {slot.display_time || slot.time} ({slot.date})
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={submitBooking}
        className="bg-blue-600 mt-6 p-3 rounded text-white w-full"
      >
        Confirm Booking
      </button>
    </div>
  );
}
