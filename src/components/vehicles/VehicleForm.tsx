import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useVehicleStore } from '../../store/vehicle-store';
import type { FuelType } from '../../types';
import { FUEL_LABELS } from '../../types';

import { soundFx } from '../../lib/sound';

interface Props {
  onClose: () => void;
  editId?: string | null;
}

const EMOJIS = ['🚗', '🚙', '🏎️', '🛻', '🚐', '🏍️', '🛵', '🚕'];

export default function VehicleForm({ onClose, editId }: Props) {
  const { vehicles, addVehicle, updateVehicle } = useVehicleStore();
  const editing = editId ? vehicles.find((v) => v.id === editId) : null;

  const [name, setName] = useState(editing?.name ?? '');
  const [make, setMake] = useState(editing?.make ?? '');
  const [model, setModel] = useState(editing?.model ?? '');
  const [year, setYear] = useState(editing?.year?.toString() ?? '');
  const [licensePlate, setLicensePlate] = useState(editing?.license_plate ?? '');
  const [fuelType, setFuelType] = useState<FuelType>(editing?.fuel_type ?? 'gasohol_95');
  const [tankCapacity, setTankCapacity] = useState(editing?.tank_capacity_litres?.toString() ?? '');
  const [emoji, setEmoji] = useState(editing?.avatar_emoji ?? '🚗');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = () => {
    if (!name.trim() || !make.trim() || !model.trim()) return;
    const data = {
      name: name.trim(),
      make: make.trim(),
      model: model.trim(),
      year: year ? parseInt(year) : undefined,
      license_plate: licensePlate.trim() || undefined,
      fuel_type: fuelType,
      tank_capacity_litres: tankCapacity ? parseFloat(tankCapacity) : undefined,
      avatar_emoji: emoji,
    };

    if (editing) {
      updateVehicle(editing.id, data);
    } else {
      addVehicle(data as any);
    }

    soundFx.playEngineSound();
    onClose();
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="sheet-title">{editing ? 'Edit Vehicle' : 'Add Vehicle'}</span>
          <button className="btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="sheet-body">
          {/* Emoji Selector */}
          <div className="form-group">
            <label className="form-label">Avatar</label>
            <div className="pill-group">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  className={`pill ${emoji === e ? 'active' : ''}`}
                  onClick={() => setEmoji(e)}
                  style={{ fontSize: 20, padding: '6px 12px' }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Vehicle Name *</label>
            <input
              className="form-input"
              placeholder="e.g. My Honda Civic"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Make & Model */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Make *</label>
              <input
                className="form-input"
                placeholder="Honda"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                className="form-input"
                placeholder="Civic"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>

          {/* Year & Plate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                className="form-input"
                type="number"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">License Plate</label>
              <input
                className="form-input"
                placeholder="กข 1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
          </div>

          {/* Fuel Type */}
          <div className="form-group">
            <label className="form-label">Default Fuel Type *</label>
            <div className="pill-group">
              {(Object.keys(FUEL_LABELS) as FuelType[]).map((ft) => (
                <button
                  key={ft}
                  className={`pill ${fuelType === ft ? 'active' : ''}`}
                  onClick={() => setFuelType(ft)}
                >
                  {FUEL_LABELS[ft]}
                </button>
              ))}
            </div>
          </div>

          {/* Tank Capacity */}
          <div className="form-group">
            <label className="form-label">Tank Capacity (L)</label>
            <input
              className="form-input"
              type="number"
              placeholder="45"
              value={tankCapacity}
              onChange={(e) => setTankCapacity(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button className="btn btn-primary btn-block" onClick={handleSubmit} id="save-vehicle-btn">
            {editing ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </>
  );
}
