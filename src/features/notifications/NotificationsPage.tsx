import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';

const importantStatuses = new Set(['Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus']);

export function NotificationsPage() {
  const { data, loading, error, retry } = useOffers();

  const notifications = useMemo(() => {
    return (data?.offers ?? [])
      .filter((offer) => importantStatuses.has(offer.applicationStatus ?? '') || Boolean(offer.followUpAt))
      .sort((a, b) => {
        const left = Date.parse(a.autonomy?.detectedAt ?? a.followUpAt ?? a.verifiedAt ?? '') || 0;
        const right = Date.parse(b.autonomy?.detectedAt ?? b.followUpAt ?? b.verifiedAt ?? '') || 0;
        return right - left;
      });
  }, [data]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Important application updates, follow-ups and recruiter events.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications right now." />
      ) : (
        <div className="notifications-list">
          {notifications.map((offer) => (
            <article className="notification-row card" key={offer.id}>
              <div className="notification-row__icon" aria-hidden="true">!</div>
              <div className="notification-row__content">
                <strong>{displayValue(offer.applicationStatus) ?? offer.applicationStatus ?? 'Application update'}</strong>
                <h2>{offer.title}</h2>
                <p>{offer.company}{offer.city ? ` · ${offer.city}` : ''}</p>
                {offer.nextAction ? <span>Next: {displayValue(offer.nextAction)}</span> : null}
                {offer.followUpAt ? <span>Follow-up: {offer.followUpAt}</span> : null}
              </div>
              <Link className="button button--secondary" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Open</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
