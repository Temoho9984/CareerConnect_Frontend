import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';
import '../styles/App.css';

const StudentDashboard = () => {
  const { currentUser, userData } = useAuth();
  const { 
    jobs, 
    applications: jobApplications, 
    loading: jobsLoading, 
    error: jobsError, 
    applyForJob, 
    withdrawApplication,
    fetchJobs,
    fetchMyApplications 
  } = useJobs();
  
  const [courses, setCourses] = useState([]);
  const [courseApplications, setCourseApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  // Fetch real courses from API
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/courses');
      setCourses(response.data);
      console.log('✅ Loaded courses:', response.data.length);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
      // Fallback to mock data if API fails
      setCourses([
        { 
          id: 'course1', 
          name: 'Bachelor of Science in Computer Science', 
          institution: { displayName: 'Limkokwing University' },
          duration: '4 years',
          fees: 'M45,000 per year'
        },
        { 
          id: 'course2', 
          name: 'Bachelor of Business Administration', 
          institution: { displayName: 'Limkokwing University' },
          duration: '3 years',
          fees: 'M35,000 per year'
        }
      ]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchCourseApplications = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/students/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseApplications(response.data);
    } catch (error) {
      console.error('Error fetching course applications:', error);
      setError('Failed to load applications. Please try again.');
      setCourseApplications([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCourses();
    fetchCourseApplications();
    fetchJobs();
    fetchMyApplications();
  }, [fetchCourseApplications]);

  const applyForCourse = async (courseId, institutionId) => {
    if (!currentUser) {
      alert('Please login to apply for courses');
      return;
    }
    
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post('https://career-connect-backend-chi.vercel.app/api/students/applications', 
        { 
          courseId: courseId, 
          institutionId: institutionId 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      alert('Application submitted successfully!');
      fetchCourseApplications(); // Refresh applications list
      
    } catch (error) {
      console.error('Application error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert('Error applying: ' + errorMessage);
    }
  };

  const handleJobApply = (job) => {
    setSelectedJob(job);
    setCoverLetter('');
  };

  const submitJobApplication = async () => {
    if (!selectedJob) return;

    try {
      setApplying(true);
      await applyForJob(selectedJob.id, coverLetter);
      alert('Job application submitted successfully!');
      setSelectedJob(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleWithdrawJobApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await withdrawApplication(applicationId);
        alert('Application withdrawn successfully');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'admitted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'waiting-list': return '#17a2b8';
      default: return '#6c757d';
    }
  };

const formatFirestoreDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  
  console.log('Raw date value:', dateValue);
  console.log('Type of date value:', typeof dateValue);
  
  let date;
  
  try {
    // Case 1: It's already a valid Date object or ISO string
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      date = dateValue;
    }
    // Case 2: Firestore timestamp object with seconds
    else if (dateValue.seconds !== undefined) {
      date = new Date(dateValue.seconds * 1000);
    }
    // Case 3: Firestore timestamp object with _seconds (alternative format)
    else if (dateValue._seconds !== undefined) {
      date = new Date(dateValue._seconds * 1000);
    }
    // Case 4: It's an ISO string from your backend
    else if (typeof dateValue === 'string' && dateValue.includes('T')) {
      date = new Date(dateValue);
    }
    // Case 5: It might be a number (timestamp)
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    // Case 6: Try to parse it as a date anyway
    else {
      date = new Date(dateValue);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date created from:', dateValue);
      return 'Date not available';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
  } catch (error) {
    console.error('Error formatting date:', error, 'Value:', dateValue);
    return 'Date error';
  }
};

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>Welcome back, {userData?.displayName || 'Student'}!</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Available Courses
          </button>
          <button 
            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Available Jobs
          </button>
          <button 
            className={`tab-button ${activeTab === 'course-applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('course-applications')}
          >
            My Course Applications
          </button>
          <button 
            className={`tab-button ${activeTab === 'job-applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('job-applications')}
          >
            My Job Applications
          </button>
        </div>

        <div className="dashboard-content">
          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="courses-section">
              <h2>Available Courses</h2>
              
              {coursesLoading ? (
                <p>Loading courses...</p>
              ) : error ? (
                <div className="error-message">
                  {error}
                  <button onClick={fetchCourses} className="btn btn-secondary">
                    Retry
                  </button>
                </div>
              ) : courses.length === 0 ? (
                <p>No courses available at the moment.</p>
              ) : (
                <div className="courses-grid">
                  {courses.map(course => (
                    <div key={course.id} className="course-card">
                      <h3>{course.name}</h3>
                      <p><strong>Institution:</strong> {course.institution?.displayName || course.institution?.institutionName || 'Unknown Institution'}</p>
                      <p><strong>Duration:</strong> {course.duration}</p>
                      {course.fees && <p><strong>Fees:</strong> {course.fees}</p>}
                      {course.requirements && (
                        <p><strong>Requirements:</strong> {Array.isArray(course.requirements) ? course.requirements.join(', ') : course.requirements}</p>
                      )}
                      <button 
                        className="btn btn-primary"
                        onClick={() => applyForCourse(course.id, course.institutionId)}
                        disabled={!course.institutionId}
                      >
                        Apply Now
                      </button>
                      {!course.institutionId && (
                        <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
                          Cannot apply - institution information missing
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="jobs-section">
              <h2>Available Jobs</h2>
              
              {jobsLoading ? (
                <p>Loading jobs...</p>
              ) : jobsError ? (
                <div className="error-message">
                  {jobsError}
                  <button onClick={fetchJobs} className="btn btn-secondary">
                    Retry
                  </button>
                </div>
              ) : jobs.length === 0 ? (
                <p>No jobs available at the moment.</p>
              ) : (
                <div className="jobs-grid">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <h3>{job.title}</h3>
                      <p><strong>Company:</strong> {job.company?.displayName || 'Unknown Company'}</p>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Salary:</strong> {job.salaryRange}</p>
                      <p><strong>Type:</strong> {job.jobType}</p>
                      <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                      <p className="job-description">{job.description}</p>
                      
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="job-requirements">
                          <h4>Requirements:</h4>
                          <ul>
                            {job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button 
                        onClick={() => handleJobApply(job)}
                        className="btn btn-primary apply-job-btn"
                        disabled={new Date(job.deadline) < new Date()}
                      >
                        {new Date(job.deadline) < new Date() ? 'Expired' : 'Apply Now'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Job Application Modal */}
              {selectedJob && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Apply for {selectedJob.title}</h3>
                    <p>at {selectedJob.company?.displayName}</p>
                    
                    <div className="form-group">
                      <label>Cover Letter (Optional):</label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Tell the employer why you're a good fit for this position..."
                        rows="6"
                      />
                    </div>

                    <div className="modal-actions">
                      <button 
                        onClick={submitJobApplication}
                        disabled={applying}
                        className="btn btn-primary"
                      >
                        {applying ? 'Applying...' : 'Submit Application'}
                      </button>
                      <button 
                        onClick={() => setSelectedJob(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COURSE APPLICATIONS TAB */}
          {activeTab === 'course-applications' && (
            <div className="applications-section">
              <h2>My Course Applications</h2>
              
              {loading && <p>Loading applications...</p>}
              
              {error && (
                <div className="error-message">
                  {error}
                  <button onClick={fetchCourseApplications} className="btn btn-secondary">
                    Retry
                  </button>
                </div>
              )}
              
              {!loading && !error && courseApplications.length === 0 && (
                <p>No course applications submitted yet. Browse courses and apply!</p>
              )}
              
              {!loading && !error && courseApplications.length > 0 && (
                <div className="applications-list">
                  {courseApplications.map(app => {
                    console.log('Course app date:', app.appliedAt); // Debug log
                    return (
                      <div key={app.id} className="application-card">
                        <h3>{app.course?.name || 'Unknown Course'}</h3>
                        <p><strong>Institution:</strong> {app.institution?.displayName || app.institution?.institutionName || 'Unknown Institution'}</p>
                        <p><strong>Status:</strong> 
                          <span 
                            className="status" 
                            style={{ 
                              backgroundColor: getStatusColor(app.status),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              marginLeft: '8px'
                            }}
                          >
                            {app.status.toUpperCase()}
                          </span>
                        </p>
                        {/* USING HELPER FUNCTION HERE TOO */}
                        <p><strong>Applied:</strong> {formatFirestoreDate(app.appliedAt)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

{/* JOB APPLICATIONS TAB */}
{activeTab === 'job-applications' && (
  <div className="applications-section">
    <h2>My Job Applications</h2>
    
    {jobsLoading ? (
      <p>Loading job applications...</p>
    ) : jobsError ? (
      <div className="error-message">
        {jobsError}
        <button onClick={fetchMyApplications} className="btn btn-secondary">
          Retry
        </button>
      </div>
    ) : jobApplications.length === 0 ? (
      <p>No job applications submitted yet. Browse jobs and apply!</p>
    ) : (
      <div className="applications-list">
        {jobApplications.map(application => {
          console.log('Application data:', application); // Debug log
          return (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h3>{application.job?.title || 'Job Not Found'}</h3>
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(application.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {application.status.toUpperCase()}
                </span>
              </div>
              
              <p><strong>Company:</strong> {application.company?.displayName || 'Unknown Company'}</p>
              
              {/* USING HELPER FUNCTION */}
              <p><strong>Applied:</strong> {formatFirestoreDate(application.appliedAt)}</p>
              
              {application.coverLetter && (
                <div className="cover-letter">
                  <strong>Cover Letter:</strong>
                  <p>{application.coverLetter}</p>
                </div>
              )}

              {application.status === 'pending' && (
                <button 
                  onClick={() => handleWithdrawJobApplication(application.id)}
                  className="btn btn-danger withdraw-btn"
                >
                  Withdraw Application
                </button>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StudentDashboard;