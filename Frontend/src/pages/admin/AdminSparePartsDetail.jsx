import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';
import { formatRs, rowId, tableShell, thClass, tdClass } from './adminInventoryHelpers';
import AdminImageFileInput from './AdminImageFileInput';

const SPARE_CATEGORIES = [
  'Engine Parts',
  'Lighting',
  'Wheels & Tires',
  'Brake System',
  'Performance',
  'Exhaust',
  'Interior',
  'Exterior',
  'Electronics'
];

const emptySpareForm = () => ({
  name: '',
  compatibleVehicle: '',
  price: '',
  category: SPARE_CATEGORIES[0],
  stock: '0',
  image: '',
  description: '',
  available: true,
  rating: 0
});

const AdminSparePartsDetail = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptySpareForm);
  const [formMsg, setFormMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFieldKey, setImageFieldKey] = useState(0);
  const [editingPartId, setEditingPartId] = useState(null);

  const loadSpareParts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/spare-parts`);
      const data = await response.json();
      if (data.success) {
        setSpareParts(data.data || []);
      } else {
        setError('Failed to load spare parts.');
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpareParts();
  }, [loadSpareParts]);

  const onFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetFormState = () => {
    setForm(emptySpareForm());
    setEditingPartId(null);
    setImageFieldKey((k) => k + 1);
  };

  const handleEditClick = (part) => {
    setFormMsg('');
    setEditingPartId(rowId(part));
    setForm({
      name: part.name || '',
      compatibleVehicle: part.compatibleVehicle || '',
      price: String(part.price ?? ''),
      category: SPARE_CATEGORIES.includes(part.category) ? part.category : SPARE_CATEGORIES[0],
      stock: String(part.stock ?? 0),
      image: part.image || '',
      description: part.description || '',
      available: part.available !== false,
      rating: part.rating != null ? Number(part.rating) : 0
    });
    setImageFieldKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormMsg('');
    resetFormState();
  };

  const handleSaveSpare = async (e) => {
    e.preventDefault();
    setFormMsg('');
    const name = form.name.trim();
    const compatibleVehicle = form.compatibleVehicle.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!name || !compatibleVehicle) {
      setFormMsg('Name and compatible vehicle are required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormMsg('Enter a valid price.');
      return;
    }

    const ratingVal = Number(form.rating);
    const payload = {
      name,
      compatibleVehicle,
      price,
      category: form.category,
      stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
      image: typeof form.image === 'string' ? form.image.trim() : '',
      description: form.description.trim(),
      available: !!form.available,
      rating: Number.isFinite(ratingVal) && ratingVal >= 0 && ratingVal <= 5 ? ratingVal : 0
    };

    const wasEditing = Boolean(editingPartId);
    setSaving(true);
    try {
      const { data } = editingPartId
        ? await axios.put(`${API_CONFIG.BACKEND_API_URL}/spare-parts/${editingPartId}`, payload)
        : await axios.post(`${API_CONFIG.BACKEND_API_URL}/spare-parts`, payload);
      if (data.success) {
        setFormMsg(wasEditing ? 'Spare part updated successfully.' : 'Spare part added successfully.');
        resetFormState();
        await loadSpareParts();
      } else {
        setFormMsg(data.message || data.error || `Could not ${wasEditing ? 'update' : 'add'} spare part.`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        `Could not ${editingPartId ? 'update' : 'add'} spare part.`;
      setFormMsg(
        err.response?.status === 403 || err.response?.status === 401
          ? `${msg} Log in with an admin account.`
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page py-8 px-4">
      <div className="max-w-7xl mx-auto panel-solid">
        <div className="panel-header">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Spare parts — details</h1>
            <p className="text-gray-600 mt-1">
              All spare part records from the database. New parts can only be added here (admin).
            </p>
          </div>
        </div>
        <div className="panel-body space-y-8">
          <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-5">
            <h2 className="text-lg font-extrabold text-gray-900">{editingPartId ? 'Edit spare part' : 'Add spare part'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Uses your admin session.
              {editingPartId ? ' Update the fields below and save changes.' : ''}
            </p>
            <form onSubmit={handleSaveSpare} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="sp-name">
                  Part name
                </label>
                <input id="sp-name" name="name" className="input" value={form.name} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="sp-cat">
                  Category
                </label>
                <select id="sp-cat" name="category" className="select" value={form.category} onChange={onFormChange}>
                  {SPARE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="sp-compat">
                  Compatible vehicle
                </label>
                <input id="sp-compat" name="compatibleVehicle" className="input" value={form.compatibleVehicle} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="sp-price">
                  Price (Rs.)
                </label>
                <input id="sp-price" name="price" type="number" min="0" className="input" value={form.price} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="sp-stock">
                  Stock
                </label>
                <input id="sp-stock" name="stock" type="number" min="0" className="input" value={form.stock} onChange={onFormChange} />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <AdminImageFileInput
                  id="sp-part-image"
                  resetKey={imageFieldKey}
                  label="Part image"
                  value={form.image}
                  onChange={(dataUrl) => setForm((prev) => ({ ...prev, image: dataUrl }))}
                  helperText="Optional. Choose a file from your computer; large images are compressed."
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="label" htmlFor="sp-desc">
                  Description (optional)
                </label>
                <textarea id="sp-desc" name="description" rows={2} className="input resize-none" value={form.description} onChange={onFormChange} />
              </div>
              <div className="flex items-center gap-2">
                <input id="sp-avail" name="available" type="checkbox" checked={form.available} onChange={onFormChange} className="rounded" />
                <label htmlFor="sp-avail" className="text-sm text-gray-700">
                  Available
                </label>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
                <button type="submit" className="btn-portal" disabled={saving}>
                  {saving ? 'Saving…' : editingPartId ? 'Save changes' : 'Add spare part'}
                </button>
                {editingPartId ? (
                  <button type="button" className="btn-ghost" disabled={saving} onClick={handleCancelEdit}>
                    Cancel edit
                  </button>
                ) : null}
                {formMsg ? (
                  <p className={`text-sm ${formMsg.includes('success') ? 'text-emerald-700' : 'text-red-600'}`}>{formMsg}</p>
                ) : null}
              </div>
            </form>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
            </div>
          )}
          {!loading && error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          {!loading && !error && (
            <div className={tableShell}>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className={thClass}>ID</th>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Compatible vehicle</th>
                    <th className={thClass}>Price</th>
                    <th className={thClass}>Stock</th>
                    <th className={thClass}>Rating</th>
                    <th className={thClass}>Available</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`${tdClass} text-center text-gray-500 max-w-none`}>
                        No spare parts.
                      </td>
                    </tr>
                  ) : (
                    spareParts.map((p) => (
                      <tr key={rowId(p)} className="hover:bg-gray-50/80">
                        <td className={tdClass} title={String(rowId(p))}>
                          {String(rowId(p)).slice(-8)}
                        </td>
                        <td className={tdClass} title={p.name}>
                          {p.name || '—'}
                        </td>
                        <td className={tdClass}>{p.category || '—'}</td>
                        <td className={tdClass} title={p.compatibleVehicle}>
                          {p.compatibleVehicle || '—'}
                        </td>
                        <td className={tdClass}>{formatRs(p.price)}</td>
                        <td className={tdClass}>{p.stock ?? '—'}</td>
                        <td className={tdClass}>{p.rating != null ? p.rating : '—'}</td>
                        <td className={tdClass}>{p.available ? 'Yes' : 'No'}</td>
                        <td className={`${tdClass} text-right`}>
                          <button
                            type="button"
                            className="text-sm font-semibold text-primary-700 hover:text-primary-900"
                            onClick={() => handleEditClick(p)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSparePartsDetail;
