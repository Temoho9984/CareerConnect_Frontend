import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';
import Notifications from './Notifications';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          CareerConnect
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          
          {currentUser ? (
            <>
              <span className="nav-welcome">
                Welcome, {userData?.displayName || currentUser.email}
              </span>
              
              {userData?.userType === 'student' && (
                <Link to="/student" className="nav-link">Dashboard</Link>
              )}
              {userData?.userType === 'institution' && (
                <Link to="/institution" className="nav-link">Dashboard</Link>
              )}
              {userData?.userType === 'company' && (
                <Link to="/company" className="nav-link">Dashboard</Link>
              )}
              {userData?.userType === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}

              
              

              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;