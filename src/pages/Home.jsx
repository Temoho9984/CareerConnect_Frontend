import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const Home = () => {
  const { currentUser, userData } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Career Guidance & Employment Platform</h1>
          <p>Connecting students with higher education institutions and career opportunities in Lesotho</p>
          
          {!currentUser ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to={`/${userData?.userType}`} className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>For Students</h3>
              <p>Discover institutions, apply for courses, and find career opportunities</p>
            </div>
            
            <div className="feature-card">
              <h3>For Institutions</h3>
              <p>Manage courses, review applications, and connect with students</p>
            </div>
            
            <div className="feature-card">
              <h3>For Companies</h3>
              <p>Find qualified graduates and post job opportunities</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;