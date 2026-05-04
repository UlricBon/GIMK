import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await adminAPI.getMetrics();
      setMetrics(response.data.metrics);
    } catch (error) {
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon="👥"
        />
        <StatCard
          title="Active Tasks"
          value={metrics?.activeTasks || 0}
          icon="📋"
        />
        <StatCard
          title="Completed Tasks"
          value={metrics?.completedTasks || 0}
          icon="✅"
        />
        <StatCard
          title="Total Payments"
          value={`₱${metrics?.totalPaymentsProcessed || 0}`}
          icon="💰"
        />
      </div>

      <div className="dashboard-actions">
        <button className="action-button" onClick={loadMetrics}>
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
