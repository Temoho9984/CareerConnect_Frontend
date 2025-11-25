import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  
  const { currentUser, userData, sendVerificationEmail, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from user data
    if (userData?.email) {
      setEmail(userData.email);
    } else if (currentUser?.email) {
      setEmail(currentUser.email);
    }

    // Check if user is already verified
    checkVerificationStatus();
  }, [currentUser, userData, location]);

  const checkVerificationStatus = async () => {
    if (!currentUser) return;

    try {
      await refreshUser();
      
      if (currentUser.emailVerified) {
        setVerified(true);
        setMessage('Your email has been verified successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          const userType = userData?.userType || 'student';
          navigate(`/${userType}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const resendVerification = async () => {
    if (!currentUser) return;

    setResendLoading(true);
    setMessage('');

    try {
      await sendVerificationEmail();
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
      console.error('Resend error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleContinue = async () => {
    if (verified) {
      const userType = userData?.userType || 'student';
      navigate(`/${userType}`);
    } else {
      await checkVerificationStatus();
      if (!currentUser.emailVerified) {
        setMessage('Please verify your email first. Check your inbox for the verification link.');
      }
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-icon">📧</div>
        
        <h1>Verify Your Email Address</h1>
        
        <p className="verification-text">
          We've sent a verification email to: <strong>{email}</strong>
        </p>
        
        <p className="verification-instructions">
          Please check your inbox and click the verification link to activate your account.
          <br />
          <strong>You must verify your email before you can login.</strong>
        </p>

        {message && (
          <div className={`verification-message ${verified ? 'success' : 'info'}`}>
            {message}
          </div>
        )}

        <div className="verification-actions">
          <button 
            onClick={resendVerification}
            disabled={resendLoading || verified}
            className="btn btn-secondary"
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>
          
          <button 
            onClick={handleContinue}
            className="btn btn-primary"
          >
            {verified ? 'Continue to Dashboard' : 'Check Verification Status'}
          </button>
        </div>

        <div className="verification-help">
          <p>Didn't receive the email?</p>
          <ul>
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try resending</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </div>

        {/* Development helper - show current verification status */}
        {process.env.NODE_ENV === 'development' && currentUser && (
          <div className="dev-info">
            <p><strong>Development Info:</strong></p>
            <p>Email Verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
            <p>User ID: {currentUser.uid}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;