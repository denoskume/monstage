import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';
import { getOfferPlan, targetCompany } from '../../../shared/searchScope';
import { sectors, dateKey, wasSent } from '../targets/targets';

const CALL_NOTES_KEY = 'monstage:company-call-notes:v1';
function readCallNotes(): Record<string, string> {
  try {
    const data = JSON.parse(localStorage.getItem(CALL_NOTES_KEY) || '{}') as unknown;
    return data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string,string> : {};
  } catch { return {}; }
}
const dossierLink = (id: string) =>
  id.startsWith('prospection:')
    ? '/prospection?lead=' + encodeURIComponent(id.slice('prospection:'.length))
    : '/workspace?offer=' + encodeURIComponent(id);

export function CompanyBriefs({ offers, sectorId }: { offers: InternshipOffer[]; sectorId?: string }) {
  const [notes, setNotes] = useState(readCallNotes);
  const selected = sectorId ? sectors.filter(sector => sector.id === sectorId) : sectors;
  const companies = selected.flatMap(sector => sector.companies.map(company => ({
    name: company[0], career: company[1], sector: sector.name,
  })));
  function saveNote(company: string, text: string) {
    setNotes(previous => {
      const next = {...previous, [company]: text};
      try { localStorage.setItem(CALL_NOTES_KEY, JSON.stringify(next)); } catch { /* Private mode or full storage */ }
      return next;
    });
  }
  return <section className="company-portfolio" aria-label="Fiches des 15 entreprises ciblées">
    <div className="company-portfolio__intro">
      <h2>{sectorId ? 'Fiches entreprises' : '15 entreprises · deux plans'}</h2>
      <p>Une entreprise à connaître, plusieurs candidatures A / B possibles. Les notes servent à identifier immédiatement un appel de recruteur.</p>
    </div>
    <div className="company-portfolio__grid">
      {companies.map(company => {
        const companyOffers = offers.filter(offer => targetCompany(offer.company) === company.name && getOfferPlan(offer) !== null);
        const planA = companyOffers.filter(offer => getOfferPlan(offer) === 'A');
        const planB = companyOffers.filter(offer => getOfferPlan(offer) === 'B');
        const sent = companyOffers.filter(wasSent);
        return <article className="card company-portfolio__card" key={company.name}>
          <div className="company-portfolio__top"><h3>{company.name}</h3><span>{company.sector}</span></div>
          <div className="company-portfolio__numbers">
            <span>Plan A <strong>{planA.length}</strong></span>
            <span>Plan B <strong>{planB.length}</strong></span>
            <span>Envoyées <strong>{sent.length}</strong></span>
          </div>
          <details className="company-portfolio__details">
            <summary>Fiche entreprise et préparation d’appel</summary>
            <p><strong>Entreprise :</strong> {company.name}</p>
            <p><strong>Objectif :</strong> stage de six mois à partir de janvier/février 2027</p>
            <h4>Mes candidatures</h4>
            {companyOffers.length === 0 ? <p>Aucune candidature enregistrée pour cette entreprise.</p> : <ul>{companyOffers.map(offer => <li key={offer.id}>
              <span><strong>Plan {getOfferPlan(offer)}</strong> · {offer.title} · {offer.applicationStatus || 'À candidater'}{dateKey(offer.appliedAt) ? ' · ' + dateKey(offer.appliedAt) : ''}</span>
              <Link to={dossierLink(offer.id)}>Voir le dossier</Link>
            </li>)}</ul>}
            <label className="company-portfolio__notes">
              Repères pour un appel (équipe, contact, missions, dernière démarche)
              <textarea rows={3} value={notes[company.name] || ''} onChange={event => saveNote(company.name, event.target.value)} placeholder="Ex. Candidature Data Analyst, équipe maintenance, contact RH, date de l’envoi…" />
            </label>
            <small>Notes personnelles sauvegardées dans ce navigateur.</small>
          </details>
          <div className="company-portfolio__actions">
            <Link className="button button--primary" to={'/prospection?company=' + encodeURIComponent(company.name) + '&plan=A'}>Candidature Plan A</Link>
            <Link className="button button--secondary" to={'/prospection?company=' + encodeURIComponent(company.name) + '&plan=B'}>Candidature Plan B</Link>
            <a className="button button--secondary" href={'https://' + company.career} target="_blank" rel="noopener noreferrer">Site carrières</a>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
