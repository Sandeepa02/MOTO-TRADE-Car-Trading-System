import React, { useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../config/apiConfig';
import { SELLER_CARS_STORAGE_KEY } from './admin/adminInventoryHelpers';
import {
  deletePurchaseFeedback,
  getAllPurchaseFeedback,
  replyToPurchaseFeedback
} from '../utils/purchaseFeedbackStorage';

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      const endpoints = [
        { key: 'vehicles', url: `${API_CONFIG.BACKEND_API_URL}/vehicles` },
        { key: 'spareParts', url: `${API_CONFIG.BACKEND_API_URL}/spare-parts` },
        { key: 'modifications', url: `${API_CONFIG.BACKEND_API_URL}/modifications` }
      ];

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const response = await fetch(url);
            const data = await response.json();
            return { key, ok: data.success, data: data.data || [] };
          } catch {
            return { key, ok: false, data: [] };
          }
        })
      );

      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        setError(
          `Some data could not be loaded (${failed.map((f) => f.key).join(', ')}). Check that the backend is running.`
        );
      }

      results.forEach(({ key, data }) => {
        if (key === 'vehicles') setVehicles(data);
        if (key === 'spareParts') setSpareParts(data);
        if (key === 'modifications') setModifications(data);
      });

      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    setFeedbackItems(getAllPurchaseFeedback());
  }, []);

  const sellerCars = useMemo(
    () => JSON.parse(localStorage.getItem(SELLER_CARS_STORAGE_KEY) || '[]'),
    [vehicles, spareParts, modifications, loading]
  );

  const brandedCars = useMemo(
    () => vehicles.filter((v) => v.category === 'branded'),
    [vehicles]
  );

  const secondHandFromApi = useMemo(
    () => vehicles.filter((v) => v.category === 'second-hand'),
    [vehicles]
  );

  const secondHandCars = useMemo(
    () => [...sellerCars, ...secondHandFromApi],
    [sellerCars, secondHandFromApi]
  );

  const analytics = useMemo(
    () => ({
      branded: brandedCars.length,
      secondHand: secondHandCars.length,
      modifications: modifications.length,
      spareParts: spareParts.length
    }),
    [brandedCars.length, secondHandCars.length, modifications.length, spareParts.length]
  );

  const totalListings =
    analytics.branded + analytics.secondHand + analytics.modifications + analytics.spareParts;

  const refreshFeedback = () => {
    setFeedbackItems(getAllPurchaseFeedback());
  };

  const handleReply = (feedbackId) => {
    replyToPurchaseFeedback(feedbackId, replyDrafts[feedbackId] || '');
    refreshFeedback();
  };

  const handleDelete = (feedbackId) => {
    if (!window.confirm('Delete this review/complaint?')) return;
    deletePurchaseFeedback(feedbackId);
    refreshFeedback();
  };

  return (
    <div className="page py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="panel-soft">
          <div className="panel-header">
            <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Inventory overview. Use the sidebar to open each section — branded cars, spare parts, and modifications can
              only be added from those admin pages (admin login required).
            </p>
          </div>
          <div className="panel-body">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
              </div>
            )}

            {!loading && error && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="kpi-card bg-gradient-to-b from-surface-50 to-white subtle-ring">
                    <p className="text-sm text-gray-600">Branded Cars</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{analytics.branded}</p>
                  </div>
                  <div className="kpi-card bg-gradient-to-b from-surface-50 to-white subtle-ring">
                    <p className="text-sm text-gray-600">Second-Hand Cars</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{analytics.secondHand}</p>
                  </div>
                  <div className="kpi-card bg-gradient-to-b from-surface-50 to-white subtle-ring">
                    <p className="text-sm text-gray-600">Modifications</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{analytics.modifications}</p>
                  </div>
                  <div className="kpi-card bg-gradient-to-b from-surface-50 to-white subtle-ring">
                    <p className="text-sm text-gray-600">Spare Parts</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{analytics.spareParts}</p>
                  </div>
                </div>

                <div className="mt-6 panel-muted p-4 rounded-lg">
                  <p className="text-gray-700 font-semibold">Total tracked listings: {totalListings}</p>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-extrabold text-gray-900">Customer Reviews & Complaints</h2>
                  <p className="text-sm text-gray-600 mt-1">Admin can reply and delete items below.</p>
                  {feedbackItems.length === 0 ? (
                    <div className="mt-3 empty-state text-sm">
                      No reviews or complaints submitted yet.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {feedbackItems.map((item) => (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-gray-900">{item.vehicleTitle}</p>
                            <p className="text-xs text-gray-500">{new Date(item.updatedAt).toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            Buyer: <span className="font-semibold">{item.buyerName}</span> ({item.buyerEmail})
                          </p>
                          <p className="text-sm text-amber-700 font-bold mt-1">
                            {'★'.repeat(item.starRating)}
                            {'☆'.repeat(5 - item.starRating)}
                          </p>
                          {item.selectedSuggestion && (
                            <p className="text-sm text-gray-700 mt-1">Suggestion: {item.selectedSuggestion}</p>
                          )}
                          {item.manualFeedback && (
                            <p className="text-sm text-gray-700 mt-1">Feedback: {item.manualFeedback}</p>
                          )}
                          {item.complaintCategory && (
                            <p className="text-sm text-red-700 mt-1">
                              Complaint ({item.complaintCategory}): {item.complaintText || '—'}
                            </p>
                          )}

                          <div className="mt-3 space-y-2">
                            <textarea
                              rows={2}
                              className="input resize-none"
                              value={replyDrafts[item.id] ?? item.adminReply ?? ''}
                              onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Write admin reply..."
                            />
                            <div className="flex gap-2">
                              <button type="button" className="btn-portal" onClick={() => handleReply(item.id)}>
                                Save Reply
                              </button>
                              <button type="button" className="btn-danger" onClick={() => handleDelete(item.id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
