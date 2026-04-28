import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/apiConfig';

const NIC_12_DIGIT_REGEX = /^\d{12}$/;
const SL_PHONE_10_DIGIT_REGEX = /^0\d{9}$/;

const mileageKmToFormValue = (mileage) => {
  if (mileage == null || mileage === '') return '';
  if (typeof mileage === 'number') return String(mileage);
  const digits = String(mileage).replace(/[^\d]/g, '');
  return digits || '';
};

const AddSecondHandListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const isEditMode = Boolean(listingId);
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    vehicleBrand: '',
    vehicleModel: '',
    vehicleNumber: '',
    vehicleColor: '',
    manufacturingYear: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: '',
    vehicleImage: '',
    price: '',
    condition: 'Used - Good',
    ownerName: '',
    ownerAddress: '',
    ownerNICNumber: '',
    ownerPhoneNumber: '',
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    if (!listingId || !user?.email) return;

    const loadListing = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/second-hand-cars/${listingId}`);
        const data = await response.json();
        const car = data?.data;

        if (!data.success || !car || String(car.sellerEmail || '').toLowerCase() !== String(user.email).toLowerCase()) {
          setMessage('Listing not found or you do not have permission to edit it.');
          return;
        }

        const owner = car.ownerInformation || {};
        setFormData({
          vehicleBrand: car.brand || '',
          vehicleModel: car.model || '',
          vehicleNumber: car.vehicleNumber || '',
          vehicleColor: car.vehicleColor || '',
          manufacturingYear: car.year != null ? String(car.year) : '',
          fuelType: car.fuelType || 'Petrol',
          transmission: car.transmission || 'Manual',
          mileage: mileageKmToFormValue(car.mileage),
          vehicleImage: car.vehicleImage || car.image || '',
          price: car.price != null ? String(car.price) : '',
          condition: car.condition || 'Used - Good',
          ownerName: owner.ownerName || '',
          ownerAddress: owner.ownerAddress || '',
          ownerNICNumber: owner.ownerNICNumber || '',
          ownerPhoneNumber: owner.ownerPhoneNumber || '',
        });
        setMessage('');
      } catch (error) {
        setMessage('Failed to load listing details.');
      }
    };

    loadListing();
  }, [listingId, user?.email]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'ownerNICNumber') {
      const nicDigitsOnly = value.replace(/\D/g, '').slice(0, 12);
      setFormData((prev) => ({ ...prev, [name]: nicDigitsOnly }));
      return;
    }
    if (name === 'ownerPhoneNumber') {
      const phoneDigitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: phoneDigitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const allRequiredTextFields = [
      formData.vehicleBrand,
      formData.vehicleModel,
      formData.vehicleNumber,
      formData.vehicleColor,
      formData.manufacturingYear,
      formData.mileage,
      formData.price,
      formData.ownerName,
      formData.ownerAddress,
      formData.ownerNICNumber,
      formData.ownerPhoneNumber
    ];

    if (allRequiredTextFields.some((value) => !String(value || '').trim())) {
      setMessage('Please fill all required fields.');
      return;
    }

    if (!NIC_12_DIGIT_REGEX.test(formData.ownerNICNumber.trim())) {
      setMessage('Owner NIC number must contain exactly 12 digits.');
      return;
    }

    if (!SL_PHONE_10_DIGIT_REGEX.test(formData.ownerPhoneNumber.trim())) {
      setMessage('Owner phone number must be a valid Sri Lankan 10-digit number (starts with 0).');
      return;
    }

    if (!formData.vehicleImage) {
      setMessage('Please attach a vehicle image.');
      return;
    }

    const builtPayload = {
      condition: formData.condition,
      brand: formData.vehicleBrand.trim(),
      model: formData.vehicleModel.trim(),
      vehicleNumber: formData.vehicleNumber.trim(),
      vehicleColor: formData.vehicleColor.trim(),
      year: Number(formData.manufacturingYear),
      price: Number(formData.price),
      mileage: `${formData.mileage} km`,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      image: formData.vehicleImage || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
      vehicleImage: formData.vehicleImage || '',
      ownerInformation: {
        ownerName: formData.ownerName.trim(),
        ownerAddress: formData.ownerAddress.trim(),
        ownerNICNumber: formData.ownerNICNumber.trim(),
        ownerPhoneNumber: formData.ownerPhoneNumber.trim(),
        ownerIdFrontImage: '',
        ownerIdBackImage: '',
      },
      sellerEmail: user?.email || 'unknown',
      sellerName: user?.name || 'Seller',
      category: 'second-hand',
    };

    try {
      const endpoint = isEditMode
        ? `${API_CONFIG.BACKEND_API_URL}/second-hand-cars/${listingId}`
        : `${API_CONFIG.BACKEND_API_URL}/second-hand-cars`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(builtPayload)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || 'Failed to save listing.');
        return;
      }

      setMessage(isEditMode
        ? 'Listing updated successfully. Redirecting to seller dashboard...'
        : 'Listing added successfully. Redirecting to seller dashboard...'
      );
    } catch (error) {
      setMessage('Failed to save listing. Please try again.');
      return;
    }

    setTimeout(() => {
      navigate('/seller-dashboard');
    }, 900);
  };

  return (
    <div className="page py-8 px-4">
      <div className="max-w-4xl mx-auto panel-solid overflow-hidden">
        <div className="panel-header">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isEditMode ? 'Edit Second-Hand Car Listing' : 'Add Second-Hand Car Listing'}
          </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? 'Update details and save changes to your listing.'
            : 'Fill in details to publish your second-hand car.'}
        </p>
        </div>

        <div className="panel-body">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="vehicleBrand" value={formData.vehicleBrand} onChange={onInputChange} placeholder="Vehicle Brand" required className="input" />
              <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={onInputChange} placeholder="Vehicle Model" required className="input" />
              <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={onInputChange} placeholder="Vehicle Number" required className="input" />
              <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={onInputChange} placeholder="Vehicle Color" required className="input" />
              <input type="number" name="manufacturingYear" value={formData.manufacturingYear} onChange={onInputChange} placeholder="Manufacturing Year" required className="input" />
              <select name="fuelType" value={formData.fuelType} onChange={onInputChange} className="select">
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
              <div>
                <label className="label" htmlFor="second-hand-transmission">Transmission</label>
                <select
                  id="second-hand-transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={onInputChange}
                  className="select"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="AWD">AWD</option>
                </select>
              </div>
              <input type="number" name="mileage" value={formData.mileage} onChange={onInputChange} placeholder="Mileage (km)" required className="input" />
              <input type="number" name="price" value={formData.price} onChange={onInputChange} placeholder="Price (Rs.)" required className="input" />
              <select name="condition" value={formData.condition} onChange={onInputChange} className="select">
                <option value="Used - Excellent">Used - Excellent</option>
                <option value="Used - Very Good">Used - Very Good</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>
              <div>
                <label className="label">Vehicle Image</label>
                <input type="file" accept="image/*" onChange={(event) => onImageChange(event, 'vehicleImage')} required={!formData.vehicleImage} className="input" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="ownerName" value={formData.ownerName} onChange={onInputChange} placeholder="Owner Name" required className="input" />
              <input type="text" name="ownerAddress" value={formData.ownerAddress} onChange={onInputChange} placeholder="Owner Address" required className="input" />
              <input type="text" name="ownerNICNumber" value={formData.ownerNICNumber} onChange={onInputChange} placeholder="Owner NIC Number (12 digits)" required maxLength={12} pattern="\d{12}" title="NIC must contain exactly 12 digits." className="input" />
              <input type="tel" name="ownerPhoneNumber" value={formData.ownerPhoneNumber} onChange={onInputChange} placeholder="Owner Phone Number (07XXXXXXXX)" required maxLength={10} pattern="0\d{9}" title="Use a valid 10-digit Sri Lankan phone number (starts with 0)." className="input" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/seller-dashboard')} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-portal">
              {isEditMode ? 'Save changes' : 'Add Listing'}
            </button>
          </div>
        </form>

        {message ? (
          <p
            className={`mt-4 font-medium ${
              message.includes('successfully') ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        ) : null}
        </div>
      </div>
    </div>
  );
};

export default AddSecondHandListing;
