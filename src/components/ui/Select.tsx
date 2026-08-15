import { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  // Add any custom props here in the future
}

export default function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        className={`form-input ${className}`}
        style={{
          appearance: 'none', // Remove default browser styling
          paddingRight: '36px', // Make room for custom chevron
          ...props.style,
        }}
        {...props}
      >
        {children}
      </select>
      
      {/* Custom F1 Neon Chevron Icon */}
      <div
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00e5ff', // F1 Telemetry Neon Cyan
          filter: 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.5))',
        }}
      >
        <ChevronDown size={18} />
      </div>
    </div>
  );
}
