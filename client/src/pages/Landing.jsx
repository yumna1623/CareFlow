import { ChevronRight, Clock, Users, Shield, Zap, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        @keyframes flowRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flowLeft {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-flow-right {
          animation: flowRight 20s linear infinite;
        }
        .animate-flow-left {
          animation: flowLeft 25s linear infinite;
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-lg">
              <span className="text-lg font-bold">⚕️</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">CareFlow</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">Features</a>
            <a href="#case-study" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">Case Study</a>
            <a href="/track" className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
              Track Status
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 -z-10"></div>
        
        {/* Animated Lines */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40 animate-flow-right"></div>
          <div className="absolute top-1/3 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 animate-flow-left"></div>
          <div className="absolute top-1/2 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40 animate-flow-right"></div>
          <div className="absolute top-2/3 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-flow-left"></div>
          <div className="absolute top-3/4 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40 animate-flow-right"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] mb-4">Digital Healthcare</p>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Smart Appointment <span className="text-blue-600">Management</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  Eliminate waiting times with intelligent scheduling. Real-time queue tracking, instant booking, and transparent patient communication.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/book" className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition group shadow-lg shadow-blue-600/30">
                  Book Appointment <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
                </a>
                <a href="/doctor" className="inline-flex items-center justify-center bg-gray-100 text-gray-900 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-200 transition">
                  Doctor Portal
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">500+</p>
                  <p className="text-xs text-gray-500 mt-1">Active Clinics</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">1000+</p>
                  <p className="text-xs text-gray-500 mt-1">Doctors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">99.9%</p>
                  <p className="text-xs text-gray-500 mt-1">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-400/5 rounded-2xl blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-xl">
                <div className="space-y-6">
                  {[
                    { icon: Clock, label: "Smart Scheduling", desc: "AI-powered optimization" },
                    { icon: Users, label: "Queue Management", desc: "Real-time tracking" },
                    { icon: Shield, label: "HIPAA Compliant", desc: "Enterprise security" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-6 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-35 animate-flow-left"></div>
          <div className="absolute top-1/3 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 animate-flow-right"></div>
          <div className="absolute top-2/3 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-35 animate-flow-left"></div>
          <div className="absolute bottom-0 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-flow-right"></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] mb-3">Platform Features</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to optimize operations and enhance patient satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Instant Booking",
                desc: "24/7 appointment scheduling with real-time slot availability"
              },
              {
                icon: Users,
                title: "Queue Tracking",
                desc: "Live position updates eliminate waiting room anxiety"
              },
              {
                icon: Zap,
                title: "Smart Notifications",
                desc: "Automated reminders and delay alerts via SMS/Email"
              },
              {
                icon: TrendingUp,
                title: "Doctor Dashboard",
                desc: "Real-time queue management and patient insights"
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                desc: "HIPAA/GDPR encryption for sensitive patient data"
              },
              {
                icon: CheckCircle,
                title: "Performance Analytics",
                desc: "Data-driven insights to improve clinic operations"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study */}
      <div id="case-study" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-35 animate-flow-right"></div>
          <div className="absolute top-1/2 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 animate-flow-left"></div>
          <div className="absolute top-3/4 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-35 animate-flow-right"></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] mb-3">Case Study</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">CareFlow: Smart Hospital Appointment Tracker</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How we transformed healthcare delivery with intelligent scheduling and real-time transparency.
            </p>
          </div>

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">The Problem</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Waiting Times & Inefficiency</h3>
                <ul className="space-y-3">
                  {[
                    "Patients spend hours waiting with no visibility",
                    "Doctors manage overlapping appointments manually",
                    "Zero real-time updates on queue status",
                    "Double-booking and scheduling conflicts"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-red-500 font-bold mt-1">✕</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Our Solution</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Digital Management</h3>
                <ul className="space-y-3">
                  {[
                    "Real-time queue tracking with position updates",
                    "Automated smart scheduling & conflict prevention",
                    "Live doctor portal with appointment insights",
                    "Instant patient notifications & transparency"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Workflow */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-200 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { num: "1", label: "Doctor Setup", desc: "Register & set availability" },
                { num: "2", label: "Patient Books", desc: "Select doctor & time slot" },
                { num: "3", label: "Confirmation", desc: "Auto-assigned queue number" },
                { num: "4", label: "Track Live", desc: "Monitor queue position" },
                { num: "5", label: "Updates Real-time", desc: "Automatic status refresh" }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-white rounded-lg p-6 border border-blue-200 text-center h-full">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                      {step.num}
                    </div>
                    <p className="font-semibold text-gray-900 mb-2">{step.label}</p>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                  {idx < 4 && (
                    <ChevronRight className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "For Patients",
                benefits: ["No physical queues", "Real-time visibility", "Reduced anxiety", "Better experience"]
              },
              {
                title: "For Doctors",
                benefits: ["Optimized schedule", "Better planning", "Fewer conflicts", "Higher efficiency"]
              },
              {
                title: "For Hospitals",
                benefits: ["Digital records", "Better metrics", "Improved operations", "Happier patients"]
              }
            ].map((section, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900 mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[200%] h-1 bg-white/20 animate-flow-left"></div>
          <div className="absolute top-1/2 left-0 w-[200%] h-1 bg-white/15 animate-flow-right"></div>
          <div className="absolute top-3/4 left-0 w-[200%] h-1 bg-white/20 animate-flow-left"></div>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Start Improving Your Practice Today</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join 500+ clinics already using CareFlow to deliver exceptional patient experiences.
          </p>
          <a href="/book" className="inline-flex items-center bg-white text-blue-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg">
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold mb-2">CareFlow</h3>
            <p className="text-sm text-gray-400">Intelligent healthcare management for modern clinics.</p>
          </div>
          
          {[
            { title: "Product", links: ["Features", "Security", "Pricing"] },
            { title: "Company", links: ["About Us", "Blog", "Careers"] },
            { title: "Support", links: ["Help Center", "Contact", "Status"] },
            { title: "Legal", links: ["Privacy", "Terms", "Cookies"] }
          ].map((col, idx) => (
            <div key={idx}>
              <p className="font-semibold text-sm mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CareFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}