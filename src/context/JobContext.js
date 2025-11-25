import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Fetch all active jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student's job applications
  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/job-applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply for job
  const applyForJob = async (jobId, coverLetter = '') => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.post('https://career-connect-backend-chi.vercel.app/api/job-applications/apply', 
        {
          jobId,
          coverLetter
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh applications list
      await fetchMyApplications();
      setError('');
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to apply for job';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Withdraw application
  const withdrawApplication = async (applicationId) => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      await axios.delete(`https://career-connect-backend-chi.vercel.app/api/job-applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to withdraw application';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchJobs();
      fetchMyApplications();
    }
  }, [currentUser]);

  const value = {
    jobs,
    applications,
    loading,
    error,
    fetchJobs,
    fetchMyApplications,
    applyForJob,
    withdrawApplication
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};