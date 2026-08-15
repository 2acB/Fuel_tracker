import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Clock,
  Map,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';

import { soundFx } from '../../lib/sound';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Vehicles', icon: Car },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bouncingPath, setBouncingPath] = useState<string | null>(null);

  const handleNav = (path: string) => {
    soundFx.playClickSound();
    setBouncingPath(path);
    setTimeout(() => setBouncingPath(null), 500);
    navigate(path);
  };

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const isBouncing = bouncingPath === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''} ${isBouncing ? 'slime-bounce' : ''}`}
            onClick={() => handleNav(item.path)}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <Icon className="nav-icon" strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

