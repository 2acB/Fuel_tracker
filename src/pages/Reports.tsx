import { useMemo, useState } from 'react';
import { useRefuelStore } from '../store/refuel-store';
import { useVehicleStore } from '../store/vehicle-store';
import { formatTHB, formatNumber } from '../lib/utils';
import { calculateCostPerKm } from '../lib/calculations';
import CostChart from '../components/charts/CostChart';
import EfficiencyChart from '../components/charts/EfficiencyChart';
import FuelTypeChart from '../components/charts/FuelTypeChart';
import { BarChart3, Filter } from 'lucide-react';
import { STATION_LABELS } from '../types';
import type { StationBrand } from '../types';

export default function Reports() {
  const { sessions } = useRefuelStore();
  const { vehicles } = useVehicleStore();
  const [filterVehicleId, setFilterVehicleId] = useState('');

  const filtered = useMemo(
    () => sessions.filter((s) => !filterVehicleId || s.vehicle_id === filterVehicleId),
    [sessions, filterVehicleId]
  );

  const stats = useMemo(() => {
    const totalCost = filtered.reduce((sum, s) => sum + s.cost_thb, 0);
    const totalLitres = filtered.reduce((sum, s) => sum + (s.litres ?? 0), 0);
    const vehicleGroups: Record<string, number[]> = {};
    filtered.forEach((s) => {
      if (!vehicleGroups[s.vehicle_id]) vehicleGroups[s.vehicle_id] = [];
      vehicleGroups[s.vehicle_id].push(s.odometer_km);
    });
    let totalDistance = 0;
    Object.values(vehicleGroups).forEach((odos) => {
      if (odos.length >= 2) {
        const sorted = [...odos].sort((a, b) => a - b);
        totalDistance += sorted[sorted.length - 1] - sorted[0];
      }
    });
    const avgCostPerKm = calculateCostPerKm(totalCost, totalDistance);
    const effs = filtered.filter((s) => s.efficiency_kml != null).map((s) => s.efficiency_kml!);
    const avgEff = effs.length > 0 ? effs.reduce((a, b) => a + b, 0) / effs.length : 0;

    const perVehicle = vehicles.map((v) => {
      const vs = filtered.filter((s) => s.vehicle_id === v.id);
      const cost = vs.reduce((sum, s) => sum + s.cost_thb, 0);
      const litres = vs.reduce((sum, s) => sum + (s.litres ?? 0), 0);
      const ve = vs.filter((s) => s.efficiency_kml != null).map((s) => s.efficiency_kml!);
      const avgE = ve.length > 0 ? ve.reduce((a, b) => a + b, 0) / ve.length : 0;
      return { ...v, cost, litres, avgE, count: vs.length };
    }).filter((v) => v.count > 0);

    const stationCounts: Record<string, number> = {};
    filtered.forEach((s) => { if (s.station_brand) stationCounts[s.station_brand] = (stationCounts[s.station_brand] || 0) + 1; });
    const topStations = Object.entries(stationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalCost, totalLitres, totalDistance, avgCostPerKm, avgEff, perVehicle, topStations };
  }, [filtered, vehicles]);

  if (sessions.length === 0) {
    return (
      <div>
        <div className="page-header"><div className="page-title">Reports</div><div className="page-subtitle">Analytics</div></div>
        <div className="empty-state">
          <div className="empty-icon"><BarChart3 size={48} strokeWidth={1.2} /></div>
          <div className="empty-title">No Data Yet</div>
          <div className="empty-desc">Start logging refuels to see reports</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><div className="page-title">Reports</div><div className="page-subtitle">Analytics</div></div>

      {vehicles.length > 1 && (
        <div className="pill-group" style={{ marginBottom: 16 }}>
          <button className={`pill ${!filterVehicleId ? 'active' : ''}`} onClick={() => setFilterVehicleId('')}>
            <Filter size={12} /> All
          </button>
          {vehicles.map((v) => (
            <button key={v.id} className={`pill ${filterVehicleId === v.id ? 'active' : ''}`} onClick={() => setFilterVehicleId(filterVehicleId === v.id ? '' : v.id)}>
              {v.avatar_emoji} {v.name}
            </button>
          ))}
        </div>
      )}

      <div className="section">
        <div className="section-title">📊 Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="stat-card orange"><div className="stat-label">Total Cost</div><div className="stat-value">{formatTHB(stats.totalCost)}</div></div>
          <div className="stat-card blue"><div className="stat-label">Total Litres</div><div className="stat-value">{formatNumber(stats.totalLitres, 1)}L</div></div>
          <div className="stat-card green"><div className="stat-label">Distance</div><div className="stat-value">{formatNumber(stats.totalDistance)} km</div></div>
          <div className="stat-card purple"><div className="stat-label">Avg Cost/km</div><div className="stat-value">฿{stats.avgCostPerKm}</div></div>
        </div>
      </div>

      {stats.perVehicle.length > 0 && (
        <div className="section">
          <div className="section-title">🚗 Per Vehicle</div>
          <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Vehicle', 'Cost', 'Litres', 'km/L'].map((h) => (
                    <th key={h} style={{ padding: '10px 8px', textAlign: h === 'Vehicle' ? 'left' : 'right', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.perVehicle.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 8px' }}>{v.avatar_emoji} {v.name}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: "'DM Mono',monospace", color: 'var(--accent)' }}>{formatTHB(v.cost)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: "'DM Mono',monospace" }}>{v.litres.toFixed(1)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: "'DM Mono',monospace", color: 'var(--success)' }}>{v.avgE > 0 ? v.avgE.toFixed(1) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.topStations.length > 0 && (
        <div className="section">
          <div className="section-title">📍 Top Stations</div>
          {stats.topStations.map(([brand, count]) => (
            <div key={brand} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', marginBottom: 8 }}>
              <span>{STATION_LABELS[brand as StationBrand] ?? brand}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--text-muted)' }}>{count} visits</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CostChart />
        <EfficiencyChart />
        <FuelTypeChart />
      </div>
    </div>
  );
}
