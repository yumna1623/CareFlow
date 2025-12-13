import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import PatientBooking from "./pages/PatientBooking";
import PatientTracker from "./pages/PatientTracker";
import DoctorPortal from "./pages/DoctorPortal";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/book" element={<PatientBooking />} />
        <Route path="/track" element={<PatientTracker />} />
        <Route path="/doctor" element={<DoctorPortal />} />
      </Routes>
    </Router>
  );
}