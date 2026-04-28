import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';
import { MOTO_TRADE_PHONE, createPaymentSubmission } from '../utils/paymentStorage';
import { removePartsCartLines } from '../utils/partsCartStorage';
import { getOfferCode, redeemOfferCode } from '../utils/offerCodeStorage';

const formatPrice = (value) => `Rs. ${(Number(value) || 0).toLocaleString()}`;

const COMPANY_INVOICE = {
  legalName: 'Moto Trade (Pvt) Ltd',
  tagline: 'Branded & second-hand vehicles · spare parts · modifications',
  addressLines: ['Motor Trade Plaza, Colombo Road, Matara, Sri Lanka'],
  email: 'payments@mototrade.lk',
  website: 'www.mototrade.lk'
};

/** JPEG re-encode to shrink base64 receipts before localStorage (avoids QuotaExceededError). */
const compressReceiptDataUrl = (dataUrl, maxSide = 1100, quality = 0.66) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return Promise.resolve(dataUrl);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const longest = Math.max(img.width, img.height);
        const scale = longest > maxSide ? maxSide / longest : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const jpeg = canvas.toDataURL('image/jpeg', quality);
        resolve(jpeg && jpeg.length < dataUrl.length ? jpeg : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

const compressReceiptAggressive = async (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  let compressed = await compressReceiptDataUrl(dataUrl, 1100, 0.66);
  if (compressed.length > 900000) {
    compressed = await compressReceiptDataUrl(compressed, 900, 0.55);
  }
  if (compressed.length > 650000) {
    compressed = await compressReceiptDataUrl(compressed, 760, 0.48);
  }
  return compressed;
};

const downloadCheckoutInvoice = (params) => {
  const invoiceNo = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}`;
  const issuedAt = new Date().toLocaleString();
  const { buyerName, buyerEmail, isCartCheckout, car, cartCheckout, vehicleTitle, totalAmount, baseAmount, offeredPrice } =
    params;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFontSize(18);
  doc.text(COMPANY_INVOICE.legalName, margin, 50);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(COMPANY_INVOICE.tagline, margin, 66);
  doc.text(COMPANY_INVOICE.addressLines.join(', '), margin, 80);
  doc.text(
    `Tel: ${MOTO_TRADE_PHONE} | Email: ${COMPANY_INVOICE.email} | Web: ${COMPANY_INVOICE.website}`,
    margin,
    94
  );

  doc.setTextColor(20);
  doc.setFontSize(12);
  doc.text('TAX INVOICE / PAYMENT REQUEST', margin, 140);
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoiceNo}`, margin, 156);
  doc.text(`Date: ${issuedAt}`, margin, 170);

  doc.text(`Bill To: ${buyerName || 'Customer'}`, pageWidth - 240, 156);
  doc.text(`${buyerEmail || '—'}`, pageWidth - 240, 170);

  const tableHead = isCartCheckout ? [['#', 'Description', 'Amount (LKR)']] : [['#', 'Field', 'Details']];
  const tableBody = [];
  if (isCartCheckout && cartCheckout?.items?.length) {
    cartCheckout.items.forEach((it, idx) => {
      const kind = it.kind === 'modification' ? 'Modification' : 'Spare part';
      tableBody.push([`${idx + 1}`, `${it.name} (${kind})`, formatPrice(it.price)]);
    });
  } else if (car) {
    const details = [
      ['Description', vehicleTitle],
      ['Brand', car.brand],
      ['Model', car.model],
      ['Year', car.year],
      ['Condition', car.condition],
      ['Fuel', car.fuelType],
      ['Transmission', car.transmission],
      ['Mileage', car.mileage],
      ['Vehicle number', car.vehicleNumber],
      ['Category', car.category]
    ].filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== '');
    details.forEach(([k, v], idx) => tableBody.push([`${idx + 1}`, String(k), String(v)]));
  }

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 190,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [15, 118, 110] }
  });

  const tableBottomY = doc.lastAutoTable?.finalY || 230;
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(`Base price: ${formatPrice(baseAmount)}`, margin, tableBottomY + 20);
  doc.text(`Offered price: ${formatPrice(offeredPrice)}`, margin, tableBottomY + 36);
  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text(`Sub total: ${formatPrice(totalAmount)}`, pageWidth - margin, tableBottomY + 36, { align: 'right' });

  doc.save(`${invoiceNo}.pdf`);
};

const PaymentCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const car = location.state?.car || null;
  const cartCheckout = location.state?.cartCheckout || null;

  const isCartCheckout = Boolean(cartCheckout?.items?.length);

  const [senderBank, setSenderBank] = useState('');
  const [senderBranch, setSenderBranch] = useState('');
  const [senderName, setSenderName] = useState(user?.name || '');
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [paymentFormVisible, setPaymentFormVisible] = useState(false);
  const [offerCodeInput, setOfferCodeInput] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [offerMsg, setOfferMsg] = useState('');

  const vehicleTitle = useMemo(() => {
    if (isCartCheckout) {
      const n = cartCheckout.items.length;
      return `Parts & modifications (${n} item${n === 1 ? '' : 's'})`;
    }
    if (!car) return '';
    return `${car.brand || ''} ${car.model || ''}`.trim() || car.name || 'Vehicle';
  }, [car, cartCheckout, isCartCheckout]);

  const cartTotal = useMemo(() => {
    if (!isCartCheckout) return 0;
    return cartCheckout.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
  }, [cartCheckout, isCartCheckout]);

  const baseAmount = isCartCheckout ? cartTotal : Number(car?.price) || 0;
  const offerDiscount = Number(appliedOffer?.amount) || 0;
  const payableAmount = Math.max(0, Number(baseAmount) - offerDiscount);
  const offeredPrice = offerDiscount;
  const isSecondHandVehicle = !isCartCheckout && String(car?.category || '').toLowerCase() === 'second-hand';
  const sellerEmail = isSecondHandVehicle ? String(car?.sellerEmail || '').trim().toLowerCase() : '';
  const sellerName = isSecondHandVehicle ? String(car?.sellerName || '').trim() : '';

  const handleApplyOfferCode = () => {
    setOfferMsg('');
    const code = offerCodeInput.trim().toUpperCase();
    if (!code) {
      setOfferMsg('Enter an offer code.');
      return;
    }
    const preview = getOfferCode(code);
    const previewAmount = Number(preview?.amount) || 0;
    if (!preview) {
      setOfferMsg('Offer code not found.');
      return;
    }
    if (preview.used) {
      setOfferMsg('This offer code is already used.');
      return;
    }
    if (!Number.isFinite(previewAmount) || previewAmount <= 0 || previewAmount > baseAmount) {
      setOfferMsg('Offer code is valid but offer amount is not applicable for this checkout.');
      return;
    }
    const result = redeemOfferCode({
      code,
      buyerEmail: user?.email || ''
    });
    if (!result.ok) {
      setOfferMsg(result.message || 'Invalid offer code.');
      return;
    }
    const offeredAmount = Number(result.amount) || 0;
    const newPayableAmount = Math.max(0, Number(baseAmount) - offeredAmount);
    setAppliedOffer({ code: result.code, amount: offeredAmount });
    setOfferMsg(`Offer applied. Discount: ${formatPrice(offeredAmount)}. New payable amount: ${formatPrice(newPayableAmount)}`);
  };

  const handlePickReceipt = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image receipt.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Receipt image must be under 4 MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceipt({
        name: file.name,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleShowInvoice = (e) => {
    e.preventDefault();
    setError('');
    setInvoiceVisible(true);
  };

  const handleDownloadInvoice = () => {
    downloadCheckoutInvoice({
      buyerName: user?.name || user?.email || 'Customer',
      buyerEmail: user?.email || '—',
      isCartCheckout,
      car,
      cartCheckout,
      vehicleTitle,
      totalAmount: payableAmount,
      baseAmount,
      offeredPrice
    });
  };

  const handlePayNow = () => {
    setError('');
    setPaymentFormVisible(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!senderBank.trim() || !senderBranch.trim() || !senderName.trim()) {
      setError('Please fill sender bank, branch, and sender name.');
      return;
    }
    if (!receipt?.dataUrl) {
      setError('Please upload a payment receipt image.');
      return;
    }

    setError('');
    setSubmitting(true);
    const receiptDataUrl = await compressReceiptAggressive(receipt.dataUrl);

    try {
      if (isCartCheckout) {
        const items = cartCheckout.items;
        const lineIds = cartCheckout.lineIds || items.map((i) => i.lineId);
        const listingId = items.map((i) => i.productId).filter(Boolean).join(',') || `cart_${Date.now()}`;
        const cartItemsForPayment = items.map((it) => ({
          name: it.name,
          kind: it.kind,
          price: Number(it.price) || 0,
          productId: it.productId,
          subtitle: it.subtitle || ''
        }));
        const linesNote = items
          .map((it, idx) => `${idx + 1}. ${it.name} (${it.kind}) — ${formatPrice(it.price)}`)
          .join('\n');
        const offerLine = appliedOffer ? `Offer code applied: ${appliedOffer.code} (${formatPrice(appliedOffer.amount)})` : '';
        const fullNote = [offerLine, linesNote, note.trim()].filter(Boolean).join('\n\n');

        createPaymentSubmission({
          buyerEmail: user?.email || '',
          buyerName: user?.name || user?.email || 'Buyer',
          listingId,
          vehicleTitle,
          vehicleImage: items[0]?.image || '',
          vehiclePrice: payableAmount,
          senderBank: senderBank.trim(),
          senderBranch: senderBranch.trim(),
          senderName: senderName.trim(),
          receiptImage: receiptDataUrl,
          note: fullNote,
          orderType: 'parts_cart',
          cartItems: cartItemsForPayment
        });
        removePartsCartLines(user?.email || '', lineIds);
        navigate('/user-profile/payments', { replace: true });
        return;
      }

      if (!car) {
        setError('Vehicle details are missing. Please retry from the car details page.');
        setSubmitting(false);
        return;
      }

      createPaymentSubmission({
        buyerEmail: user?.email || '',
        buyerName: user?.name || user?.email || 'Buyer',
        sellerEmail,
        sellerName,
        listingId: car._id || car.id,
        vehicleTitle,
        vehicleImage: car.image || '',
        vehiclePrice: payableAmount,
        senderBank: senderBank.trim(),
        senderBranch: senderBranch.trim(),
        senderName: senderName.trim(),
        receiptImage: receiptDataUrl,
        note: [appliedOffer ? `Offer code applied: ${appliedOffer.code} (${formatPrice(appliedOffer.amount)})` : '', note.trim()]
          .filter(Boolean)
          .join('\n\n')
      });
      navigate('/user-profile/payments', { replace: true });
    } catch (err) {
      if (err?.message === 'STORAGE_QUOTA_PAYMENTS') {
        setError(
          'Browser storage is full. Free space: clear site data for this origin in your browser settings, or use a smaller receipt image, then try again.'
        );
        setSubmitting(false);
        return;
      }
      setError(err?.message || 'Could not save payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (!car && !isCartCheckout) {
    return (
      <div className="page py-8 px-4">
        <div className="max-w-3xl mx-auto panel-soft p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Payment checkout</h1>
          <p className="text-gray-600 mt-2">
            No vehicle or cart checkout selected. Open a car and use Buy now, or go to My Cart, select spare parts /
            modification lines, and choose Process to payment.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/second-hand-cars" className="btn-ghost inline-block">
              Browse cars
            </Link>
            <Link to="/user-profile/cart" className="btn-portal inline-block">
              My Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page py-8 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="panel-soft overflow-hidden">
          <div className="panel-header">
            <h1 className="text-2xl font-extrabold text-gray-900">Payment checkout</h1>
            <p className="text-gray-600 mt-1">Step 1: process payment, Step 2: review invoice, Step 3: pay now and submit receipt.</p>
          </div>
          <div className="panel-body">
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                {isCartCheckout ? 'Cart order' : 'Item to purchase'}
              </p>
              <p className="text-xl font-extrabold text-gray-900 mt-1">{vehicleTitle}</p>
              <p className="text-primary-700 font-extrabold mt-2">
                {formatPrice(baseAmount)}
              </p>
              {appliedOffer ? (
                <p className="text-sm mt-1 text-emerald-700 font-bold">
                  Offer applied → New payable: {formatPrice(payableAmount)}
                </p>
              ) : null}
              {isCartCheckout ? (
                <ul className="mt-3 space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto border-t border-gray-100 pt-3">
                  {cartCheckout.items.map((it) => (
                    <li key={it.lineId} className="flex justify-between gap-2">
                      <span className="truncate">
                        {it.name}{' '}
                        <span className="text-gray-500">({it.kind === 'modification' ? 'Mod' : 'Part'})</span>
                      </span>
                      <span className="font-semibold shrink-0">{formatPrice(it.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleShowInvoice}>
              {error ? (
                <div className="status-danger normal-case tracking-normal rounded-lg px-4 py-3 text-sm font-semibold">
                  {error}
                </div>
              ) : null}
              <div>
                <label className="label">Offer code (optional)</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={offerCodeInput}
                    onChange={(e) => setOfferCodeInput(e.target.value.toUpperCase())}
                    placeholder="Paste offer code"
                  />
                  <button type="button" className="btn-ghost shrink-0" onClick={handleApplyOfferCode}>
                    Apply code
                  </button>
                </div>
                {offerMsg ? (
                  <p className={`text-xs mt-1 ${offerMsg.startsWith('Offer applied') ? 'text-emerald-700' : 'text-red-600'}`}>
                    {offerMsg}
                  </p>
                ) : null}
              </div>
              <button disabled={submitting} type="submit" className="btn-portal w-full">
                {submitting ? 'Processing...' : 'Process payment'}
              </button>
            </form>

            {invoiceVisible ? (
              <div className="mt-6 panel-muted p-4 space-y-4">
                <h2 className="text-xl font-extrabold text-gray-900">Invoice</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-gray-200 p-3 bg-white subtle-ring">
                    <p className="text-xs text-gray-500 uppercase">Base price</p>
                    <p className="text-base font-bold text-gray-900">{formatPrice(baseAmount)}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-white subtle-ring">
                    <p className="text-xs text-gray-500 uppercase">Offered price</p>
                    <p className="text-base font-bold text-emerald-700">{formatPrice(offeredPrice)}</p>
                  </div>
                  <div className="rounded-lg border border-primary-200 p-3 bg-primary-50 subtle-ring">
                    <p className="text-xs text-primary-700 uppercase">Sub total</p>
                    <p className="text-base font-extrabold text-primary-800">{formatPrice(payableAmount)}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={handleDownloadInvoice} className="btn-ghost w-full sm:w-auto">
                    Download invoice
                  </button>
                  <button type="button" onClick={handlePayNow} className="btn-portal w-full sm:w-auto">
                    Pay now
                  </button>
                </div>
              </div>
            ) : null}

            {paymentFormVisible ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmitPayment}>
                <h2 className="text-xl font-extrabold text-gray-900">Submit payment receipt</h2>
                <div>
                  <label className="label">Sender bank</label>
                  <input className="input" value={senderBank} onChange={(e) => setSenderBank(e.target.value)} />
                </div>
                <div>
                  <label className="label">Sender branch</label>
                  <input className="input" value={senderBranch} onChange={(e) => setSenderBranch(e.target.value)} />
                </div>
                <div>
                  <label className="label">Sender name</label>
                  <input className="input" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Note (optional)</label>
                  <textarea className="input resize-none" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div>
                  <label className="label">Receipt upload</label>
                  <input type="file" accept="image/*" onChange={handlePickReceipt} className="block w-full text-sm" />
                  {receipt ? (
                    <div className="mt-2 text-sm text-gray-700">
                      Selected: <span className="font-semibold">{receipt.name}</span>
                    </div>
                  ) : null}
                </div>
                <button disabled={submitting} type="submit" className="btn-portal w-full">
                  {submitting ? 'Submitting...' : 'Submit payment for admin verification'}
                </button>
              </form>
            ) : null}
          </div>
        </section>

        <section className="panel-soft p-4 sm:p-5">
          <div className="rounded-xl overflow-hidden border border-gray-200/80 bg-gray-50 subtle-ring">
            {isCartCheckout ? (
              cartCheckout.items[0]?.image ? (
                <img src={cartCheckout.items[0].image} alt="" className="w-full h-[280px] object-cover" />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-500">Cart order</div>
              )
            ) : car?.image ? (
              <img src={car.image} alt={vehicleTitle} className="w-full h-[280px] object-cover" />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500">No image available</div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Once submitted, the admin can verify or decline your payment. You will get the status in Recent Payments
            notifications.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PaymentCheckout;
