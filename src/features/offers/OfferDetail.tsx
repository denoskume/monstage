import type { InternshipOffer } from '../../api/contract';
import { Badge } from '../../components/Badge';

function DetailItem({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === '') return null;
  return <div className="detail-item"><dt>{label}</dt><dd>{value}</dd></div>;
}

export function OfferDetail({ offer, onBack }: { offer: InternshipOffer; onBack?: () => void }) {
  return (
    <article className="offer-detail">
      {onBack ? <button className="mobile-back" type="button" onClick={onBack}>← Retour aux offres</button> : null}
      <header className="offer-detail__header">
        <div>
          <p className="offer-detail__company">{offer.company}</p>
          <h1>{offer.title}</h1>
          <p className="offer-detail__location">{[offer.city, offer.region].filter(Boolean).join(' · ') || 'Localisation non précisée'}</p>
        </div>
        <span className="offer-detail__shortlist" aria-label={offer.shortlist ? 'Dans la shortlist' : 'Pas dans la shortlist'}>{offer.shortlist ? '★' : '☆'}</span>
      </header>

      <div className="offer-detail__badges">
        <Badge tone={offer.priority === 'A+' ? 'success' : 'accent'}>{offer.priority || 'Priorité —'}</Badge>
        {offer.decisionScore !== null ? <Badge tone="accent">Décision {offer.decisionScore}/100</Badge> : null}
        {offer.technicalFit !== null ? <Badge>Technique {offer.technicalFit}/100</Badge> : null}
        {offer.m2Fit ? <Badge tone={offer.m2Fit.startsWith('Oui') ? 'success' : 'warning'}>M2 · {offer.m2Fit}</Badge> : null}
      </div>

      <section className="detail-section">
        <h2>Profil du stage</h2>
        <dl className="detail-grid">
          <DetailItem label="Domaine" value={offer.domain} />
          <DetailItem label="Spécialisation" value={offer.specialization} />
          <DetailItem label="Début" value={offer.start} />
          <DetailItem label="Durée" value={offer.duration} />
          <DetailItem label="Rémunération" value={offer.compensation} />
          <DetailItem label="Fit calendrier" value={offer.calendarFit} />
        </dl>
        {offer.skills.length ? <div className="skill-list" aria-label="Compétences clés">{offer.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : null}
      </section>

      <section className="detail-section">
        <h2>Décision & suivi</h2>
        <dl className="detail-grid">
          <DetailItem label="Statut candidature" value={offer.applicationStatus} />
          <DetailItem label="Prochaine action" value={offer.nextAction ?? offer.actionLevel} />
          <DetailItem label="Fraîcheur" value={offer.freshness} />
          <DetailItem label="Vérifié le" value={offer.verifiedAt} />
          <DetailItem label="Source" value={offer.sourceQuality} />
          <DetailItem label="Confiance" value={offer.confidence} />
        </dl>
      </section>

      {offer.relevance || offer.gaps ? <section className="detail-section"><h2>Analyse</h2>{offer.relevance ? <p>{offer.relevance}</p> : null}{offer.gaps ? <p className="detail-note">À confirmer : {offer.gaps}</p> : null}</section> : null}

      <div className="offer-detail__cta">
        {offer.applicationUrl ? (
          <a className="button button--primary button--large" href={offer.applicationUrl} target="_blank" rel="noreferrer">Candidater ↗</a>
        ) : (
          <button className="button button--primary button--large" disabled title="Aucun lien direct disponible">Lien de candidature indisponible</button>
        )}
      </div>
    </article>
  );
}
