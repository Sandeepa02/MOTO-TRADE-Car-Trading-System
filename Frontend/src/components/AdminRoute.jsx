import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectMessage: 'Please login to access the admin dashboard.' }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
        state={{ redirectMessage: 'You do not have permission to access the admin dashboard.' }}
      />
    );
  }

  return children;
};

export default AdminRoute;
