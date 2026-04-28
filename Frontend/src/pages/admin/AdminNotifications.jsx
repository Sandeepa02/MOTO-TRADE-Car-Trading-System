import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPaymentNotifications } from '../../utils/paymentStorage';

const toDateLabel = (iso) => {
  const ts = new Date(iso || 0).getTime();
  if (!Number.isFinite(ts) || ts <= 0) return 'Unknown time';
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 24 * 60) return `${Math.floor(diffMin / 60)}h ago`;
  return new Date(ts).toLocaleString();
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getAdminPaymentNotifications());
  }, []);

  const totals = useMemo(
    () => ({
      total: notifications.length,
      newPayments: notifications.filter((n) => String(n.message || '').toLowerCase().includes('new payment')).length,
      reviewed: notifications.filter((n) => {
        const msg = String(n.message || '').toLowerCase();
        return msg.includes('verified payment') || msg.includes('declined payment');
      }).length
    }),
    [notifications]
  );

  return (
    <div className="page py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="panel-solid">
          <div className="panel-header">
            <h1 className="text-2xl font-extrabold text-gray-900">Admin Notifications</h1>
            <p className="text-gray-600 mt-1">Track payment submission and review events.</p>
          </div>
          <div className="panel-body grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totals.total}</p>
            </div>
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-3">
              <p className="text-xs uppercase tracking-wide text-primary-700">New payment alerts</p>
              <p className="text-2xl font-extrabold text-primary-800 mt-1">{totals.newPayments}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Review updates</p>
              <p className="text-2xl font-extrabold text-emerald-800 mt-1">{totals.reviewed}</p>
            </div>
          </div>
        </div>

        <div className="panel-solid">
          <div className="panel-body">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No admin notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">{n.message}</p>
                      <span className="text-xs text-gray-500">{toDateLabel(n.createdAt)}</span>
                    </div>
                    <div className="mt-3">
                      <Link to="/admin/payments" className="btn-ghost text-xs px-3 py-1.5">
                        Open payment reviews
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
