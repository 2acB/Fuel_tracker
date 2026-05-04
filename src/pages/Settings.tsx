import { useVehicleStore } from '../store/vehicle-store';
import { useRefuelStore } from '../store/refuel-store';
import { Settings as SettingsIcon, Trash2, Download, Info } from 'lucide-react';

export default function Settings() {
  const { vehicles } = useVehicleStore();
  const { sessions } = useRefuelStore();

  const handleExportData = () => {
    const data = { vehicles, sessions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fueltrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete ALL your data permanently.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">App preferences</div>
      </div>

      {/* App Info */}
      <div className="section">
        <div className="section-title">App Info</div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>⛽</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>FuelTrack</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>v1.0.0 · Thailand Fuel Tracker</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>Vehicles</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18 }}>{vehicles.length}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>Refuels</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18 }}>{sessions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="section">
        <div className="section-title">Data</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-secondary btn-block" onClick={handleExportData}>
            <Download size={18} /> Export Data (JSON)
          </button>
          <button className="btn btn-danger btn-block" onClick={handleClearData}>
            <Trash2 size={18} /> Clear All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="section">
        <div className="section-title">About</div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <Info size={14} style={{ display: 'inline', marginRight: 4 }} />
            FuelTrack helps you track fuel consumption for your vehicles in Thailand.
            All data is stored locally on your device. Connect Supabase for cloud sync.
          </div>
        </div>
      </div>
    </div>
  );
}
