import { useSlimeStore } from '../../store/slime-store';

const ANGLES = [-60, -30, 0, 30, 60, -45, 45, -90, 90];

export default function SlimeToast() {
  const { particles } = useSlimeStore();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) =>
        p.emojis.map((emoji, i) => {
          const angle = ANGLES[i % ANGLES.length];
          const dist = 60 + Math.random() * 40;
          const rad = (angle * Math.PI) / 180;
          const tx = Math.sin(rad) * dist;
          const ty = -Math.cos(rad) * dist;
          const delay = i * 50;
          const size = 20 + Math.floor(Math.random() * 12);

          return (
            <span
              key={`${p.id}-${i}`}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                fontSize: size,
                transform: 'translate(-50%, -50%)',
                animation: `slime-burst 1s ease-out ${delay}ms both`,
                // CSS custom props for per-particle direction
                ['--tx' as any]: `${tx}px`,
                ['--ty' as any]: `${ty}px`,
                display: 'block',
                userSelect: 'none',
              }}
            >
              {emoji}
            </span>
          );
        })
      )}
    </div>
  );
}
