import { Link } from "react-router-dom";

// 1. Import the images from the specified path (src/assets)
// Assuming the images are named img1.png/jpg and img2.png/jpg
// Adjust the extensions (.png, .jpg, etc.) if necessary. I'll use .png as a common example.
import img1 from "../assets/img1.jpg"
import img2 from "../assets/img2.webp"

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
            <a href="#about" className="text-gray-600 hover:text-indigo-600 font-semibold transition duration-200">About Us</a>
            <Link
              to="/track"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition duration-300 shadow-md shadow-indigo-300/50"
            >
              Track Status
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-24 px-6 relative overflow-hidden bg-gray-50">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-20 -z-10 animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Main Headline */}
              <div>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">TRANSFORMING PATIENT CARE</p>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
                  Intelligent Clinic <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    Management System
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                  CareFlow delivers enterprise-grade solutions to streamline patient flow, reduce unnecessary wait times, and elevate the entire patient experience.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-xl shadow-indigo-500/50 hover:shadow-indigo-500/80 transition duration-300 transform hover:scale-[1.02]"
                >
                  📅 Book Appointment
                </Link>
                <Link
                  to="/doctor"
                  className="inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition duration-300 shadow-md hover:shadow-lg"
                >
                  👨‍⚕️ Doctor Portal
                </Link>
              </div>
            </div>

            {/* Right Content - Visual Mockup/Stats */}
            <div className="relative p-6 bg-white rounded-3xl shadow-2xl shadow-blue-200/50 border border-gray-100 transform hover:scale-[1.01] transition duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl -z-10"></div>
              
              {/* Trust Indicators - REDUCED SIZE */}
              <div className="grid grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-indigo-500">
                  <p className="text-3xl font-bold text-indigo-600 mb-1">500+</p>
                  <p className="text-sm text-gray-500 font-semibold">Partner Clinics</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-green-500">
                  <p className="text-3xl font-bold text-green-600 mb-1">1000+</p>
                  <p className="text-sm text-gray-500 font-semibold">Expert Doctors</p>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-purple-500">
                  <p className="text-3xl font-bold text-purple-600 mb-1">99.9%</p>
                  <p className="text-sm text-gray-500 font-semibold">System Uptime</p>
                </div>
              </div>

              {/* Placeholder Chart/Image - REPLACED WITH img1 */}
              <div className="mt-6 bg-gray-100 h-60 rounded-xl p-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                <img 
                  src={img2} 
                  alt="A digital dashboard showing clinic workflow optimization and reduced wait times" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Features Section (No changes needed) */}
      <div id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Core Features of CareFlow</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We empower clinics and patients with tools that prioritize efficiency, security, and convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Seamless Booking */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
              <div className="bg-indigo-100 text-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5">
                🗓️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Book appointments 24/7 with real-time slot availability checked against doctor schedules.</p>
            </div>

            {/* Feature 2: Real-time Status */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
              <div className="bg-cyan-100 text-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5">
                ⏱️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Queue Tracking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Patients receive a unique ID to monitor their exact position in the queue, eliminating waiting room anxiety.</p>
            </div>

            {/* Feature 3: Expert Network */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
              <div className="bg-purple-100 text-purple-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5">
                👨‍⚕️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Specialist Access</h3>
              <p className="text-gray-600 text-sm leading-relaxed">A curated network of highly-qualified specialists across all major medical disciplines.</p>
            </div>

            {/* Feature 4: Smart Notifications */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
              <div className="bg-orange-100 text-orange-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5">
                🔔
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proactive Alerts</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Automated SMS/Email reminders and delay notifications keep patients informed every step of the way.</p>
            </div>

            {/* Feature 5: Data Security */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
              <div className="bg-red-100 text-red-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5">
                🔒
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">HIPAA/GDPR Compliant</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Industry-leading encryption and security protocols protect sensitive patient and provider data.</p>
            </div>

            {/* Feature 6: Doctor Portal */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5">
              <div className="bg-green-100 text-green-600 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5">
                💻
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Intuitive Doctor Dashboard</h3>
              <p className="text-gray-600 text-sm leading-relaxed">A powerful interface for doctors to manage queues, patient records, and update appointment statuses in real-time.</p>
            </div>
          </div>
        </div>
      </div>
      
      <hr className="border-gray-100" />

      {/* About Section (Updated Visual) */}
      <div id="about" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Block - Placeholder for a professional image - REPLACED WITH img2 */}
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl h-80 shadow-xl shadow-blue-100/50 flex items-center justify-center overflow-hidden">
                <img 
                  src={img1} 
                  alt="A doctor consulting a patient in a modern clinic" 
                  className="w-full h-full object-cover rounded-3xl"
                />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-gray-900">Our Vision: Healthcare, Simplified</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                **CareFlow** was founded on the belief that healthcare should be **accessible, efficient, and stress-free**. We are committed to using technology to eliminate the friction points of traditional clinic visits.
              </p>
              <div className="space-y-4 pt-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl text-indigo-600 font-bold flex-shrink-0">✓</span>
                  <div>
                    <p className="font-bold text-gray-900">Commitment to Innovation</p>
                    <p className="text-gray-600 text-sm">Continuously improving our platform with the latest AI and scheduling technology.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl text-indigo-600 font-bold flex-shrink-0">✓</span>
                  <div>
                    <p className="font-bold text-gray-900">Patient-Centric Approach</p>
                    <p className="text-gray-600 text-sm">Every feature is designed to put the patient experience first, starting with eliminating wait times.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section (Refined) */}
      <div className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-5 bg-gradient-to-r from-blue-400 to-cyan-200 bg-clip-text text-transparent">Start Your Flow Today</h2>
          <p className="text-lg mb-8 text-gray-300">Experience the difference modern, intelligent healthcare management makes for your next visit.</p>
          <Link
            to="/book"
            className="inline-flex items-center justify-center bg-white text-indigo-600 px-10 py-3.5 rounded-xl font-extrabold text-xl shadow-2xl shadow-indigo-300/30 hover:shadow-indigo-300/60 transition duration-300 transform hover:scale-105"
          >
            Book Now <span className="ml-3 text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Logo/Brand Column */}
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-1.5 rounded-xl">
                        <span className="text-xl font-bold">🏥</span>
                    </div>
                    <h1 className="text-xl font-extrabold text-white">CareFlow</h1>
                </div>
                <p className="text-xs text-gray-400 max-w-xs">Intelligent solutions for tomorrow's healthcare facilities.</p>
            </div>

            {/* Links Columns */}
            <div>
                <p className="font-bold text-base text-white mb-3">Product</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#features" className="hover:text-indigo-400 transition">Features</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Pricing</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Security</a></li>
                </ul>
            </div>
            <div>
                <p className="font-bold text-base text-white mb-3">Company</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#about" className="hover:text-indigo-400 transition">About Us</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Careers</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Media Kit</a></li>
                </ul>
            </div>
            <div>
                <p className="font-bold text-base text-white mb-3">Support</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-indigo-400 transition">Help Center</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Contact Sales</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">System Status</a></li>
                </ul>
            </div>
            <div>
                <p className="font-bold text-base text-white mb-3">Legal</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-indigo-400 transition">Cookie Policy</a></li>
                </ul>
            </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
          <p>&copy; 2024 CareFlow. All rights reserved. Built with modern healthcare in mind.</p>
        </div>
      </footer>
    </div>
  );
}