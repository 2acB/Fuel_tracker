import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Loader } from 'lucide-react';
import { useVehicleStore } from '../../store/vehicle-store';
import { useRefuelStore } from '../../store/refuel-store';
import { usePriceStore } from '../../store/price-store';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSlimeStore } from '../../store/slime-store';
import { getLatestPrice } from '../../lib/fuel-prices';
import { calculateLitres } from '../../lib/calculations';
import type { FuelType, StationBrand } from '../../types';
import { STATION_LABELS, FUEL_LABELS } from '../../types';

import { soundFx } from '../../lib/sound';
import Select from '../ui/Select';
interface Props {
  onClose: () => void;
}

export default function RefuelForm({ onClose }: Props) {
  const { vehicles, activeVehicleId } = useVehicleStore();
  const { addSession, getLastSession } = useRefuelStore();
  const { triggerSlime } = useSlimeStore();
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const { prices } = usePriceStore();
  const geo = useGeolocation();

  const [vehicleId, setVehicleId] = useState(activeVehicleId ?? vehicles[0]?.id ?? '');
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const [fueledAt, setFueledAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [odometer, setOdometer] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>(
    selectedVehicle?.fuel_type ?? 'gasohol_95'
  );
  const [stationBrand, setStationBrand] = useState<StationBrand | ''>('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [cost, setCost] = useState('');
  const [pricePerLitre, setPricePerLitre] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill price when fuel type or station changes
  useEffect(() => {
    const price = getLatestPrice(fuelType, prices, stationBrand || undefined);
    if (price) setPricePerLitre(price.toString());
  }, [fuelType, stationBrand, prices]);

  // Auto-fill fuel type when vehicle changes
  useEffect(() => {
    const v = vehicles.find((x) => x.id === vehicleId);
    if (v) setFuelType(v.fuel_type);
  }, [vehicleId, vehicles]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Calculate litres
  const costNum = parseFloat(cost) || 0;
  const pplNum = parseFloat(pricePerLitre) || 0;
  const litres = calculateLitres(costNum, pplNum);

  const lastSession = vehicleId ? getLastSession(vehicleId) : undefined;

  const handleSubmit = () => {
    if (!vehicleId) {
      alert("Please add a vehicle first!");
      return;
    }
    if (!odometer) {
      alert("Please enter your current odometer reading.");
      return;
    }
    if (!cost) {
      alert("Please enter the total cost.");
      return;
    }
    const odoNum = parseFloat(odometer);

    // Validate odometer
    if (lastSession && odoNum <= lastSession.odometer_km) {
      alert(`Odometer must be greater than last entry (${lastSession.odometer_km.toLocaleString()} km)`);
      return;
    }

    addSession({
      vehicle_id: vehicleId,
      fueled_at: new Date(fueledAt).toISOString(),
      odometer_km: odoNum,
      fuel_type: fuelType,
      litres: litres > 0 ? litres : undefined,
      cost_thb: costNum,
      price_per_litre_thb: pplNum > 0 ? pplNum : undefined,
      is_full_tank: isFullTank,
      station_brand: stationBrand || undefined,
      lat: geo.coords?.lat,
      lng: geo.coords?.lng,
      notes: notes.trim() || undefined,
    });

    // 🏎️ Play F1 Pit Stop sound FX
    soundFx.playPitStopSound();

    // 🎉 Slime burst from save button
    if (saveBtnRef.current) {
      const rect = saveBtnRef.current.getBoundingClientRect();
      triggerSlime(rect.left + rect.width / 2, rect.top + rect.height / 2,
        ['⛽', '🫧', '💧', '✅', '🎉', '⛽', '💧']);
    }
    setTimeout(onClose, 350);
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="sheet-title">🏎️ PIT STOP LOG CONSOLE</span>
          <button className="btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="sheet-body">
          {/* Vehicle Selector */}
          {vehicles.length > 1 && (
            <div className="form-group">
              <label className="form-label">Vehicle</label>
              <Select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.avatar_emoji} {v.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Date & Time */}
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input
              className="form-input"
              type="datetime-local"
              value={fueledAt}
              onChange={(e) => setFueledAt(e.target.value)}
            />
          </div>

          {/* Odometer */}
          <div className="form-group">
            <label className="form-label">
              Odometer (km)
              {lastSession && (
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  {' '}· last: {lastSession.odometer_km.toLocaleString()} km
                </span>
              )}
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 50000"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>

          {/* Fuel Type */}
          <div className="form-group">
            <label className="form-label">Fuel Type</label>
            <Select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
            >
              {(Object.keys(FUEL_LABELS) as FuelType[]).map((ft) => (
                <option key={ft} value={ft}>
                  {FUEL_LABELS[ft]}
                </option>
              ))}
            </Select>
          </div>

          {/* Station Brand */}
          <div className="form-group">
            <label className="form-label">Station Brand</label>
            <Select
              value={stationBrand}
              onChange={(e) => setStationBrand(e.target.value as StationBrand | '')}
            >
              <option value="">Select a brand (optional)</option>
              {(Object.keys(STATION_LABELS) as StationBrand[]).map((sb) => (
                <option key={sb} value={sb}>
                  {STATION_LABELS[sb]}
                </option>
              ))}
            </Select>
          </div>

          {/* Full Tank Toggle */}
          <div className="form-group">
            <div className="toggle-wrapper">
              <label className="form-label" style={{ marginBottom: 0 }}>Full Tank</label>
              <button
                className={`toggle ${isFullTank ? 'on' : ''}`}
                onClick={() => setIsFullTank(!isFullTank)}
                type="button"
              />
            </div>
          </div>

          {/* Cost (Primary Input) */}
          <div className="form-group">
            <label className="form-label">Cost (THB)</label>
            <input
              className="form-input form-input-large"
              type="number"
              placeholder="฿ 0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              id="refuel-cost-input"
            />
          </div>

          {/* Price per Litre */}
          <div className="form-group">
            <label className="form-label">Price / Litre (THB/L) — auto-filled</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={pricePerLitre}
              onChange={(e) => setPricePerLitre(e.target.value)}
            />
          </div>

          {/* Litres (Auto Calculated) */}
          {litres > 0 && (
            <div className="form-group">
              <label className="form-label">Litres (calculated)</label>
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 12,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--success)',
                }}
              >
                {litres.toFixed(2)} L
              </div>
            </div>
          )}

          {/* GPS Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            {geo.coords ? (
              <div style={{ padding: '10px 14px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: 12, fontSize: 13, color: 'var(--accent-blue)', fontFamily: "'DM Mono', monospace" }}>
                📍 {geo.coords.lat.toFixed(5)}, {geo.coords.lng.toFixed(5)}
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={geo.getLocation}
                disabled={geo.loading}
                type="button"
              >
                {geo.loading ? <Loader size={16} className="animate-spin" /> : <MapPin size={16} />}
                {geo.loading ? 'Getting location...' : 'Use My Location'}
              </button>
            )}
            {geo.error && (
              <div style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>{geo.error}</div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          {/* Submit */}
          <button
            ref={saveBtnRef}
            className="btn btn-primary btn-block"
            onClick={handleSubmit}
            style={{ marginTop: 8 }}
            id="save-refuel-btn"
          >
            CONFIRM PIT STOP
          </button>
        </div>
      </div>
    </>
  );
}
