import type { RefuelSession } from '../../types';
import { FUEL_LABELS, STATION_LABELS } from '../../types';
import { formatTHB, formatDate } from '../../lib/utils';
import { Droplets, Gauge, MapPin, Fuel } from 'lucide-react';
import { useVehicleStore } from '../../store/vehicle-store';
import { useRefuelStore } from '../../store/refuel-store';
import { Trash2 } from 'lucide-react';

interface Props {
  session: RefuelSession;
}

export default function RefuelCard({ session }: Props) {
  const { vehicles } = useVehicleStore();
  const { deleteSession } = useRefuelStore();
  const vehicle = vehicles.find((v) => v.id === session.vehicle_id);

  return (
    <div className="refuel-card" id={`refuel-${session.id}`}>
      <div className="refuel-card-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20 }}>{vehicle?.avatar_emoji ?? '⛽'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {vehicle?.name ?? 'Unknown Vehicle'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {formatDate(session.fueled_at)}
              {session.station_brand && ` · ${STATION_LABELS[session.station_brand] ?? session.station_brand}`}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 16, color: 'var(--accent)' }}>
              {formatTHB(session.cost_thb)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {FUEL_LABELS[session.fuel_type]}
            </div>
          </div>
          <button
            className="btn-ghost"
            onClick={() => { if (confirm('Delete this refuel?')) deleteSession(session.id); }}
            style={{ padding: 4, color: 'var(--text-muted)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="refuel-meta">
        {session.litres != null && (
          <div className="refuel-meta-item">
            <Droplets size={13} />
            {session.litres.toFixed(1)}L
          </div>
        )}
        <div className="refuel-meta-item">
          <Gauge size={13} />
          {session.odometer_km.toLocaleString()} km
        </div>
        {session.efficiency_kml != null && (
          <div className="refuel-meta-item" style={{ color: 'var(--success)' }}>
            <Fuel size={13} />
            {session.efficiency_kml} km/L
          </div>
        )}
        {session.lat != null && (
          <div className="refuel-meta-item">
            <MapPin size={13} />
            GPS
          </div>
        )}
      </div>
    </div>
  );
}
