import { Link } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';
import { Badge } from '../../components/Badge';
import { displayValue } from '../../i18n/display';
import { getCvMatch } from '../workspace/intelligence';

function DetailItem({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === '') return null;
  const rendered = typeof value === 'string' ? displayValue(value) : value;
  return <div className="detail-item"><dt>{label}</dt><dd>{rendered}</dd></div>;
}

export function OfferDetail({ offer, onBack }: { offer: InternshipOffer; onBack?: () => void }) {
  const match = getCvMatch(offer);

  return (
    <article className="offer-detail">
      {onBack ? <button className="mobile-back" type="button" onClick={onBack}>← Back to jobs</button> : null}
      <header className="offer-detail__header">
        <div>
          <p className="offer-detail__company">{offer.company}</p>
          <h1>{offer.title}</h1>
          <p className="offer-detail__location">{[offer.city, offer.region].filter(Boolean).join(' · ') || 'Location not specified'}</p>
        </div>
        <span className="offer-detail__shortlist" aria-label={offer.shortlist ? 'In shortlist' : 'Not in shortlist'}>{offer.shortlist ? '★' : '☆'}</span>
      </header>

      <div className="offer-detail__badges">
        <Badge tone={offer.priority === 'A+' ? 'success' : 'accent'}>{offer.priority || 'Priority —'}</Badge>
        {offer.decisionScore !== null ? <Badge tone="accent">Decision {offer.decisionScore}/100</Badge> : null}
        {offer.technicalFit !== null ? <Badge>Technical fit {offer.technicalFit}/100</Badge> : null}
        <Badge tone={match.score >= 80 ? 'success' : 'accent'}>CV match {match.score}/100</Badge>
        {offer.m2Fit ? <Badge tone={offer.m2Fit.startsWith('Oui') ? 'success' : 'warning'}>M2 · {displayValue(offer.m2Fit)}</Badge> : null}
      </div>

      <section className="detail-section">
        <h2>Internship profile</h2>
        <dl className="detail-grid">
          <DetailItem label="Domain" value={offer.domain} />
          <DetailItem label="Specialization" value={offer.specialization} />
          <DetailItem label="Start" value={offer.start} />
          <DetailItem label="Duration" value={offer.duration} />
          <DetailItem label="Compensation" value={offer.compensation} />
          <DetailItem label="Calendar fit" value={offer.calendarFit} />
        </dl>
        {offer.skills.length ? <div className="skill-list" aria-label="Key skills">{offer.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : null}
      </section>

      <section className="detail-section">
        <h2>CV intelligence</h2>
        <div className="match-meter"><span style={{ width: `${match.score}%` }} /></div>
        {match.matched.length ? <p className="match-positive"><strong>Already supported:</strong> {match.matched.slice(0, 7).join(', ')}</p> : <p>No explicit skill list was provided by the source; the score falls back to existing fit signals.</p>}
        {match.missing.length ? <p className="match-warning"><strong>Prepare / strengthen:</strong> {match.missing.slice(0, 6).join(', ')}</p> : null}
      </section>

      <section className="detail-section">
        <h2>Decision & tracking</h2>
        <dl className="detail-grid">
          <DetailItem label="Application status" value={offer.applicationStatus} />
          <DetailItem label="Next action" value={offer.nextAction ?? offer.actionLevel} />
          <DetailItem label="Freshness" value={offer.freshness} />
          <DetailItem label="Verified at" value={offer.verifiedAt} />
          <DetailItem label="Source" value={offer.sourceQuality} />
          <DetailItem label="Confidence" value={offer.confidence} />
        </dl>
      </section>

      <section className="detail-section">
        <h2>Company / role intelligence</h2>
        <dl className="detail-grid">
          <DetailItem label="Company" value={offer.company} />
          <DetailItem label="Location" value={[offer.city, offer.region].filter(Boolean).join(' · ') || null} />
          <DetailItem label="Source quality" value={offer.sourceQuality} />
          <DetailItem label="Compensation" value={offer.compensation} />
        </dl>
        {offer.relevance ? <p>{offer.relevance}</p> : null}
        {offer.gaps ? <p className="detail-note">To confirm: {offer.gaps}</p> : null}
      </section>

      <div className="offer-detail__cta offer-detail__cta--dual">
        <Link className="button button--secondary button--large" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Prepare application</Link>
        {offer.applicationUrl ? (
          <a className="button button--primary button--large" href={offer.applicationUrl} target="_blank" rel="noreferrer">Apply ↗</a>
        ) : (
          <button className="button button--primary button--large" disabled title="No direct application link available">Application link unavailable</button>
        )}
      </div>
    </article>
  );
}
