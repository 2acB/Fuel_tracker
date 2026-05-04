import type { FuelType } from '../../types';
import { FUEL_LABELS, FUEL_COLORS } from '../../types';

interface Props {
  value: FuelType;
  onChange: (ft: FuelType) => void;
}

export default function FuelTypeSelector({ value, onChange }: Props) {
  return (
    <div className="pill-group">
      {(Object.keys(FUEL_LABELS) as FuelType[]).map((ft) => (
        <button
          key={ft}
          className={`pill ${value === ft ? 'active' : ''}`}
          onClick={() => onChange(ft)}
          style={
            value === ft
              ? { borderColor: FUEL_COLORS[ft], color: FUEL_COLORS[ft], background: `${FUEL_COLORS[ft]}15` }
              : {}
          }
        >
          {FUEL_LABELS[ft]}
        </button>
      ))}
    </div>
  );
}
