import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPurchaseFeedbackForBuyer } from '../utils/purchaseFeedbackStorage';

const UserReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setReviews(getPurchaseFeedbackForBuyer(user?.email || ''));
  }, [user?.email]);

  return (
    <div className="page py-8 px-4">
      <div className="max-w-5xl mx-auto panel-solid">
        <div className="panel-header">
          <h1 className="text-2xl font-extrabold text-gray-900">My Reviews & Complaints</h1>
          <p className="text-gray-600 mt-1">Track your submitted purchase ratings and complaint updates.</p>
        </div>
        <div className="panel-body">
          {reviews.length === 0 ? (
            <div>
              <p className="text-gray-600">No reviews submitted yet.</p>
              <Link className="btn-ghost mt-3 inline-block" to="/user-profile/payments">
                Open Recent Payments
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-200 p-4 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-bold text-gray-900">{r.vehicleTitle}</h2>
                    <Link to={`/purchase-feedback/${r.paymentId}`} className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                      Edit
                    </Link>
                  </div>
                  <p className="text-sm text-amber-700 font-bold mt-1">{'★'.repeat(r.starRating)}{'☆'.repeat(5 - r.starRating)}</p>
                  {r.selectedSuggestion && <p className="text-sm text-gray-700 mt-1">Suggestion: {r.selectedSuggestion}</p>}
                  {r.manualFeedback && <p className="text-sm text-gray-700 mt-1">Feedback: {r.manualFeedback}</p>}
                  {r.complaintCategory && (
                    <p className="text-sm text-red-700 mt-1">
                      Complaint ({r.complaintCategory}): {r.complaintText || '—'}
                    </p>
                  )}
                  <div className="mt-2 rounded-lg bg-gray-50 border border-gray-200 p-2 text-sm">
                    <span className="font-semibold text-gray-800">Admin reply:</span>{' '}
                    <span className="text-gray-700">{r.adminReply || 'No reply yet.'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviews;
