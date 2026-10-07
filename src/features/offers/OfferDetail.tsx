import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';
import { displayValue } from '../../i18n/display';
import { getCvMatch } from '../workspace/intelligence';
import { ApplyCenter } from './ApplyCenter';

function DetailItem({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === '') return null;
  const rendered = typeof value === 'string' ? displayValue(value) : value;
  return <div className="detail-item"><dt>{label}</dt><dd>{rendered}</dd></div>;
}

export function OfferDetail({ offer, onBack }: { offer: InternshipOffer; onBack?: () => void }) {
  const match = getCvMatch(offer);
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <>
    <article className="offer-detail card">
      {onBack ? <button className="mobile-back" type="button" onClick={onBack}>← Back to jobs</button> : null}

      <header className="offer-detail__header">
        <div className="offer-detail__identity">
          <p className="offer-detail__company">{offer.company}</p>
          <h1>{offer.title}</h1>
          <p className="offer-detail__location">{[offer.city, offer.region].filter(Boolean).join(' · ') || 'Location not specified'}</p>
          <p className="offer-detail__type">
            {offer.duration ? displayValue(offer.duration) : 'Internship'}
            {offer.compensation ? ' · ' + offer.compensation : ''}
          </p>
        </div>
        <button className="offer-detail__save" type="button" aria-label={offer.shortlist ? 'Saved' : 'Save job'}>{offer.shortlist ? '★' : '☆'}</button>
      </header>

      <div className="offer-detail__actions">
        {offer.applicationUrl ? (
          <button className="button button--primary button--large" type="button" onClick={() => setApplyOpen(true)}>Apply in MonStage</button>
        ) : (
          <button className="button button--primary button--large" disabled>Application link unavailable</button>
        )}
        <Link className="button button--secondary button--large" to={'/workspace?offer=' + encodeURIComponent(offer.id)}>Prepare application</Link>
      </div>

      <section className="detail-section detail-section--summary">
        <h2>Job details</h2>
        <dl className="detail-grid detail-grid--facts">
          <DetailItem label="Start" value={offer.start} />
          <DetailItem label="Duration" value={offer.duration} />
          <DetailItem label="Compensation" value={offer.compensation} />
          <DetailItem label="Specialization" value={offer.specialization ?? offer.domain} />
        </dl>
      </section>

      <section className="detail-section">
        <div className="detail-section__heading">
          <h2>Why this fits you</h2>
          <strong>{match.score}% CV match</strong>
        </div>
        <div className="match-meter"><span style={{ width: match.score + '%' }} /></div>
        {match.matched.length ? <p><strong>Strong overlap:</strong> {match.matched.slice(0, 6).join(', ')}.</p> : <p>The source does not expose enough skill detail for a full comparison.</p>}
        {match.alignedProjects.length ? <p><strong>Best project evidence:</strong> {match.alignedProjects.join(', ')}.</p> : null}
        {match.missing.length ? <p><strong>Prepare:</strong> {match.missing.slice(0, 5).join(', ')}.</p> : null}
        <dl className="detail-grid">
          <DetailItem label="Skills" value={match.breakdown.skills + '/100'} />
          <DetailItem label="Projects" value={match.breakdown.projects + '/100'} />
          <DetailItem label="Education" value={match.breakdown.education + '/100'} />
          <DetailItem label="Experience" value={match.breakdown.experience + '/100'} />
          <DetailItem label="Domain" value={match.breakdown.domain + '/100'} />
          <DetailItem label="Internship fit" value={match.breakdown.constraints + '/100'} />
        </dl>
      </section>

      {offer.skills.length ? (
        <section className="detail-section">
          <h2>Skills</h2>
          <div className="skill-list">{offer.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        </section>
      ) : null}

      <section className="detail-section">
        <h2>Application intelligence</h2>
        <dl className="detail-grid">
          <DetailItem label="Priority" value={offer.priority} />
          <DetailItem label="Decision score" value={offer.decisionScore !== null ? offer.decisionScore + '/100' : null} />
          <DetailItem label="Application status" value={offer.applicationStatus} />
          <DetailItem label="Next action" value={offer.nextAction ?? offer.actionLevel} />
          <DetailItem label="Source" value={offer.sourceQuality} />
          <DetailItem label="Verified" value={offer.verifiedAt} />
        </dl>
      </section>

      {offer.relevance || offer.gaps ? (
        <section className="detail-section">
          <h2>Role notes</h2>
          {offer.relevance ? <p>{offer.relevance}</p> : null}
          {offer.gaps ? <p><strong>To confirm:</strong> {offer.gaps}</p> : null}
        </section>
      ) : null}
    </article>
      {applyOpen ? <ApplyCenter offer={offer} onClose={() => setApplyOpen(false)} /> : null}
    </>
  );
}
