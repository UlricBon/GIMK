import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>GMIK Admin</h2>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="/" className="menu-link">Dashboard</a>
          </li>
          <li>
            <a href="/users" className="menu-link">Users</a>
          </li>
          <li>
            <a href="/logs" className="menu-link">Activity Logs</a>
          </li>
          <li>
            <a href="/moderation" className="menu-link">Moderation</a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="topbar">
          <h1>GMIK Platform Management</h1>
          <div className="user-info">
            <span>{user.email}</span>
          </div>
        </div>

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
