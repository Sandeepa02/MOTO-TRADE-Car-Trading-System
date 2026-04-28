import React, { useEffect, useMemo, useState } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import {
  formatRs,
  formatMileage,
  rowId,
  tableShell,
  thClass,
  tdClass
} from './adminInventoryHelpers';

const AdminSecondHandCarsDetail = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/second-hand-cars`);
        const data = await response.json();
        if (data.success) {
          setVehicles(data.data || []);
          setError('');
        } else {
          setError('Failed to load vehicles.');
        }
      } catch {
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const secondHandCars = useMemo(() => vehicles, [vehicles]);

  return (
    <div className="page py-8 px-4">
      <div className="max-w-7xl mx-auto panel-solid">
        <div className="panel-header">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Second-hand cars — details</h1>
            <p className="text-gray-600 mt-1">All second-hand listings saved in the database.</p>
          </div>
        </div>
        <div className="panel-body">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
            </div>
          )}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}
          {!loading && !error && (
            <div className={tableShell}>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className={thClass}>ID</th>
                    <th className={thClass}>Source</th>
                    <th className={thClass}>Brand</th>
                    <th className={thClass}>Model</th>
                    <th className={thClass}>Year</th>
                    <th className={thClass}>Price</th>
                    <th className={thClass}>Mileage</th>
                    <th className={thClass}>Fuel</th>
                    <th className={thClass}>Vehicle #</th>
                  </tr>
                </thead>
                <tbody>
                  {secondHandCars.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`${tdClass} text-center text-gray-500 max-w-none`}>
                        No second-hand listings.
                      </td>
                    </tr>
                  ) : (
                    secondHandCars.map((car) => {
                      return (
                        <tr key={rowId(car)} className="hover:bg-gray-50/80">
                          <td className={tdClass} title={String(rowId(car))}>
                            {String(rowId(car)).slice(-12)}
                          </td>
                          <td className={tdClass}>Database</td>
                          <td className={tdClass}>{car.brand || '—'}</td>
                          <td className={tdClass}>{car.model || '—'}</td>
                          <td className={tdClass}>{car.year ?? '—'}</td>
                          <td className={tdClass}>{formatRs(car.price)}</td>
                          <td className={tdClass}>{formatMileage(car)}</td>
                          <td className={tdClass}>{car.fuelType || '—'}</td>
                          <td className={tdClass}>{car.vehicleNumber || '—'}</td>
                        </tr>
                      );
                    })
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

export default AdminSecondHandCarsDetail;
