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

type OilSymbol = 'CL=F' | 'BZ=F';

const OIL_METADATA: Record<OilSymbol, { name: string; short: string }> = {
  'CL=F': { name: 'WTI Crude (US Oil)', short: 'US Oil' },
  'BZ=F': { name: 'Brent Crude Oil', short: 'Brent' },
};

function CrudeOilCard() {
  const [selectedSymbol, setSelectedSymbol] = useState<OilSymbol>('CL=F');
  const [crude, setCrude] = useState<CrudeData>({ price: 82.40, prev: 81.25, loading: true, error: false });

  const fetchCrude = async (symbol: OilSymbol) => {
    setCrude(c => ({ ...c, loading: true, error: false }));
    try {
      // Try local dev proxy first (/api/oil), then direct endpoint
      const urls = [
        `/api/oil/${symbol}?interval=1d&range=5d`,
        `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
      ];

      let data: any = null;
      for (const url of urls) {
        try {
          const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (res.ok) {
            const json = await res.json();
            if (json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.length) {
              data = json;
              break;
            }
          }
        } catch {
          // try next
        }
      }

      const meta = data?.chart?.result?.[0]?.meta;
      const closes: number[] = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
      const valid = closes.filter((v: number) => v != null);

      if (valid.length >= 2) {
        setCrude({
          price: valid[valid.length - 1],
          prev: valid[valid.length - 2],
          loading: false,
          error: false
        });
      } else if (valid.length === 1 && meta?.chartPreviousClose) {
        setCrude({
          price: valid[0],
          prev: meta.chartPreviousClose,
          loading: false,
          error: false
        });
      } else {
        throw new Error('No price data');
      }
    } catch {
      // Fallback with updated market rates (~$82.40 for WTI US Oil, ~$85.50 for Brent)
      const fallback = symbol === 'CL=F'
        ? { price: 82.40, prev: 81.25 }
        : { price: 85.50, prev: 84.60 };
      setCrude({ price: fallback.price, prev: fallback.prev, loading: false, error: true });
    }
  };

  useEffect(() => {
    fetchCrude(selectedSymbol);
  }, [selectedSymbol]);

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
      }}
    >
      {/* Symbol toggle selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🌍 Global Oil Market
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.06)', padding: 2, borderRadius: 6 }}>
          {(Object.keys(OIL_METADATA) as OilSymbol[]).map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              style={{
                border: 'none',
                background: selectedSymbol === sym ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: selectedSymbol === sym ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: selectedSymbol === sym ? 700 : 500,
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: selectedSymbol === sym ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {OIL_METADATA[sym].short}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🛢️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
            {OIL_METADATA[selectedSymbol].name}
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
    </div>
  );
}

// ── Fuel types to show (exclude premium_diesel, show it as crude section instead) ──
const DISPLAYED_FUELS: FuelType[] = ['gasohol_91', 'gasohol_95', 'gasohol_e20', 'gasohol_e85', 'diesel'];

const TYRE_COMPOUNDS: Record<string, { label: string; class: string }> = {
  gasohol_95: { label: 'SOFT', class: 'tyre-soft' },
  gasohol_91: { label: 'MEDIUM', class: 'tyre-medium' },
  diesel: { label: 'HARD', class: 'tyre-hard' },
  gasohol_e20: { label: 'INTER', class: 'tyre-medium' },
  gasohol_e85: { label: 'WET', class: 'tyre-soft' },
};

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
    <div className="card card-telemetry" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
            🏎️ TRACKSIDE FUEL MARKET
          </div>
          <div style={{ fontSize: 11, fontFamily: "'Rajdhani', sans-serif", color: 'var(--accent-cyan)', marginTop: 2, fontWeight: 600 }}>
            BANGCHAK PADDOCK FEED · {isLoading ? 'RECEIVING TELEMETRY...' : `UPDATED ${dateStr}`}
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
        {displayPrices.map((fp) => {
          const tyre = TYRE_COMPOUNDS[fp.fuel_type];
          return (
            <div className="price-item" key={fp.id ?? fp.fuel_type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="fuel-name">{FUEL_LABELS[fp.fuel_type as FuelType]}</div>
                {tyre && <span className={`tyre-badge ${tyre.class}`}>{tyre.label}</span>}
              </div>
              <div className="fuel-price" style={{ color: FUEL_COLORS[fp.fuel_type as FuelType] }}>
                ฿{fp.price_thb.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ margin: '4px 8px', borderTop: '1px dashed rgba(0,0,0,0.08)' }} />

      {/* Crude oil section */}
      <div style={{ padding: '4px 0 4px' }}>
        <CrudeOilCard />
      </div>
    </div>
  );
}
