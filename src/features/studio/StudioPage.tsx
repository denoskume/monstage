import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';
import { tailorCvForOffer, tailorLetterForOffer } from '../applications/tailoredPackage';
import { saveCvDraft, type CvLanguage } from '../cv/cvStorage';
import { saveCoverLetter } from '../cl/clStorage';

export function StudioPage() {
  const [params] = useSearchParams();
  const offerId = params.get('offer');
  const { data, loading } = useOffers();
  const offer = offerId ? data?.offers.find(item => item.id === offerId) : undefined;
  const [language, setLanguage] = useState<CvLanguage>('FR');
  const [preparedId, setPreparedId] = useState<string | null>(null);

  function prepare() {
    if (!offer) return;
    saveCvDraft(tailorCvForOffer(offer, language));
    saveCoverLetter(tailorLetterForOffer(offer, language));
    localStorage.setItem('monstage:application-review:v1', JSON.stringify({
      offerId: offer.id, company: offer.company, title: offer.title, language,
      state: 'awaiting_review', preparedAt: new Date().toISOString(),
    }));
    setPreparedId(offer.id + ':' + language);
  }

  return (
    <section className="page studio-page">
      <div className="page-header">
        <div>
          <h1>Studio</h1>
          <p>Prépare et relis tes documents dans les éditeurs officiels de MonStage, avant tout envoi.</p>
        </div>
      </div>
      {offerId ? (
        <section className="card" aria-label="Préparation de candidature" style={{ padding: 24, marginBottom: 24 }}>
          {loading && !data ? <p>Chargement de l’offre…</p> : offer ? (
            <>
              <h2 style={{ marginBottom: 8 }}>{offer.company} — {offer.title}</h2>
              <p>{offer.city} · {offer.duration || 'Durée à confirmer'} · {offer.skills.slice(0, 5).join(', ')}</p>
              <p>Les brouillons restent modifiables. La préparation ne transmet aucun document au recruteur.</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <label>Langue <select value={language} onChange={event => setLanguage(event.target.value as CvLanguage)}><option value="FR">Français</option><option value="EN">English</option></select></label>
                <button className="button button--primary" type="button" onClick={prepare}>Préparer CV + lettre dans Studio</button>
              </div>
              {preparedId === offer.id + ':' + language ? (
                <div role="status" style={{ marginTop: 18 }}>
                  <p><strong>Brouillons prêts à relire.</strong> Vérifie les dates, chaque compétence, l’en-tête centré et les quatre paragraphes. Aucun envoi sans ton accord explicite.</p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link className="button button--secondary" to="/cv">Examiner le CV →</Link>
                    <Link className="button button--secondary" to="/cl">Examiner la lettre →</Link>
                  </div>
                </div>
              ) : null}
            </>
          ) : <p>Cette offre n’est pas disponible dans la liste actuelle. Aucune donnée existante n’a été modifiée.</p>}
        </section>
      ) : null}
      <div className="studio-grid">
        <Link to="/cv" className="card studio-card" aria-label="Open CV Studio">
          <div className="studio-card__icon" aria-hidden="true">CV</div>
          <div><h2>CV</h2><p>Prepare independent French and English CV versions, tailor the content and export a clean ATS-friendly PDF.</p></div>
          <span className="studio-card__arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/cl" className="card studio-card" aria-label="Open Cover Letter Studio">
          <div className="studio-card__icon" aria-hidden="true">CL</div>
          <div><h2>Cover Letter</h2><p>Write and adapt native French and English cover letters with independent templates and direct PDF export.</p></div>
          <span className="studio-card__arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
