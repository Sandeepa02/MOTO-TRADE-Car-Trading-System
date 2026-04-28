import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navIcon = (d) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
  </svg>
);

const UserProfileDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const savedProfile = JSON.parse(localStorage.getItem('userProfileDetails') || '{}');
  const profileImage = savedProfile.profilePicture || '';
  const displayName = savedProfile.name || user?.name || 'User';
  const email = savedProfile.email || user?.email || '';

  const menuItems = [
    {
      label: 'Profile',
      path: '/user-profile/details',
      icon: navIcon('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')
    },
    {
      label: 'My Reviews',
      path: '/user-profile/reviews',
      icon: navIcon('M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z')
    },
    {
      label: 'Recent Payments',
      path: '/user-profile/payments',
      icon: navIcon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z')
    },
    {
      label: 'My Cart',
      path: '/user-profile/cart',
      icon: navIcon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z')
    },
    {
      label: 'Browsing History',
      path: '/user-profile/history',
      icon: navIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z')
    },
    {
      label: 'Become a Seller',
      path: '/seller-dashboard',
      icon: navIcon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4')
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-8 min-h-[calc(100vh-120px)]">
        <aside className="w-full h-full">
          <div className="rounded-[28px] bg-[#f7f7f8] border border-gray-200/80 shadow-sm p-4 h-full">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-700 px-2 mb-5">Moto Trade</p>
            <nav className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate('/user-profile')}
                className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-[15px] font-semibold transition-colors border ${
                  location.pathname === '/user-profile'
                    ? 'bg-primary-50 text-primary-800 border-primary-100'
                    : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {navIcon('M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z')}
                Dashboard
              </button>
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-[15px] font-medium transition-colors border ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-800 border-primary-100'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={isActive(item.path) ? 'text-primary-700' : 'text-gray-400'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="h-px bg-gray-200 mt-8" />
          </div>
        </aside>

        <main className="min-w-0 w-full h-full">
          <div className="rounded-[44px] bg-[#f7f7f8] border border-gray-200/80 shadow-[0_6px_22px_rgba(0,0,0,0.12)] p-5 sm:p-7 h-full flex flex-col">
            <header className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back — manage your account from here.</p>
            </header>

            <div className="w-full flex-1">
              <div className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden w-full">
                <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-50">
                  {profileImage ? (
                    <img src={profileImage} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary-700/35 text-5xl font-extrabold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="px-6 sm:px-8 py-6">
                  <div className="flex flex-col items-start gap-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">My profile</h2>
                    <p className="text-xs text-gray-500 max-w-[220px]">
                      {email ? <span className="break-all">{email}</span> : <span>No email on file</span>}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-6">{displayName}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/user-profile/details')}
                className="w-full sm:w-64 rounded-full border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login', {
                    replace: true,
                    state: { logoutMessage: 'You have been logged out.' }
                  });
                }}
                className="w-full sm:w-64 rounded-full border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfileDashboard;
