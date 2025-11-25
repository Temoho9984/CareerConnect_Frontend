import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const FileUpload = ({ onUploadSuccess, type = 'transcript', accept = '.pdf,.jpg,.jpeg,.png' }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', `Uploaded ${new Date().toLocaleDateString()}`);

    setUploading(true);
    setProgress(0);

    try {
      const token = await currentUser.getIdToken();
      const endpoint = type === 'transcript' ? '/uploads/transcript' : '/uploads/certificate';
      
      const response = await axios.post(`http://localhost:5000/api${endpoint}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      onUploadSuccess(response.data);
      setUploading(false);
      setProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.response?.data?.error || error.message);
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label">
        <input
          type="file"
          onChange={handleFileUpload}
          accept={accept}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div className="file-upload-button">
          {uploading ? `Uploading... ${progress}%` : `Upload ${type}`}
        </div>
      </label>
      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;