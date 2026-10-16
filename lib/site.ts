// ─────────────────────────────────────────────────────────────
//  Brand configuration — change these values to re-skin the
//  prototype for any interior design studio.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: 'Ember & Oak',
  fullName: 'Ember & Oak Interiors',
  tagline: 'Interior architecture, lit for living.',
  city: 'Bengaluru',
  phone: '+91 80 4000 0000',
  email: 'studio@emberandoak.example',
  address: '12 Lavelle Road, Bengaluru 560001',
  currency: 'INR',
  locale: 'en-IN',
};

export const formatMoney = (n: number) =>
  new Intl.NumberFormat(SITE.locale, {
    style: 'currency',
    currency: SITE.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(n));

export const formatLakh = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  return `₹${(n / 1e5).toFixed(1)} L`;
};
