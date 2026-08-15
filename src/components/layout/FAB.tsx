import { useState } from 'react';
import { Fuel, Car, DollarSign, Clock } from 'lucide-react';
import { useUIStore } from '../../store/ui-store';
import { useSlimeStore } from '../../store/slime-store';
import { soundFx } from '../../lib/sound';

const FAB_ITEMS = [
  { icon: Clock, label: 'Race Reminder', action: 'reminder' as const, color: '#a855f7', y: -260, x: 0, dir: 'left', emojis: ['⏰','🔔','✨'] },
  { icon: Car, label: 'Garage Fleet', action: 'vehicle' as const, color: '#ffb800', y: -200, x: 0, dir: 'left', emojis: ['🏎️','✨','⚙️'] },
  { icon: DollarSign, label: 'Pit Expense', action: 'expense' as const, color: '#00e5ff', y: -140, x: 0, dir: 'left', emojis: ['💰','🏁','🎉'] },
  { icon: Fuel, label: 'Pit Stop', action: 'refuel' as const, color: '#e10600', y: -80, x: 0, dir: 'left', emojis: ['⛽','🏁','🏎️','⛽'] },
];

export default function FAB() {
  const { fabOpen, toggleFab, closeFab, openModal } = useUIStore();
  const { triggerSlime } = useSlimeStore();
  const [spinning, setSpinning] = useState(false);

  const handleToggle = () => {
    // 🏎️ Play pneumatic sound & high-speed spin animation
    soundFx.playClickSound();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);

    toggleFab();
  };

  const handleItem = (item: typeof FAB_ITEMS[0], e: React.MouseEvent) => {
    soundFx.playClickSound();
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
        {/* Radial F1 Dial Menu Items */}
        {FAB_ITEMS.map((item, i) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.action}
              className={`fab-menu-item ${fabOpen ? 'visible' : ''}`}
              style={{
                borderColor: item.color,
                boxShadow: fabOpen ? `0 0 15px ${item.color}66` : 'none',
                transform: fabOpen
                  ? `translate(${item.x}px, ${item.y}px) scale(1)`
                  : 'translate(0, 0) scale(0)',
                transitionDelay: fabOpen ? `${i * 55}ms` : '0ms',
              }}
              onClick={(e) => handleItem(item, e)}
              id={`fab-${item.action}`}
            >
              <IconComp size={20} style={{ color: item.color }} />
              {fabOpen && (
                <span 
                  className="fab-tooltip"
                  style={{
                    borderColor: item.color,
                    color: item.color,
                    boxShadow: `0 0 12px ${item.color}44`,
                    ...(item.dir === 'left' 
                      ? { right: 'calc(100% + 8px)', left: 'auto' } // Extend inward towards center
                      : { left: 'calc(100% + 8px)', right: 'auto' }) // Extend inward towards center
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* F1 Pirelli Tyre Wheel FAB Main Button */}
        <button
          className={`fab-button ${fabOpen ? 'open' : ''} ${spinning ? 'spin-fast' : ''}`}
          onClick={handleToggle}
          id="fab-main"
          title="F1 Pit Action Menu"
        >
          {/* Wheel Center-Lock Hub SVG inside button */}
          <svg width="32" height="32" viewBox="0 0 32 32" style={{ transition: 'transform 0.3s ease', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
            {/* 5 Double-Spokes */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 16 16)`}>
                <line x1="16" y1="16" x2="16" y2="4" stroke="#4a5168" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            ))}
            {/* Red Anodized Center Nut */}
            <circle cx="16" cy="16" r="7" fill="#e10600" stroke="#ff4d4d" strokeWidth="1" />
            {/* Center Plus Icon */}
            <path d="M16 11V21M11 16H21" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  );
}
