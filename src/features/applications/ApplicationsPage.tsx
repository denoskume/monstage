import { useMemo } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Badge } from '../../components/Badge';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';
import type { InternshipOffer } from '../../api/contract';

const statusOrder = ['Candidature envoyée', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus', 'Abandonné'];

function ApplicationRow({ offer }: { offer: InternshipOffer }) {
  return (
    <article className="application-row card">
      <div className="application-row__main"><p>{offer.company}</p><h2>{offer.title}</h2><span>{offer.city ?? 'City not specified'}</span></div>
      <div className="application-row__badges"><Badge tone={offer.priority === 'A+' ? 'success' : 'accent'}>{offer.priority}</Badge>{offer.decisionScore !== null ? <Badge>Score {offer.decisionScore}</Badge> : null}</div>
      <dl className="application-row__meta">
        <div><dt>Applied</dt><dd>{offer.appliedAt ?? 'Not provided'}</dd></div>
        <div><dt>Follow-up</dt><dd>{offer.followUpAt ?? '—'}</dd></div>
        <div><dt>Next action</dt><dd>{displayValue(offer.nextAction ?? offer.actionLevel) ?? '—'}</dd></div>
        <div><dt>Freshness</dt><dd>{displayValue(offer.freshness) ?? '—'}</dd></div>
      </dl>
      {offer.applicationUrl ? <a className="application-row__link" href={offer.applicationUrl} target="_blank" rel="noreferrer">View job ↗</a> : null}
    </article>
  );
}

export function ApplicationsPage() {
  const { data, loading, error, retry } = useOffers();
  const grouped = useMemo(() => {
    const all = (data?.offers ?? []).filter((offer) => offer.applicationStatus && offer.applicationStatus !== 'À candidater');
    return statusOrder.map((status) => ({ status, offers: all.filter((offer) => offer.applicationStatus === status) })).filter((group) => group.offers.length > 0);
  }, [data]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;
  const total = grouped.reduce((sum, group) => sum + group.offers.length, 0);

  return (
    <section className="page applications-page">
      <div className="page-header"><div><p className="eyebrow">Pipeline</p><h1>Applications</h1><p>{total} active {total === 1 ? 'application' : 'applications'} beyond the “To apply” backlog.</p></div></div>
      {total === 0 ? <EmptyState title="No active applications yet." /> : grouped.map((group) => (
        <section className="application-group" key={group.status}><div className="application-group__heading"><h2>{displayValue(group.status)}</h2><span>{group.offers.length}</span></div><div className="application-group__list">{group.offers.map((offer) => <ApplicationRow key={offer.id || `${offer.company}-${offer.title}`} offer={offer} />)}</div></section>
      ))}
    </section>
  );
}
