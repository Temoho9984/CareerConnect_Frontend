import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import EmailVerification from './pages/EmailVerification';
// Components
import Navbar from './components/Navbar';
import { JobProvider } from './context/JobContext'
import AdminDashboard from './pages/AdminDashboard'; 
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import CompanyDashboard from './pages/CompanyDashboard';

import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/institution" element={<InstitutionDashboard />} />
              <Route path="/company" element={<CompanyDashboard />} />
              <Route path="/verify-email" element={<EmailVerification />} />

              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </JobProvider>
    </AuthProvider>
  );
}

export default App;