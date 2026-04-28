import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addPartsCartLine, buildPartsCartLineFromProduct } from '../utils/partsCartStorage';

/**
 * @param {object} props
 * @param {object} props.product
 * @param {'spare-part' | 'modification'} props.cartKind — required for add-to-cart from shop listings
 */
const ProductCard = ({ product, cartKind }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [addedHint, setAddedHint] = useState(false);

  const stockCount =
    cartKind === 'spare-part' ? Math.max(0, Math.floor(Number(product.stock) || 0)) : null;
  const outOfStock = cartKind === 'spare-part' && stockCount === 0;

  const modificationUnavailable = cartKind === 'modification' && product.available === false;
  const modificationSubtitle =
    cartKind === 'modification'
      ? [product.category, product.brand, Array.isArray(product.compatibleVehicles) ? product.compatibleVehicles.slice(0, 2).join(', ') : '']
          .filter(Boolean)
          .join(' · ') || product.compatibleVehicle || '—'
      : product.compatibleVehicle || product.category;

  const handleAddToCart = () => {
    if (!isAuthenticated || !user?.email) {
      navigate('/login', {
        state: {
          redirectMessage: 'Please login or register to add items to cart',
          redirectTo: cartKind === 'modification' ? '/modifications' : '/spare-parts'
        }
      });
      return;
    }
    if (!cartKind) return;
    if (cartKind === 'spare-part' && outOfStock) return;
    if (cartKind === 'modification' && modificationUnavailable) return;
    const line = buildPartsCartLineFromProduct(product, cartKind);
    addPartsCartLine(user.email, line);
    setAddedHint(true);
    setTimeout(() => setAddedHint(false), 2200);
  };

  return (
    <div className="card group">
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.discount ? (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-100">
            {product.discount}% OFF
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{modificationSubtitle}</p>

        <div className="flex justify-between items-start gap-3 mb-4">
          <span className="text-xl font-extrabold text-primary-700 shrink-0">
            Rs. {product.price.toLocaleString()}
          </span>
          <div className="text-right min-w-0">
            {product.originalPrice ? (
              <span className="text-gray-500 text-sm line-through block">Rs. {product.originalPrice.toLocaleString()}</span>
            ) : null}
            {stockCount != null ? (
              <p
                className={`text-sm font-semibold mt-0.5 ${outOfStock ? 'text-red-600' : 'text-gray-700'}`}
                title="Current stock"
              >
                Stock: {stockCount}
              </p>
            ) : null}
            {cartKind === 'modification' ? (
              <p
                className={`text-sm font-semibold mt-0.5 ${modificationUnavailable ? 'text-red-600' : 'text-emerald-700'}`}
              >
                {modificationUnavailable ? 'Not available' : 'Available'}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!cartKind || outOfStock || modificationUnavailable}
          className="w-full btn-portal disabled:opacity-50 disabled:pointer-events-none"
        >
          {!isAuthenticated
            ? 'Login to buy'
            : outOfStock
              ? 'Out of stock'
              : modificationUnavailable
                ? 'Not available'
                : 'Add to cart'}
        </button>
        {addedHint ? (
          <p className="text-xs text-emerald-700 font-semibold mt-2 text-center">
            Added — view{' '}
            <Link to="/user-profile/cart" className="underline">
              My Cart
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ProductCard;
