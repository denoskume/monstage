import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';

type Publication = { date: Date | null; hasTime: boolean; dateLabel: string; exact: boolean };

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function parsePublishedDate(value: string | null): Publication | null {
  if (!value) return null;
  const text = value.trim();
  const fr = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?=$|[\s—–;,])/);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?(?=$|[\s—–;,])/);
  if (fr || iso) {
    const year = Number(fr ? fr[3] : iso![1]);
    const month = Number(fr ? fr[2] : iso![2]);
    const day = Number(fr ? fr[1] : iso![3]);
    const localDay = new Date(year, month - 1, day);
    if (localDay.getFullYear() !== year || localDay.getMonth() !== month - 1 || localDay.getDate() !== day) return null;
    const hasTime = Boolean(iso?.[4]);
    const timeText = iso?.[0] || '';
    const timeStamp = hasTime ? new Date(timeText.replace(' ', 'T') + (iso?.[7] ? '' : 'Z')) : localDay;
    if (Number.isNaN(timeStamp.getTime()) || timeStamp.getTime() > Date.now() + 86_400_000) return null;
    return { date: timeStamp, hasTime, exact: true, dateLabel: localDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) };
  }

  // Month-only and year-only references are not precise posting dates.
  const normalized = text.toLocaleLowerCase('fr-FR');
  const longMonth = normalized.match(/^(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(\d{4})(?=$|[\s—–;,])/);
  if (longMonth) {
    const name = longMonth[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const index = MONTHS.findIndex((month) => month.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === name);
    if (index >= 0) return { date: null, hasTime: false, exact: false, dateLabel: MONTHS[index] + ' ' + longMonth[2] };
  }
  const numericMonth = text.match(/^(\d{1,2})\/(\d{4})(?=$|[\s—–;,])/);
  if (numericMonth && Number(numericMonth[1]) >= 1 && Number(numericMonth[1]) <= 12) {
    return { date: null, hasTime: false, exact: false, dateLabel: MONTHS[Number(numericMonth[1]) - 1] + ' ' + numericMonth[2] };
  }
  const yearOnly = text.match(/^(\d{4})$/);
  if (yearOnly) return { date: null, hasTime: false, exact: false, dateLabel: yearOnly[1] };
  return null;
}

function relativePublishedDate(publication: Publication | null): string {
  if (!publication) return 'Date non communiquée';
  if (!publication.exact || !publication.date) return 'Publié en ' + publication.dateLabel;
  const now = new Date();
  const { date, hasTime } = publication;
  if (hasTime) {
    const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
    if (minutes < 1) return 'À l’instant';
    if (minutes < 60) return 'Il y a ' + minutes + ' min';
    if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60);
      return 'Il y a ' + hours + ' heure' + (hours > 1 ? 's' : '');
    }
  }
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.max(0, Math.round((today - day) / 86_400_000));
  if (days === 0) return 'Aujourd’hui';
  if (days === 1) return 'Hier';
  if (days < 7) return 'Il y a ' + days + ' jours';
  if (days < 30) return 'Il y a ' + Math.floor(days / 7) + ' semaine' + (days >= 14 ? 's' : '');
  if (days < 365) return 'Il y a ' + Math.floor(days / 30) + ' mois';
  const years = Math.floor(days / 365);
  return 'Il y a ' + years + ' an' + (years > 1 ? 's' : '');
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
  const publication = parsePublishedDate(offer.publishedAt);
  const publishedLabel = relativePublishedDate(publication);
  const exactPublicationLabel = publication?.exact ? publication.dateLabel : null;
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
              <span className="offer-card__published" title={exactPublicationLabel ?? publishedLabel}>
                {publishedLabel}{exactPublicationLabel ? ` · ${exactPublicationLabel}` : null}
              </span>
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
