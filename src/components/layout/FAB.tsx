import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUIStore } from '../../store/ui-store';
import { useSlimeStore } from '../../store/slime-store';

// tooltip: 'left' | 'right' | 'above' to control label placement
const FAB_ITEMS = [
  { icon: '⛽', label: 'Refuel', action: 'refuel' as const, bg: '#f97316', y: -80, x: 60, tooltip: 'right' as const, emojis: ['⛽','🫧','💧','⛽'] },
  { icon: '🔧', label: 'Service', action: 'service' as const, bg: '#3b82f6', y: -20, x: 100, tooltip: 'right' as const, emojis: ['🔧','✨','⚙️'] },
  { icon: '💰', label: 'Expense', action: 'expense' as const, bg: '#10b981', y: -20, x: -100, tooltip: 'left' as const, emojis: ['💰','💸','🎉'] },
  { icon: '⏰', label: 'Reminder', action: 'reminder' as const, bg: '#a855f7', y: -80, x: -60, tooltip: 'left' as const, emojis: ['⏰','🔔','✨'] },
];

export default function FAB() {
  const { fabOpen, toggleFab, closeFab, openModal } = useUIStore();
  const { triggerSlime } = useSlimeStore();
  const [jiggling, setJiggling] = useState(false);

  const handleToggle = () => {
    if (!fabOpen) {
      setJiggling(true);
      setTimeout(() => setJiggling(false), 400);
    }
    toggleFab();
  };

  const handleItem = (item: typeof FAB_ITEMS[0], e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    triggerSlime(rect.left + rect.width / 2, rect.top + rect.height / 2, item.emojis);
    setTimeout(() => openModal(item.action), 100);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fab-overlay ${fabOpen ? 'visible' : ''}`}
        onClick={closeFab}
      />

      {/* FAB Container */}
      <div className="fab-container">
        {/* Radial Menu Items */}
        {FAB_ITEMS.map((item, i) => (
          <button
            key={item.action}
            className={`fab-menu-item ${fabOpen ? 'visible' : ''}`}
            style={{
              background: item.bg,
              transform: fabOpen
                ? `translate(${item.x}px, ${item.y}px) scale(1)`
                : 'translate(0, 0) scale(0)',
              transitionDelay: fabOpen ? `${i * 55}ms` : '0ms',
            }}
            onClick={(e) => handleItem(item, e)}
            id={`fab-${item.action}`}
          >
            <span>{item.icon}</span>
            {fabOpen && (
              <span 
                className="fab-tooltip"
                style={item.tooltip === 'right' 
                  ? { left: 'calc(100% + 8px)', right: 'auto' } 
                  : { right: 'calc(100% + 8px)', left: 'auto' }}
              >
                {item.label}
              </span>
            )}
          </button>
        ))}

        {/* Main FAB Button */}
        <button
          className={`fab-button ${fabOpen ? 'open' : ''} ${jiggling ? 'jiggle' : ''}`}
          onClick={handleToggle}
          id="fab-main"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}

