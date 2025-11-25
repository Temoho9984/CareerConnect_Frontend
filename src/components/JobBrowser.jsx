import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const JobBrowser = () => {
    const { jobs, loading, error, applyForJob } = useJobs();
    const { user } = useAuth();
    const [selectedJob, setSelectedJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [applying, setApplying] = useState(false);

    const handleApply = async (job) => {
        setSelectedJob(job);
        setCoverLetter('');
    };

    const submitApplication = async () => {
        if (!selectedJob) return;

        try {
            setApplying(true);
            await applyForJob(selectedJob.id, coverLetter);
            alert('Application submitted successfully!');
            setSelectedJob(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="loading">Loading jobs...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="job-browser">
            <h2>Available Jobs</h2>
            
            {jobs.length === 0 ? (
                <p>No jobs available at the moment.</p>
            ) : (
                <div className="jobs-grid">
                    {jobs.map(job => (
                        <div key={job.id} className="job-card">
                            <h3>{job.title}</h3>
                            <p><strong>Company:</strong> {job.company?.displayName || 'Unknown'}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Salary:</strong> {job.salaryRange}</p>
                            <p><strong>Type:</strong> {job.jobType}</p>
                            <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                            <p className="job-description">{job.description}</p>
                            
                            <div className="job-requirements">
                                <h4>Requirements:</h4>
                                <ul>
                                    {job.requirements?.map((req, index) => (
                                        <li key={index}>{req}</li>
                                    ))}
                                </ul>
                            </div>

                            <button 
                                onClick={() => handleApply(job)}
                                className="apply-btn"
                                disabled={new Date(job.deadline) < new Date()}
                            >
                                {new Date(job.deadline) < new Date() ? 'Expired' : 'Apply Now'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Application Modal */}
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
                                onClick={submitApplication}
                                disabled={applying}
                                className="btn-primary"
                            >
                                {applying ? 'Applying...' : 'Submit Application'}
                            </button>
                            <button 
                                onClick={() => setSelectedJob(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobBrowser;