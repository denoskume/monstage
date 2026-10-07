import type { InternshipOffer } from '../../api/contract';
import { OfferCard } from './OfferCard';

export function OfferList({
  offers,
  selectedKey,
  onSelect,
  isSaved,
  onToggleSave,
  onHide,
  onShare,
}: {
  offers: InternshipOffer[];
  selectedKey: string | null;
  onSelect: (offer: InternshipOffer) => void;
  isSaved: (offer: InternshipOffer) => boolean;
  onToggleSave: (offer: InternshipOffer) => void;
  onHide: (offer: InternshipOffer) => void;
  onShare: (offer: InternshipOffer) => void;
}) {
  const selectionKey = (offer: InternshipOffer) => [offer.id, offer.company, offer.title, offer.applicationUrl ?? ''].join('::');

  return (
    <div className="offer-list">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id || `${offer.company}-${offer.title}`}
          offer={offer}
          selected={selectionKey(offer) === selectedKey}
          saved={isSaved(offer)}
          onSelect={() => onSelect(offer)}
          onToggleSave={() => onToggleSave(offer)}
          onHide={() => onHide(offer)}
          onShare={() => onShare(offer)}
        />
      ))}
    </div>
  );
}
