import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPaymentNotificationsForUser, getPaymentsForBuyer } from '../utils/paymentStorage';

const toDateLabel = (iso) => {
  const ts = new Date(iso || 0).getTime();
  if (!Number.isFinite(ts) || ts <= 0) return 'Unknown time';
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 24 * 60) return `${Math.floor(diffMin / 60)}h ago`;
  return new Date(ts).toLocaleString();
};

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [paymentsById, setPaymentsById] = useState({});

  useEffect(() => {
    const email = user?.email || '';
    const noteList = getPaymentNotificationsForUser(email);
    const paymentList = getPaymentsForBuyer(email);
    const byId = paymentList.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    setNotifications(noteList);
    setPaymentsById(byId);
  }, [user?.email]);

  const totals = useMemo(
    () => ({
      total: notifications.length,
      verified: notifications.filter((n) => String(n.message || '').toLowerCase().includes('verified')).length,
      declined: notifications.filter((n) => String(n.message || '').toLowerCase().includes('declined')).length
    }),
    [notifications]
  );

  return (
    <div className="page py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="panel-solid">
          <div className="panel-header">
            <h1 className="text-2xl font-extrabold text-gray-900">My Notifications</h1>
            <p className="text-gray-600 mt-1">See your latest payment updates from Moto Trade admin.</p>
          </div>
          <div className="panel-body grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totals.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Verified</p>
              <p className="text-2xl font-extrabold text-emerald-800 mt-1">{totals.verified}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs uppercase tracking-wide text-red-700">Declined</p>
              <p className="text-2xl font-extrabold text-red-800 mt-1">{totals.declined}</p>
            </div>
          </div>
        </div>

        <div className="panel-solid">
          <div className="panel-body">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const payment = paymentsById[n.paymentId];
                  const canRate = payment?.status === 'verified';
                  return (
                    <div key={n.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800">{n.message}</p>
                        <span className="text-xs text-gray-500">{toDateLabel(n.createdAt)}</span>
                      </div>
                      {payment ? (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-semibold">Payment:</span> {payment.vehicleTitle}
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link to="/user-profile/payments" className="btn-ghost text-xs px-3 py-1.5">
                          Open payments
                        </Link>
                        {canRate ? (
                          <Link to={`/purchase-feedback/${n.paymentId}`} className="btn-portal text-xs px-3 py-1.5">
                            Rate this purchase
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;
