import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import ModerationPage from './pages/ModerationPage';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const handleActivity = () => {
      localStorage.setItem('lastActivity', Date.now());
    };

    const checkIdleTimeout = () => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity'), 10);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      if (now - lastActivity > thirtyMinutes) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('lastActivity');
        window.location.href = '/login';
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    const interval = setInterval(checkIdleTimeout, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/logs" element={<ActivityLogsPage />} />
                    <Route path="/moderation" element={<ModerationPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
