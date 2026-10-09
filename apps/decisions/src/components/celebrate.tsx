import type { CSSProperties } from 'react';

const COLORS = ['#0d9488', '#4f46e5', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'];
const PIECES = 34;
const noise = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

export function Confetti() {
  return <span className="confetti" aria-hidden="true">{Array.from({ length: PIECES }, (_, i) => {
    const angle = (i / PIECES) * Math.PI * 2 + noise(i, 1) * .5;
    const distance = 80 + noise(i, 2) * 110;
    const style = {
      '--x': `${Math.round(Math.cos(angle) * distance)}px`,
      '--y': `${Math.round(Math.sin(angle) * distance * .8 - 30)}px`,
      '--r': `${Math.round(noise(i, 3) * 720 - 360)}deg`,
      '--w': `${5 + Math.round(noise(i, 4) * 4)}px`,
      '--h': `${3 + Math.round(noise(i, 5) * 3)}px`,
      '--c': COLORS[i % COLORS.length],
      '--d': `${(i % 6) * 18}ms`,
    } as CSSProperties;
    return <i key={i} style={style} />;
  })}</span>;
}

// aria-label keeps the heading name intact; the per-letter spans are presentational.
export function TicketId({ id }: { id: string }) {
  return <h3 className="ticket-id" aria-label={id}><span aria-hidden="true">{id.split('').map((char, i) => <span key={i} style={{ '--i': i } as CSSProperties}>{char}</span>)}</span></h3>;
}
