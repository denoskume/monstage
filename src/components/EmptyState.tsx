export function EmptyState({ title = 'Aucune offre ne correspond à ces filtres.', actionLabel, onAction }: { title?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="empty-state card">
      <div className="empty-state__icon" aria-hidden="true">⌕</div>
      <h2>{title}</h2>
      <p>Modifiez vos critères pour élargir les résultats.</p>
      {actionLabel && onAction ? <button className="button button--secondary" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}
