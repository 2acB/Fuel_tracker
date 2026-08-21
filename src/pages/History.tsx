import { useState } from 'react';
import { useRefuelStore } from '../store/refuel-store';
import { useVehicleStore } from '../store/vehicle-store';
import RefuelCard from '../components/refuel/RefuelCard';
import { Clock, Filter, List, Map as MapIcon } from 'lucide-react';
import MapView from './MapView';

export default function History() {
  const { sessions } = useRefuelStore();
  const { vehicles } = useVehicleStore();
  const [filterVehicleId, setFilterVehicleId] = useState<string | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filtered = sessions
    .filter((s) => !filterVehicleId || s.vehicle_id === filterVehicleId)
    .sort((a, b) => new Date(b.fueled_at).getTime() - new Date(a.fueled_at).getTime());

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">History</div>
          <div className="page-subtitle">{filtered.length} refuel session{filtered.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 }}>
          <button
            className="btn-ghost"
            style={{ 
              padding: '6px 12px', 
              background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              borderRadius: 6,
              color: viewMode === 'list' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
          <button
            className="btn-ghost"
            style={{ 
              padding: '6px 12px', 
              background: viewMode === 'map' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              borderRadius: 6,
              color: viewMode === 'map' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={16} />
          </button>
        </div>
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

      {viewMode === 'map' ? (
        <MapView hideHeader filterVehicleId={filterVehicleId || undefined} />
      ) : filtered.length === 0 ? (
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
