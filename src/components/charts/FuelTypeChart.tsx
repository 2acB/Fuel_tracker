import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRefuelStore } from '../../store/refuel-store';
import { FUEL_LABELS, FUEL_COLORS } from '../../types';
import type { FuelType } from '../../types';

export default function FuelTypeChart() {
  const { sessions } = useRefuelStore();

  // Group by fuel type
  const grouped: Record<string, number> = {};
  sessions.forEach((s) => {
    grouped[s.fuel_type] = (grouped[s.fuel_type] || 0) + s.cost_thb;
  });

  const data = Object.entries(grouped).map(([key, value]) => ({
    name: FUEL_LABELS[key as FuelType] ?? key,
    value: Math.round(value),
    color: FUEL_COLORS[key as FuelType] ?? '#6b7280',
  }));

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">🛢️ Spending by Fuel Type</div>
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-desc">Log refuels to see fuel type breakdown</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-title">🛢️ Spending by Fuel Type</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f9fafb',
              fontFamily: "'DM Mono', monospace",
            }}
            formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'Cost']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
