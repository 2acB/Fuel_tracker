import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRefuelStore } from '../../store/refuel-store';
import { useVehicleStore } from '../../store/vehicle-store';
import { format } from 'date-fns';

export default function EfficiencyChart() {
  const { sessions } = useRefuelStore();
  const { activeVehicleId } = useVehicleStore();

  const filtered = sessions
    .filter((s) => (!activeVehicleId || s.vehicle_id === activeVehicleId) && s.efficiency_kml != null)
    .sort((a, b) => new Date(a.fueled_at).getTime() - new Date(b.fueled_at).getTime())
    .slice(-10);

  const data = filtered.map((s) => ({
    date: format(new Date(s.fueled_at), 'dd/MM'),
    kml: s.efficiency_kml,
  }));

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">📈 Efficiency Trend (km/L)</div>
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-desc">Need 2+ full tank refuels to show efficiency</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-title">📈 Efficiency Trend (km/L)</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f9fafb',
              fontFamily: "'DM Mono', monospace",
            }}
            formatter={(val: any) => [`${val} km/L`, 'Efficiency']}
          />
          <Line
            type="monotone"
            dataKey="kml"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
