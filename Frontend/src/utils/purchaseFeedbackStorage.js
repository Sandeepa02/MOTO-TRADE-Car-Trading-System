const PURCHASE_FEEDBACK_KEY = 'motoTradePurchaseFeedback';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const loadAll = () => {
  try {
    const raw = localStorage.getItem(PURCHASE_FEEDBACK_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAll = (items) => {
  localStorage.setItem(PURCHASE_FEEDBACK_KEY, JSON.stringify(items));
};

export const getSuggestedCommentsByStars = (stars) => {
  const rating = Number(stars);
  if (rating >= 5) {
    return ['Excellent condition and smooth process', 'Very satisfied with this purchase', 'Fast and professional support'];
  }
  if (rating >= 4) {
    return ['Good overall experience', 'Vehicle matches the description', 'Payment confirmation was clear'];
  }
  if (rating >= 3) {
    return ['Average experience', 'Needs better communication', 'Delivery and support can improve'];
  }
  if (rating >= 2) {
    return ['Not fully satisfied with the process', 'Support response was slow', 'Expected better quality assurance'];
  }
  return ['Poor purchase experience', 'Serious issue with vehicle or service', 'Need urgent support from Moto Trade'];
};

export const COMPLAINT_CATEGORIES = [
  'Vehicle condition mismatch',
  'Payment issue',
  'Late response',
  'Delivery delay',
  'Other'
];

export const saveOrUpdatePurchaseFeedback = (payload) => {
  const all = loadAll();
  const buyerEmail = normalizeEmail(payload.buyerEmail);
  const existingIdx = all.findIndex(
    (item) => item.paymentId === payload.paymentId && normalizeEmail(item.buyerEmail) === buyerEmail
  );

  const next = {
    id: existingIdx >= 0 ? all[existingIdx].id : `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    paymentId: payload.paymentId,
    buyerEmail,
    buyerName: payload.buyerName || payload.buyerEmail,
    vehicleTitle: payload.vehicleTitle || 'Vehicle',
    starRating: Number(payload.starRating) || 0,
    selectedSuggestion: payload.selectedSuggestion || '',
    manualFeedback: payload.manualFeedback || '',
    complaintCategory: payload.complaintCategory || '',
    complaintText: payload.complaintText || '',
    adminReply: existingIdx >= 0 ? all[existingIdx].adminReply || '' : '',
    createdAt: existingIdx >= 0 ? all[existingIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    all[existingIdx] = next;
  } else {
    all.unshift(next);
  }
  saveAll(all);
  return next;
};

export const getPurchaseFeedbackForBuyer = (buyerEmail) => {
  const n = normalizeEmail(buyerEmail);
  return loadAll()
    .filter((item) => normalizeEmail(item.buyerEmail) === n)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
};

export const getPurchaseFeedbackByPayment = (paymentId, buyerEmail) => {
  const n = normalizeEmail(buyerEmail);
  return loadAll().find((item) => item.paymentId === paymentId && normalizeEmail(item.buyerEmail) === n) || null;
};

export const getAllPurchaseFeedback = () =>
  loadAll().sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

export const replyToPurchaseFeedback = (feedbackId, replyText) => {
  const all = loadAll();
  const idx = all.findIndex((item) => item.id === feedbackId);
  if (idx < 0) return null;
  all[idx] = {
    ...all[idx],
    adminReply: replyText || '',
    updatedAt: new Date().toISOString()
  };
  saveAll(all);
  return all[idx];
};

export const deletePurchaseFeedback = (feedbackId) => {
  const all = loadAll();
  const next = all.filter((item) => item.id !== feedbackId);
  saveAll(next);
};
