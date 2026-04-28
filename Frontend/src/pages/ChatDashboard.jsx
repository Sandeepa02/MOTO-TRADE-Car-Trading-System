import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/apiConfig';
import {
  appendMessageToConversation,
  deleteConversationForBuyer,
  ensureConversation,
  getMergedChatsForDashboard,
  setBuyerArchived,
  setRecipientArchived,
  setTestDriveRequestStatus
} from '../utils/sellerChatStorage';
import { createOfferCode } from '../utils/offerCodeStorage';

const SELLER_CARS_STORAGE_KEY = 'sellerSecondHandCars';

const formatShortDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rs. 0';
  return `Rs. ${amount.toLocaleString()}`;
};

const isThreadArchived = (c) =>
  c.threadRole === 'outbound' ? !!c.buyerArchived : !!c.recipientArchived;

const QUICK_REPLY_OPTIONS = [
  'Hello!',
  'Thank you!',
  'Great!',
  'Is this still available?',
  'Can we discuss the price?',
  'Please share more details.'
];

const ChatDashboard = () => {
  const { user } = useAuth();
  const email = user?.email || '';
  const buyerName = user?.name || user?.email || '';
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('active');
  const [draft, setDraft] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [offerError, setOfferError] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [copyOfferMsg, setCopyOfferMsg] = useState('');
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [tdName, setTdName] = useState('');
  const [tdPhone, setTdPhone] = useState('');
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('');
  const [tdError, setTdError] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [resolvedThumbnails, setResolvedThumbnails] = useState({});

  const refreshList = useCallback(() => {
    if (!email) return;
    setConversations(getMergedChatsForDashboard(user));
  }, [email, user]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  useEffect(() => {
    let cancelled = false;

    const resolveMissingThumbnails = async () => {
      const missing = conversations.filter((c) => !c.thumbnail);
      if (missing.length === 0) return;

      const sellerCars = JSON.parse(localStorage.getItem(SELLER_CARS_STORAGE_KEY) || '[]');
      const updates = {};

      await Promise.all(
        missing.map(async (c) => {
          const listingId = String(c.listingId || '');
          if (!listingId) return;

          // For second-hand listings saved in localStorage.
          if (c.category === 'second-hand' && listingId.startsWith('seller-')) {
            const localCar = sellerCars.find((car) => String(car.id) === listingId);
            const localImage = localCar?.image || localCar?.vehicleImage || '';
            if (localImage) updates[c.id] = localImage;
            return;
          }

          // For branded/backend listings fetch by id.
          try {
            const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles/${listingId}`);
            if (!response.ok) return;
            const data = await response.json();
            const img = data?.data?.image || data?.data?.vehicleImage || '';
            if (img) updates[c.id] = img;
          } catch {
            /* ignore thumbnail fetch failures */
          }
        })
      );

      if (!cancelled && Object.keys(updates).length > 0) {
        setResolvedThumbnails((prev) => ({ ...prev, ...updates }));
      }
    };

    resolveMissingThumbnails();
    return () => {
      cancelled = true;
    };
  }, [conversations]);

  useEffect(() => {
    const listing = location.state?.chatListing;
    if (!listing?.listingId || !email) return;
    const conv = ensureConversation(email, buyerName, listing);
    setSelectedId(conv.id);
    refreshList();
    navigate('/my-chats', { replace: true, state: {} });
  }, [email, buyerName, location.state, navigate, refreshList]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );
  const selectedMessages = Array.isArray(selected?.messages) ? selected.messages : [];

  const filteredSidebar = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const archived = isThreadArchived(c);
      if (tab === 'active' && archived) return false;
      if (tab === 'archived' && !archived) return false;
      if (!q) return true;
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.displayCounterparty || c.sellerName || '').toLowerCase().includes(q) ||
        (c.buyerEmail || '').toLowerCase().includes(q) ||
        (c.buyerName || '').toLowerCase().includes(q)
      );
    });
  }, [conversations, search, tab]);

  const activeCount = conversations.filter((c) => !isThreadArchived(c)).length;
  const canSendOffer = !!selected && selected.threadRole === 'inbound' && selected.replyAs === 'seller';
  const canRequestTestDrive =
    !!selected &&
    selected.threadRole === 'outbound' &&
    selected.category === 'second-hand' &&
    selected.recipientRole === 'seller';

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be under 2 MB.');
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage({ dataUrl: reader.result, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!email || !selectedId || !selected) return;
    if (!text && !pendingImage) return;

    const sender =
      selected.threadRole === 'outbound'
        ? 'buyer'
        : selected.replyAs === 'admin'
          ? 'admin'
          : 'seller';

    const msg = {
      id: `msg_${Date.now()}`,
      sender,
      body: text,
      imageUrl: pendingImage?.dataUrl || null,
      createdAt: new Date().toISOString()
    };

    appendMessageToConversation(selectedId, msg);
    setDraft('');
    setPendingImage(null);
    setShowQuickReplies(false);
    refreshList();
  };

  const handleQuickReplySelect = (text) => {
    setDraft(text);
    setShowQuickReplies(false);
  };

  const handleArchiveToggle = () => {
    if (!email || !selected) return;
    if (selected.threadRole === 'outbound') {
      setBuyerArchived(selected.id, !selected.buyerArchived);
    } else {
      setRecipientArchived(selected.id, !selected.recipientArchived);
    }
    refreshList();
    setSelectedId(null);
  };

  const handleDeleteConv = (id, e) => {
    e.stopPropagation();
    if (!email) return;
    deleteConversationForBuyer(id, email);
    if (selectedId === id) setSelectedId(null);
    refreshList();
  };

  const openOfferModal = () => {
    if (!canSendOffer || !selected) return;
    setOfferAmount(selected.listingPrice ? String(selected.listingPrice) : '');
    setOfferNote('');
    setOfferError('');
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setOfferError('');
  };

  const handleSubmitOffer = () => {
    if (!selected || !selectedId || !canSendOffer) return;
    const amount = Number(offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setOfferError('Enter a valid offer amount.');
      return;
    }

    const offerCodeRecord = createOfferCode({
      conversationId: selectedId,
      buyerEmail: selected.buyerEmail || '',
      amount,
      sellerEmail: user?.email || ''
    });

    const msg = {
      id: `msg_${Date.now()}`,
      sender: 'seller',
      body: offerNote.trim(),
      offer: {
        amount,
        code: offerCodeRecord.code,
        currency: 'LKR',
        type: 'seller_to_buyer'
      },
      createdAt: new Date().toISOString()
    };

    appendMessageToConversation(selectedId, msg);
    closeOfferModal();
    refreshList();
  };

  const openOfferCoupon = (offer) => {
    if (!offer?.amount) return;
    setSelectedOffer(offer);
    setCopyOfferMsg('');
  };

  const copyOfferCode = async () => {
    if (!selectedOffer?.code) return;
    try {
      await navigator.clipboard.writeText(selectedOffer.code);
      setCopyOfferMsg('Code copied.');
    } catch {
      setCopyOfferMsg('Could not copy automatically. Please copy manually.');
    }
  };

  const openTestDriveModal = () => {
    if (!canRequestTestDrive) return;
    const saved = JSON.parse(localStorage.getItem('userProfileDetails') || '{}');
    setTdName((buyerName || saved.name || '').trim());
    setTdPhone((saved.telephoneNumber || '').trim());
    setTdDate('');
    setTdTime('');
    setTdError('');
    setShowTestDriveModal(true);
  };

  const closeTestDriveModal = () => {
    setShowTestDriveModal(false);
    setTdError('');
  };

  const handleSubmitTestDrive = () => {
    if (!selectedId || !canRequestTestDrive) return;
    const requesterName = tdName.trim();
    const requesterPhone = tdPhone.trim();
    if (!requesterName) {
      setTdError('Please enter your name.');
      return;
    }
    if (!requesterPhone) {
      setTdError('Please enter your phone number.');
      return;
    }
    if (!tdDate) {
      setTdError('Please choose a test drive date.');
      return;
    }
    if (!tdTime) {
      setTdError('Please choose a test drive time.');
      return;
    }

    const requestId = `tdr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const msg = {
      id: `msg_${Date.now()}`,
      sender: 'buyer',
      body: '',
      testDriveRequest: {
        id: requestId,
        requesterName,
        requesterPhone,
        date: tdDate,
        time: tdTime,
        status: 'pending'
      },
      createdAt: new Date().toISOString()
    };

    appendMessageToConversation(selectedId, msg);
    closeTestDriveModal();
    refreshList();
  };

  const handleResolveTestDrive = (messageId, decision) => {
    if (!selectedId || !selected || selected.threadRole !== 'inbound' || selected.replyAs !== 'seller') return;
    const msg = selectedMessages.find((m) => m.id === messageId);
    const req = msg?.testDriveRequest;
    if (!req || req.status !== 'pending') return;

    const ok = setTestDriveRequestStatus(selectedId, messageId, decision);
    if (!ok) return;

    const when = `${req.date} at ${req.time}`;
    const followUp = {
      id: `msg_${Date.now()}`,
      sender: 'seller',
      body:
        decision === 'accepted'
          ? `Test drive accepted for ${when}. See you then.`
          : `Test drive request declined (${when} was requested).`,
      createdAt: new Date().toISOString()
    };
    appendMessageToConversation(selectedId, followUp);
    refreshList();
  };

  return (
    <div className="page py-6 px-4">
      <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Chats</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Chats you start with a listing, plus buyer messages you receive as admin (branded cars only) or as the
            listing seller for your second-hand listings.
          </p>
        </div>
        <Link to="/" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
          ← Browse listings
        </Link>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 min-h-[520px] md:h-[calc(100vh-12rem)] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <aside className="w-full md:w-[300px] lg:w-[320px] flex flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 shrink-0">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              Messages
              <span className="text-xs font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            </h2>
          </div>
          <div className="p-3 border-b border-gray-200">
            <input
              type="search"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-sm"
            />
          </div>
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab('active')}
              className={`flex-1 py-2 text-sm font-semibold ${
                tab === 'active' ? 'text-primary-700 border-b-2 border-primary-600 bg-white' : 'text-gray-600'
              }`}
            >
              Active ({conversations.filter((c) => !isThreadArchived(c)).length})
            </button>
            <button
              type="button"
              onClick={() => setTab('archived')}
              className={`flex-1 py-2 text-sm font-semibold ${
                tab === 'archived' ? 'text-primary-700 border-b-2 border-primary-600 bg-white' : 'text-gray-600'
              }`}
            >
              Archived ({conversations.filter((c) => isThreadArchived(c)).length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[200px] md:min-h-0">
            {filteredSidebar.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No conversations here yet.</p>
            ) : (
              filteredSidebar.map((c) => (
                (() => {
                  const thumbnail = c.thumbnail || resolvedThumbnails[c.id] || '';
                  return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(c.id);
                    setShowQuickReplies(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(c.id);
                      setShowQuickReplies(false);
                    }
                  }}
                  className={`w-full text-left p-3 border-b border-gray-100 flex gap-3 hover:bg-white/80 transition-colors cursor-pointer ${
                    selectedId === c.id ? 'bg-white shadow-inner' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 overflow-hidden border border-gray-100">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.title}</p>
                    {c.threadRole === 'outbound' ? (
                      <p className="text-xs text-gray-600 truncate">
                        <span className="font-semibold text-primary-700">You sent</span>
                        <span className="mx-1">→</span>
                        {c.displayCounterparty || c.sellerName}
                        <span className="ml-1 font-medium text-gray-500">
                          {c.recipientRole === 'admin' ? '(Admin)' : '(Seller)'}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 truncate">
                        <span className="font-semibold text-emerald-700">Received</span>
                        <span className="mx-1">·</span>
                        Buyer: {c.buyerName || c.buyerEmail}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">{formatShortDate(c.updatedAt)}</p>
                    <p className="text-xs text-gray-500 truncate">{c.preview || 'No messages yet...'}</p>
                  </div>
                  {c.threadRole === 'outbound' && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConv(c.id, e)}
                      className="shrink-0 text-red-500 hover:text-red-700 p-1"
                      aria-label="Delete conversation"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                  );
                })()
              ))
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
              <div>
                <p className="font-semibold text-gray-700">Select a conversation</p>
                <p className="text-sm mt-1">
                  Start a chat from a listing page, or open a thread where someone messaged you.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="p-4 border-b border-gray-200 flex flex-wrap items-start justify-between gap-3 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.title}</h2>
                  {selected.threadRole === 'outbound' ? (
                    <div>
                      <p className="text-sm text-gray-600">
                        To:{' '}
                        <span className="font-medium text-gray-800">
                          {selected.displayCounterparty || selected.sellerName}
                        </span>
                        {selected.recipientRole === 'admin' ? (
                          <span className="ml-2 text-xs font-semibold text-primary-700">Admin</span>
                        ) : (
                          <span className="ml-2 text-xs font-semibold text-emerald-700">Seller</span>
                        )}
                      </p>
                      {canRequestTestDrive && (
                        <button
                          type="button"
                          onClick={openTestDriveModal}
                          className="mt-2 text-sm font-semibold text-primary-700 hover:text-primary-800 border border-primary-200 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg"
                        >
                          Request test drive
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      From buyer:{' '}
                      <span className="font-medium text-gray-800">
                        {selected.buyerName || selected.buyerEmail}
                      </span>
                      <span className="text-gray-400"> ({selected.buyerEmail})</span>
                    </p>
                  )}
                </div>
                <button type="button" onClick={handleArchiveToggle} className="btn-ghost text-sm shrink-0">
                  {isThreadArchived(selected) ? 'Unarchive' : 'Archive'}
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {selectedMessages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-12">No messages yet.</p>
                ) : (
                  selectedMessages.map((m) => {
                    const isMine =
                      selected.threadRole === 'outbound'
                        ? m.sender === 'buyer'
                        : m.sender === 'buyer'
                          ? false
                          : true;
                    const td = m.testDriveRequest;
                    const showTdActions =
                      td &&
                      td.status === 'pending' &&
                      selected.threadRole === 'inbound' &&
                      selected.replyAs === 'seller';
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                            isMine
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          {m.imageUrl && (
                            <div className={`mb-2 rounded-lg overflow-hidden border ${isMine ? 'border-white/20' : 'border-gray-200'}`}>
                              <img src={m.imageUrl} alt="Attachment" className="max-h-48 w-full object-contain bg-black/10" />
                            </div>
                          )}
                          {td ? (
                            <div
                              className={`mb-1 rounded-lg border px-3 py-2 text-left ${
                                isMine
                                  ? 'border-white/30 bg-white/10 text-white'
                                  : 'border-amber-200 bg-amber-50 text-gray-900'
                              }`}
                            >
                              <p
                                className={`text-[11px] font-semibold uppercase tracking-wide ${
                                  isMine ? 'text-primary-100' : 'text-amber-800'
                                }`}
                              >
                                Test drive request
                              </p>
                              <ul className={`text-sm mt-1 space-y-0.5 ${isMine ? 'text-white' : 'text-gray-800'}`}>
                                <li>
                                  <span className={isMine ? 'text-primary-100' : 'text-gray-500'}>Name:</span>{' '}
                                  {td.requesterName}
                                </li>
                                <li>
                                  <span className={isMine ? 'text-primary-100' : 'text-gray-500'}>Phone:</span>{' '}
                                  {td.requesterPhone}
                                </li>
                                <li>
                                  <span className={isMine ? 'text-primary-100' : 'text-gray-500'}>Date:</span>{' '}
                                  {td.date}
                                </li>
                                <li>
                                  <span className={isMine ? 'text-primary-100' : 'text-gray-500'}>Time:</span>{' '}
                                  {td.time}
                                </li>
                              </ul>
                              {td.status !== 'pending' ? (
                                <p
                                  className={`text-xs font-bold mt-2 ${
                                    td.status === 'accepted'
                                      ? isMine
                                        ? 'text-emerald-200'
                                        : 'text-emerald-700'
                                      : isMine
                                        ? 'text-red-200'
                                        : 'text-red-700'
                                  }`}
                                >
                                  {td.status === 'accepted' ? 'Accepted' : 'Declined'}
                                </p>
                              ) : null}
                              {showTdActions ? (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleResolveTestDrive(m.id, 'accepted')}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResolveTestDrive(m.id, 'rejected')}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          {m.offer?.amount ? (
                            <div
                              className={`mb-2 rounded-lg border px-3 py-2 ${
                                isMine
                                  ? 'border-white/30 bg-white/10'
                                  : 'border-primary-200 bg-primary-50 text-primary-900'
                              }`}
                            >
                              <p className={`text-[11px] font-semibold uppercase tracking-wide ${isMine ? 'text-primary-100' : 'text-primary-700'}`}>
                                Seller Offer
                              </p>
                              <p className="text-lg font-extrabold">{formatCurrency(m.offer.amount)}</p>
                              {m.offer.code ? (
                                <p className={`text-xs mt-0.5 ${isMine ? 'text-primary-100' : 'text-primary-700'}`}>
                                  Code: {m.offer.code}
                                </p>
                              ) : null}
                              {selected.threadRole === 'outbound' && !isMine ? (
                                <button
                                  type="button"
                                  onClick={() => openOfferCoupon(m.offer)}
                                  className={`mt-2 text-xs font-semibold underline ${isMine ? 'text-primary-100' : 'text-primary-700'}`}
                                >
                                  View offer coupon
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                          {m.body ? <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p> : null}
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-100' : 'text-gray-400'}`}>
                            {m.sender === 'buyer'
                              ? 'Buyer'
                              : m.sender === 'admin'
                                ? 'Admin'
                                : 'Seller'}{' '}
                            · {formatShortDate(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <footer className="p-3 border-t border-gray-200 bg-white shrink-0">
                {imageError && <p className="text-xs text-red-600 mb-2">{imageError}</p>}
                {pendingImage && (
                  <div className="mb-2 flex items-center gap-2 p-2 rounded-lg bg-gray-100 border border-gray-200">
                    <img src={pendingImage.dataUrl} alt="" className="h-14 w-14 object-cover rounded-md border" />
                    <span className="text-xs text-gray-600 truncate flex-1">{pendingImage.name}</span>
                    <button type="button" className="text-xs font-semibold text-red-600" onClick={() => setPendingImage(null)}>
                      Remove
                    </button>
                  </div>
                )}
                {selected.threadRole === 'outbound' && showQuickReplies && (
                  <div className="mb-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Quick Q&A</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLY_OPTIONS.map((text) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => handleQuickReplySelect(text)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePickImage}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                    aria-label="Attach picture"
                    title="Attach picture"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <textarea
                    rows={1}
                    placeholder={selected.threadRole === 'outbound' ? 'Type a message...' : 'Type a reply...'}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="input flex-1 min-h-[44px] resize-y max-h-32 py-2.5 text-sm"
                  />
                  {canSendOffer && (
                    <button
                      type="button"
                      onClick={openOfferModal}
                      className="shrink-0 px-3 py-2.5 rounded-xl border border-primary-300 text-primary-700 font-semibold hover:bg-primary-50"
                      title="Make offer"
                    >
                      $ Offer
                    </button>
                  )}
                  {selected.threadRole === 'outbound' && (
                    <button
                      type="button"
                      onClick={() => setShowQuickReplies((prev) => !prev)}
                      className={`shrink-0 px-3 py-2.5 rounded-xl border font-semibold ${
                        showQuickReplies
                          ? 'border-primary-300 text-primary-700 bg-primary-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Quick Q&A replies"
                    >
                      Q&A
                    </button>
                  )}
                  <button type="button" onClick={handleSend} className="btn-portal shrink-0 px-4 py-2.5 rounded-xl" title="Send">
                    <span className="sr-only">Send</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
      {showOfferModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4 border-b border-gray-100">
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900">Make an Offer</h3>
                <p className="text-gray-700 mt-3 text-2xl font-extrabold">{selected.title}</p>
                <p className="text-gray-500 mt-1">
                  Listed Price <span className="font-bold text-gray-900 ml-1">{formatCurrency(selected.listingPrice)}</span>
                </p>
              </div>
              <button type="button" onClick={closeOfferModal} className="text-2xl leading-none text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Offer Amount</label>
              <input
                type="number"
                min="1"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="input text-xl font-bold"
                placeholder="Enter amount"
              />

              <label className="block text-sm font-semibold text-gray-700 mt-5 mb-2">Message</label>
              <textarea
                rows={3}
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                className="input resize-none"
                placeholder="Add a note to support your offer..."
              />

              {offerError && <p className="text-sm text-red-600 mt-2">{offerError}</p>}

              <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeOfferModal} className="btn-ghost">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmitOffer} className="btn-portal">
                  $ Submit Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTestDriveModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Request a test drive</h3>
                <p className="text-sm text-gray-600 mt-1">{selected.title}</p>
              </div>
              <button type="button" onClick={closeTestDriveModal} className="text-2xl leading-none text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your name</label>
                <input
                  type="text"
                  value={tdName}
                  onChange={(e) => setTdName(e.target.value)}
                  className="input w-full"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={tdPhone}
                  onChange={(e) => setTdPhone(e.target.value)}
                  className="input w-full"
                  placeholder="Mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred date</label>
                <input type="date" value={tdDate} onChange={(e) => setTdDate(e.target.value)} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred time</label>
                <input type="time" value={tdTime} onChange={(e) => setTdTime(e.target.value)} className="input w-full" />
              </div>
              {tdError && <p className="text-sm text-red-600">{tdError}</p>}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeTestDriveModal} className="btn-ghost">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmitTestDrive} className="btn-portal">
                  Submit request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Offer coupon</h3>
                <p className="text-xs text-gray-500 mt-0.5">Use this code at payment checkout</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="text-2xl leading-none text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Offering price</p>
                <p className="text-2xl font-extrabold text-primary-800 mt-1">{formatCurrency(selectedOffer.amount)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Offer code</p>
                <p className="text-xl font-extrabold text-gray-900 mt-1 break-all">{selectedOffer.code || '—'}</p>
              </div>
              {copyOfferMsg ? <p className="text-xs text-emerald-700">{copyOfferMsg}</p> : null}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" className="btn-ghost" onClick={() => setSelectedOffer(null)}>
                  Close
                </button>
                <button type="button" className="btn-portal" onClick={copyOfferCode} disabled={!selectedOffer.code}>
                  Copy code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;
