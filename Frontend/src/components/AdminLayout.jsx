import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminPaymentNotifications } from '../utils/paymentStorage';

const navLinkClass = ({ isActive }) =>
  `block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-800'
  }`;

const notificationsNavClass = ({ isActive }) =>
  `flex w-full items-center justify-between gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-800'
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [adminNotificationCount, setAdminNotificationCount] = useState(0);

  const refreshAdminNotificationCount = useCallback(() => {
    setAdminNotificationCount(getAdminPaymentNotifications().length);
  }, []);

  useEffect(() => {
    refreshAdminNotificationCount();
  }, [refreshAdminNotificationCount, location.pathname]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'motoTradePaymentNotifications' || e.key === null) {
        refreshAdminNotificationCount();
      }
    };
    const onPaymentNotifications = () => refreshAdminNotificationCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshAdminNotificationCount);
    window.addEventListener('mototrade-payment-notifications', onPaymentNotifications);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshAdminNotificationCount);
      window.removeEventListener('mototrade-payment-notifications', onPaymentNotifications);
    };
  }, [refreshAdminNotificationCount]);

  const adminBadgeLabel =
    adminNotificationCount > 99 ? '99+' : String(adminNotificationCount || '');

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 sm:w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Moto Trade</p>
          <p className="text-lg font-extrabold text-gray-900">Admin</p>
          <p className="text-xs text-gray-500 mt-1">Use the menu to open each section.</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/admin/dashboard" className={navLinkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/branded-cars" className={navLinkClass}>
            Branded Cars
          </NavLink>
          <NavLink to="/admin/second-hand-cars" className={navLinkClass}>
            Second-Hand Cars
          </NavLink>
          <NavLink to="/admin/spare-parts" className={navLinkClass}>
            Spare Parts
          </NavLink>
          <NavLink to="/admin/modifications" className={navLinkClass}>
            Modifications
          </NavLink>
          <NavLink to="/admin/payments" className={navLinkClass}>
            Payment Reviews
          </NavLink>
          <NavLink to="/my-chats" className={navLinkClass}>
            My Chats
          </NavLink>
          <NavLink to="/admin/notifications" className={notificationsNavClass}>
            <span>Notifications</span>
            {adminNotificationCount > 0 ? (
              <span className="shrink-0 min-w-[1.25rem] rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                {adminBadgeLabel}
              </span>
            ) : null}
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login', {
                replace: true,
                state: { logoutMessage: 'You have been logged out.' }
              });
            }}
            className="btn-ghost w-full text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
