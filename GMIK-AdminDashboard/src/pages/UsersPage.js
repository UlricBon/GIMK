import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableUser = async (userId) => {
    if (window.confirm('Are you sure you want to disable this user?')) {
      try {
        await adminAPI.disableUser(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
        toast.success('User disabled successfully');
      } catch (error) {
        toast.error('Failed to disable user');
      }
    }
  };

  return (
    <div className="users-container">
      <h1>User Management</h1>
      
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Completed Tasks</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id.substring(0, 8)}...</td>
                  <td>{user.email}</td>
                  <td>{user.display_name}</td>
                  <td>{user.completed_tasks_count}</td>
                  <td>
                    <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDisableUser(user.id)}
                      disabled={!user.is_active}
                    >
                      {user.is_active ? 'Disable' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
