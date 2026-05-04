import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  value: string;
  label: string;
  color: 'orange' | 'blue' | 'green' | 'purple';
}

export default function StatCard({ icon, value, label, color }: Props) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
