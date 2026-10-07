import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';

const activityStatuses = new Set(['Réponse recruteur', 'Entretien', 'Test technique', 'Offre reçue']);

function activityLabel(status: string | null): string {
  if (!status) return 'Recruiter activity';
  return displayValue(status) ?? status;
}

export function MessagesPage() {
  const { data, loading, error, retry } = useOffers();

  const activity = useMemo(() => {
    return (data?.offers ?? [])
      .filter((offer) => activityStatuses.has(offer.applicationStatus ?? '') || offer.autonomy?.type)
      .sort((a, b) => {
        const left = Date.parse(a.autonomy?.detectedAt ?? a.verifiedAt ?? '') || 0;
        const right = Date.parse(b.autonomy?.detectedAt ?? b.verifiedAt ?? '') || 0;
        return right - left;
      });
  }, [data]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page messages-page">
      <div className="page-header">
        <div>
          <h1>Recruiter activity</h1>
          <p>Responses and application events detected by MonStage.</p>
        </div>
      </div>

      {activity.length === 0 ? (
        <EmptyState title="No recruiter activity yet." />
      ) : (
        <div className="messages-list">
          {activity.map((offer) => (
            <article className="message-row card" key={offer.id}>
              <div className="message-row__marker" aria-hidden="true" />
              <div className="message-row__content">
                <div className="message-row__top">
                  <strong>{offer.company}</strong>
                  <span>{offer.autonomy?.detectedAt ?? offer.verifiedAt ?? ''}</span>
                </div>
                <h2>{activityLabel(offer.applicationStatus)}</h2>
                <p>{offer.title}</p>
                {offer.autonomy?.evidence ? <p className="message-row__evidence">{offer.autonomy.evidence}</p> : null}
                <div className="message-row__meta">
                  {offer.autonomy?.source ? <span>Source: {offer.autonomy.source}</span> : null}
                  {offer.autonomy?.confidence !== null && offer.autonomy?.confidence !== undefined ? <span>{Math.round(offer.autonomy.confidence * 100)}% confidence</span> : null}
                </div>
              </div>
              <Link className="button button--secondary" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Open</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
