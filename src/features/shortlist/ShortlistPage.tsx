import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';
import { sortOffers } from '../offers/offerSelectors';
import { useOfferActions } from '../offers/offerActions';
import { ExternalApplicationForm } from '../applications/ExternalApplicationForm';

type MyJobsTab = 'saved' | 'applications' | 'interviews' | 'archived';

function TrackingList({
  offers,
  emptyTitle,
  stage,
  onMove,
}: {
  offers: InternshipOffer[];
  emptyTitle: string;
  stage: 'application' | 'interview' | 'archived';
  onMove: (offer: InternshipOffer, next: 'application' | 'interview' | 'archived' | null) => void;
}) {
  if (offers.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <div className="my-jobs-saved-list">
      {offers.map((offer) => (
        <article className="my-jobs-saved-row" key={offer.id}>
          <div className="my-jobs-company-mark" aria-hidden="true">
            {offer.company.trim().slice(0, 2).toUpperCase()}
          </div>

          <div className="my-jobs-saved-row__main">
            <h2>{offer.title}</h2>
            <p>{offer.company}</p>
            <span>{offer.city ?? 'City not specified'}</span>
            <small>{stage === 'application' ? 'Application' : stage === 'interview' ? 'Interview' : 'Archived'}</small>
          </div>

          <div className="my-jobs-saved-row__actions">
            <Link className="button button--primary my-jobs-apply" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Open</Link>
            {stage === 'application' ? <button className="button button--secondary" type="button" onClick={() => onMove(offer, 'interview')}>Mark interview</button> : null}
            {stage === 'interview' ? <button className="button button--secondary" type="button" onClick={() => onMove(offer, 'application')}>Back to applications</button> : null}
            {stage !== 'archived' ? <button className="button button--secondary" type="button" onClick={() => onMove(offer, 'archived')}>Archive</button> : <button className="button button--secondary" type="button" onClick={() => onMove(offer, null)}>Restore</button>}
            {offer.applicationUrl ? (
              <a className="offer-action-icon my-jobs-secondary-action" href={offer.applicationUrl} target="_blank" rel="noreferrer" aria-label="View job" title="View job">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 5h5v5M19 5l-8 8M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ShortlistPage() {
  const { data, loading, error, retry } = useOffers();
  const actions = useOfferActions();
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<MyJobsTab>('saved');
  const [externalFormOpen, setExternalFormOpen] = useState(false);

  const allOffers = data?.offers ?? [];
  const savedOffers = useMemo(
    () => sortOffers(allOffers.filter((offer) => !actions.isHidden(offer.id) && actions.isSaved(offer.id, offer.shortlist)), 'best'),
    [data, actions.savedIds, actions.unsavedIds, actions.hidden],
  );
  function resolvedStage(offer: InternshipOffer): 'application' | 'interview' | 'archived' | null {
    const localStage = actions.stages[offer.id];
    if (localStage) return localStage;

    const status = offer.applicationStatus;
    if (!status || status === 'À candidater') return null;
    if (status === 'Entretien') return 'interview';

    // Archived is a manual workspace action only.
    // Backend statuses such as Refus or Abandonné remain visible in Applications
    // unless the user explicitly archives them.
    return 'application';
  }

  const applications = useMemo(
    () => allOffers.filter((offer) => resolvedStage(offer) === 'application'),
    [data, actions.stages],
  );
  const interviews = useMemo(
    () => allOffers.filter((offer) => resolvedStage(offer) === 'interview'),
    [data, actions.stages],
  );
  const archived = useMemo(
    () => allOffers.filter((offer) => resolvedStage(offer) === 'archived'),
    [data, actions.stages],
  );

  function toggleSaved(offer: InternshipOffer) {
    actions.toggleSaved(offer.id, offer.shortlist);
  }

  function moveOffer(offer: InternshipOffer, next: 'application' | 'interview' | 'archived' | null) {
    actions.setStage(offer.id, next);
  }

  async function shareOffer(offer: InternshipOffer) {
    const url = offer.applicationUrl || window.location.href;
    const text = `${offer.title} — ${offer.company}`;
    try {
      if (navigator.share) await navigator.share({ title: offer.title, text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setNotice('Job link copied.');
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setNotice('Unable to share this job.');
    }
  }

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  const tabs: Array<[MyJobsTab, string, number]> = [
    ['saved', 'Saved jobs', savedOffers.length],
    ['applications', 'Applications', applications.length],
    ['interviews', 'Interviews', interviews.length],
    ['archived', 'Archived', archived.length],
  ];

  return (
    <section className="page my-jobs-page">
      <div className="page-header">
        <div><h1>My jobs</h1><p>Your saved opportunities and application progress in one place.</p></div>
        <button type="button" className="jobs-filter-button" onClick={() => setExternalFormOpen(true)}>+ Add external application</button>
      </div>
      {externalFormOpen ? <ExternalApplicationForm onClose={() => setExternalFormOpen(false)} onCreated={() => { setExternalFormOpen(false); setNotice('External application added.'); setTab('applications'); retry(); }} /> : null}

      <div className="my-jobs-tabs" role="tablist" aria-label="My jobs">
        {tabs.map(([value, label, count]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)}>
            <span>{count}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </div>

      {notice ? <div className="offer-action-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice(null)}>×</button></div> : null}

      {tab === 'saved' ? (
        savedOffers.length === 0 ? <EmptyState title="Your saved jobs are empty." /> : (
          <div className="my-jobs-saved-list">
            {savedOffers.map((offer) => (
              <article className="my-jobs-saved-row" key={offer.id}>
                <div className="my-jobs-company-mark" aria-hidden="true">
                  {offer.company.trim().slice(0, 2).toUpperCase()}
                </div>

                <div className="my-jobs-saved-row__main">
                  <h2>{offer.title}</h2>
                  <p>{offer.company}</p>
                  <span>{offer.city ?? 'City not specified'}</span>
                  <small>Saved in My jobs</small>
                </div>

                <div className="my-jobs-saved-row__actions">
                  {offer.applicationUrl ? (
                    <a className="button button--primary my-jobs-apply" href={offer.applicationUrl} target="_blank" rel="noreferrer">Apply</a>
                  ) : (
                    <button className="button button--primary my-jobs-apply" type="button" disabled>Apply</button>
                  )}
                  <button className="button button--secondary" type="button" onClick={() => moveOffer(offer, 'application')}>Mark applied</button>

                  <button className="offer-action-icon is-active my-jobs-bookmark" type="button" onClick={() => toggleSaved(offer)} aria-label="Remove from saved jobs" title="Saved">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.55L6 21V4.75Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                  </button>

                  <button className="my-jobs-more" type="button" onClick={() => void shareOffer(offer)} aria-label="More actions" title="Share job">•••</button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}

      {tab === 'applications' ? <TrackingList offers={applications} emptyTitle="No applications yet." stage="application" onMove={moveOffer} /> : null}
      {tab === 'interviews' ? <TrackingList offers={interviews} emptyTitle="No interviews scheduled yet." stage="interview" onMove={moveOffer} /> : null}
      {tab === 'archived' ? <TrackingList offers={archived} emptyTitle="No archived applications." stage="archived" onMove={moveOffer} /> : null}
    </section>
  );
}
