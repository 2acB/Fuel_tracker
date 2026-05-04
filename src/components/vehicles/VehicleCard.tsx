import { FUEL_LABELS } from '../../types';
import type { Vehicle } from '../../types';
import { Pencil, Trash2 } from 'lucide-react';
import { useVehicleStore } from '../../store/vehicle-store';
import { useUIStore } from '../../store/ui-store';

interface Props {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: Props) {
  const { activeVehicleId, setActiveVehicle, deleteVehicle } = useVehicleStore();
  const { openModal } = useUIStore();
  const isActive = activeVehicleId === vehicle.id;

  return (
    <div
      className={`vehicle-card ${isActive ? 'active' : ''}`}
      onClick={() => setActiveVehicle(vehicle.id)}
      id={`vehicle-${vehicle.id}`}
    >
      <div className="vehicle-emoji">{vehicle.avatar_emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{vehicle.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {vehicle.make} {vehicle.model} {vehicle.year && `· ${vehicle.year}`}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <span className="pill active" style={{ padding: '3px 10px', fontSize: 11 }}>
            {FUEL_LABELS[vehicle.fuel_type]}
          </span>
          {vehicle.license_plate && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              {vehicle.license_plate}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            openModal('vehicle', vehicle.id);
          }}
          style={{ padding: 6 }}
        >
          <Pencil size={16} />
        </button>
        <button
          className="btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this vehicle?')) deleteVehicle(vehicle.id);
          }}
          style={{ padding: 6, color: 'var(--danger)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
