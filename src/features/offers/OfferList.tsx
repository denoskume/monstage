import type { InternshipOffer } from '../../api/contract';
import { OfferCard } from './OfferCard';
import { offerIdentity } from './offerSelectors';

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
  const selectionKey = (offer: InternshipOffer) => offerIdentity(offer);

  return (
    <div className="offer-list">
      {offers.map((offer) => (
        <OfferCard
          key={offerIdentity(offer)}
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
