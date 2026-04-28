export const SELLER_CARS_STORAGE_KEY = 'sellerSecondHandCars';

export const formatRs = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—';
  return `Rs. ${Number(value).toLocaleString()}`;
};

export const formatMileage = (car) => {
  if (car.mileage === undefined || car.mileage === null || car.mileage === '') return '—';
  if (typeof car.mileage === 'number') return `${car.mileage.toLocaleString()} km`;
  return String(car.mileage);
};

export const rowId = (item) => item._id || item.id || '—';

export const tableShell =
  'overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm';
export const thClass =
  'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 bg-gray-50 border-b border-gray-200 whitespace-nowrap';
export const tdClass =
  'px-3 py-2.5 text-sm text-gray-800 border-b border-gray-100 whitespace-nowrap max-w-[14rem] truncate';
