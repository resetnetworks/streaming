// components/admin/UploadProgressToast.jsx
import React, { useEffect, useState } from 'react';
import { FaSpinner, FaCheck, FaTimes, FaFileAudio, FaPause } from 'react-icons/fa';

const UploadProgressToast = ({ 
  upload, 
  showDetails = false 
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer for upload duration
  useEffect(() => {
    let interval;
    if (upload.status === 'uploading') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [upload.status]);

  const getStatusIcon = () => {
    switch (upload.status) {
      case 'uploading':
        return <FaSpinner className="animate-spin text-blue-500" />;
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'error':
        return <FaTimes className="text-red-500" />;
      case 'paused':
        return <FaPause className="text-yellow-500" />;
      default:
        return <FaFileAudio className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (upload.status) {
      case 'uploading':
        return 'border-blue-500 bg-gray-800';
      case 'success':
        return 'border-green-500 bg-gray-800';
      case 'error':
        return 'border-red-500 bg-gray-800';
      case 'paused':
        return 'border-yellow-500 bg-gray-800';
      default:
        return 'border-gray-500 bg-gray-800';
    }
  };

  const getStatusText = () => {
    switch (upload.status) {
      case 'uploading':
        return `Uploading... (${formatTime(timeElapsed)})`;
      case 'success':
        return 'Completed';
      case 'error':
        return 'Failed';
      case 'paused':
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div
      className={`${getStatusColor()} border-l-4 p-3 rounded shadow-lg min-w-80 max-w-96 transition-all duration-300 animate-in slide-in-from-right`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-white text-sm font-medium truncate" title={upload.title}>
              {upload.title}
            </span>
            
            <span className="text-xs text-gray-400">
              {getStatusText()}
            </span>

            {/* File details */}
            {showDetails && upload.fileSize && (
              <span className="text-xs text-gray-500 mt-1">
                {formatFileSize(upload.fileSize)}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Progress bar for uploading status */}
      {upload.status === 'uploading' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{upload.progress || 0}%</span>
            {upload.uploadSpeed && (
              <span>{upload.uploadSpeed}</span>
            )}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${upload.progress || 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error message */}
      {upload.status === 'error' && upload.error && (
        <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
          <p className="text-xs text-red-400 break-words">
            {upload.error}
          </p>
          {upload.retryCount && (
            <p className="text-xs text-red-300 mt-1">
              Retry attempts: {upload.retryCount}
            </p>
          )}
        </div>
      )}

      {/* Success details */}
      {upload.status === 'success' && (
        <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-500/30">
          <p className="text-xs text-green-400">
            Upload completed successfully
          </p>
          {upload.uploadTime && (
            <p className="text-xs text-green-300">
              Total time: {formatTime(upload.uploadTime)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadProgressToast;