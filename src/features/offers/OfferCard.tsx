import type { InternshipOffer } from '../../api/contract';
import { Badge } from '../../components/Badge';
import { displayValue } from '../../i18n/display';

function priorityTone(priority: string) {
  if (priority === 'A+') return 'success' as const;
  if (priority === 'A') return 'accent' as const;
  if (priority === 'B+') return 'violet' as const;
  return 'neutral' as const;
}

export function OfferCard({ offer, selected, onSelect }: { offer: InternshipOffer; selected: boolean; onSelect: () => void }) {
  return (
    <article className={`offer-card card${selected ? ' offer-card--selected' : ''}`}>
      <button className="offer-card__button" type="button" onClick={onSelect} aria-pressed={selected}>
        <div className="offer-card__topline">
          <span className="offer-card__company">{offer.company}</span>
          <span className="offer-card__star" aria-label={offer.shortlist ? 'In shortlist' : 'Not in shortlist'} aria-hidden={false}>{offer.shortlist ? '★' : '☆'}</span>
        </div>
        <h2 className="offer-card__title">{offer.title}</h2>
        <div className="offer-card__meta">
          {offer.city ? <span>{offer.city}</span> : null}
          {offer.city && offer.specialization ? <span aria-hidden="true">·</span> : null}
          {offer.specialization ? <span>{displayValue(offer.specialization)}</span> : null}
        </div>
        <div className="offer-card__badges">
          <Badge tone={priorityTone(offer.priority)}>{offer.priority || '—'}</Badge>
          {offer.decisionScore !== null ? <Badge tone="accent">Score {offer.decisionScore}/100</Badge> : null}
          {offer.m2Fit ? <Badge tone={offer.m2Fit.startsWith('Oui') ? 'success' : 'warning'}>{displayValue(offer.m2Fit)}</Badge> : null}
        </div>
        <div className="offer-card__footer">
          <span>{displayValue(offer.freshness) ?? 'Freshness unknown'}</span>
          <span>{displayValue(offer.sourceQuality) ?? 'Source needs verification'}</span>
        </div>
      </button>
    </article>
  );
}
