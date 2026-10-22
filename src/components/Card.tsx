import type { ReactNode } from 'react';
import type { AsyncState } from '../useAsync';

interface Props<T> {
  title: string;
  subtitle?: string;
  state: AsyncState<T>;
  className?: string;
  children: (data: T) => ReactNode;
}

export function Card<T>({ title, subtitle, state, className = '', children }: Props<T>) {
  return (
    <section className={`card ${className}`}>
      <header className="card-header">
        <h2>{title}</h2>
        {subtitle && <span className="muted">{subtitle}</span>}
      </header>
      {state.loading && <div className="placeholder">Carregando…</div>}
      {state.error && <div className="placeholder error">{state.error}</div>}
      {state.data !== undefined && children(state.data)}
    </section>
  );
}
