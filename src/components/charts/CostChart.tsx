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
      month: format(monthDate, 'MMM').toUpperCase(),
      cost: Math.round(total),
    };
  });

  if (sessions.length === 0) {
    return (
      <div className="chart-container card-telemetry">
        <div className="chart-title" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: '0.05em', color: '#fff' }}>
          🏁 PIT SPEND ANALYSIS (THB)
        </div>
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-desc" style={{ fontFamily: "'Rajdhani', sans-serif" }}>No telemetry logs. Complete a pit stop to render cost trends.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container card-telemetry" style={{ position: 'relative' }}>
      <div className="chart-title" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: '0.05em', color: '#fff', marginBottom: 16 }}>
        🏁 PIT SPEND ANALYSIS (THB)
      </div>

      {/* 🏁 Checkered Finish Line */}
      <div style={{
        position: 'absolute',
        right: '25px',
        top: '40px',
        bottom: '25px',
        width: '8px',
        background: `
          linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), 
          linear-gradient(45deg, #111 25%, #fff 25%, #fff 75%, #111 75%, #111)`,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 4px 4px',
        borderLeft: '2px solid #e10600',
        opacity: 0.7,
        pointerEvents: 'none',
        zIndex: 5
      }} />
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="f1BarGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#660000" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#e10600" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          
          <XAxis 
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: "'Orbitron', monospace" }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
          />
          
          <YAxis 
            dataKey="month" 
            type="category"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: "'Orbitron', monospace" }} 
            axisLine={{ stroke: '#262933' }} 
            tickLine={false} 
          />
          
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            contentStyle={{
              background: '#0d0e12',
              border: '1px solid #e10600',
              borderRadius: '4px',
              color: '#ffffff',
              fontFamily: "'Orbitron', monospace",
              boxShadow: '0 0 15px rgba(225,6,0,0.4)',
              fontSize: '12px'
            }}
            formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'TOTAL SPEND']}
          />
          
          {/* 🏎️ Racing F1 Car Bars */}
          <Bar 
            dataKey="cost" 
            fill="url(#f1BarGradient)" 
            radius={[0, 4, 4, 0]} 
            barSize={16}
            label={(props: any) => {
              const { x, y, width, height, value } = props;
              if (value === 0) return null;
              
              return (
                <g>
                  {/* The Value Number (Inside the bar, aligned right) */}
                  {width > 40 && (
                    <text 
                      x={x + width - 8} 
                      y={y + height / 2 + 3} 
                      fill="#ffffff" 
                      fontSize="10"
                      fontFamily="'Orbitron', monospace"
                      textAnchor="end"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      ฿{value.toLocaleString()}
                    </text>
                  )}
                  {/* The F1 Car Emoji (At the tip) */}
                  <text 
                    x={x + width + 5} 
                    y={y + height / 2 + 5} 
                    fill="#fff" 
                    fontSize="16"
                    style={{ textShadow: '0 0 8px rgba(225,6,0,0.8)' }}
                  >
                    🏎️
                  </text>
                </g>
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
