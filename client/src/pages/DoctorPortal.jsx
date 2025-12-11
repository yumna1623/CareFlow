import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper components (assuming Tailwind CSS context)
const Icon = ({ name, className = "w-5 h-5" }) => {
  // A simplified component to represent a professional icon (using standard SVG paths or Font Awesome/Heroicons names)
  const icons = {
    // Dashboard Icons
    calendar:
      "M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h12v4H6V4zm0 6h12v8H6v-8z",
    time: "M12 8v4l3 3m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z",
    logout:
      "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-4a3 3 0 013-3h7",
    hospital:
      "M20 6H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zM4 8h16v10H4V8zm4 4v-2h2v2h2v-2h2v2h2v-2h-2V10h-2V8h-2v2h-2V8h-2v2h-2v2h2zm4 0h-2v2h2v-2z",
    check: "M5 13l4 4L19 7",
    waiting: "M10 18a8 8 0 100-16 8 8 0 000 16zM10 14V8",
    total:
      "M12 6.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V6.75zM8.25 10.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V10.5zM15.75 8.25a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v9a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-9z",
    queue:
      "M19 11a1 1 0 011 1v1a1 1 0 01-1 1h-1v-2h1zM5 11a1 1 0 01-1 1v1a1 1 0 011 1h1v-2H5zm14-4a1 1 0 011 1v1a1 1 0 01-1 1h-1V7h1zM5 7a1 1 0 01-1 1v1a1 1 0 011 1h1V7H5zm10 0a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V8a1 1 0 011-1h4zM9 11h6v2H9v-2z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    // Login Icons
    mail: "M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM4 6l8 5 8-5",
    lock: "M12 11c-1.657 0-3 1.343-3 3v2h6v-2c0-1.657-1.343-3-3-3zM7 9a5 5 0 0110 0v2H7V9z",
  };

  const d = icons[name] || icons.info;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
};

const API = "http://localhost:5000/api";

function formatDate(date) {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}

// DoctorLoginRegister component remains the same for consistency.
function DoctorLoginRegister({ setAuth, setUserType }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) {
        if (formData.secret_key !== "1994") {
    alert("❌ Invalid secret key! Please contact management.");
    setLoading(false);
    return;
        }
        const data = {
          ...formData,
          start_time: formData.start_time || "09:00 AM",
          end_time: formData.end_time || "05:00 PM",
          slot_duration: formData.slot_duration || 15,
        };
        await axios.post(`${API}/doctor/register`, data);
        alert("✓ Registered! Please login now.");
        setIsLogin(true);
        setFormData({});
      } else {
        const res = await axios.post(`${API}/doctor/login`, formData);
        localStorage.setItem("docToken", res.data.token);
        setAuth(res.data.user);
        setUserType("doctor");
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.error || "An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding (Professional, Monochromatic Blue) */}
      <div className="w-1/2 bg-blue-800 p-16 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-white/10 p-3 rounded-full">
              <Icon name="hospital" className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                CareFlow
              </h1>
              <p className="text-sm opacity-70">Clinic Management System</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-6 leading-snug">
            Centralized Platform for Seamless Operations
          </h2>
          <p className="text-lg opacity-80 mb-12">
            Gain comprehensive oversight of your appointments, patient flow, and
            practice metrics in real-time.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 p-5 rounded-lg border border-white/20">
              <p className="text-3xl font-extrabold mb-1">500+</p>
              <p className="text-sm opacity-80">Clinics Served</p>
            </div>
            <div className="bg-white/10 p-5 rounded-lg border border-white/20">
              <p className="text-3xl font-extrabold mb-1">99.9%</p>
              <p className="text-sm opacity-80">Guaranteed Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (Clean, Minimal) */}
      <div className="w-1/2 p-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-2xl border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? "Doctor Login" : "Doctor Registration"}
          </h2>
          <p className="text-gray-500 mb-8">
            {isLogin
              ? "Access your professional dashboard."
              : "Set up your clinic account."}
          </p>

          {/* Form Tabs */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 font-semibold transition text-lg ${
                isLogin
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 font-semibold transition text-lg ${
                !isLogin
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <Icon
                      name="user"
                      className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                    />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Dr. John Doe"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter management secret key"
                    onChange={(e) =>
                      setFormData({ ...formData, secret_key: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Specialization
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Cardiology"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Icon
                  name="mail"
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  type="email"
                  placeholder="doctor@careflow.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  type="password"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-8 text-lg shadow-lg shadow-blue-200/50"
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In to Dashboard"
                : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function DoctorDashboard({ auth, setAuth }) {
  const [appointments, setAppointments] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [activeSection, setActiveSection] = useState("dashboard");

  const fetchAppointments = async () => {
    try {
      const url = `${API}/doctor/appointments/${auth.doctor_id}?target_date=${selectedDate}`;
      const res = await axios.get(url);
      setAppointments(res.data.allAppointments || []);
      setDoctorDetails(res.data.doctor || {});
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    }
  };

  const completeAppointment = async (id) => {
    try {
      await axios.put(`${API}/complete/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error("Error completing appointment:", err);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      await axios.delete(`${API}/appointment/${id}`);
      fetchAppointments(); // refresh list after deletion
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert(err.response?.data?.error || "Failed to delete appointment");
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 15000);
    return () => clearInterval(interval);
  }, [auth, selectedDate]);

  const nowServing = appointments.find((a) => a.status === "scheduled");
  const waitingList = appointments.filter(
    (a) =>
      a.status === "scheduled" &&
      a.appointment_id !== nowServing?.appointment_id
  );
  const completedList = appointments.filter((a) => a.status === "completed");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 shadow-xl flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <Icon name="hospital" className="w-8 h-8 text-white" />
            <h1 className="text-xl font-extrabold text-white tracking-wide">
              CareFlow
            </h1>
          </div>
          <div className="bg-blue-900 p-4 rounded-lg mb-8 text-white">
            <p className="font-semibold text-lg">Dr. {auth.name}</p>
            <p className="text-sm opacity-80">{auth.specialization}</p>
          </div>
          <nav className="space-y-2">
            <SidebarLink
              icon="total"
              label="Dashboard"
              isActive={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
            />
            <SidebarLink
              icon="calendar"
              label="Schedule"
              isActive={activeSection === "schedule"}
              onClick={() => setActiveSection("schedule")}
            />
          </nav>
        </div>

        {/* Sidebar Buttons */}
        <div className="space-y-3 mt-6">
          {/* Sign Out Button */}
          <button
            onClick={() => {
              localStorage.removeItem("docToken");
              setAuth(null);
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow-md hover:bg-blue-50 hover:shadow-lg transition"
          >
            <Icon name="logout" className="w-5 h-5" />
            Sign Out
          </button>

          {/* Delete Account Button */}
          <button
            onClick={async () => {
              if (
                !window.confirm("Are you sure? This will delete your account!")
              )
                return;
              const token = localStorage.getItem("docToken");
              try {
                await axios.delete(`${API}/doctor/me`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                localStorage.removeItem("docToken");
                setAuth(null);
                alert("Account deleted successfully.");
              } catch (err) {
                alert("Error deleting account: " + err.response?.data?.error);
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 hover:shadow-lg transition"
          >
            <Icon name="user" className="w-5 h-5" />{" "}
            {/* or choose a trash/delete icon if you prefer */}
            Delete Account
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Appointments Dashboard
        </h2>

        {/* Date & Hours */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Icon name="calendar" className="w-7 h-7 text-blue-600" />
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Viewing Appointments For
                </p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <Icon name="time" className="w-7 h-7 text-blue-600" />
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Clinic Hours
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {doctorDetails.start_time || "N/A"} -{" "}
                  {doctorDetails.end_time || "N/A"}
                </p>
                <p className="text-gray-500 text-xs">
                  Slot Duration: {doctorDetails.slot_duration || 15} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon="total"
            color="blue"
          />
          <StatCard
            title="Now Serving"
            value={nowServing ? "1" : "0"}
            icon="check"
            color="green"
          />
          <StatCard
            title="Waiting Queue"
            value={waitingList.length}
            icon="queue"
            color="orange"
          />
          <StatCard
            title="Completed Today"
            value={completedList.length}
            icon="check"
            color="indigo"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Now Serving */}
          <div className="col-span-2">
            {nowServing ? (
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-green-600 p-6 text-white flex justify-between items-center">
                  <p className="text-xl font-bold flex items-center gap-2">
                    <Icon name="user" className="w-6 h-6" />
                    CURRENT PATIENT
                  </p>
                  <p className="text-lg font-medium">{nowServing.slot_time}</p>
                </div>
                <div className="p-8">
                  <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
                    {nowServing.patient_name}
                  </h2>
                  <div className="flex justify-between items-center">
                    <div className="text-xl text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold text-gray-800">
                          Queue Number:
                        </span>{" "}
                        {nowServing.queue_number}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">
                          Age:
                        </span>{" "}
                        {nowServing.patient_age || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        completeAppointment(nowServing.appointment_id)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-bold text-lg transition shadow-xl shadow-blue-200/50 flex items-center gap-2"
                    >
                      <Icon name="check" className="w-6 h-6" />
                      Complete & Call Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-xl p-12 text-center border border-gray-200">
                <Icon
                  name="info"
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                />
                <p className="text-gray-500 text-xl font-medium">
                  {appointments.length === 0
                    ? "No appointments scheduled for this date."
                    : "All scheduled patients have been served."}
                </p>
              </div>
            )}
          </div>

          {/* Waiting & Completed Lists */}
          <div className="space-y-8">
            {/* Waiting List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-xl text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                <Icon name="waiting" className="w-5 h-5 text-orange-600" />
                Waiting Queue ({waitingList.length})
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {waitingList.length > 0 ? (
                  waitingList.map((p) => (
                    <div
                      key={p.appointment_id}
                      className="bg-orange-50 p-4 rounded-lg border border-orange-200 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-orange-700 text-lg flex justify-between items-center">
                          {p.slot_time}
                          <span className="text-sm bg-orange-200 px-2 py-0.5 rounded-full font-extrabold">
                            Q: {p.queue_number}
                          </span>
                        </p>
                        <p className="text-base text-gray-700 mt-1 font-medium">
                          {p.patient_name}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAppointment(p.appointment_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">
                    The waiting list is empty.
                  </p>
                )}
              </div>
            </div>

            {/* Completed List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-xl text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                <Icon name="check" className="w-5 h-5 text-indigo-600" />
                Completed Appointments
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {completedList.length > 0 ? (
                  completedList.map((p) => (
                    <div
                      key={p.appointment_id}
                      className="text-sm text-gray-700 pb-2 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                    >
                      <span>
                        <span className="font-semibold text-gray-900">
                          {p.slot_time}
                        </span>{" "}
                        - {p.patient_name}
                      </span>
                      <button
                        onClick={() => deleteAppointment(p.appointment_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold transition"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-2">
                    No appointments completed yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Component for Sidebar Links
const SidebarLink = ({ icon, label, isActive, onClick }) => {
  const activeClasses = "bg-blue-700 text-white shadow-md";
  const inactiveClasses = "text-blue-200 hover:bg-blue-700/50 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      <Icon name={icon} className="w-5 h-5" />
      {label}
    </button>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "border-blue-600 text-blue-600 bg-blue-50",
    green: "border-green-600 text-green-600 bg-green-50",
    orange: "border-orange-600 text-orange-600 bg-orange-50",
    indigo: "border-indigo-600 text-indigo-600 bg-indigo-50",
  };
  const classes =
    colorClasses[color] || "border-gray-500 text-gray-600 bg-white";

  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${classes}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase text-gray-500">{title}</p>
        <Icon name={icon} className={`w-6 h-6 ${classes.split(" ")[2]}`} />
      </div>
      <p className="text-4xl font-extrabold text-gray-800 mt-2">{value}</p>
    </div>
  );
};

export default function DoctorPortal() {
  const [auth, setAuth] = useState(null);
  const [userType, setUserType] = useState("doctor");

  useEffect(() => {
    const token = localStorage.getItem("docToken");
    if (token && !auth) {
      axios
        .get(`${API}/doctor/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setAuth(res.data.doctor);
          setUserType("doctor");
        })
        .catch(() => localStorage.removeItem("docToken"));
    }
  }, [auth]);

  return auth ? (
    <DoctorDashboard auth={auth} setAuth={setAuth} />
  ) : (
    <DoctorLoginRegister setAuth={setAuth} setUserType={setUserType} />
  );
}
