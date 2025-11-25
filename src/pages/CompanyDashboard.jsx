import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';
import '../styles/App.css';

const CompanyDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    qualifications: '',
    location: '',
    salaryRange: '',
    jobType: 'full-time',
    deadline: ''
  });

  // Fetch company's jobs
  const fetchJobs = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/companies/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data);
      console.log('✅ Loaded jobs:', response.data.length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Mock data for development
      setJobs([
        {
          id: 'job1',
          title: 'Software Developer',
          description: 'Looking for a skilled software developer...',
          location: 'Maseru',
          salaryRange: 'M15,000 - M20,000',
          jobType: 'full-time',
          deadline: '2024-12-31',
          postedAt: new Date()
        },
        {
          id: 'job2',
          title: 'Marketing Manager',
          description: 'Seeking experienced marketing professional...',
          location: 'Remote',
          salaryRange: 'M12,000 - M18,000',
          jobType: 'full-time',
          deadline: '2024-11-30',
          postedAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch qualified applicants for a job
  const fetchApplicants = async (jobId) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`http://localhost:5000/api/companies/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(response.data);
      setSelectedJob(jobId);
      setActiveTab('applicants');
      console.log('✅ Loaded applicants:', response.data.length);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      // Mock data for development
      setApplicants([
        {
          studentId: 'student1',
          studentName: 'John Doe',
          email: 'john@student.com',
          matchScore: 85,
          matchDetails: ['Academic transcripts verified', '3 relevant certificates'],
          transcripts: [{ fileName: 'transcript.pdf' }],
          certificates: [{ type: 'Programming Certificate' }]
        },
        {
          studentId: 'student2',
          studentName: 'Jane Smith',
          email: 'jane@student.com',
          matchScore: 78,
          matchDetails: ['Academic transcripts verified', '2 relevant certificates'],
          transcripts: [{ fileName: 'transcript.pdf' }],
          certificates: [{ type: 'Business Certificate' }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchJobs();
    }
  }, [currentUser, fetchJobs]);

  // Post new job
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split(',').map(req => req.trim()),
        qualifications: jobForm.qualifications.split(',').map(qual => qual.trim())
      };

      const response = await axios.post('http://localhost:5000/api/companies/jobs', jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Job posted successfully!');
      setShowJobForm(false);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        qualifications: '',
        location: '',
        salaryRange: '',
        jobType: 'full-time',
        deadline: ''
      });
      fetchJobs(); // Refresh jobs list
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job: ' + (error.response?.data?.error || error.message));
    }
  };

  // Contact applicant
  const contactApplicant = async (applicant) => {
    const emailSubject = `Interview Opportunity - ${jobs.find(j => j.id === selectedJob)?.title}`;
    const emailBody = `Dear ${applicant.studentName},\n\nWe were impressed by your profile and would like to invite you for an interview for the position.\n\nBest regards,\n${userData?.companyName || userData?.displayName}`;
    
    const mailtoLink = `mailto:${applicant.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
  };

  // Close job posting
  const closeJob = async (jobId) => {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`http://localhost:5000/api/companies/jobs/${jobId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Job closed successfully!');
      fetchJobs(); // Refresh jobs list
    } catch (error) {
      console.error('Error closing job:', error);
      alert('Error closing job: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['company']}>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Company Dashboard</h1>
          <p>Welcome, {userData?.companyName || userData?.displayName}!</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Job Postings
          </button>
          <button 
            className={`tab-button ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            Qualified Applicants
          </button>
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Company Profile
          </button>
        </div>

        <div className="dashboard-content">
          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="jobs-section">
              <div className="section-header">
                <h2>Job Postings</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowJobForm(true)}
                >
                  Post New Job
                </button>
              </div>

              {showJobForm && (
                <div className="form-modal">
                  <div className="modal-content">
                    <h3>Post New Job</h3>
                    <form onSubmit={handleJobSubmit}>
                      <div className="form-group">
                        <label>Job Title *</label>
                        <input
                          type="text"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Job Description *</label>
                        <textarea
                          value={jobForm.description}
                          onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                          rows="4"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Requirements (comma separated) *</label>
                        <input
                          type="text"
                          value={jobForm.requirements}
                          onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                          placeholder="e.g., JavaScript, React, Node.js"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Qualifications (comma separated) *</label>
                        <input
                          type="text"
                          value={jobForm.qualifications}
                          onChange={(e) => setJobForm({...jobForm, qualifications: e.target.value})}
                          placeholder="e.g., Bachelor's Degree, 2 years experience"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          value={jobForm.location}
                          onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Salary Range *</label>
                        <input
                          type="text"
                          value={jobForm.salaryRange}
                          onChange={(e) => setJobForm({...jobForm, salaryRange: e.target.value})}
                          placeholder="e.g., M15,000 - M20,000"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Job Type *</label>
                        <select
                          value={jobForm.jobType}
                          onChange={(e) => setJobForm({...jobForm, jobType: e.target.value})}
                          required
                        >
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                          <option value="remote">Remote</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Application Deadline *</label>
                        <input
                          type="date"
                          value={jobForm.deadline}
                          onChange={(e) => setJobForm({...jobForm, deadline: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Post Job</button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowJobForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {loading ? (
                <p>Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <h3>No Job Postings Yet</h3>
                  <p>Start by posting your first job opportunity to find qualified candidates.</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <div className="job-header">
                        <h3>{job.title}</h3>
                        <span className={`job-status ${job.isActive ? 'active' : 'closed'}`}>
                          {job.isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Salary:</strong> {job.salaryRange}</p>
                      <p><strong>Type:</strong> {job.jobType}</p>
                      <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                      <p><strong>Posted:</strong> {new Date(job.postedAt).toLocaleDateString()}</p>
                      
                      <div className="job-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => fetchApplicants(job.id)}
                        >
                          View Applicants
                        </button>
                        {job.isActive && (
                          <button 
                            className="btn btn-warning"
                            onClick={() => closeJob(job.id)}
                          >
                            Close Job
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applicants Tab */}
          {activeTab === 'applicants' && (
            <div className="applicants-section">
              <div className="section-header">
                <h2>Qualified Applicants</h2>
                {selectedJob && (
                  <p className="selected-job">
                    For: {jobs.find(j => j.id === selectedJob)?.title}
                  </p>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('jobs')}
                >
                  Back to Jobs
                </button>
              </div>

              {loading ? (
                <p>Loading applicants...</p>
              ) : applicants.length === 0 ? (
                <div className="empty-state">
                  <h3>No Qualified Applicants Yet</h3>
                  <p>Qualified applicants will appear here based on their qualifications and your job requirements.</p>
                </div>
              ) : (
                <div className="applicants-list">
                  {applicants.map(applicant => (
                    <div key={applicant.studentId} className="applicant-card">
                      <div className="applicant-info">
                        <h3>{applicant.studentName}</h3>
                        <p><strong>Email:</strong> {applicant.email}</p>
                        <p><strong>Match Score:</strong> 
                          <span className="match-score">{applicant.matchScore}%</span>
                        </p>
                        <div className="match-details">
                          <strong>Qualifications:</strong>
                          <ul>
                            {applicant.matchDetails?.map((detail, index) => (
                              <li key={index}>✓ {detail}</li>
                            ))}
                          </ul>
                        </div>
                        {applicant.transcripts && applicant.transcripts.length > 0 && (
                          <p><strong>Transcripts:</strong> {applicant.transcripts.length} available</p>
                        )}
                        {applicant.certificates && applicant.certificates.length > 0 && (
                          <p><strong>Certificates:</strong> {applicant.certificates.length} available</p>
                        )}
                      </div>
                      <div className="applicant-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => contactApplicant(applicant)}
                        >
                          Contact for Interview
                        </button>
                        <button className="btn btn-secondary">
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Company Profile</h2>
              <div className="profile-info">
                <p><strong>Company Name:</strong> {userData?.companyName || userData?.displayName}</p>
                <p><strong>Email:</strong> {userData?.email}</p>
                <p><strong>Phone:</strong> {userData?.phone || 'Not provided'}</p>
                <p><strong>Member since:</strong> {new Date(userData?.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`status status-${userData?.isVerified ? 'active' : 'pending'}`}>
                    {userData?.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </p>
              </div>
              <button className="btn btn-primary">Edit Profile</button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CompanyDashboard;