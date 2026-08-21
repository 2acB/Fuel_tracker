import { useVehicleStore } from '../store/vehicle-store';
import { useRefuelStore } from '../store/refuel-store';
import { useAuthStore } from '../store/auth-store';
import { Settings as SettingsIcon, Trash2, Download, Info, Mail } from 'lucide-react';

export default function Settings() {
  const { vehicles } = useVehicleStore();
  const { sessions } = useRefuelStore();
  const { user } = useAuthStore();


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
        <div className="section-title">Account & Data</div>
        
        {user && (
          <div className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} color="var(--text-main)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Signed in as</span>
              <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'No email provided'}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-secondary btn-block" onClick={handleExportData}>
            <Download size={18} /> Export Data (JSON)
          </button>
          <button 
            className="btn btn-danger btn-block" 
            onClick={async () => {
              if (confirm('Are you sure you want to sign out?')) {
                const { useAuthStore } = await import('../store/auth-store');
                useAuthStore.getState().signOut();
              }
            }}
          >
            Sign Out
          </button>
          <button className="btn btn-danger btn-block" onClick={handleClearData} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Trash2 size={18} /> Clear Local Data
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
