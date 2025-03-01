import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import Registration from "./pages/Registration"
import Dashboard from "./pages/Dashboard";
function App() {
  
  const isLoggedIn = localStorage.getItem('token');
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/register" />} />
        <Route path="/register" element={<Registration />} />
        
        
        

        
        {/*Protected Routes*/}
        <Route 
              path="/dashboard" 
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/register" />} 
        />




      </Routes>
      <Toaster />
    </Router>
  )
}

export default App

