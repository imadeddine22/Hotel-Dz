'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

// Exchange rates (value of 1 unit in DZD) set by the admin in /admin/pricing; fetched once per page load
let ratesPromise = null;
const loadRates = () =>
  (ratesPromise ||= api
    .get('/pricing/prices')
    .then(({ data }) => data.settings?.exchangeRates || {})
    .catch(() => ({})));

/**
 * "≈ 7 740 DZD" under a price in another currency (Tunisian dinar, Moroccan dirham), so
 * Algerian visitors get an idea of the cost. Renders nothing for prices already in DZD.
 * Indicative only: bookings are made and paid in the listing's own currency.
 */
export default function ApproxPrice({ amount, currency, className = 'text-xs text-gray-400' }) {
  const [rate, setRate] = useState(null);
  const foreign = currency && currency !== 'DZD' && Number(amount) > 0;

  useEffect(() => {
    if (!foreign) return undefined;
    let active = true;
    loadRates().then((rates) => active && setRate(Number(rates[currency]) || null));
    return () => {
      active = false;
    };
  }, [foreign, currency]);

  if (!foreign || !rate) return null;
  return <span className={className}>≈ {formatDZD(Math.round((amount * rate) / 10) * 10)}</span>;
}
