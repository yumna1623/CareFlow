import { Link } from "react-router-dom";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.webp";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Navigation Bar */}
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-2 rounded-xl shadow-md">
              <span className="text-xl font-bold">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">CareFlow</h1>
              <p className="text-xs text-gray-500">Intelligent Healthcare Management</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-semibold transition duration-200">Features</a>
            <a href="#case-study" className="text-gray-600 hover:text-indigo-600 font-semibold transition duration-200">Case Study</a>
            <Link to="/track" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition duration-300 shadow-md shadow-indigo-300/50">
              Track Status
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-24 px-6 relative overflow-hidden bg-gray-50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-20 -z-10 animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">TRANSFORMING PATIENT CARE</p>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
                Intelligent Clinic <br />
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Management System
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                CareFlow is a digital hospital appointment tracker that reduces waiting times, optimizes schedules, and ensures full transparency for patients and doctors.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link to="/book" className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-xl shadow-indigo-500/50 hover:shadow-indigo-500/80 transition duration-300 transform hover:scale-[1.02]">
                  📅 Book Appointment
                </Link>
                <Link to="/doctor" className="inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition duration-300 shadow-md hover:shadow-lg">
                  👨‍⚕️ Doctor Portal
                </Link>
              </div>
            </div>
            <div className="relative p-6 bg-white rounded-3xl shadow-2xl shadow-blue-200/50 border border-gray-100 transform hover:scale-[1.01] transition duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl -z-10"></div>
              <div className="mt-6 bg-gray-100 h-60 rounded-xl p-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                <img src={img2} alt="Dashboard visualization" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Core Features of CareFlow</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">We empower clinics and patients with tools that prioritize efficiency, security, and convenience.</p>
        </div>
        {/* Feature grid can go here */}
      </div>

      {/* Case Study Section */}
<div id="case-study" className="relative py-20 px-6 bg-gray-50 overflow-hidden">
  {/* Background flowing lines */}
  <div className="absolute top-0 left-0 w-full h-full -z-10">
    <div className="absolute w-[200%] h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-30 animate-flowing-lines" style={{ top: '20%' }}></div>
    <div className="absolute w-[200%] h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 animate-flowing-lines animation-delay-2000" style={{ top: '40%' }}></div>
    <div className="absolute w-[200%] h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-25 animate-flowing-lines animation-delay-4000" style={{ top: '60%' }}></div>
  </div>

  <div className="max-w-7xl mx-auto relative">
    <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Case Study: CareFlow – Smart Hospital Appointment Tracker</h2>

    {/* Project Overview */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">Project Overview</h3>
        <p className="text-gray-600">CareFlow allows doctors to set their availability, and patients can book slots without waiting in physical queues. It ensures transparency by showing the patient’s position in the queue, estimated waiting time, and consultation order. Built with React, Node.js, and MySQL.</p>
      </div>
      <div className="flex justify-center">
        <img src={img1} alt="Doctor consulting patient" className="rounded-3xl shadow-xl object-cover w-full h-72" />
      </div>
    </div>

    {/* Interactive Cards: Problem, Objectives, Workflow, Benefits */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Problem Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer">
        <h4 className="font-bold text-lg text-blue-600 mb-2">Problem Statement</h4>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          <li>Patients spend hours waiting in queues with no visibility.</li>
          <li>Doctors face overlapping appointments.</li>
          <li>Manual scheduling lacks real-time updates.</li>
        </ul>
      </div>

      {/* Objectives Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer">
        <h4 className="font-bold text-lg text-green-600 mb-2">Objectives</h4>
        <ul className="list-decimal list-inside text-gray-600 text-sm space-y-1">
          <li>Doctor portal for schedule management.</li>
          <li>Patient booking & queue view.</li>
          <li>Track real-time queue status.</li>
          <li>Prevent double-booking.</li>
          <li>Improve transparency & satisfaction.</li>
        </ul>
      </div>

      {/* Workflow Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer">
        <h4 className="font-bold text-lg text-purple-600 mb-2">Workflow</h4>
        <ol className="list-decimal list-inside text-gray-600 text-sm space-y-1">
          <li>Doctor registers & sets availability.</li>
          <li>Patient selects doctor & slot.</li>
          <li>Appointment confirmed & queue assigned.</li>
          <li>Patient dashboard shows queue info.</li>
          <li>Queue updates automatically.</li>
        </ol>
      </div>

      {/* Benefits Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer">
        <h4 className="font-bold text-lg text-indigo-600 mb-2">Benefits</h4>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          <li>Patients: No long queues & transparency.</li>
          <li>Doctors: Better schedule & real-time visibility.</li>
          <li>Hospitals: Efficiency & digital records.</li>
        </ul>
      </div>
    </div>

    {/* Dashboard Visualization */}
    
  </div>

  {/* Custom CSS Animations */}
  <style>
    {`
      @keyframes flowing-lines {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(50%); }
      }
      .animate-flowing-lines {
        animation: flowing-lines 15s linear infinite;
      }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
    `}
  </style>
</div>


      {/* CTA Section */}
      <div className="py-20 px-6 bg-gray-900 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-5 bg-gradient-to-r from-blue-400 to-cyan-200 bg-clip-text text-transparent">Start Your Flow Today</h2>
        <p className="text-lg mb-8 text-gray-300">Experience the difference modern, intelligent healthcare management makes for your next visit.</p>
        <Link to="/book" className="inline-flex items-center justify-center bg-white text-indigo-600 px-10 py-3.5 rounded-xl font-extrabold text-xl shadow-2xl shadow-indigo-300/30 hover:shadow-indigo-300/60 transition duration-300 transform hover:scale-105">
          Book Now <span className="ml-3 text-xl">→</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-1.5 rounded-xl">
                <span className="text-xl font-bold">🏥</span>
              </div>
              <h1 className="text-xl font-extrabold text-white">CareFlow</h1>
            </div>
            <p className="text-xs text-gray-400 max-w-xs">Intelligent solutions for tomorrow's healthcare facilities.</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
          <p>&copy; 2024 CareFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
