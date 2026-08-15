import { useMemo } from 'react';
import { useVehicleStore } from '../store/vehicle-store';
import { useRefuelStore } from '../store/refuel-store';
import StatCard from '../components/dashboard/StatCard';
import PriceBoard from '../components/dashboard/PriceBoard';
import CostChart from '../components/charts/CostChart';
import EfficiencyChart from '../components/charts/EfficiencyChart';
import FuelTypeChart from '../components/charts/FuelTypeChart';
import { formatTHB, formatNumber } from '../lib/utils';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function Dashboard() {
  const { vehicles } = useVehicleStore();
  const { sessions } = useRefuelStore();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthSessions = sessions.filter((s) => {
      const d = new Date(s.fueled_at);
      return d >= monthStart && d <= monthEnd;
    });

    const totalSpend = monthSessions.reduce((sum, s) => sum + s.cost_thb, 0);
    const totalLitres = monthSessions.reduce((sum, s) => sum + (s.litres ?? 0), 0);

    const efficiencies = sessions
      .filter((s) => s.efficiency_kml != null)
      .map((s) => s.efficiency_kml!);
    const avgEfficiency = efficiencies.length > 0
      ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
      : 0;

    return { totalSpend, totalLitres, avgEfficiency, vehicleCount: vehicles.length };
  }, [sessions, vehicles]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">PADDOCK TELEMETRY</div>
        <div className="page-subtitle">Trackside Fuel Performance & Analytics</div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatCard
          icon={<span>🏁</span>}
          value={formatTHB(stats.totalSpend)}
          label="PIT SPEND"
          color="orange"
        />
        <StatCard
          icon={<span>⛽</span>}
          value={`${formatNumber(stats.totalLitres, 1)}L`}
          label="FUEL CAPACITY"
          color="blue"
        />
        <StatCard
          icon={<span>⚡</span>}
          value={stats.avgEfficiency > 0 ? `${stats.avgEfficiency.toFixed(1)}` : '—'}
          label="PACE (km/L)"
          color="green"
        />
        <StatCard
          icon={<span>🏎️</span>}
          value={stats.vehicleCount.toString()}
          label="GARAGE FLEET"
          color="purple"
        />
      </div>

      {/* Price Board */}
      <div className="section">
        <PriceBoard />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CostChart />
        <EfficiencyChart />
        <FuelTypeChart />
      </div>
    </div>
  );
}
