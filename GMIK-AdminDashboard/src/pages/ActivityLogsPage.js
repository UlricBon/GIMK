import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import './ActivityLogsPage.css';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await adminAPI.getActivityLogs();
      setLogs(response.data.logs);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return '#ff6b6b';
    if (action.includes('create')) return '#51cf66';
    if (action.includes('update')) return '#4ecdc4';
    return '#666';
  };

  return (
    <div className="logs-container">
      <h1>Activity Logs</h1>
      
      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : (
        <div className="logs-list">
          {logs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-header">
                <span
                  className="log-action"
                  style={{ color: getActionColor(log.action) }}
                >
                  {log.action}
                </span>
                <span className="log-entity">{log.entity_type}</span>
                <span className="log-time">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <div className="log-details">
                <small>{log.user_id ? `User: ${log.user_id.substring(0, 8)}...` : 'System'}</small>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="no-logs">No activity logs found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
