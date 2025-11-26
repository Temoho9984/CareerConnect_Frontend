import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresVerification, setRequiresVerification] = useState(false);

  // Send email verification using Firebase Client SDK
  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user, {
        url: 'http://localhost:3000/login?verified=true',
        handleCodeInApp: true,
      });
      console.log('✅ Verification email sent to:', user.email);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  };

const register = async (email, password, userData) => {
  try {
    console.log('🚀 Starting registration process...');
    
    // Step 1: Create user in Firebase Auth (frontend only)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth user created:', user.uid);

    // Step 2: Send verification email
    await sendVerificationEmail(user);
    console.log('✅ Verification email sent');

    // Step 3: Prepare data for backend (Firestore only)
    const backendUserData = {
      uid: user.uid, // ← CRITICAL: Send the UID
      email: email,
      userType: userData.userType,
      displayName: userData.displayName,
      phone: userData.phone || '',
      institutionName: userData.institutionName || '',
      companyName: userData.companyName || ''
    };

    console.log('📤 Sending to backend:', backendUserData);

    // Step 4: Call backend to create Firestore document ONLY
    const backendResponse = await axios.post('https://career-connect-backend-chi.vercel.app/api/auth/register', backendUserData);
    
    console.log('✅ Backend registration successful:', backendResponse.data);

    return {
      user: user,
      backendData: backendResponse.data,
      success: true
    };

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already exists. Please use a different email or login.');
    }
    
    throw error;
  }
};

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        throw new Error('Please verify your email address before logging in.');
      }
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setRequiresVerification(false);
    return signOut(auth);
  };

  const fetchUserProfile = async (user) => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If profile doesn't exist, create a basic one
      if (error.response?.status === 404) {
        const basicProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          userType: 'student',
          emailVerified: user.emailVerified
        };
        setUserData(basicProfile);
      }
    }
  };

  // Check if user is verified and can access the app
  const checkEmailVerification = async (user) => {
    if (user) {
      await user.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser && !updatedUser.emailVerified) {
        setRequiresVerification(true);
        return false;
      }
      setRequiresVerification(false);
      return true;
    }
    return false;
  };

  // Force refresh to check email verification status
  const refreshUser = async () => {
    if (currentUser) {
      await currentUser.reload();
      await checkEmailVerification(currentUser);
      await fetchUserProfile(currentUser);
    }
  };

const refreshUserData = async () => {
  if (!currentUser) return;
  
  try {
    const token = await currentUser.getIdToken();
    const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUserData(response.data);
    console.log('✅ User data refreshed');
  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkEmailVerification(user);
        await fetchUserProfile(user);
      } else {
        setUserData(null);
        setRequiresVerification(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    requiresVerification,
    sendVerificationEmail: () => sendVerificationEmail(currentUser),
    register,
    login,
    logout,
    refreshUser,
    refreshUserData,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
