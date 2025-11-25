import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/App.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    displayName: '',
    phone: '',
    institutionName: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate passwords match
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  // Validate password length
  if (formData.password.length < 6) {
    toast.error('Password should be at least 6 characters');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.error('Please enter a valid email address');
    return;
  }

  setLoading(true);

  try {
    console.log('🚀 Starting registration process...');

    // Determine the correct display name based on user type
    let displayName = formData.displayName;
    
    if (formData.userType === 'institution') {
      displayName = formData.institutionName || formData.displayName || formData.email.split('@')[0];
    } else if (formData.userType === 'company') {
      displayName = formData.companyName || formData.displayName || formData.email.split('@')[0];
    } else if (formData.userType === 'student') {
      displayName = formData.displayName || formData.email.split('@')[0];
    }

    // Prepare user data for registration
    const userData = {
      userType: formData.userType,
      displayName: displayName,
      phone: formData.phone || '',
      institutionName: formData.institutionName || '',
      companyName: formData.companyName || ''
    };

    console.log('📤 Registration data:', {
      email: formData.email,
      userType: formData.userType,
      displayName: displayName
    });

    // Call the register function from AuthContext
    const result = await register(formData.email, formData.password, userData);
    
    console.log('✅ Registration successful:', result);

    // Show success message
    toast.success('Registration successful! Please check your email for verification.');

    // Redirect to verification page
    navigate('/verify-email', { 
      state: { 
        email: formData.email,
        displayName: displayName,
        from: 'registration'
      } 
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    let errorMessage = 'Failed to create account. Please try again.';
    
    // Handle specific error cases
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please login instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please check your email.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.response?.data?.error) {
      // Backend API error
      errorMessage = error.response.data.error;
    } else if (error.message) {
      // Generic error message
      errorMessage = error.message;
    }

    toast.error(errorMessage);

    // Log detailed error for debugging
    console.error('Detailed error:', {
      code: error.code,
      message: error.message,
      response: error.response?.data
    });

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="institution">Institution</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {formData.userType === 'institution' ? 'Institution Name' : 
               formData.userType === 'company' ? 'Company Name' : 'Full Name'}
            </label>
            <input
              type="text"
              name={formData.userType === 'institution' ? 'institutionName' : 
                    formData.userType === 'company' ? 'companyName' : 'displayName'}
              value={formData.userType === 'institution' ? formData.institutionName : 
                     formData.userType === 'company' ? formData.companyName : formData.displayName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;