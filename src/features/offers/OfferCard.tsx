import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';

function Icon({ name }: { name: 'save' | 'hide' | 'share' }) {
  if (name === 'save') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.55L6 21V4.75Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (name === 'hide') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v8a2 2 0 0 1-2 2H9l-5 3v-13Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m9 10 6 4M15 10l-6 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10M8.5 7.5 12 4l3.5 3.5M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function OfferCard({
  offer,
  selected,
  saved,
  onSelect,
  onToggleSave,
  onHide,
  onShare,
}: {
  offer: InternshipOffer;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
  onHide: () => void;
  onShare: () => void;
}) {
  const meta = [offer.city, offer.region].filter(Boolean).join(', ');

  return (
    <article className={'offer-card' + (selected ? ' offer-card--selected' : '')}>
      <button className="offer-card__button" type="button" onClick={onSelect} aria-pressed={selected}>
        <div className="offer-card__topline">
          <span className="offer-card__company">{offer.company}</span>
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

      <div className="offer-card__actions" aria-label="Job actions">
        <button className={'offer-action-icon' + (saved ? ' is-active' : '')} type="button" onClick={onToggleSave} aria-pressed={saved} aria-label={saved ? 'Remove from saved jobs' : 'Save job'} title={saved ? 'Saved' : 'Save'}>
          <Icon name="save" />
        </button>
        <button className="offer-action-icon" type="button" onClick={onHide} aria-label="Not interested" title="Not interested">
          <Icon name="hide" />
        </button>
        <button className="offer-action-icon" type="button" onClick={onShare} aria-label="Share job" title="Share">
          <Icon name="share" />
        </button>
      </div>
    </article>
  );
}
