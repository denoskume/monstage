import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Badge } from '../../components/Badge';
import { useOffers } from '../../hooks/useOffers';
import { displayValue } from '../../i18n/display';
import type { InternshipOffer } from '../../api/contract';
import { getFollowUpAdvice } from '../workspace/intelligence';
import { getWorkspaceState, loadWorkspace } from '../workspace/workspaceStorage';
import { ExternalApplicationForm } from './ExternalApplicationForm';

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
      <div className="application-row__actions">
        <Link className="application-row__link" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Dossier et documents →</Link>
        <Link className="application-row__link" to={`/studio?offer=${encodeURIComponent(offer.id)}`}>Préparer CV et lettre →</Link>
        {offer.applicationUrl ? <a className="application-row__link" href={offer.applicationUrl} target="_blank" rel="noreferrer">View job ↗</a> : null}
      </div>
    </article>
  );
}

export function ApplicationsPage() {
  const { data, loading, error, retry } = useOffers();
  const [externalFormOpen, setExternalFormOpen] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(false);
  const [query, setQuery] = useState('');
  const grouped = useMemo(() => {
    const local = loadWorkspace();
    const all = (data?.offers ?? []).filter(offer => {
      const backendApplied = Boolean(offer.applicationStatus && !['À candidater', 'À qualifier'].includes(offer.applicationStatus));
      return backendApplied || Boolean(local[offer.id]?.submitted);
    }).map(offer => local[offer.id]?.submitted && (!offer.applicationStatus || ['À candidater', 'À qualifier'].includes(offer.applicationStatus))
      ? { ...offer, applicationStatus: 'Candidature envoyée', appliedAt: local[offer.id].updatedAt?.slice(0, 10) || offer.appliedAt }
      : offer);
    const matching = all.filter(offer => [offer.company, offer.title, offer.city].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
    return statusOrder.map(status => ({ status, offers: matching.filter(offer => offer.applicationStatus === status) })).filter(group => group.offers.length > 0);
  }, [data, query]);

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;
  const total = grouped.reduce((sum, group) => sum + group.offers.length, 0);

  return (
    <section className="page applications-page">
      <div className="page-header"><div><h1>Mes candidatures</h1><p>Prépare tes documents, retrouve tes candidatures et suis leur progression.</p></div><button type="button" className="jobs-filter-button" onClick={() => setExternalFormOpen(true)}>+ Add external application</button></div>
      <label className="external-app-field"><span>Rechercher dans mes candidatures</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Entreprise, poste ou ville" /></label>
      {createdNotice ? <div className="offer-action-notice" role="status"><span>External application added.</span><button type="button" onClick={() => setCreatedNotice(false)}>×</button></div> : null}
      {externalFormOpen ? <ExternalApplicationForm onClose={() => setExternalFormOpen(false)} onCreated={() => { setExternalFormOpen(false); setCreatedNotice(true); retry(); }} /> : null}
      {total === 0 ? <EmptyState title="No active applications yet." /> : grouped.map((group) => (
        <section className="application-group" key={group.status}><div className="application-group__heading"><h2>{displayValue(group.status)}</h2><span>{group.offers.length}</span></div><div className="application-group__list">{group.offers.map((offer) => <ApplicationRow key={offer.id || `${offer.company}-${offer.title}`} offer={offer} />)}</div></section>
      ))}
    </section>
  );
}
