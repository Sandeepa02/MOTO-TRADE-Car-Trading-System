import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';
import { formatRs, rowId, tableShell, thClass, tdClass } from './adminInventoryHelpers';
import AdminImageFileInput from './AdminImageFileInput';

const MOD_CATEGORIES = [
  'Exterior',
  'Interior',
  'Performance',
  'Suspension',
  'Brakes',
  'Wheels',
  'Lighting',
  'Electronics',
  'Audio'
];

const emptyModForm = () => ({
  name: '',
  category: MOD_CATEGORIES[0],
  price: '',
  brand: '',
  image: '',
  description: '',
  compatibleVehicles: '',
  installationIncluded: false,
  available: true,
  rating: 0
});

const AdminModificationsDetail = () => {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyModForm);
  const [formMsg, setFormMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFieldKey, setImageFieldKey] = useState(0);
  const [editingModificationId, setEditingModificationId] = useState(null);

  const loadModifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/modifications`);
      const data = await response.json();
      if (data.success) {
        setModifications(data.data || []);
      } else {
        setError('Failed to load modifications.');
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModifications();
  }, [loadModifications]);

  const onFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetFormState = () => {
    setForm(emptyModForm());
    setEditingModificationId(null);
    setImageFieldKey((k) => k + 1);
  };

  const handleEditClick = (item) => {
    setFormMsg('');
    setEditingModificationId(rowId(item));
    const compat = Array.isArray(item.compatibleVehicles) ? item.compatibleVehicles.join(', ') : '';
    setForm({
      name: item.name || '',
      category: MOD_CATEGORIES.includes(item.category) ? item.category : MOD_CATEGORIES[0],
      price: String(item.price ?? ''),
      brand: item.brand || '',
      image: item.image || '',
      description: item.description || '',
      compatibleVehicles: compat,
      installationIncluded: !!item.installationIncluded,
      available: item.available !== false,
      rating: item.rating != null ? Number(item.rating) : 0
    });
    setImageFieldKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormMsg('');
    resetFormState();
  };

  const handleSaveModification = async (e) => {
    e.preventDefault();
    setFormMsg('');
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name) {
      setFormMsg('Name is required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormMsg('Enter a valid price.');
      return;
    }

    const compatibleVehicles = form.compatibleVehicles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const ratingVal = Number(form.rating);
    const payload = {
      name,
      category: form.category,
      price,
      brand: form.brand.trim() || undefined,
      image: typeof form.image === 'string' ? form.image.trim() : '',
      description: form.description.trim(),
      compatibleVehicles,
      installationIncluded: !!form.installationIncluded,
      available: !!form.available,
      rating: Number.isFinite(ratingVal) && ratingVal >= 0 && ratingVal <= 5 ? ratingVal : 0
    };

    const wasEditing = Boolean(editingModificationId);
    setSaving(true);
    try {
      const { data } = editingModificationId
        ? await axios.put(`${API_CONFIG.BACKEND_API_URL}/modifications/${editingModificationId}`, payload)
        : await axios.post(`${API_CONFIG.BACKEND_API_URL}/modifications`, payload);
      if (data.success) {
        setFormMsg(wasEditing ? 'Modification updated successfully.' : 'Modification added successfully.');
        resetFormState();
        await loadModifications();
      } else {
        setFormMsg(data.message || data.error || `Could not ${wasEditing ? 'update' : 'add'} modification.`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        `Could not ${wasEditing ? 'update' : 'add'} modification.`;
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
            <h1 className="text-2xl font-extrabold text-gray-900">Modifications — details</h1>
            <p className="text-gray-600 mt-1">
              All modification items from the database. New items can only be added here (admin).
            </p>
          </div>
        </div>
        <div className="panel-body space-y-8">
          <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-5">
            <h2 className="text-lg font-extrabold text-gray-900">
              {editingModificationId ? 'Edit modification' : 'Add modification'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Uses your admin session. Compatible vehicles: comma-separated list.
              {editingModificationId ? ' Update the fields below and save changes.' : ''}
            </p>
            <form onSubmit={handleSaveModification} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="md-name">
                  Name
                </label>
                <input id="md-name" name="name" className="input" value={form.name} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="md-cat">
                  Category
                </label>
                <select id="md-cat" name="category" className="select" value={form.category} onChange={onFormChange}>
                  {MOD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="md-price">
                  Price (Rs.)
                </label>
                <input id="md-price" name="price" type="number" min="0" className="input" value={form.price} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="md-brand">
                  Brand (optional)
                </label>
                <input id="md-brand" name="brand" className="input" value={form.brand} onChange={onFormChange} />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <AdminImageFileInput
                  id="md-item-image"
                  resetKey={imageFieldKey}
                  label="Modification image"
                  value={form.image}
                  onChange={(dataUrl) => setForm((prev) => ({ ...prev, image: dataUrl }))}
                  helperText="Optional. Choose a file — large images are compressed before save."
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="label" htmlFor="md-compat">
                  Compatible vehicles (comma-separated)
                </label>
                <input
                  id="md-compat"
                  name="compatibleVehicles"
                  className="input"
                  value={form.compatibleVehicles}
                  onChange={onFormChange}
                  placeholder="e.g. Honda Civic, Toyota Corolla"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="label" htmlFor="md-desc">
                  Description (optional)
                </label>
                <textarea id="md-desc" name="description" rows={2} className="input resize-none" value={form.description} onChange={onFormChange} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="md-install"
                  name="installationIncluded"
                  type="checkbox"
                  checked={form.installationIncluded}
                  onChange={onFormChange}
                  className="rounded"
                />
                <label htmlFor="md-install" className="text-sm text-gray-700">
                  Installation included
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input id="md-avail" name="available" type="checkbox" checked={form.available} onChange={onFormChange} className="rounded" />
                <label htmlFor="md-avail" className="text-sm text-gray-700">
                  Available
                </label>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
                <button type="submit" className="btn-portal" disabled={saving}>
                  {saving ? 'Saving…' : editingModificationId ? 'Save changes' : 'Add modification'}
                </button>
                {editingModificationId ? (
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
                    <th className={thClass}>Brand</th>
                    <th className={thClass}>Price</th>
                    <th className={thClass}>Compatible</th>
                    <th className={thClass}>Install</th>
                    <th className={thClass}>Available</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modifications.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`${tdClass} text-center text-gray-500 max-w-none`}>
                        No modification items.
                      </td>
                    </tr>
                  ) : (
                    modifications.map((m) => (
                      <tr key={rowId(m)} className="hover:bg-gray-50/80">
                        <td className={tdClass} title={String(rowId(m))}>
                          {String(rowId(m)).slice(-8)}
                        </td>
                        <td className={tdClass} title={m.name}>
                          {m.name || '—'}
                        </td>
                        <td className={tdClass}>{m.category || '—'}</td>
                        <td className={tdClass}>{m.brand || '—'}</td>
                        <td className={tdClass}>{formatRs(m.price)}</td>
                        <td className={`${tdClass} max-w-[18rem]`} title={(m.compatibleVehicles || []).join(', ')}>
                          {(m.compatibleVehicles || []).join(', ') || '—'}
                        </td>
                        <td className={tdClass}>{m.installationIncluded ? 'Yes' : 'No'}</td>
                        <td className={tdClass}>{m.available ? 'Yes' : 'No'}</td>
                        <td className={`${tdClass} text-right`}>
                          <button
                            type="button"
                            className="text-sm font-semibold text-primary-700 hover:text-primary-900"
                            onClick={() => handleEditClick(m)}
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

export default AdminModificationsDetail;
