import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';

export function OfferCard({ offer, selected, onSelect }: { offer: InternshipOffer; selected: boolean; onSelect: () => void }) {
  const meta = [offer.city, offer.region].filter(Boolean).join(', ');

  return (
    <article className={'offer-card' + (selected ? ' offer-card--selected' : '')}>
      <button className="offer-card__button" type="button" onClick={onSelect} aria-pressed={selected}>
        <div className="offer-card__topline">
          <span className="offer-card__company">{offer.company}</span>
          <span className="offer-card__star" aria-label={offer.shortlist ? 'Saved' : 'Not saved'}>{offer.shortlist ? '★' : '☆'}</span>
        </div>
        <h2 className="offer-card__title">{offer.title}</h2>
        <p className="offer-card__location">{meta || 'Location not specified'}</p>
        <div className="offer-card__facts">
          {offer.duration ? <span>{displayValue(offer.duration)}</span> : null}
          {offer.compensation ? <span>{offer.compensation}</span> : null}
          {offer.m2Fit ? <span>{displayValue(offer.m2Fit)}</span> : null}
        </div>
        <div className="offer-card__signals">
          {offer.decisionScore !== null ? <span className="signal signal--match">{offer.decisionScore}% match</span> : null}
          {offer.priority ? <span className="signal">{offer.priority} priority</span> : null}
          {offer.freshness ? <span className="signal">{displayValue(offer.freshness)}</span> : null}
        </div>
      </button>
    </article>
  );
}
