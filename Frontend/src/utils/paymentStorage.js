const PAYMENTS_KEY = 'motoTradePayments';
const PAYMENT_NOTIFICATIONS_KEY = 'motoTradePaymentNotifications';

export const MOTO_TRADE_PHONE = '+94 11 234 5678';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const loadJsonArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveJsonArray = (key, list) => {
  localStorage.setItem(key, JSON.stringify(list));
};

const isQuotaError = (e) =>
  e &&
  (e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22);

const slimPaymentForQuota = (payment) => ({
  ...payment,
  receiptImage: '',
  cartItems: null,
  note: '',
  receiptRemovedDueToQuota: true,
  compactedDueToQuota: true
});

/**
 * Persists payments; on quota overflow strips oldest receipt images, then drops oldest rows.
 * @returns {{ evictedReceipts: boolean, droppedPayments: number }}
 */
const savePaymentsList = (payments) => {
  let working = payments.map((p) => ({ ...p }));
  let evictedReceipts = false;
  let droppedPayments = 0;

  for (let round = 0; round < 600; round += 1) {
    try {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(working));
      return { evictedReceipts, droppedPayments };
    } catch (e) {
      if (!isQuotaError(e)) throw e;

      let stripped = false;
      for (let i = working.length - 1; i >= 0; i -= 1) {
        const r = working[i].receiptImage;
        if (r && String(r).length > 80) {
          working[i] = {
            ...working[i],
            receiptImage: '',
            receiptRemovedDueToQuota: true
          };
          evictedReceipts = true;
          stripped = true;
          break;
        }
      }
      if (stripped) continue;

      if (working.length <= 1) {
        // Last-resort: keep the payment row but drop heavy optional fields.
        const compacted = slimPaymentForQuota(working[0]);
        if (JSON.stringify(compacted) !== JSON.stringify(working[0])) {
          working = [compacted];
          evictedReceipts = true;
          continue;
        }
        const err = new Error('STORAGE_QUOTA_PAYMENTS');
        err.cause = e;
        throw err;
      }
      working = working.slice(0, -1);
      droppedPayments += 1;
    }
  }
  throw new Error('STORAGE_QUOTA_PAYMENTS');
};

const pushNotification = (notification) => {
  let all = loadJsonArray(PAYMENT_NOTIFICATIONS_KEY);
  all.unshift(notification);
  const maxKeep = 200;
  for (let round = 0; round < 50; round += 1) {
    try {
      if (all.length > maxKeep) all = all.slice(0, maxKeep);
      localStorage.setItem(PAYMENT_NOTIFICATIONS_KEY, JSON.stringify(all));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mototrade-payment-notifications'));
      }
      return;
    } catch (e) {
      if (!isQuotaError(e)) throw e;
      all = all.slice(0, Math.max(20, Math.floor(all.length / 2)));
    }
  }
};

export const getAllPayments = () =>
  loadJsonArray(PAYMENTS_KEY).sort(
    (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );

export const getPaymentsForBuyer = (buyerEmail) => {
  const n = normalizeEmail(buyerEmail);
  return getAllPayments().filter((p) => normalizeEmail(p.buyerEmail) === n);
};

export const getPaymentById = (paymentId) =>
  loadJsonArray(PAYMENTS_KEY).find((p) => p.id === paymentId) || null;

export const getPaymentNotificationsForUser = (email) => {
  const n = normalizeEmail(email);
  return loadJsonArray(PAYMENT_NOTIFICATIONS_KEY).filter((nItem) => normalizeEmail(nItem.userEmail) === n);
};

export const getAdminPaymentNotifications = () =>
  loadJsonArray(PAYMENT_NOTIFICATIONS_KEY).filter((nItem) => nItem.role === 'admin');

export const createPaymentSubmission = ({
  buyerEmail,
  buyerName,
  sellerEmail,
  sellerName,
  listingId,
  vehicleTitle,
  vehicleImage,
  vehiclePrice,
  senderBank,
  senderBranch,
  senderName,
  receiptImage,
  note,
  orderType = 'vehicle',
  cartItems = null
}) => {
  const payments = loadJsonArray(PAYMENTS_KEY);
  const payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    buyerEmail: normalizeEmail(buyerEmail),
    buyerName: buyerName || buyerEmail,
    sellerEmail: normalizeEmail(sellerEmail),
    sellerName: sellerName || '',
    listingId: String(listingId || ''),
    vehicleTitle: vehicleTitle || 'Vehicle',
    vehicleImage: vehicleImage || '',
    vehiclePrice: Number(vehiclePrice) || 0,
    senderBank: senderBank || '',
    senderBranch: senderBranch || '',
    senderName: senderName || '',
    receiptImage: receiptImage || '',
    note: note || '',
    orderType: orderType === 'parts_cart' ? 'parts_cart' : 'vehicle',
    cartItems: Array.isArray(cartItems) && cartItems.length > 0 ? cartItems : null,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    adminDecisionNote: ''
  };

  payments.unshift(payment);
  savePaymentsList(payments);

  pushNotification({
    id: `pn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userEmail: 'admin',
    paymentId: payment.id,
    role: 'admin',
    createdAt: new Date().toISOString(),
    message: `New payment submitted by ${payment.buyerName} for ${payment.vehicleTitle}.`
  });

  return payment;
};

export const reviewPaymentByAdmin = ({ paymentId, adminEmail, decision, decisionNote }) => {
  const payments = loadJsonArray(PAYMENTS_KEY);
  const idx = payments.findIndex((p) => p.id === paymentId);
  if (idx < 0) return null;

  const status = decision === 'verified' ? 'verified' : 'declined';
  const updated = {
    ...payments[idx],
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: normalizeEmail(adminEmail) || 'admin',
    adminDecisionNote: decisionNote || ''
  };
  payments[idx] = updated;
  savePaymentsList(payments);

  const humanStatus = status === 'verified' ? 'verified' : 'declined';
  pushNotification({
    id: `pn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userEmail: updated.buyerEmail,
    paymentId: updated.id,
    role: 'buyer',
    createdAt: new Date().toISOString(),
    message: `Your payment for ${updated.vehicleTitle} was ${humanStatus} by Moto Trade admin. For support call ${MOTO_TRADE_PHONE}.`
  });

  if (updated.sellerEmail) {
    pushNotification({
      id: `pn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userEmail: updated.sellerEmail,
      paymentId: updated.id,
      role: 'seller',
      createdAt: new Date().toISOString(),
      message: `Payment for your listing ${updated.vehicleTitle} was ${humanStatus} by Moto Trade admin.`
    });
  }

  pushNotification({
    id: `pn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userEmail: normalizeEmail(adminEmail) || 'admin@mototrade.local',
    paymentId: updated.id,
    role: 'admin',
    createdAt: new Date().toISOString(),
    message: `You ${humanStatus} payment ${updated.id} for ${updated.vehicleTitle}.`
  });

  return updated;
};
