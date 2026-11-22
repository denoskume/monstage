export function EmptyState({ title = 'No opportunities match these filters.', actionLabel, onAction }: { title?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="empty-state card">
      <div className="empty-state__icon" aria-hidden="true">⌕</div>
      <h2>{title}</h2>
      <p>Adjust your criteria to broaden the results.</p>
      {actionLabel && onAction ? <button className="button button--secondary" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}
