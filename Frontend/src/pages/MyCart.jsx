import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPartsCart, removePartsCartLines } from '../utils/partsCartStorage';

const kindLabel = (kind) => (kind === 'modification' ? 'Modification' : 'Spare part');

const MyCart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const email = user?.email || '';

  const [lines, setLines] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [selectMode, setSelectMode] = useState(false);

  const refresh = useCallback(() => {
    if (!email) {
      setLines([]);
      setSelected(new Set());
      return;
    }
    setLines(getPartsCart(email));
    setSelected(new Set());
  }, [email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.price) || 0), 0), [lines]);

  const toggleLine = (lineId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(lines.map((l) => l.lineId)));
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const handleRemoveSelected = () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Remove ${selected.size} item(s) from your cart?`)) return;
    removePartsCartLines(email, [...selected]);
    refresh();
  };

  const handleProcessPayment = () => {
    if (selected.size === 0) return;
    const items = lines.filter((l) => selected.has(l.lineId));
    const lineIds = items.map((l) => l.lineId);
    navigate('/payment/checkout', {
      state: {
        cartCheckout: {
          items,
          lineIds
        }
      }
    });
  };

  const enterSelectMode = () => {
    setSelectMode(true);
    clearSelection();
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    clearSelection();
  };

  return (
    <div className="page py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="panel-solid overflow-hidden">
          <div className="panel-header flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">My Cart</h1>
              <p className="text-gray-600 mt-1">
                Spare parts and modification items you add from the shop appear here. Select items to remove them or
                proceed to payment.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/spare-parts" className="btn-ghost text-sm">
                Spare parts
              </Link>
              <Link to="/modifications" className="btn-ghost text-sm">
                Modifications
              </Link>
            </div>
          </div>

          <div className="panel-body border-t border-gray-100">
            {lines.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Your cart is empty. Browse{' '}
                <Link to="/spare-parts" className="text-primary-700 font-semibold hover:underline">
                  spare parts
                </Link>{' '}
                or{' '}
                <Link to="/modifications" className="text-primary-700 font-semibold hover:underline">
                  modifications
                </Link>{' '}
                and use <span className="font-semibold">Add to cart</span> on any item.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{lines.length}</span> line(s) ·{' '}
                    <span className="font-semibold text-primary-700">Rs. {total.toLocaleString()}</span> subtotal
                  </p>
                  {!selectMode ? (
                    <button type="button" onClick={enterSelectMode} className="btn-portal text-sm">
                      Select items
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={selectAll} className="btn-ghost text-sm">
                        Select all
                      </button>
                      <button type="button" onClick={clearSelection} className="btn-ghost text-sm">
                        Clear selection
                      </button>
                      <button type="button" onClick={exitSelectMode} className="btn-ghost text-sm">
                        Done selecting
                      </button>
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.lineId}
                      className={`flex gap-3 p-3 rounded-xl border ${
                        selectMode && selected.has(line.lineId)
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {selectMode && (
                        <label className="flex items-start pt-1 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={selected.has(line.lineId)}
                            onChange={() => toggleLine(line.lineId)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 mt-0.5"
                          />
                        </label>
                      )}
                      <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
                        {line.image ? (
                          <img src={line.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{line.name}</p>
                        <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mt-0.5">
                          {kindLabel(line.kind)}
                        </p>
                        {line.subtitle ? <p className="text-sm text-gray-600 truncate mt-0.5">{line.subtitle}</p> : null}
                        <p className="text-sm font-extrabold text-primary-700 mt-1">
                          Rs. {(Number(line.price) || 0).toLocaleString()}
                        </p>
                      </div>
                      {!selectMode && (
                        <button
                          type="button"
                          className="text-sm font-semibold text-red-600 hover:text-red-800 shrink-0 self-start"
                          onClick={() => {
                            if (!window.confirm('Remove this item from your cart?')) return;
                            removePartsCartLines(email, [line.lineId]);
                            refresh();
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {selectMode && (
                  <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      disabled={selected.size === 0}
                      onClick={handleRemoveSelected}
                      className="btn-ghost text-sm border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Remove selected ({selected.size})
                    </button>
                    <button
                      type="button"
                      disabled={selected.size === 0}
                      onClick={handleProcessPayment}
                      className="btn-portal text-sm disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Process to payment
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCart;
