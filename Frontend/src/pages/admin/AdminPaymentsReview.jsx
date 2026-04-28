import React, { useCallback, useEffect, useState } from 'react';
import {
  getAdminPaymentNotifications,
  getAllPayments,
  reviewPaymentByAdmin
} from '../../utils/paymentStorage';
import { useAuth } from '../../context/AuthContext';
import ReceiptLightbox from '../../components/ReceiptLightbox';

const statusPillClass = (status) => {
  if (status === 'verified') return 'status-success';
  if (status === 'declined') return 'status-danger';
  return 'status-warning';
};

const AdminPaymentsReview = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState({});
  const [adminNotifications, setAdminNotifications] = useState([]);

  const refresh = useCallback(() => {
    setPayments(getAllPayments());
    setAdminNotifications(getAdminPaymentNotifications());
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  useEffect(() => {
    const onStorage = (e) => {
      if (
        e.key === 'motoTradePayments' ||
        e.key === 'motoTradePaymentNotifications' ||
        e.key === null
      ) {
        refresh();
      }
    };
    const onPaymentNotifications = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    window.addEventListener('mototrade-payment-notifications', onPaymentNotifications);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('mototrade-payment-notifications', onPaymentNotifications);
    };
  }, [refresh]);

  const handleReview = (paymentId, decision) => {
    reviewPaymentByAdmin({
      paymentId,
      adminEmail: user?.email || 'admin@mototrade.local',
      decision,
      decisionNote: notes[paymentId] || ''
    });
    refresh();
  };

  return (
    <div className="page py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="panel-soft">
          <div className="panel-header">
            <h1 className="text-2xl font-extrabold text-gray-900">Payment Reviews</h1>
            <p className="text-gray-600 mt-1">Verify or decline submitted buyer payments.</p>
          </div>
          <div className="panel-body">
            {adminNotifications.length === 0 ? (
              <div className="empty-state text-sm">No payment notifications yet.</div>
            ) : (
              <div className="space-y-2">
                {adminNotifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-soft"
                  >
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="empty-state text-sm text-gray-600">No payment submissions yet.</div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="panel-soft overflow-hidden">
              <div className="panel-header flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{p.vehicleTitle}</h2>
                  <p className="text-sm text-gray-600">
                    Buyer: <span className="font-semibold">{p.buyerName}</span> ({p.buyerEmail})
                  </p>
                  {p.sellerEmail ? (
                    <p className="text-sm text-gray-600">
                      Seller: <span className="font-semibold">{p.sellerName || p.sellerEmail}</span> ({p.sellerEmail})
                    </p>
                  ) : null}
                </div>
                <span className={statusPillClass(p.status)}>{p.status}</span>
              </div>
              <div className="panel-body grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 subtle-ring">
                    {p.vehicleImage ? (
                      <img src={p.vehicleImage} alt={p.vehicleTitle} className="w-full h-52 object-cover" />
                    ) : (
                      <div className="h-52 flex items-center justify-center text-gray-500">No vehicle image</div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 font-semibold">Amount: Rs. {(Number(p.vehiclePrice) || 0).toLocaleString()}</p>
                </div>
                <div className="lg:col-span-1 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Sender bank:</span> {p.senderBank}
                  </p>
                  <p>
                    <span className="font-semibold">Sender branch:</span> {p.senderBranch}
                  </p>
                  <p>
                    <span className="font-semibold">Sender name:</span> {p.senderName}
                  </p>
                  <p>
                    <span className="font-semibold">Buyer note:</span> {p.note || '—'}
                  </p>
                  {p.orderType === 'parts_cart' && Array.isArray(p.cartItems) && p.cartItems.length > 0 ? (
                    <div className="panel-muted p-3 mt-2">
                      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1">Line items</p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {p.cartItems.map((c, idx) => (
                          <li key={idx}>
                            {c.name}{' '}
                            <span className="text-gray-500">({c.kind === 'modification' ? 'Modification' : 'Spare part'})</span>{' '}
                            — Rs. {(Number(c.price) || 0).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <p>
                    <span className="font-semibold">Submitted:</span> {new Date(p.submittedAt).toLocaleString()}
                  </p>
                  {p.reviewedAt && (
                    <p>
                      <span className="font-semibold">Reviewed:</span> {new Date(p.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="lg:col-span-1">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Receipt</p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 subtle-ring">
                    {p.receiptImage ? (
                      <ReceiptLightbox src={p.receiptImage} alt={`Receipt for ${p.vehicleTitle}`} />
                    ) : (
                      <div className="h-52 flex items-center justify-center text-gray-500">No receipt image</div>
                    )}
                  </div>
                  {p.receiptRemovedDueToQuota ? (
                    <p className="mt-2 text-xs text-amber-700 font-semibold">
                      Receipt was removed due to browser storage limit. Ask buyer to re-submit after clearing site storage.
                    </p>
                  ) : null}
                  {p.status === 'pending' && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="input resize-none"
                        rows={2}
                        placeholder="Admin note (optional)"
                        value={notes[p.id] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <button type="button" className="btn-danger flex-1" onClick={() => handleReview(p.id, 'declined')}>
                          Decline
                        </button>
                        <button type="button" className="btn-portal flex-1" onClick={() => handleReview(p.id, 'verified')}>
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsReview;
