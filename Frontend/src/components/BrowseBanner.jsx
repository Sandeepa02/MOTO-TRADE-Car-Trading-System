import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BrowseBanner = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Don't show if logged in
  }

  return (
    <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-3 px-4 text-center shadow-sm border-b border-primary-800/10">
      <p className="text-sm md:text-base">
        You&apos;re browsing as a guest.{' '}
        <Link to="/login" className="underline font-bold hover:text-white/90 transition-colors">
          Login
        </Link>{' '}
        or{' '}
        <Link to="/register" className="underline font-bold hover:text-white/90 transition-colors">
          Register
        </Link>{' '}
        to unlock full features and make purchases.
      </p>
    </div>
  );
};

export default BrowseBanner;
