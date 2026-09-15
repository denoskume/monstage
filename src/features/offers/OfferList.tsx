import type { InternshipOffer } from '../../api/contract';
import { OfferCard } from './OfferCard';

export function OfferList({ offers, selectedId, onSelect }: { offers: InternshipOffer[]; selectedId: string | null; onSelect: (offer: InternshipOffer) => void }) {
  return <div className="offer-list">{offers.map((offer) => <OfferCard key={offer.id || `${offer.company}-${offer.title}`} offer={offer} selected={offer.id === selectedId} onSelect={() => onSelect(offer)} />)}</div>;
}
