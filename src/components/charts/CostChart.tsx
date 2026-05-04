import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRefuelStore } from '../../store/refuel-store';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function CostChart() {
  const { sessions } = useRefuelStore();

  // Build last 6 months data
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(now, 5 - i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const monthSessions = sessions.filter((s) => {
      const d = new Date(s.fueled_at);
      return d >= start && d <= end;
    });

    const total = monthSessions.reduce((sum, s) => sum + s.cost_thb, 0);

    return {
      month: format(monthDate, 'MMM'),
      cost: Math.round(total),
    };
  });

  if (sessions.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">📊 Monthly Cost</div>
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-desc">Log some refuels to see cost trends</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-title">📊 Monthly Cost (THB)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
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
          <Bar dataKey="cost" fill="#f97316" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
