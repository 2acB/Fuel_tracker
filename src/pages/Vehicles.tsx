import { useVehicleStore } from '../store/vehicle-store';
import { useUIStore } from '../store/ui-store';
import VehicleCard from '../components/vehicles/VehicleCard';
import { Plus, Car } from 'lucide-react';

export default function Vehicles() {
  const { vehicles } = useVehicleStore();
  const { openModal } = useUIStore();

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Vehicles</div>
          <div className="page-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openModal('vehicle')}
          id="add-vehicle-btn"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Car size={48} strokeWidth={1.2} /></div>
          <div className="empty-title">No Vehicles Yet</div>
          <div className="empty-desc">Add your first vehicle to start tracking fuel consumption</div>
          <button className="btn btn-primary" onClick={() => openModal('vehicle')}>
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
