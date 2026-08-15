import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import History from './pages/History';
import MapView from './pages/MapView';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { Loader } from 'lucide-react';

import { useVehicleStore } from './store/vehicle-store';
import { useRefuelStore } from './store/refuel-store';

function ProtectedRoute() {
  const { session, loading } = useAuthStore();
  const fetchCloudVehicles = useVehicleStore(state => state.fetchCloudVehicles);
  const fetchCloudSessions = useRefuelStore(state => state.fetchCloudSessions);

  useEffect(() => {
    if (session) {
      fetchCloudVehicles();
      fetchCloudSessions();
    }
  }, [session, fetchCloudVehicles, fetchCloudSessions]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-base)' }}>
        <Loader size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell><Outlet /></AppShell>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/history" element={<History />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
