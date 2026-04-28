const STORAGE_KEY = 'motoTradePartsCart';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const saveAll = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getPartsCart = (email) => {
  const n = normalizeEmail(email);
  const all = loadAll();
  return Array.isArray(all[n]) ? all[n] : [];
};

/**
 * @param {string} email
 * @param {{
 *   lineId: string,
 *   productId: string,
 *   kind: 'spare-part' | 'modification',
 *   name: string,
 *   price: number,
 *   image: string,
 *   subtitle: string,
 *   addedAt: string
 * }} line
 */
export const addPartsCartLine = (email, line) => {
  const n = normalizeEmail(email);
  if (!n) return;
  const all = loadAll();
  const list = Array.isArray(all[n]) ? [...all[n]] : [];
  list.unshift(line);
  all[n] = list;
  saveAll(all);
};

export const removePartsCartLines = (email, lineIds) => {
  const n = normalizeEmail(email);
  if (!n || !lineIds?.length) return;
  const set = new Set(lineIds);
  const all = loadAll();
  const list = (Array.isArray(all[n]) ? all[n] : []).filter((l) => !set.has(l.lineId));
  all[n] = list;
  saveAll(all);
};

/**
 * @param {object} product
 * @param {'spare-part' | 'modification'} kind
 */
export const buildPartsCartLineFromProduct = (product, kind) => {
  const productId = String(product._id || product.id || '');
  let subtitle = '';
  if (kind === 'spare-part') {
    subtitle = product.compatibleVehicle || product.category || '';
  } else {
    const compat = Array.isArray(product.compatibleVehicles)
      ? product.compatibleVehicles.slice(0, 2).join(', ')
      : product.compatibleVehicle || '';
    subtitle = [product.category, product.brand, compat].filter(Boolean).join(' · ');
  }
  return {
    lineId: `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    productId,
    kind,
    name: product.name || 'Item',
    price: Number(product.price) || 0,
    image: product.image || '',
    subtitle,
    addedAt: new Date().toISOString()
  };
};
