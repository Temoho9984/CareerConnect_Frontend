import React from 'react';
import { useJobs } from '../context/JobContext';

const MyApplications = () => {
    const { applications, loading, error, withdrawApplication } = useJobs();

    const handleWithdraw = async (applicationId) => {
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
            case 'pending': return 'orange';
            case 'admitted': return 'green';
            case 'rejected': return 'red';
            case 'waiting-list': return 'blue';
            default: return 'gray';
        }
    };

    if (loading) return <div className="loading">Loading applications...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="my-applications">
            <h2>My Job Applications</h2>
            
            {applications.length === 0 ? (
                <p>You haven't applied to any jobs yet.</p>
            ) : (
                <div className="applications-list">
                    {applications.map(application => (
                        <div key={application.id} className="application-card">
                            <div className="application-header">
                                <h3>{application.job?.title || 'Job Not Found'}</h3>
                                <span 
                                    className={`status-badge ${application.status}`}
                                    style={{ backgroundColor: getStatusColor(application.status) }}
                                >
                                    {application.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <p><strong>Company:</strong> {application.company?.displayName || 'Unknown'}</p>
                            <p><strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
                            
                            {application.coverLetter && (
                                <div className="cover-letter">
                                    <strong>Cover Letter:</strong>
                                    <p>{application.coverLetter}</p>
                                </div>
                            )}

                            {application.status === 'pending' && (
                                <button 
                                    onClick={() => handleWithdraw(application.id)}
                                    className="withdraw-btn"
                                >
                                    Withdraw Application
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;