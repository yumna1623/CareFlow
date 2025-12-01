import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="h-screen bg-gradient-to-r from-blue-500 to-cyan-500 flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold mb-4">CareFlow</h1>
      <p className="text-2xl mb-12">Digital Hospital Queue System</p>
      <div className="flex gap-6">
        <Link to="/book" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold shadow-lg hover:scale-105 transition">Patient Booking</Link>
        <Link to="/track" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition">Track Status</Link>
      </div>
      <Link to="/doctor" className="mt-12 text-blue-100 underline opacity-80 hover:opacity-100">Doctor Access</Link>
    </div>
  );
}