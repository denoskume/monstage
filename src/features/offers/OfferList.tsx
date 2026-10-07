import type { InternshipOffer } from '../../api/contract';
import { OfferCard } from './OfferCard';

export function OfferList({
  offers,
  selectedId,
  onSelect,
  isSaved,
  onToggleSave,
  onHide,
  onShare,
}: {
  offers: InternshipOffer[];
  selectedId: string | null;
  onSelect: (offer: InternshipOffer) => void;
  isSaved: (offer: InternshipOffer) => boolean;
  onToggleSave: (offer: InternshipOffer) => void;
  onHide: (offer: InternshipOffer) => void;
  onShare: (offer: InternshipOffer) => void;
}) {
  return (
    <div className="offer-list">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id || `${offer.company}-${offer.title}`}
          offer={offer}
          selected={offer.id === selectedId}
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
