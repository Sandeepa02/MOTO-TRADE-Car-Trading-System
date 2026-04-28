const GLOBAL_KEY = 'motoTradeAllConversations';
const LEGACY_PREFIX = 'motoTradeChats_';
const MAX_INLINE_IMAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_CONVERSATION = 50;
const MAX_CONVERSATIONS = 120;

export const normalizeEmail = (e) => (e || '').trim().toLowerCase();
export const normalizeCategory = (category) => {
  const raw = String(category || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');
  if (!raw) return 'other';
  if (raw === 'second-hand' || raw === 'secondhand' || raw === 'used') return 'second-hand';
  if (raw === 'branded' || raw === 'brand-new' || raw === 'new') return 'branded';
  return raw;
};

const sanitizeConversation = (c) => {
  if (!c || typeof c !== 'object') return null;
  const id = c.id ? String(c.id) : `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const listingId = c.listingId != null ? String(c.listingId) : '';
  return {
    ...c,
    id,
    listingId,
    category: normalizeCategory(c.category),
    buyerEmail: normalizeEmail(c.buyerEmail),
    listingSellerEmail: c.listingSellerEmail ? normalizeEmail(c.listingSellerEmail) : null,
    recipientRole: c.recipientRole || 'admin',
    sellerName: c.sellerName || 'Seller',
    displayCounterparty: c.displayCounterparty || c.sellerName || 'Seller',
    listingPrice: Number.isFinite(Number(c.listingPrice)) ? Number(c.listingPrice) : 0,
    messages: Array.isArray(c.messages) ? c.messages : [],
    updatedAt: c.updatedAt || new Date().toISOString(),
    buyerArchived: !!c.buyerArchived,
    recipientArchived: !!c.recipientArchived,
    preview: c.preview || 'No messages yet...'
  };
};

const sanitizeConversations = (input) =>
  (Array.isArray(input) ? input : [])
    .map((c) => sanitizeConversation(c))
    .filter(Boolean);

const migrateLegacyPerUserKeys = () => {
  const conversations = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(LEGACY_PREFIX)) continue;
      const buyerEmail = k.slice(LEGACY_PREFIX.length);
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const data = JSON.parse(raw);
      for (const c of data.conversations || []) {
        conversations.push({
          ...c,
          buyerEmail: normalizeEmail(buyerEmail),
          buyerName: c.buyerName || buyerEmail,
          category: c.category || 'second-hand',
          listingSellerEmail: c.listingSellerEmail ? normalizeEmail(c.listingSellerEmail) : null,
          recipientRole: c.recipientRole || 'seller',
          displayCounterparty: c.displayCounterparty || c.sellerName || 'Seller',
          buyerArchived: !!c.archived || !!c.buyerArchived,
          recipientArchived: !!c.recipientArchived
        });
      }
    }
  } catch {
    /* ignore */
  }
  return { conversations };
};

export const loadGlobalChats = () => {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.conversations)) {
        const sanitized = sanitizeConversations(parsed.conversations);
        const next = { conversations: sanitized };
        if (JSON.stringify(parsed.conversations) !== JSON.stringify(sanitized)) {
          saveGlobalChats(next);
        }
        return next;
      }
      const migrated = migrateLegacyPerUserKeys();
      if (migrated.conversations.length > 0) {
        const next = { conversations: sanitizeConversations(migrated.conversations) };
        saveGlobalChats(next);
        return next;
      }
      return { conversations: [] };
    }
  } catch {
    /* fall through */
  }
  const migrated = migrateLegacyPerUserKeys();
  if (migrated.conversations.length > 0) {
    const next = { conversations: sanitizeConversations(migrated.conversations) };
    saveGlobalChats(next);
    return next;
  }
  return { conversations: [] };
};

const pruneForStorage = (data, level = 0) => {
  const source = sanitizeConversations(data?.conversations);
  let conversations = source.map((c) => ({ ...c }));

  // Level 0: keep sanitized payload.
  if (level >= 1) {
    // Remove heavy thumbnails and message images first.
    conversations = conversations.map((c) => ({
      ...c,
      thumbnail: '',
      messages: (Array.isArray(c.messages) ? c.messages : []).map((m) => ({
        ...m,
        imageUrl: null
      }))
    }));
  }

  if (level >= 2) {
    // Keep only most recent messages per thread.
    conversations = conversations.map((c) => ({
      ...c,
      messages: (Array.isArray(c.messages) ? c.messages : []).slice(-MAX_MESSAGES_PER_CONVERSATION)
    }));
  }

  if (level >= 3) {
    // Keep only recent conversations.
    conversations = conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_CONVERSATIONS);
  }

  return { conversations };
};

export const saveGlobalChats = (data) => {
  for (let level = 0; level <= 3; level += 1) {
    try {
      const payload = pruneForStorage(data, level);
      localStorage.setItem(GLOBAL_KEY, JSON.stringify(payload));
      return true;
    } catch (err) {
      const isQuotaError =
        err?.name === 'QuotaExceededError' ||
        String(err?.message || '').toLowerCase().includes('quota');
      if (!isQuotaError) {
        console.error('Failed to save chat storage:', err);
        return false;
      }
      if (level === 3) {
        console.warn('Chat storage quota exceeded; unable to persist all data.');
        return false;
      }
    }
  }
  return false;
};

export const getBuyerConversations = (buyerEmail) => {
  const n = normalizeEmail(buyerEmail);
  return loadGlobalChats().conversations.filter((c) => normalizeEmail(c.buyerEmail) === n);
};

/** Admin inbox: only chats about branded listings (branded inventory is admin-managed). */
export const getAdminBrandedInbox = () =>
  loadGlobalChats().conversations.filter(
    (c) => normalizeCategory(c.category) === 'branded' && c.recipientRole === 'admin'
  );

/** Second-hand threads for the listing owner email */
export const getSellerSecondHandInbox = (sellerEmail) => {
  const n = normalizeEmail(sellerEmail);
  return loadGlobalChats().conversations.filter(
    (c) =>
      c.recipientRole === 'seller' &&
      normalizeCategory(c.category) === 'second-hand' &&
      c.listingSellerEmail &&
      normalizeEmail(c.listingSellerEmail) === n
  );
};

/**
 * @param {string} buyerEmail
 * @param {string} buyerName
 * @param {{
 *   listingId: string,
 *   title: string,
 *   sellerName?: string,
 *   thumbnail?: string,
 *   category?: string,
 *   listingPrice?: number | string,
 *   listingSellerEmail?: string | null
 * }} listing
 */
export const ensureConversation = (buyerEmail, buyerName, listing) => {
  const data = loadGlobalChats();
  const lid = String(listing.listingId);
  const be = normalizeEmail(buyerEmail);
  let conv = data.conversations.find(
    (c) => c.listingId === lid && normalizeEmail(c.buyerEmail) === be
  );

  const category = normalizeCategory(listing.category);
  const listingPrice = Number(listing.listingPrice);
  const listingSellerEmail = listing.listingSellerEmail
    ? normalizeEmail(listing.listingSellerEmail)
    : null;

  let recipientRole = 'admin';
  if (category === 'branded') {
    recipientRole = 'admin';
  } else if (category === 'second-hand') {
    recipientRole = listingSellerEmail ? 'seller' : 'admin';
  } else {
    recipientRole = 'admin';
  }

  const displayCounterparty =
    recipientRole === 'admin'
      ? 'Moto Trade (Admin)'
      : listing.sellerName || 'Seller';
  const thumbnail =
    typeof listing.thumbnail === 'string' &&
    listing.thumbnail.length > 0 &&
    listing.thumbnail.length <= MAX_INLINE_IMAGE_LENGTH
      ? listing.thumbnail
      : '';

  if (!conv) {
    conv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      listingId: lid,
      category,
      title: listing.title || `Listing (${lid.slice(-12)})`,
      sellerName: listing.sellerName || 'Seller',
      displayCounterparty,
      thumbnail,
      buyerEmail: be,
      buyerName: buyerName || buyerEmail,
      listingSellerEmail,
      recipientRole,
      listingPrice: Number.isFinite(listingPrice) ? listingPrice : 0,
      messages: [],
      updatedAt: new Date().toISOString(),
      buyerArchived: false,
      recipientArchived: false,
      preview: 'No messages yet...'
    };
    data.conversations.unshift(conv);
    saveGlobalChats(data);
  } else {
    if (!Array.isArray(conv.messages)) {
      conv.messages = [];
    }
    if (listingSellerEmail && conv.listingSellerEmail !== listingSellerEmail) {
      conv.listingSellerEmail = listingSellerEmail;
    }
    if (recipientRole && conv.recipientRole !== recipientRole) {
      conv.recipientRole = recipientRole;
    }
    if (Number.isFinite(listingPrice) && listingPrice >= 0) {
      conv.listingPrice = listingPrice;
    }
    conv.thumbnail = thumbnail;
    conv.displayCounterparty = displayCounterparty;
    conv.category = category;
    saveGlobalChats(data);
  }
  return conv;
};

export const appendMessageToConversation = (conversationId, message) => {
  const data = loadGlobalChats();
  const conv = data.conversations.find((c) => c.id === conversationId);
  if (!conv) return;
  if (!Array.isArray(conv.messages)) {
    conv.messages = [];
  }
  conv.messages.push(message);
  conv.updatedAt = new Date().toISOString();
  if (message.offer?.amount) {
    conv.preview = `Offer: Rs. ${Number(message.offer.amount).toLocaleString()}`;
  } else if (message.testDriveRequest) {
    conv.preview = '🚗 Test drive request';
  } else {
    conv.preview = message.imageUrl
      ? '📷 Photo'
      : (message.body || '').slice(0, 80) || 'Message';
  }
  saveGlobalChats(data);
};

/**
 * @param {string} conversationId
 * @param {string} messageId
 * @param {'accepted' | 'rejected'} status
 */
export const setTestDriveRequestStatus = (conversationId, messageId, status) => {
  const data = loadGlobalChats();
  const conv = data.conversations.find((c) => c.id === conversationId);
  if (!conv) return false;
  if (!Array.isArray(conv.messages)) {
    conv.messages = [];
    saveGlobalChats(data);
    return false;
  }
  const msg = conv.messages.find((m) => m.id === messageId);
  if (!msg?.testDriveRequest || msg.testDriveRequest.status !== 'pending') return false;
  msg.testDriveRequest.status = status;
  msg.testDriveRequest.respondedAt = new Date().toISOString();
  conv.updatedAt = new Date().toISOString();
  conv.preview =
    status === 'accepted'
      ? `Test drive accepted · ${msg.testDriveRequest.requesterName || 'Buyer'}`
      : 'Test drive request declined';
  saveGlobalChats(data);
  return true;
};

export const setBuyerArchived = (conversationId, archived) => {
  const data = loadGlobalChats();
  const conv = data.conversations.find((c) => c.id === conversationId);
  if (!conv) return;
  conv.buyerArchived = !!archived;
  saveGlobalChats(data);
};

export const setRecipientArchived = (conversationId, archived) => {
  const data = loadGlobalChats();
  const conv = data.conversations.find((c) => c.id === conversationId);
  if (!conv) return;
  conv.recipientArchived = !!archived;
  saveGlobalChats(data);
};

export const deleteConversationForBuyer = (conversationId, buyerEmail) => {
  const data = loadGlobalChats();
  const conv = data.conversations.find((c) => c.id === conversationId);
  if (!conv || normalizeEmail(conv.buyerEmail) !== normalizeEmail(buyerEmail)) return false;
  data.conversations = data.conversations.filter((c) => c.id !== conversationId);
  saveGlobalChats(data);
  return true;
};

/**
 * Outbound = you started the chat as buyer. Inbound = you receive as admin or listing seller.
 * @param {{ email?: string, role?: string }} user
 */
export const getMergedChatsForDashboard = (user) => {
  const email = user?.email;
  if (!email) return [];
  const outbound = getBuyerConversations(email).map((c) => ({
    ...c,
    threadRole: 'outbound',
    replyAs: null
  }));
  const inbound = [];
  if (user?.role === 'admin') {
    getAdminBrandedInbox().forEach((c) => {
      inbound.push({ ...c, threadRole: 'inbound', replyAs: 'admin' });
    });
  }
  getSellerSecondHandInbox(email).forEach((c) => {
    inbound.push({ ...c, threadRole: 'inbound', replyAs: 'seller' });
  });
  const byId = new Map();
  [...inbound, ...outbound].forEach((c) => {
    if (!c || !c.id) return;
    if (!byId.has(c.id)) byId.set(c.id, c);
  });
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};
