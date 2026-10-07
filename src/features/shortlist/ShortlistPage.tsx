import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import type { InternshipOffer } from '../../api/contract';
import { sortOffers } from '../offers/offerSelectors';
import { OfferDetail } from '../offers/OfferDetail';
import { OfferList } from '../offers/OfferList';
import { useOfferActions } from '../offers/offerActions';

export function ShortlistPage() {
  const { data, loading, error, retry } = useOffers();
  const actions = useOfferActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const offers = useMemo(
    () => sortOffers((data?.offers ?? []).filter((offer) => !actions.isHidden(offer.id) && (actions.isSaved(offer.id, offer.shortlist))), 'best'),
    [data, actions.savedIds, actions.unsavedIds, actions.hidden],
  );
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0] ?? null;

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

  return (
    <section className="page">
      <div className="page-header"><div><h1>Shortlist</h1><p>{offers.length} saved {offers.length === 1 ? 'job' : 'jobs'}</p></div></div>
      {notice ? <div className="offer-action-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice(null)}>×</button></div> : null}
      {offers.length === 0 ? <EmptyState title="Your saved jobs are empty." /> : (
        <div className="offers-layout shortlist-layout">
          <div className="offers-list-pane">
            <OfferList
              offers={offers}
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
      )}
    </section>
  );
}
