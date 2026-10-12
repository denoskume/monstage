import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';

function parsePublishedDate(value: string): Date | null {
  const trimmed = value.trim();
  const frenchDate = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+.*)?$/);
  if (frenchDate) {
    const [, day, month, year] = frenchDate;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const isoDate = new Date(trimmed);
  return Number.isNaN(isoDate.getTime()) ? null : isoDate;
}

function relativePublishedDate(value: string | null): string {
  if (!value) return 'Publication date unavailable';
  const published = parsePublishedDate(value);
  if (!published) return 'Publication date unavailable';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfPublished = new Date(published.getFullYear(), published.getMonth(), published.getDate());
  const diffDays = Math.max(0, Math.floor((startOfToday.getTime() - startOfPublished.getTime()) / 86400000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;

  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return months === 1 ? '1 month ago' : `${months} months ago`;

  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

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
  const publishedLabel = relativePublishedDate(offer.publishedAt);
  const companyMark = offer.company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <article className={'offer-card' + (selected ? ' offer-card--selected' : '')}>
      <button className="offer-card__button" type="button" onClick={onSelect} aria-pressed={selected}>
        <div className="offer-card__identity">
          <span className="offer-card__company-mark" aria-hidden="true">{companyMark || '•'}</span>
          <div className="offer-card__identity-copy">
            <div className="offer-card__company-row">
              <span className="offer-card__company">{offer.company}</span>
              <span className="offer-card__published">{publishedLabel}</span>
            </div>
            <h2 className="offer-card__title">{offer.title}</h2>
            <p className="offer-card__location">{meta || 'Location not specified'}</p>
            <div className="offer-card__facts">
              {offer.duration ? <span>{displayValue(offer.duration)}</span> : null}
              {offer.compensation ? <span>{offer.compensation}</span> : null}
            </div>
          </div>
        </div>
        <div className="offer-card__signals">
          {offer.decisionScore !== null ? <span className="signal signal--match">{offer.decisionScore}% match</span> : null}
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
