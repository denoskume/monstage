import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Badge } from '../../components/Badge';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';
import type { InternshipOffer } from '../../api/contract';
import { getFollowUpAdvice } from '../workspace/intelligence';
import { getWorkspaceState } from '../workspace/workspaceStorage';

const statusOrder = ['Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus', 'Abandonné'];

function ApplicationRow({ offer }: { offer: InternshipOffer }) {
  const local = getWorkspaceState(offer.id);
  const followUp = getFollowUpAdvice(offer, local.followUpDate);

  return (
    <article className="application-row card">
      <div className="application-row__main"><p>{offer.company}</p><h2>{offer.title}</h2><span>{offer.city ?? 'City not specified'}</span></div>
      <div className="application-row__badges">
        <Badge tone={offer.priority === 'A+' ? 'success' : 'accent'}>{offer.priority}</Badge>
        {offer.decisionScore !== null ? <Badge>Score {offer.decisionScore}</Badge> : null}
        {offer.autonomy?.source ? <Badge tone="success">Auto · {offer.autonomy.source}</Badge> : null}
      </div>
      <dl className="application-row__meta">
        <div><dt>Applied</dt><dd>{offer.appliedAt ?? 'Not provided'}</dd></div>
        <div><dt>Follow-up</dt><dd>{local.followUpDate || offer.followUpAt || '—'}</dd></div>
        <div><dt>Next action</dt><dd>{displayValue(offer.nextAction ?? offer.actionLevel) ?? '—'}</dd></div>
        <div><dt>Assistant</dt><dd>{followUp}</dd></div>
      </dl>
      {offer.autonomy ? <div className="application-evidence">
        <strong>Auto-detected</strong>
        <span>{offer.autonomy.type} · {offer.autonomy.confidence !== null ? Math.round(offer.autonomy.confidence * 100) + '% confidence' : 'confidence n/a'}</span>
      </div> : null}
      <div className="application-row__actions">
        <Link className="application-row__link" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Workspace →</Link>
        {offer.applicationUrl ? <a className="application-row__link" href={offer.applicationUrl} target="_blank" rel="noreferrer">View job ↗</a> : null}
      </div>
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
      <div className="page-header"><div><p className="eyebrow">Autonomous pipeline</p><h1>Applications</h1><p>{total} tracked {total === 1 ? 'application' : 'applications'} with evidence-based status updates.</p></div></div>
      {data?.autonomyLastSync ? <div className="autonomy-sync card"><span>Autonomy engine</span><strong>Last sync: {new Date(data.autonomyLastSync).toLocaleString()}</strong></div> : null}
      {total === 0 ? <EmptyState title="No active applications yet." /> : grouped.map((group) => (
        <section className="application-group" key={group.status}><div className="application-group__heading"><h2>{displayValue(group.status)}</h2><span>{group.offers.length}</span></div><div className="application-group__list">{group.offers.map((offer) => <ApplicationRow key={offer.id || `${offer.company}-${offer.title}`} offer={offer} />)}</div></section>
      ))}
    </section>
  );
}
