import { useState } from 'react';
import { useRefuelStore } from '../store/refuel-store';
import { useVehicleStore } from '../store/vehicle-store';
import RefuelCard from '../components/refuel/RefuelCard';
import { Clock, Filter } from 'lucide-react';

export default function History() {
  const { sessions } = useRefuelStore();
  const { vehicles } = useVehicleStore();
  const [filterVehicleId, setFilterVehicleId] = useState<string | ''>('');

  const filtered = sessions
    .filter((s) => !filterVehicleId || s.vehicle_id === filterVehicleId)
    .sort((a, b) => new Date(b.fueled_at).getTime() - new Date(a.fueled_at).getTime());

  return (
    <div>
      <div className="page-header">
        <div className="page-title">History</div>
        <div className="page-subtitle">{filtered.length} refuel session{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Vehicle Filter */}
      {vehicles.length > 1 && (
        <div className="form-group" style={{ marginBottom: 16 }}>
          <div className="pill-group">
            <button
              className={`pill ${filterVehicleId === '' ? 'active' : ''}`}
              onClick={() => setFilterVehicleId('')}
            >
              <Filter size={12} style={{ marginRight: 4 }} />
              All
            </button>
            {vehicles.map((v) => (
              <button
                key={v.id}
                className={`pill ${filterVehicleId === v.id ? 'active' : ''}`}
                onClick={() => setFilterVehicleId(filterVehicleId === v.id ? '' : v.id)}
              >
                {v.avatar_emoji} {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Clock size={48} strokeWidth={1.2} /></div>
          <div className="empty-title">No Refuels Yet</div>
          <div className="empty-desc">Tap the + button to log your first refueling session</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((s) => (
            <RefuelCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
