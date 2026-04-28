import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPaymentNotificationsForUser } from '../utils/paymentStorage';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const savedProfile = JSON.parse(localStorage.getItem('userProfileDetails') || '{}');
  const avatar = savedProfile.profilePicture || '';
  const displayName = savedProfile.name || user?.name || 'User';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Branded Cars', path: '/branded-cars' },
    { name: 'Second-Hand Cars', path: '/second-hand-cars' },
    { name: 'Spare Parts', path: '/spare-parts' },
    { name: 'Modifications', path: '/modifications' },
  ];

  const isActive = (path) => location.pathname === path;

  const refreshNotificationCount = useCallback(() => {
    if (!isAuthenticated || isAdmin || !user?.email) {
      setNotificationCount(0);
      return;
    }
    setNotificationCount(getPaymentNotificationsForUser(user.email).length);
  }, [isAuthenticated, isAdmin, user?.email]);

  useEffect(() => {
    refreshNotificationCount();
  }, [refreshNotificationCount, location.pathname]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'motoTradePaymentNotifications' || e.key === null) {
        refreshNotificationCount();
      }
    };
    const onPaymentNotifications = () => refreshNotificationCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshNotificationCount);
    window.addEventListener('mototrade-payment-notifications', onPaymentNotifications);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshNotificationCount);
      window.removeEventListener('mototrade-payment-notifications', onPaymentNotifications);
    };
  }, [refreshNotificationCount]);

  const notificationBadgeLabel =
    notificationCount > 99 ? '99+' : String(notificationCount || '');

  return (
    <nav className="bg-gradient-to-r from-[#0f2f8a] to-[#1d4ed8] border-b border-[#274fb0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-white">
              Moto Trade
            </Link>
          </div>

          {/* Desktop Menu - Conditional based on auth state */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              /* Logged-in: Show all navigation links */
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive(item.path)
                        ? 'bg-white text-blue-700'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/my-chats"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    isActive('/my-chats')
                      ? 'bg-white text-blue-700'
                      : 'text-blue-100 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  My Chats
                </Link>
                <Link
                  to="/ai-suggestion"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 inline-flex items-center gap-2 ${
                    isActive('/ai-suggestion')
                      ? 'bg-white text-blue-700'
                      : 'text-blue-100 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <img src="/gemini-logo.svg" alt="Gemini" className="w-4 h-4" />
                  <span>AI Suggestion Agent</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
                      isActive('/admin/dashboard')
                        ? 'bg-white text-blue-700'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <div className="ml-2 flex items-center gap-2">
                  <Link
                    to="/user-profile"
                    className="w-10 h-10 rounded-full border border-blue-200 overflow-hidden flex items-center justify-center bg-white text-blue-800 font-bold hover:border-white transition-colors shrink-0"
                    title="User Profile"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </Link>
                  {!isAdmin && (
                    <Link
                      to="/user-profile/notifications"
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isActive('/user-profile/notifications')
                          ? 'border-white bg-white text-blue-700'
                          : 'border-blue-200/80 bg-white/10 text-white hover:bg-white/20 hover:border-white'
                      }`}
                      title="Notifications"
                      aria-label={`Notifications${notificationCount ? `, ${notificationCount} total` : ''}`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.389 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {notificationCount > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#1d4ed8]">
                          {notificationBadgeLabel}
                        </span>
                      ) : null}
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Guest User: Show only Login/Register buttons */
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:bg-white/15 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-primary-700 to-primary-600 text-white hover:from-primary-800 hover:to-primary-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-white/90 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Conditional based on auth state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1d4ed8] border-t border-[#274fb0]">
            {isAuthenticated ? (
              /* Logged-in: Show all navigation links */
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isActive(item.path)
                        ? 'bg-white text-blue-700'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/my-chats"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive('/my-chats')
                      ? 'bg-white text-blue-700'
                      : 'text-blue-100 hover:bg-white/15 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Chats
                </Link>
                <Link
                  to="/ai-suggestion"
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive('/ai-suggestion')
                      ? 'bg-white text-blue-700'
                      : 'text-blue-100 hover:bg-white/15 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <img src="/gemini-logo.svg" alt="Gemini" className="w-5 h-5" />
                    <span>AI Suggestion Agent</span>
                  </span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-300 ${
                      isActive('/admin/dashboard')
                        ? 'bg-white text-blue-700'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/user-profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive('/user-profile')
                      ? 'bg-white text-blue-700'
                      : 'text-blue-100 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  User Profile
                </Link>
                {!isAdmin && (
                  <Link
                    to="/user-profile/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isActive('/user-profile/notifications')
                        ? 'bg-white text-blue-700'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <span>Notifications</span>
                    {notificationCount > 0 ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        {notificationBadgeLabel}
                      </span>
                    ) : null}
                  </Link>
                )}
              </>
            ) : (
              /* Guest User: Show only Login/Register buttons */
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-semibold text-white hover:bg-white/15 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-left px-3 py-2 mt-2 rounded-xl text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 text-white hover:from-primary-800 hover:to-primary-700 transition-all duration-300 shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;