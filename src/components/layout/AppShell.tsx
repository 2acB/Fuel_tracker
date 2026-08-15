import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import FAB from './FAB';
import RefuelForm from '../refuel/RefuelForm';
import VehicleForm from '../vehicles/VehicleForm';
import SlimeToast from '../ui/SlimeToast';
import { useUIStore } from '../../store/ui-store';

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  const { activeModal, closeModal, editingId } = useUIStore();

  return (
    <div className="app-shell">
      {/* F1 Pit-Wall Top Header */}
      <div className="pitwall-header">
        <div className="pitwall-logo">
          <span>🏎️</span> FUELTRACK <span className="pitwall-badge">F1</span>
        </div>
        <div className="pitwall-status">
          <div className="status-led" />
          <span>PIT-WALL LIVE</span>
        </div>
      </div>

      <div className="page-content">{children}</div>
      <FAB />
      <BottomNav />

      {/* Global Slime Particle Overlay */}
      <SlimeToast />

      {/* Modals */}
      {activeModal === 'refuel' && <RefuelForm onClose={closeModal} />}
      {(activeModal === 'vehicle') && (
        <VehicleForm onClose={closeModal} editId={editingId} />
      )}
    </div>
  );
}
