import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    email: '',
    password: '',
    institutionName: '',
    phone: '',
    address: ''
  });
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    duration: '',
    fees: '',
    requirements: '',
    institutionId: '',
    faculty: ''
  });

  const fetchStats = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  const fetchInstitutions = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/admin/institutions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStats();
      fetchInstitutions();
      fetchCompanies();
      fetchCourses();
    }
  }, [currentUser]);

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post('http://localhost:5000/api/admin/institutions', newInstitution, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Institution created successfully!');
      setShowInstitutionForm(false);
      setNewInstitution({
        email: '',
        password: '',
        institutionName: '',
        phone: '',
        address: ''
      });
      fetchInstitutions();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create institution');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post('http://localhost:5000/api/admin/courses', {
        ...newCourse,
        requirements: newCourse.requirements.split(',').map(req => req.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Course created successfully!');
      setShowCourseForm(false);
      setNewCourse({
        name: '',
        description: '',
        duration: '',
        fees: '',
        requirements: '',
        institutionId: '',
        faculty: ''
      });
      fetchCourses();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleUpdateStatus = async (type, id, status) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`http://localhost:5000/api/admin/${type}/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Status updated successfully!');
      if (type === 'institutions') fetchInstitutions();
      if (type === 'companies') fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/admin/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      if (type === 'institutions') fetchInstitutions();
      if (type === 'courses') fetchCourses();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || `Failed to delete ${type}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {userData?.displayName || 'Admin'}!</p>
        </div>

        <div className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={activeTab === 'institutions' ? 'active' : ''} onClick={() => setActiveTab('institutions')}>
            Institutions
          </button>
          <button className={activeTab === 'companies' ? 'active' : ''} onClick={() => setActiveTab('companies')}>
            Companies
          </button>
          <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
            Courses
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => { setActiveTab('reports'); fetchReports(); }}>
            Reports
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>System Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Students</h3>
                  <p className="stat-number">{stats.students || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Institutions</h3>
                  <p className="stat-number">{stats.institutions || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Companies</h3>
                  <p className="stat-number">{stats.companies || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Courses</h3>
                  <p className="stat-number">{stats.courses || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Course Applications</h3>
                  <p className="stat-number">{stats.courseApplications || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Job Applications</h3>
                  <p className="stat-number">{stats.jobApplications || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Jobs Posted</h3>
                  <p className="stat-number">{stats.jobs || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'institutions' && (
            <div className="institutions-section">
              <div className="section-header">
                <h2>Manage Institutions</h2>
                <button className="btn btn-primary" onClick={() => setShowInstitutionForm(true)}>
                  Add Institution
                </button>
              </div>

              {showInstitutionForm && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Add New Institution</h3>
                    <form onSubmit={handleCreateInstitution}>
                      <div className="form-group">
                        <label>Email:</label>
                        <input
                          type="email"
                          value={newInstitution.email}
                          onChange={(e) => setNewInstitution({...newInstitution, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password:</label>
                        <input
                          type="password"
                          value={newInstitution.password}
                          onChange={(e) => setNewInstitution({...newInstitution, password: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Institution Name:</label>
                        <input
                          type="text"
                          value={newInstitution.institutionName}
                          onChange={(e) => setNewInstitution({...newInstitution, institutionName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone:</label>
                        <input
                          type="text"
                          value={newInstitution.phone}
                          onChange={(e) => setNewInstitution({...newInstitution, phone: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Address:</label>
                        <textarea
                          value={newInstitution.address}
                          onChange={(e) => setNewInstitution({...newInstitution, address: e.target.value})}
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Create</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowInstitutionForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map(institution => (
                      <tr key={institution.id}>
                        <td>{institution.institutionName || institution.displayName}</td>
                        <td>{institution.email}</td>
                        <td>{institution.phone || 'N/A'}</td>
                        <td>
                          <span className={`status status-${institution.status || 'active'}`}>
                            {institution.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleUpdateStatus('institutions', institution.id, 
                                institution.status === 'active' ? 'suspended' : 'active'
                              )}
                            >
                              {institution.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete('institutions', institution.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="companies-section">
              <h2>Manage Companies</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => (
                      <tr key={company.id}>
                        <td>{company.displayName}</td>
                        <td>{company.email}</td>
                        <td>{company.phone || 'N/A'}</td>
                        <td>
                          <span className={`status status-${company.status || 'active'}`}>
                            {company.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <select
                              value={company.status || 'active'}
                              onChange={(e) => handleUpdateStatus('companies', company.id, e.target.value)}
                              className="status-select"
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="courses-section">
              <div className="section-header">
                <h2>Manage Courses</h2>
                <button className="btn btn-primary" onClick={() => setShowCourseForm(true)}>
                  Add Course
                </button>
              </div>

              {showCourseForm && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Add New Course</h3>
                    <form onSubmit={handleCreateCourse}>
                      <div className="form-group">
                        <label>Course Name:</label>
                        <input
                          type="text"
                          value={newCourse.name}
                          onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Institution:</label>
                        <select
                          value={newCourse.institutionId}
                          onChange={(e) => setNewCourse({...newCourse, institutionId: e.target.value})}
                          required
                        >
                          <option value="">Select Institution</option>
                          {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>
                              {inst.institutionName || inst.displayName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Faculty:</label>
                        <input
                          type="text"
                          value={newCourse.faculty}
                          onChange={(e) => setNewCourse({...newCourse, faculty: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration:</label>
                        <input
                          type="text"
                          value={newCourse.duration}
                          onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                          placeholder="e.g., 4 years"
                        />
                      </div>
                      <div className="form-group">
                        <label>Fees:</label>
                        <input
                          type="text"
                          value={newCourse.fees}
                          onChange={(e) => setNewCourse({...newCourse, fees: e.target.value})}
                          placeholder="e.g., M45,000 per year"
                        />
                      </div>
                      <div className="form-group">
                        <label>Requirements (comma separated):</label>
                        <textarea
                          value={newCourse.requirements}
                          onChange={(e) => setNewCourse({...newCourse, requirements: e.target.value})}
                          placeholder="e.g., Mathematics, Science, English"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Create</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCourseForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Institution</th>
                      <th>Faculty</th>
                      <th>Duration</th>
                      <th>Fees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>{course.name}</td>
                        <td>{course.institution?.institutionName || course.institution?.displayName || 'N/A'}</td>
                        <td>{course.faculty || 'N/A'}</td>
                        <td>{course.duration || 'N/A'}</td>
                        <td>{course.fees || 'N/A'}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete('courses', course.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <h2>System Reports</h2>
              
              <div className="report-section">
                <h3>Recent User Registrations</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>User Type</th>
                        <th>Registration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.recentUsers?.map(user => (
                        <tr key={user.id}>
                          <td>{user.displayName}</td>
                          <td>{user.email}</td>
                          <td>{user.userType}</td>
                          <td>{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-section">
                <h3>Recent Course Applications</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Applied Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.recentApplications?.map(app => (
                        <tr key={app.id}>
                          <td>{app.studentName || 'N/A'}</td>
                          <td>{app.courseId}</td>
                          <td>{app.status}</td>
                          <td>{app.appliedAt ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;