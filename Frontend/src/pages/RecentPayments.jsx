import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReceiptLightbox from '../components/ReceiptLightbox';
import {
  MOTO_TRADE_PHONE,
  getPaymentNotificationsForUser,
  getPaymentsForBuyer
} from '../utils/paymentStorage';

const statusClass = (status) => {
  if (status === 'verified') return 'bg-emerald-100 text-emerald-800';
  if (status === 'declined') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
};

const RecentPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const email = user?.email || '';
    setPayments(getPaymentsForBuyer(email));
    setNotifications(getPaymentNotificationsForUser(email));
  }, [user?.email]);

  return (
    <div className="page py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="panel-solid">
          <div className="panel-header">
            <h1 className="text-2xl font-extrabold text-gray-900">Recent Payments</h1>
            <p className="text-gray-600 mt-1">
              Track your payment status. For payment support contact Moto Trade: {MOTO_TRADE_PHONE}
            </p>
          </div>
          <div className="panel-body">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No payment notifications yet.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => {
                  const payment = payments.find((p) => p.id === n.paymentId);
                  const canRate = payment?.status === 'verified';
                  return (
                    <div
                      key={n.id}
                      className="rounded-lg border border-gray-200 bg-primary-50 px-3 py-2 text-sm text-gray-800 flex flex-wrap items-center justify-between gap-2"
                    >
                      <span>{n.message}</span>
                      {canRate && (
                        <Link to={`/purchase-feedback/${n.paymentId}`} className="btn-portal text-xs px-3 py-1.5">
                          Rate this purchase
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="panel-solid p-6">
            <p className="text-gray-600">No payment submissions yet.</p>
            <Link to="/second-hand-cars" className="btn-ghost mt-3 inline-block">
              Browse Cars
            </Link>
          </div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="panel-solid overflow-hidden">
              <div className="panel-header flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{p.vehicleTitle}</h2>
                  <p className="text-sm text-gray-600">Submitted: {new Date(p.submittedAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold ${statusClass(p.status)}`}>{p.status}</span>
              </div>
              <div className="panel-body grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  {p.vehicleImage ? (
                    <img src={p.vehicleImage} alt={p.vehicleTitle} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="h-44 flex items-center justify-center text-gray-500">No image</div>
                  )}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold">Amount:</span> Rs. {(Number(p.vehiclePrice) || 0).toLocaleString()}
                  </p>
                  {p.orderType === 'parts_cart' && Array.isArray(p.cartItems) && p.cartItems.length > 0 ? (
                    <ul className="text-xs text-gray-600 border border-gray-100 rounded-lg p-2 bg-gray-50 space-y-0.5">
                      {p.cartItems.map((c, idx) => (
                        <li key={idx}>
                          {c.name} — Rs. {(Number(c.price) || 0).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p>
                    <span className="font-semibold">Sender bank:</span> {p.senderBank}
                  </p>
                  <p>
                    <span className="font-semibold">Sender branch:</span> {p.senderBranch}
                  </p>
                  <p>
                    <span className="font-semibold">Sender name:</span> {p.senderName}
                  </p>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold">Admin note:</span> {p.adminDecisionNote || '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Reviewed:</span>{' '}
                    {p.reviewedAt ? new Date(p.reviewedAt).toLocaleString() : 'Pending review'}
                  </p>
                  {p.receiptImage ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-800 text-sm">Receipt</p>
                      <ReceiptLightbox src={p.receiptImage} alt={`Receipt for ${p.vehicleTitle}`} />
                      <a
                        href={p.receiptImage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-700 font-semibold hover:underline inline-block"
                      >
                        Open receipt in new tab
                      </a>
                    </div>
                  ) : p.receiptRemovedDueToQuota ? (
                    <p className="text-xs text-amber-700 font-semibold">
                      Receipt preview was removed due to browser storage limit.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentPayments;
