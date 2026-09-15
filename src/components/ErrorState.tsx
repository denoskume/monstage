export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-state card" role="alert">
      <div className="error-state__icon" aria-hidden="true">!</div>
      <h2>Unable to load opportunities.</h2>
      <p>The connection to Stage Intelligence France failed. Please try again shortly.</p>
      <button className="button button--primary" onClick={onRetry}>Try again</button>
    </div>
  );
}
