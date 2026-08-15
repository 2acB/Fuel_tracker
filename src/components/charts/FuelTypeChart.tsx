import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRefuelStore } from '../../store/refuel-store';
import { STATION_LABELS } from '../../types';
import type { StationBrand } from '../../types';

const STATION_COLORS: Record<string, string> = {
  ptt: '#0ea5e9',       // PTT Blue
  bangchak: '#22c55e',  // Bangchak Green
  shell: '#eab308',     // Shell Yellow
  caltex: '#ef4444',    // Caltex Red
  esso: '#dc2626',      // Esso Dark Red
  susco: '#facc15',     // Susco Yellow
  other: '#a855f7',     // Purple
  unknown: '#64748b'    // Slate
};

// 🏎️ Realistic F1 Center-Lock Racing Wheel Rim (SVG Overlay)
function F1WheelCenter() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100px',
      height: '100px',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="rimMetallic" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c303e" />
            <stop offset="70%" stopColor="#191b24" />
            <stop offset="100%" stopColor="#0d0e14" />
          </radialGradient>
          <radialGradient id="brakeDisc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1c24" />
            <stop offset="85%" stopColor="#111218" />
            <stop offset="100%" stopColor="#08080c" />
          </radialGradient>
          <radialGradient id="centerNut" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff3333" />
            <stop offset="70%" stopColor="#cc0000" />
            <stop offset="100%" stopColor="#880000" />
          </radialGradient>
        </defs>

        {/* Outer Wheel Rim Lip */}
        <circle cx="50" cy="50" r="49" fill="none" stroke="#2a2e3d" strokeWidth="2" />
        <circle cx="50" cy="50" r="47" fill="url(#rimMetallic)" stroke="#12141c" strokeWidth="1" />

        {/* Carbon Brake Disc behind spokes */}
        <circle cx="50" cy="50" r="38" fill="url(#brakeDisc)" stroke="#222533" strokeWidth="1" strokeDasharray="2 2" />
        {/* Brake Disc Ventilation Holes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 32 * Math.cos(rad);
          const y = 50 + 32 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="1.2" fill="#000" opacity="0.8" />;
        })}

        {/* Brembo F1 Red Brake Caliper */}
        <path
          d="M 68 28 A 38 38 0 0 1 82 50 L 73 48 A 28 28 0 0 0 62 31 Z"
          fill="#e10600"
          stroke="#990000"
          strokeWidth="0.5"
        />

        {/* 5 Double-Spokes (BBS F1 Forged Magnesium Rim) */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 50 50)`}>
            <path d="M 48.5 50 L 46 12 L 49 12 L 49.5 50 Z" fill="#3a3f52" />
            <path d="M 50.5 50 L 51 12 L 54 12 L 51.5 50 Z" fill="#2a2e3d" />
            <line x1="47.5" y1="14" x2="49" y2="45" stroke="#505770" strokeWidth="0.8" />
            <line x1="52.5" y1="14" x2="51" y2="45" stroke="#505770" strokeWidth="0.8" />
          </g>
        ))}

        {/* Inner Hub Circle */}
        <circle cx="50" cy="50" r="14" fill="#12141c" stroke="#3a3f52" strokeWidth="1.5" />

        {/* F1 Anodized Center Lock Nut (Red Hexagon) */}
        <polygon
          points="50,38 59,43 59,57 50,62 41,57 41,43"
          fill="url(#centerNut)"
          stroke="#ff6666"
          strokeWidth="0.8"
        />
        <circle cx="50" cy="50" r="4" fill="#000" opacity="0.6" />
        <circle cx="50" cy="50" r="2" fill="#ffb800" />
      </svg>
    </div>
  );
}

export default function FuelTypeChart() {
  const { sessions } = useRefuelStore();

  // Group by Gas Station Brand
  const grouped: Record<string, number> = {};
  sessions.forEach((s) => {
    const stationId = s.station_brand || 'unknown';
    grouped[stationId] = (grouped[stationId] || 0) + s.cost_thb;
  });

  const data = Object.entries(grouped).map(([key]) => ({
    name: key === 'unknown' ? 'Unknown Station' : STATION_LABELS[key as StationBrand],
    value: Math.round(grouped[key]),
    color: STATION_COLORS[key] || STATION_COLORS.unknown,
  }));

  if (data.length === 0) {
    return (
      <div className="chart-container card-telemetry">
        <div className="chart-title" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: '0.05em', color: '#fff' }}>
          ⛽ STATION BRAND LOYALTY
        </div>
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-desc" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Log refuels to render station brand distribution</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container card-telemetry">
      <div className="chart-title" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: '0.05em', color: '#fff', marginBottom: 16 }}>
        ⛽ STATION BRAND LOYALTY
      </div>
      
      <div style={{ position: 'relative', width: '100%', height: '210px' }}>
        {/* Real F1 Center-Lock Wheel Rim Overlay */}
        <F1WheelCenter />

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              dataKey="value"
              paddingAngle={3}
              stroke="#0d0e14"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0d0e12',
                border: '1px solid #00e5ff',
                borderRadius: '4px',
                color: '#ffffff',
                fontFamily: "'Orbitron', monospace",
                boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)',
                fontSize: '12px'
              }}
              formatter={(val: any) => [`฿${Number(val).toLocaleString()}`, 'TOTAL SPEND']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Brand Custom Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
