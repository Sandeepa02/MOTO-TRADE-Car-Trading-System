import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPaymentById } from '../utils/paymentStorage';
import {
  COMPLAINT_CATEGORIES,
  getPurchaseFeedbackByPayment,
  getSuggestedCommentsByStars,
  saveOrUpdatePurchaseFeedback
} from '../utils/purchaseFeedbackStorage';

const PurchaseFeedbackPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const payment = getPaymentById(paymentId);
  const existing = getPurchaseFeedbackByPayment(paymentId, user?.email || '');

  const [stars, setStars] = useState(existing?.starRating || 0);
  const [selectedSuggestion, setSelectedSuggestion] = useState(existing?.selectedSuggestion || '');
  const [manualFeedback, setManualFeedback] = useState(existing?.manualFeedback || '');
  const [complaintCategory, setComplaintCategory] = useState(existing?.complaintCategory || '');
  const [complaintText, setComplaintText] = useState(existing?.complaintText || '');
  const [error, setError] = useState('');

  const suggestions = useMemo(() => getSuggestedCommentsByStars(stars), [stars]);

  if (!payment || (user?.email && payment.buyerEmail !== user.email.toLowerCase())) {
    return (
      <div className="page py-8 px-4">
        <div className="max-w-3xl mx-auto panel-solid p-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Review & Rating</h1>
          <p className="text-gray-600 mt-2">This purchase is not available for review.</p>
          <Link className="btn-ghost mt-4 inline-block" to="/user-profile/payments">
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  if (payment.status !== 'verified') {
    return (
      <div className="page py-8 px-4">
        <div className="max-w-3xl mx-auto panel-solid p-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Review & Rating</h1>
          <p className="text-gray-600 mt-2">You can rate this purchase after admin verifies your payment.</p>
          <Link className="btn-ghost mt-4 inline-block" to="/user-profile/payments">
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (stars < 1) {
      setError('Please select a star rating.');
      return;
    }
    if (!selectedSuggestion && !manualFeedback.trim()) {
      setError('Choose a suggested comment or write manual feedback.');
      return;
    }
    if (complaintCategory && !complaintText.trim()) {
      setError('Please write complaint details for the selected category.');
      return;
    }

    saveOrUpdatePurchaseFeedback({
      paymentId,
      buyerEmail: user?.email || '',
      buyerName: user?.name || user?.email || 'Buyer',
      vehicleTitle: payment.vehicleTitle,
      starRating: stars,
      selectedSuggestion,
      manualFeedback: manualFeedback.trim(),
      complaintCategory,
      complaintText: complaintText.trim()
    });
    navigate('/user-profile/reviews');
  };

  return (
    <div className="page py-8 px-4">
      <div className="max-w-4xl mx-auto panel-solid overflow-hidden">
        <div className="panel-header">
          <h1 className="text-2xl font-extrabold text-gray-900">Rate This Purchase</h1>
          <p className="text-gray-600 mt-1">{payment.vehicleTitle}</p>
        </div>
        <div className="panel-body">
          <form className="space-y-5" onSubmit={onSubmit}>
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <p className="label">Star rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setStars(v);
                      setSelectedSuggestion('');
                      setError('');
                    }}
                    className={`h-10 w-10 rounded-lg border text-lg font-extrabold ${
                      stars >= v ? 'bg-amber-300 border-amber-400 text-amber-900' : 'bg-white border-gray-300 text-gray-500'
                    }`}
                    title={`${v} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label">Suggested comments (auto based on stars)</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSelectedSuggestion(item);
                      setError('');
                    }}
                    className={`px-3 py-2 rounded-full text-sm border ${
                      selectedSuggestion === item
                        ? 'bg-primary-100 text-primary-800 border-primary-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Manual feedback</label>
              <textarea
                rows={4}
                className="input resize-none"
                value={manualFeedback}
                onChange={(e) => {
                  setManualFeedback(e.target.value);
                  setError('');
                }}
                placeholder="Write your own feedback..."
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="font-semibold text-gray-900">Complain about this purchase (optional)</p>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setComplaintCategory(cat === complaintCategory ? '' : cat);
                      setError('');
                    }}
                    className={`text-left px-3 py-2 rounded-lg border text-sm ${
                      complaintCategory === cat
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {complaintCategory && (
                <div className="mt-3">
                  <label className="label">Complaint details</label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder={`Describe complaint for "${complaintCategory}"`}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link to="/user-profile/payments" className="btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn-portal">
                Submit Review & Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFeedbackPage;
