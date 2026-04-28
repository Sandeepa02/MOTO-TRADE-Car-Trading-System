import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_CONFIG } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';

const formatValue = (value, fallback = 'N/A') => {
  if (value === undefined || value === null || value === '') return fallback;
  return value;
};

const formatPrice = (price) => {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return 'N/A';
  return `Rs. ${Number(price).toLocaleString()}`;
};

const getSellerName = (vehicle) => {
  if (!vehicle) return 'Seller';
  return (
    vehicle.seller?.name ||
    vehicle.sellerName ||
    vehicle.ownerInformation?.ownerName ||
    vehicle.sellerEmail ||
    'Seller'
  );
};

const normalizeCategory = (category) => {
  const raw = String(category || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');
  if (raw === 'second-hand' || raw === 'secondhand' || raw === 'used') return 'second-hand';
  if (raw === 'branded' || raw === 'brand-new' || raw === 'new') return 'branded';
  return raw || 'other';
};

const getListingSellerEmail = (vehicle) => {
  if (!vehicle || normalizeCategory(vehicle.category) !== 'second-hand') return null;
  const raw =
    vehicle.sellerEmail ||
    vehicle.seller?.email ||
    vehicle.ownerInformation?.ownerEmail ||
    vehicle.ownerInformation?.email;
  if (!raw || typeof raw !== 'string') return null;
  const normalized = raw.trim().toLowerCase();
  return normalized || null;
};

const CarDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState(state?.car || null);
  const [loading, setLoading] = useState(!state?.car);
  const [error, setError] = useState('');

  const handleChatWithSeller = () => {
    if (!car) return;
    const listingId = String(car._id || car.id || id);
    const shortId = listingId.length > 12 ? listingId.slice(-12) : listingId;
    const normalizedCategory = normalizeCategory(car.category);
    const categoryLabel =
      normalizedCategory === 'branded'
        ? 'Branded car'
        : normalizedCategory === 'second-hand'
          ? 'Second-hand car'
          : 'Listing';
    const chatListing = {
      listingId,
      title: `${categoryLabel} (${shortId})`,
      sellerName: getSellerName(car),
      thumbnail: car.image || '',
      category: normalizedCategory,
      listingPrice: Number(car.price) || 0,
      listingSellerEmail: getListingSellerEmail(car)
    };

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectTo: '/my-chats',
          chatListing
        }
      });
      return;
    }

    navigate('/my-chats', { state: { chatListing } });
  };

  const handleBuyNow = () => {
    if (!car) return;
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectTo: '/payment/checkout',
          redirectState: { car }
        }
      });
      return;
    }
    navigate('/payment/checkout', { state: { car } });
  };

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) {
        setError('Invalid vehicle ID.');
        setLoading(false);
        return;
      }

      try {
        const secondHandResponse = await fetch(`${API_CONFIG.BACKEND_API_URL}/second-hand-cars/${id}`);
        const secondHandData = await secondHandResponse.json();
        if (secondHandResponse.ok && secondHandData.success && secondHandData.data) {
          setCar(secondHandData.data);
          setError('');
          return;
        }

        const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles/${id}`);
        const data = await response.json();
        if (!response.ok || !data.success || !data.data) {
          setError('Vehicle details not found.');
          return;
        }
        setCar(data.data);
        setError('');
      } catch (err) {
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!car || String(car._id || car.id) !== String(id)) {
      fetchCarDetails();
    } else {
      setLoading(false);
    }
  }, [id, car]);

  return (
    <div className="page py-8">
      <div className="container-shell">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {!loading && error && (
          <div className="panel-solid p-8 text-center">
            <p className="text-xl text-red-600 font-semibold mb-4">{error}</p>
            <Link to="/second-hand-cars" className="btn-portal">
              Back to Cars
            </Link>
          </div>
        )}

        {!loading && !error && car && (
          <div className="panel-solid overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              <div className="bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={car.image}
                  alt={`${formatValue(car.brand)} ${formatValue(car.model)}`}
                  className="w-full h-full object-cover min-h-[320px]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
                  {formatValue(car.category, 'Vehicle')}
                </p>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                  {formatValue(car.brand)} {formatValue(car.model)}
                </h1>
                <p className="text-gray-600 mb-6">{formatValue(car.name, 'Quality checked listing')}</p>

                <div className="text-2xl font-extrabold text-primary-700 mb-6">{formatPrice(car.price)}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="panel-muted p-3 rounded-lg">
                    <p className="text-gray-500">Condition</p>
                    <p className="font-semibold text-gray-900">{formatValue(car.condition)}</p>
                  </div>
                  <div className="panel-muted p-3 rounded-lg">
                    <p className="text-gray-500">Year</p>
                    <p className="font-semibold text-gray-900">{formatValue(car.year)}</p>
                  </div>
                  <div className="panel-muted p-3 rounded-lg">
                    <p className="text-gray-500">Fuel Type</p>
                    <p className="font-semibold text-gray-900">{formatValue(car.fuelType)}</p>
                  </div>
                  <div className="panel-muted p-3 rounded-lg">
                    <p className="text-gray-500">Transmission</p>
                    <p className="font-semibold text-gray-900">{formatValue(car.transmission)}</p>
                  </div>
                  <div className="panel-muted p-3 rounded-lg">
                    <p className="text-gray-500">Mileage</p>
                    <p className="font-semibold text-gray-900">{formatValue(car.mileage)}</p>
                  </div>
                  <div className="panel-muted p-3 rounded-lg">
                    <p className="text-gray-500">Vehicle Number</p>
                    <p className="font-semibold text-gray-900">{formatValue(car.vehicleNumber)}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={handleChatWithSeller} className="btn-ghost">
                    Chat with Seller
                  </button>
                  <button onClick={handleBuyNow} className="btn-portal">
                    Buy Now
                  </button>
                  <Link
                    to={normalizeCategory(car.category) === 'branded' ? '/branded-cars' : '/second-hand-cars'}
                    className="btn-ghost"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetails;
