import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'violet';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
