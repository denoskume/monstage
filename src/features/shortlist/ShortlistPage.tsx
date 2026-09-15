import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOffers } from '../../hooks/useOffers';
import { sortOffers } from '../offers/offerSelectors';
import { OfferDetail } from '../offers/OfferDetail';
import { OfferList } from '../offers/OfferList';

export function ShortlistPage() {
  const { data, loading, error, retry } = useOffers();
  const offers = useMemo(() => sortOffers((data?.offers ?? []).filter((offer) => offer.shortlist), 'best'), [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0] ?? null;

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return (
    <section className="page">
      <div className="page-header"><div><p className="eyebrow">Priority selection</p><h1>Shortlist</h1><p>{offers.length} priority {offers.length === 1 ? 'opportunity' : 'opportunities'} to act on.</p></div></div>
      {offers.length === 0 ? <EmptyState title="Your shortlist is empty." /> : (
        <div className="offers-layout shortlist-layout">
          <div className="offers-list-pane"><OfferList offers={offers} selectedId={selected?.id ?? null} onSelect={(offer) => setSelectedId(offer.id)} /></div>
          <div className="offer-detail-pane card">{selected ? <OfferDetail offer={selected} /> : null}</div>
        </div>
      )}
    </section>
  );
}
