const OFFER_CODES_KEY = 'motoTradeOfferCodes';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const loadCodes = () => {
  try {
    const raw = localStorage.getItem(OFFER_CODES_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCodes = (codes) => {
  localStorage.setItem(OFFER_CODES_KEY, JSON.stringify(codes));
};

const randomSegment = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const generateUniqueCode = () => {
  const existing = new Set(loadCodes().map((c) => c.code));
  for (let i = 0; i < 30; i += 1) {
    const candidate = `MT-${Date.now().toString(36).toUpperCase().slice(-6)}-${randomSegment()}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `MT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

/**
 * Registers a code in local storage to enforce uniqueness and one-time use.
 */
export const createOfferCode = ({ conversationId, buyerEmail, amount, sellerEmail = '' }) => {
  const code = generateUniqueCode();
  const record = {
    code,
    conversationId: conversationId || '',
    buyerEmail: normalizeEmail(buyerEmail),
    sellerEmail: normalizeEmail(sellerEmail),
    amount: Number(amount) || 0,
    used: false,
    createdAt: new Date().toISOString(),
    usedAt: null,
    usedBy: null
  };
  const all = loadCodes();
  all.unshift(record);
  saveCodes(all);
  return record;
};

export const getOfferCode = (code) =>
  loadCodes().find((r) => r.code === String(code || '').trim().toUpperCase()) || null;

/**
 * Checks and redeems code. It cannot be used more than once and only by intended buyer.
 */
export const redeemOfferCode = ({ code, buyerEmail }) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const normalizedBuyer = normalizeEmail(buyerEmail);
  const all = loadCodes();
  const idx = all.findIndex((r) => r.code === normalizedCode);
  if (idx < 0) {
    return { ok: false, reason: 'not_found', message: 'Offer code not found.' };
  }

  const rec = all[idx];
  if (rec.used) {
    return { ok: false, reason: 'used', message: 'This offer code is already used.' };
  }
  if (rec.buyerEmail && rec.buyerEmail !== normalizedBuyer) {
    return { ok: false, reason: 'wrong_buyer', message: 'This offer code is assigned to another buyer.' };
  }

  all[idx] = {
    ...rec,
    used: true,
    usedAt: new Date().toISOString(),
    usedBy: normalizedBuyer
  };
  saveCodes(all);
  return { ok: true, amount: Number(rec.amount) || 0, code: rec.code };
};

