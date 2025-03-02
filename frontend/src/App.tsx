import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import Registration from "./pages/Registration"
import Dashboard from "./pages/Dashboard";
import CreateEmergencyCall from "./pages/CreateEmergencyCall";
import MedicalReportsPage from "./pages/MedicalReportsPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import MediChat from "./pages/MediChat";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

import XRayPage from "./pages/XRayPage";
import CTScanPage from "./pages/CTScanPage";

function App() {
  const token = localStorage.getItem('token');
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />


        <Route path="/xray" element={<XRayPage />} />
        <Route path="/ctscan" element={<CTScanPage />} />
        

        <Route path="/register" element={<Registration />} />
        <Route path="/create-emergency-call" element={<CreateEmergencyCall />} />
        <Route path="/medical-reports" element={<MedicalReportsPage />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/medi-chat" element={<MediChat />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App

