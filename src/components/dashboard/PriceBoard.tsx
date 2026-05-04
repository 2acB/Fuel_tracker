import { useEffect, useState } from 'react';
import { FUEL_LABELS, FUEL_COLORS } from '../../types';
import type { FuelType } from '../../types';
import { DEFAULT_FUEL_PRICES } from '../../lib/fuel-prices';
import { usePriceStore } from '../../store/price-store';
import { Loader, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

// ── Crude Oil Widget ──────────────────────────────────────────
interface CrudeData {
  price: number;
  prev: number;
  loading: boolean;
  error: boolean;
}

function CrudeOilCard() {
  const [crude, setCrude] = useState<CrudeData>({ price: 0, prev: 0, loading: true, error: false });

  const fetchCrude = async () => {
    setCrude(c => ({ ...c, loading: true, error: false }));
    try {
      // Yahoo Finance proxy-free endpoint for Brent Crude (BZ=F)
      const res = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=5d',
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      const closes: number[] = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
      const valid = closes.filter((v: number) => v != null);
      if (valid.length >= 2) {
        setCrude({ price: valid[valid.length - 1], prev: valid[valid.length - 2], loading: false, error: false });
      } else {
        throw new Error('No data');
      }
    } catch {
      // Fallback: show last known approximate
      setCrude({ price: 64.2, prev: 65.1, loading: false, error: true });
    }
  };

  useEffect(() => { fetchCrude(); }, []);

  const change = crude.price - crude.prev;
  const changePct = crude.prev ? (change / crude.prev) * 100 : 0;
  const up = change > 0.05;
  const down = change < -0.05;

  const trendColor = up ? '#ef4444' : down ? '#22c55e' : '#f59e0b';
  const TrendIcon = up ? TrendingUp : down ? TrendingDown : Minus;
  const trendLabel = up
    ? 'Rising — pump prices may increase'
    : down
    ? 'Falling — pump prices may decrease'
    : 'Stable';

  return (
    <div
      style={{
        margin: '0 8px 8px',
        padding: '10px 14px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.02) 100%)',
        border: `1.5px solid ${trendColor}33`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 22 }}>🛢️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
          Brent Crude Oil
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          {trendLabel}
        </div>
      </div>
      {crude.loading ? (
        <Loader size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      ) : (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: trendColor }}>
            ${crude.price.toFixed(2)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
            <TrendIcon size={11} style={{ color: trendColor }} />
            <span style={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>
              {change >= 0 ? '+' : ''}{changePct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fuel types to show (exclude premium_diesel, show it as crude section instead) ──
const DISPLAYED_FUELS: FuelType[] = ['gasohol_91', 'gasohol_95', 'gasohol_e20', 'gasohol_e85', 'diesel'];

export default function PriceBoard() {
  const { prices, lastFetched, isLoading, fetchPrices } = usePriceStore();

  useEffect(() => {
    if (!lastFetched || (Date.now() - new Date(lastFetched).getTime() > 6 * 60 * 60 * 1000)) {
      fetchPrices();
    }
  }, []);

  // Use BCP (Bangchak) prices for the main board
  const allPrices = prices.length > 0
    ? prices.filter(p => p.station_brand === 'bangchak')
    : DEFAULT_FUEL_PRICES;

  // Filter to only show the fuels we want (remove premium_diesel dupes, keep diesel)
  const displayPrices = DISPLAYED_FUELS.map(ft =>
    allPrices.find(p => p.fuel_type === ft)
  ).filter(Boolean) as typeof allPrices;

  const dateStr = lastFetched ? format(new Date(lastFetched), 'dd MMM HH:mm') : allPrices[0]?.effective_date;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Fuel price grid */}
      <div className="price-grid" style={{ padding: '8px 8px 4px' }}>
        {displayPrices.map((fp) => (
          <div className="price-item" key={fp.id ?? fp.fuel_type}>
            <div className="fuel-name">{FUEL_LABELS[fp.fuel_type as FuelType]}</div>
            <div className="fuel-price" style={{ color: FUEL_COLORS[fp.fuel_type as FuelType] }}>
              ฿{fp.price_thb.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ margin: '4px 8px', borderTop: '1px dashed rgba(0,0,0,0.08)' }} />

      {/* Crude oil section */}
      <div style={{ padding: '4px 0 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 16px 6px' }}>
          🌍 Global Oil Market
        </div>
        <CrudeOilCard />
      </div>
    </div>
  );
}
