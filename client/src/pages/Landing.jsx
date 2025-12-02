import { Link } from "react-router-dom";

// Note: To fully replicate the image's background, you might need a custom
// Tailwind utility class for the flowing blue line or use an SVG/Image.
// This code uses positioned elements to simulate the soft, light-blue background and structure.

const StatBox = ({ value, label }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[180px] text-center">
    <p className="text-3xl font-bold text-blue-800">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const SpecialtyBox = ({ count, label }) => (
  <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-lg border-t-4 border-blue-500">
    {/* Icon placeholder (using a simple cross/plus for medical) */}
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-base font-semibold text-gray-700">
      <span className="font-extrabold text-blue-600">{count}</span> {label}
    </p>
  </div>
);


export default function Landing() {
  return (
    // Outer container: Simulating the light-blue, abstract background
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 flex flex-col items-center justify-center p-4">
      
      {/* Abstract Background Curve (Top Left/Center) - Mimicking the soft blue shape */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white rounded-full translate-x-[-40%] translate-y-[-40%] opacity-80"></div>
      
      {/* Abstract Background Curve (Bottom Right) */}
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-white rounded-full opacity-60"></div>

      {/* Main Content Container - Wider and positioned to the left side */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-12 px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* 1. Left Section: Text and Main Button (Mimics the focus of the image) */}
          <div className="text-left py-12">
            
            {/* Main Title - Large, bold, split across lines */}
            <h1 className="text-7xl md:text-8xl font-extrabold mb-4 text-gray-900 leading-none">
              SPITALUL TĂU, <br/> MEDICII TĂI.
            </h1>
            
            {/* Description Text - Directly translated/adapted from the image */}
            <p className="text-lg mb-8 text-gray-600 max-w-md">
              La Vessa Hospital, sănătatea ta este prioritatea noastră. Cu o echipă
              de experți dedicați și servicii medicale complete, ne adaptăm
              permanent pentru a răspunde nevoilor tale.
            </p>

            {/* Main Action Button (Book Appointment) */}
            <Link 
              to="/book" 
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-md font-semibold text-lg 
                         shadow-lg shadow-blue-400/50 hover:bg-blue-700 transition duration-300 transform"
            >
              Fă o programare
            </Link>

            {/* Doctor Access Portal (Subtle Link) - Our third required option */}
            <Link 
              to="/doctor" 
              className="mt-6 text-gray-500 text-sm hover:text-blue-700 underline transition duration-300 block w-fit"
            >
              Hospital/Doctor Access Portal
            </Link>

          </div>
          
          {/* 2. Right Section: Visual, Stat Boxes, and Tracking Link */}
          <div className="relative h-full min-h-[500px] flex flex-col justify-between items-end">
            
            {/* Top Right Stat Box (Positioned like the image) */}
            <div className="absolute top-0 right-0">
              <StatBox 
                value="+180" 
                label="Servicii medicale" 
              />
            </div>
            
            {/* Doctor Image Placeholder (Simulated by positioning and styling) */}
            <div className="w-full h-full absolute top-0 left-0">
              {/* 

[Image of a smiling male doctor in glasses and a white coat, pointing right]
 */}
              {/* In a real scenario, you'd place a high-quality image here */}
            </div>

            {/* Bottom Center Specialty Box (Positioned like the image) */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
              <SpecialtyBox 
                count="12" 
                label="Specialități medicale" 
              />
            </div>

             {/* Secondary Action (Track Status) - Placed near the doctor/stats as a secondary call-out */}
            <Link 
              to="/track" 
              className="absolute bottom-0 right-0 flex items-center justify-center bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-md font-semibold text-md 
                         shadow-md hover:bg-blue-50 hover:text-blue-700 transition duration-300 transform"
            >
              Track Status
            </Link>
          </div>

        </div>
        
      </div>
      
    </div>
  );
}