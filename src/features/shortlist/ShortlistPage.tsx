import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';
import { sortOffers } from '../offers/offerSelectors';
import { OfferDetail } from '../offers/OfferDetail';
import { OfferList } from '../offers/OfferList';
import { useOfferActions } from '../offers/offerActions';

type MyJobsTab = 'saved' | 'applications' | 'interviews' | 'archived';

const applicationStatuses = new Set(['Candidature envoyée', 'Réponse recruteur', 'Relance', 'Test technique', 'Offre reçue']);
const archivedStatuses = new Set(['Refus', 'Abandonné']);

function TrackingList({ offers, emptyTitle }: { offers: InternshipOffer[]; emptyTitle: string }) {
  if (offers.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <div className="my-jobs-tracking-list">
      {offers.map((offer) => (
        <article className="application-row card" key={offer.id}>
          <div className="application-row__main">
            <p>{offer.company}</p>
            <h2>{offer.title}</h2>
            <span>{offer.city ?? 'City not specified'}</span>
          </div>
          <div className="my-jobs-tracking-status">
            <strong>{displayValue(offer.applicationStatus) ?? offer.applicationStatus}</strong>
            <span>{offer.nextAction ? displayValue(offer.nextAction) : 'No action required'}</span>
          </div>
          <Link className="application-row__link" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Open workspace →</Link>
        </article>
      ))}
    </div>
  );
}

export function ShortlistPage() {
  const { data, loading, error, retry } = useOffers();
  const actions = useOfferActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<MyJobsTab>('saved');

  const allOffers = data?.offers ?? [];
  const savedOffers = useMemo(
    () => sortOffers(allOffers.filter((offer) => !actions.isHidden(offer.id) && actions.isSaved(offer.id, offer.shortlist)), 'best'),
    [data, actions.savedIds, actions.unsavedIds, actions.hidden],
  );
  const applications = useMemo(
    () => allOffers.filter((offer) => applicationStatuses.has(offer.applicationStatus ?? '')),
    [data],
  );
  const interviews = useMemo(
    () => allOffers.filter((offer) => offer.applicationStatus === 'Entretien'),
    [data],
  );
  const archived = useMemo(
    () => allOffers.filter((offer) => archivedStatuses.has(offer.applicationStatus ?? '')),
    [data],
  );

  const selected = savedOffers.find((offer) => offer.id === selectedId) ?? savedOffers[0] ?? null;

  function toggleSaved(offer: InternshipOffer) {
    const saved = actions.toggleSaved(offer.id, offer.shortlist);
    setNotice(saved ? 'Saved to your jobs.' : 'Removed from saved jobs.');
  }

  function hideOffer(offer: InternshipOffer) {
    actions.hideOffer(offer.id);
    setNotice('Job hidden.');
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
      <div className="page-header"><div><h1>My jobs</h1><p>Your saved opportunities and application progress in one place.</p></div></div>

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
          <div className="offers-layout shortlist-layout">
            <div className="offers-list-pane">
              <OfferList
                offers={savedOffers}
                selectedId={selected?.id ?? null}
                onSelect={(offer) => setSelectedId(offer.id)}
                isSaved={(offer) => actions.isSaved(offer.id, offer.shortlist)}
                onToggleSave={toggleSaved}
                onHide={hideOffer}
                onShare={(offer) => void shareOffer(offer)}
              />
            </div>
            <div className="offer-detail-pane card">
              {selected ? (
                <OfferDetail
                  offer={selected}
                  saved={actions.isSaved(selected.id, selected.shortlist)}
                  onToggleSave={() => toggleSaved(selected)}
                  onHide={() => hideOffer(selected)}
                  onShare={() => void shareOffer(selected)}
                />
              ) : null}
            </div>
          </div>
        )
      ) : null}

      {tab === 'applications' ? <TrackingList offers={applications} emptyTitle="No applications yet." /> : null}
      {tab === 'interviews' ? <TrackingList offers={interviews} emptyTitle="No interviews scheduled yet." /> : null}
      {tab === 'archived' ? <TrackingList offers={archived} emptyTitle="No archived applications." /> : null}
    </section>
  );
}
