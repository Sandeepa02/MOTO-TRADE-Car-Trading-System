import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';
import {
  formatRs,
  rowId,
  tableShell,
  thClass,
  tdClass
} from './adminInventoryHelpers';
import AdminImageFileInput from './AdminImageFileInput';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'AWD'];
const VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'truck', 'coupe', 'convertible', 'van', 'cab'];
const CURRENT_YEAR = new Date().getFullYear();

const emptyBrandedForm = () => ({
  brand: '',
  model: '',
  year: CURRENT_YEAR,
  price: '',
  image: '',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  vehicleType: 'sedan',
  condition: 'New',
  description: '',
  mileage: '0'
});

const AdminBrandedCarsDetail = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyBrandedForm);
  const [formMsg, setFormMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFieldKey, setImageFieldKey] = useState(0);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles`);
      const data = await response.json();
      if (data.success) {
        setVehicles(data.data || []);
      } else {
        setError('Failed to load vehicles.');
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const brandedCars = useMemo(
    () => vehicles.filter((v) => v.category === 'branded'),
    [vehicles]
  );

  const hasVehicleImage = Boolean(String(form.image || '').trim());

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormState = () => {
    setForm(emptyBrandedForm());
    setEditingVehicleId(null);
    setImageFieldKey((k) => k + 1);
  };

  const handleEditClick = (car) => {
    setFormMsg('');
    setEditingVehicleId(rowId(car));
    setForm({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || CURRENT_YEAR,
      price: String(car.price ?? ''),
      image: car.image || '',
      fuelType: car.fuelType || 'Petrol',
      transmission: car.transmission || 'Automatic',
      vehicleType: car.vehicleType || 'sedan',
      condition: car.condition || 'New',
      description: car.description || '',
      mileage: String(car.mileage ?? '0')
    });
    setImageFieldKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormMsg('');
    resetFormState();
  };

  const handleSaveBranded = async (e) => {
    e.preventDefault();
    setFormMsg('');
    const brand = form.brand.trim();
    const model = form.model.trim();
    if (!brand || !model) {
      setFormMsg('Brand and model are required.');
      return;
    }
    const year = Number(form.year);
    const price = Number(form.price);
    if (!Number.isFinite(year) || !Number.isFinite(price) || price < 0) {
      setFormMsg('Enter valid year and price.');
      return;
    }
    if (year > CURRENT_YEAR) {
      setFormMsg('Invalid year');
      return;
    }
    if (!form.image || !String(form.image).trim()) {
      setFormMsg('Please choose a vehicle image.');
      return;
    }

    const name = `${brand} ${model}`.trim();
    const mileage = Number(form.mileage);
    const payload = {
      name,
      brand,
      model,
      year,
      price,
      image: String(form.image).trim(),
      fuelType: form.fuelType,
      transmission: form.transmission,
      vehicleType: form.vehicleType,
      condition: form.condition,
      description: form.description.trim(),
      mileage: Number.isFinite(mileage) && mileage >= 0 ? mileage : 0,
      category: 'branded',
      available: true,
      rating: 0,
      features: []
    };

    setSaving(true);
    try {
      const { data } = editingVehicleId
        ? await axios.put(`${API_CONFIG.BACKEND_API_URL}/vehicles/${editingVehicleId}`, payload)
        : await axios.post(`${API_CONFIG.BACKEND_API_URL}/vehicles`, payload);
      if (data.success) {
        setFormMsg(editingVehicleId ? 'Branded car updated successfully.' : 'Branded car added successfully.');
        resetFormState();
        await loadVehicles();
      } else {
        setFormMsg(data.error || data.message || `Could not ${editingVehicleId ? 'update' : 'add'} vehicle.`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        `Could not ${editingVehicleId ? 'update' : 'add'} vehicle.`;
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
            <h1 className="text-2xl font-extrabold text-gray-900">Branded cars — details</h1>
            <p className="text-gray-600 mt-1">
              All branded listings from the database. New branded cars can only be added here (admin).
            </p>
          </div>
        </div>
        <div className="panel-body space-y-8">
          <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-5">
            <h2 className="text-lg font-extrabold text-gray-900">{editingVehicleId ? 'Edit branded car' : 'Add branded car'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Uses your admin session. Listing is saved as branded inventory.
              {editingVehicleId ? ' Update the fields below and save changes.' : ''}
            </p>
            <form onSubmit={handleSaveBranded} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="bc-brand">
                  Brand
                </label>
                <input id="bc-brand" name="brand" className="input" value={form.brand} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="bc-model">
                  Model
                </label>
                <input id="bc-model" name="model" className="input" value={form.model} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="bc-year">
                  Year
                </label>
                <input
                  id="bc-year"
                  name="year"
                  type="number"
                  min="1900"
                  max={CURRENT_YEAR}
                  className="input"
                  value={form.year}
                  onChange={onFormChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="bc-price">
                  Price (Rs.)
                </label>
                <input id="bc-price" name="price" type="number" min="0" className="input" value={form.price} onChange={onFormChange} />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <AdminImageFileInput
                  id="bc-vehicle-image"
                  resetKey={imageFieldKey}
                  label="Vehicle image"
                  value={form.image}
                  onChange={(dataUrl) => setForm((prev) => ({ ...prev, image: dataUrl }))}
                  helperText="Required. JPEG/PNG/WebP — large files are resized automatically."
                />
              </div>
              <div>
                <label className="label" htmlFor="bc-mileage">
                  Mileage (km)
                </label>
                <input id="bc-mileage" name="mileage" type="number" min="0" className="input" value={form.mileage} onChange={onFormChange} />
              </div>
              <div>
                <label className="label" htmlFor="bc-fuel">
                  Fuel type
                </label>
                <select id="bc-fuel" name="fuelType" className="select" value={form.fuelType} onChange={onFormChange}>
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="bc-trans">
                  Transmission
                </label>
                <select id="bc-trans" name="transmission" className="select" value={form.transmission} onChange={onFormChange}>
                  {TRANSMISSIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="bc-vtype">
                  Vehicle type
                </label>
                <select id="bc-vtype" name="vehicleType" className="select" value={form.vehicleType} onChange={onFormChange}>
                  {VEHICLE_TYPES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="bc-cond">
                  Condition
                </label>
                <select id="bc-cond" name="condition" className="select" value={form.condition} onChange={onFormChange}>
                  <option value="New">New</option>
                  <option value="Used - Excellent">Used - Excellent</option>
                  <option value="Used - Very Good">Used - Very Good</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="label" htmlFor="bc-desc">
                  Description (optional)
                </label>
                <textarea id="bc-desc" name="description" rows={2} className="input resize-none" value={form.description} onChange={onFormChange} />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
                <button type="submit" className="btn-portal" disabled={saving || !hasVehicleImage} title={!hasVehicleImage ? 'Upload a vehicle image to continue' : undefined}>
                  {saving ? 'Saving…' : editingVehicleId ? 'Save changes' : 'Add branded car'}
                </button>
                {editingVehicleId ? (
                  <button type="button" className="btn-ghost" onClick={handleCancelEdit} disabled={saving}>
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
                    <th className={thClass}>Brand</th>
                    <th className={thClass}>Model</th>
                    <th className={thClass}>Year</th>
                    <th className={thClass}>Price</th>
                    <th className={thClass}>Condition</th>
                    <th className={thClass}>Fuel</th>
                    <th className={thClass}>Transmission</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brandedCars.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`${tdClass} text-center text-gray-500 max-w-none`}>
                        No branded cars in the database.
                      </td>
                    </tr>
                  ) : (
                    brandedCars.map((car) => (
                      <tr key={rowId(car)} className="hover:bg-gray-50/80">
                        <td className={tdClass} title={String(rowId(car))}>
                          {String(rowId(car)).slice(-8)}
                        </td>
                        <td className={tdClass}>{car.brand || '—'}</td>
                        <td className={tdClass}>{car.model || '—'}</td>
                        <td className={tdClass}>{car.year ?? '—'}</td>
                        <td className={tdClass}>{formatRs(car.price)}</td>
                        <td className={tdClass}>{car.condition || '—'}</td>
                        <td className={tdClass}>{car.fuelType || '—'}</td>
                        <td className={tdClass}>{car.transmission || '—'}</td>
                        <td className={tdClass}>
                          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => handleEditClick(car)}>
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

export default AdminBrandedCarsDetail;
