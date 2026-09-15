export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-state card" role="alert">
      <div className="error-state__icon" aria-hidden="true">!</div>
      <h2>Impossible de charger les offres.</h2>
      <p>La connexion à Stage Intelligence France a échoué. Réessayez dans un instant.</p>
      <button className="button button--primary" onClick={onRetry}>Réessayer</button>
    </div>
  );
}
