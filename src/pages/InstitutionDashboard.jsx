import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';
import '../styles/App.css';

const InstitutionDashboard = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    duration: '',
    requirements: '',
    fees: '',
    facultyId: ''
  });
  
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    description: ''
  });

  const [profileForm, setProfileForm] = useState({
    institutionName: '',
    phone: '',
    description: '',
    website: '',
    address: '',
    establishedYear: ''
  });

  // Initialize profile form with user data
  useEffect(() => {
    if (userData) {
      setProfileForm({
        institutionName: userData.institutionName || userData.displayName || '',
        phone: userData.phone || '',
        description: userData.description || '',
        website: userData.website || '',
        address: userData.address || '',
        establishedYear: userData.establishedYear || ''
      });
    }
  }, [userData]);

  // Date formatting helper
  const formatFirestoreDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    if (dateValue.seconds !== undefined) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    try {
      return new Date(dateValue).toLocaleDateString();
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid Date';
    }
  };

  // Fetch applications for this institution
  const fetchApplications = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('https://career-connect-backend-chi.vercel.app/api/applications/institution', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
      console.log('✅ Loaded applications:', response.data.length);
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Mock data for development
      setApplications([
        {
          id: 'app1',
          studentId: 'student1',
          courseId: 'course1',
          status: 'pending',
          appliedAt: new Date(),
          student: { displayName: 'John Doe', email: 'john@student.com' },
          course: { name: 'Computer Science' }
        },
        {
          id: 'app2', 
          studentId: 'student2',
          courseId: 'course2',
          status: 'admitted',
          appliedAt: new Date(),
          student: { displayName: 'Jane Smith', email: 'jane@student.com' },
          course: { name: 'Business Administration' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch institution's courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`https://career-connect-backend-chi.vercel.app/api/courses/institution/${currentUser.uid}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Mock data for development
      setCourses([
        { id: 'course1', name: 'Computer Science', duration: '4 years', students: 45 },
        { id: 'course2', name: 'Business Administration', duration: '3 years', students: 32 },
      ]);
    }
  };

  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`https://career-connect-backend-chi.vercel.app/api/institutions/faculties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      // Mock data for development
      setFaculties([
        { id: 'fac1', name: 'Faculty of Information Technology' },
        { id: 'fac2', name: 'Faculty of Business' }
      ]);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
      fetchCourses();
      fetchFaculties();
    }
  }, [currentUser, fetchApplications]);

  // Update application status
  const updateApplicationStatus = async (applicationId, status) => {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`https://career-connect-backend-chi.vercel.app/api/applications/${applicationId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Application status updated successfully!');
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating status: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      const courseData = {
        ...courseForm,
        institutionId: currentUser.uid,
        requirements: courseForm.requirements.split(',').map(req => req.trim()),
        isActive: true
      };

      await axios.post('https://career-connect-backend-chi.vercel.app/api/institutions/courses', courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Course added successfully!');
      setShowAddCourse(false);
      setCourseForm({ name: '', description: '', duration: '', requirements: '', fees: '', facultyId: '' });
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error adding course: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add new faculty
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.post('https://career-connect-backend-chi.vercel.app/api/institutions/faculties', facultyForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Faculty added successfully!');
      setShowAddFaculty(false);
      setFacultyForm({ name: '', description: '' });
      fetchFaculties();
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Error adding faculty: ' + (error.response?.data?.error || error.message));
    }
  };

  // Update institution profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await axios.put(
        'https://career-connect-backend-chi.vercel.app/api/institutions/profile', 
        profileForm, 
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          }
        }
      );

      console.log('Profile update response:', response.data);
      alert('Profile updated successfully!');
      setShowProfileForm(false);
      
      // Refresh user data
      if (refreshUserData) {
        refreshUserData();
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      alert('Error updating profile: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['institution']}>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Institution Dashboard</h1>
          <p>Welcome, {userData?.institutionName || userData?.displayName}!</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Student Applications
          </button>
          <button 
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Manage Courses
          </button>
          <button 
            className={`tab-button ${activeTab === 'faculties' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculties')}
          >
            Manage Faculties
          </button>
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Institution Profile
          </button>
        </div>

        <div className="dashboard-content">
          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="applications-section">
              <h2>Student Applications</h2>
              
              {loading ? (
                <p>Loading applications...</p>
              ) : applications.length === 0 ? (
                <p>No applications received yet.</p>
              ) : (
                <div className="applications-list">
                  {applications.map(app => (
                    <div key={app.id} className="application-card">
                      <div className="application-info">
                        <h3>{app.course?.name || 'Unknown Course'}</h3>
                        <p><strong>Student:</strong> {app.student?.displayName}</p>
                        <p><strong>Email:</strong> {app.student?.email}</p>
                        {/* FIXED DATE DISPLAY */}
                        <p><strong>Applied:</strong> {formatFirestoreDate(app.appliedAt)}</p>
                        <p><strong>Status:</strong> 
                          <span className={`status status-${app.status}`}>
                            {app.status}
                          </span>
                        </p>
                      </div>
                      <div className="application-actions">
                        {app.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-success"
                              onClick={() => updateApplicationStatus(app.id, 'admitted')}
                            >
                              Admit
                            </button>
                            <button 
                              className="btn btn-warning"
                              onClick={() => updateApplicationStatus(app.id, 'waiting-list')}
                            >
                              Wait List
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status !== 'pending' && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => updateApplicationStatus(app.id, 'pending')}
                          >
                            Reset to Pending
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="courses-section">
              <div className="section-header">
                <h2>Manage Courses</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddCourse(true)}
                >
                  Add New Course
                </button>
              </div>

              {showAddCourse && (
                <div className="form-modal">
                  <div className="modal-content">
                    <h3>Add New Course</h3>
                    <form onSubmit={handleAddCourse}>
                      <div className="form-group">
                        <label>Course Name</label>
                        <input
                          type="text"
                          value={courseForm.name}
                          onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                          placeholder="e.g., 4 years"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Requirements (comma separated)</label>
                        <input
                          type="text"
                          value={courseForm.requirements}
                          onChange={(e) => setCourseForm({...courseForm, requirements: e.target.value})}
                          placeholder="e.g., Mathematics B, English C, Science C"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Fees</label>
                        <input
                          type="text"
                          value={courseForm.fees}
                          onChange={(e) => setCourseForm({...courseForm, fees: e.target.value})}
                          placeholder="e.g., M45,000 per year"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Faculty</label>
                        <select
                          value={courseForm.facultyId}
                          onChange={(e) => setCourseForm({...courseForm, facultyId: e.target.value})}
                          required
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(faculty => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Add Course</button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddCourse(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="courses-list">
                {courses.length === 0 ? (
                  <p>No courses added yet.</p>
                ) : (
                  courses.map(course => (
                    <div key={course.id} className="course-card">
                      <h3>{course.name}</h3>
                      <p><strong>Duration:</strong> {course.duration}</p>
                      <p><strong>Fees:</strong> {course.fees}</p>
                      <p><strong>Requirements:</strong> {Array.isArray(course.requirements) ? course.requirements.join(', ') : course.requirements}</p>
                      <div className="action-buttons">
                        <button className="btn btn-secondary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Faculties Tab */}
          {activeTab === 'faculties' && (
            <div className="faculties-section">
              <div className="section-header">
                <h2>Manage Faculties</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddFaculty(true)}
                >
                  Add New Faculty
                </button>
              </div>

              {showAddFaculty && (
                <div className="form-modal">
                  <div className="modal-content">
                    <h3>Add New Faculty</h3>
                    <form onSubmit={handleAddFaculty}>
                      <div className="form-group">
                        <label>Faculty Name</label>
                        <input
                          type="text"
                          value={facultyForm.name}
                          onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={facultyForm.description}
                          onChange={(e) => setFacultyForm({...facultyForm, description: e.target.value})}
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Add Faculty</button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddFaculty(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="faculties-list">
                {faculties.length === 0 ? (
                  <p>No faculties added yet.</p>
                ) : (
                  faculties.map(faculty => (
                    <div key={faculty.id} className="faculty-card">
                      <h3>{faculty.name}</h3>
                      {faculty.description && <p>{faculty.description}</p>}
                      <div className="action-buttons">
                        <button className="btn btn-secondary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Institution Profile</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowProfileForm(true)}
                >
                  Edit Profile
                </button>
              </div>

              {showProfileForm && (
                <div className="form-modal">
                  <div className="modal-content">
                    <h3>Edit Institution Profile</h3>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="form-group">
                        <label>Institution Name *</label>
                        <input
                          type="text"
                          value={profileForm.institutionName}
                          onChange={(e) => setProfileForm({...profileForm, institutionName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={profileForm.description}
                          onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                          rows="4"
                          placeholder="Describe your institution..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Website</label>
                        <input
                          type="url"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Address</label>
                        <textarea
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                          placeholder="Full physical address"
                        />
                      </div>
                      <div className="form-group">
                        <label>Established Year</label>
                        <input
                          type="number"
                          value={profileForm.establishedYear}
                          onChange={(e) => setProfileForm({...profileForm, establishedYear: e.target.value})}
                          placeholder="e.g., 1990"
                          min="1800"
                          max="2024"
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Update Profile</button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowProfileForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="profile-info">
                <div className="info-card">
                  <h4>Basic Information</h4>
                  <p><strong>Institution Name:</strong> {userData?.institutionName || userData?.displayName}</p>
                  <p><strong>Email:</strong> {userData?.email}</p>
                  <p><strong>Phone:</strong> {userData?.phone || 'Not provided'}</p>
                  {/* FIXED DATE DISPLAY */}
                  <p><strong>Member since:</strong> {formatFirestoreDate(userData?.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status status-${userData?.isVerified ? 'active' : 'pending'}`}>
                      {userData?.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </p>
                </div>

                <div className="info-card">
                  <h4>Institution Details</h4>
                  <p><strong>Description:</strong> {userData?.description || 'Not provided'}</p>
                  <p><strong>Website:</strong> {userData?.website ? (
                    <a href={userData.website} target="_blank" rel="noopener noreferrer">
                      {userData.website}
                    </a>
                  ) : 'Not provided'}</p>
                  <p><strong>Address:</strong> {userData?.address || 'Not provided'}</p>
                  <p><strong>Established:</strong> {userData?.establishedYear || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InstitutionDashboard;