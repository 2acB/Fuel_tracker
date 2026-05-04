import { useEffect } from 'react';
import { FUEL_LABELS, FUEL_COLORS } from '../../types';
import type { FuelType } from '../../types';
import { DEFAULT_FUEL_PRICES } from '../../lib/fuel-prices';
import { usePriceStore } from '../../store/price-store';
import { Loader, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function PriceBoard() {
  const { prices, lastFetched, isLoading, fetchPrices } = usePriceStore();

  useEffect(() => {
    // Fetch if never fetched or if data is older than 6 hours
    if (!lastFetched || (Date.now() - new Date(lastFetched).getTime() > 6 * 60 * 60 * 1000)) {
      fetchPrices();
    }
  }, []);

  // Use BCP (Bangchak) prices for the main board as they are most reliable in the API
  const displayPrices = prices.length > 0 
    ? prices.filter(p => p.station_brand === 'bangchak')
    : DEFAULT_FUEL_PRICES;

  const dateStr = lastFetched ? format(new Date(lastFetched), 'dd MMM HH:mm') : displayPrices[0]?.effective_date;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>⛽ Live Fuel Prices</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Bangchak · {isLoading ? 'Updating...' : `Updated ${dateStr}`}
          </div>
        </div>
        <button 
          onClick={() => fetchPrices()} 
          disabled={isLoading}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
        >
          {isLoading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </button>
      </div>
      <div className="price-grid" style={{ padding: 8 }}>
        {displayPrices.map((fp) => (
          <div className="price-item" key={fp.id ?? fp.fuel_type}>
            <div className="fuel-name">{FUEL_LABELS[fp.fuel_type as FuelType]}</div>
            <div className="fuel-price" style={{ color: FUEL_COLORS[fp.fuel_type as FuelType] }}>
              ฿{fp.price_thb.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
