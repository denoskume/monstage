import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { InternshipOffer } from '../../api/contract';
import { tailorCvForOffer, tailorLetterForOffer } from './tailoredPackage';
import { saveCvDraft, type CvLanguage } from '../cv/cvStorage';
import { saveCoverLetter } from '../cl/clStorage';

export function ApplicationPackageActions({ offer }: { offer: InternshipOffer }) {
  const [language, setLanguage] = useState<CvLanguage>('FR');
  const [prepared, setPrepared] = useState(false);

  function prepareInStudio() {
    // Drafts stay in the existing CV and CL Studio. No PDFs are sent or exported here.
    saveCvDraft(tailorCvForOffer(offer, language));
    saveCoverLetter(tailorLetterForOffer(offer, language));
    localStorage.setItem('monstage:application-review:v1', JSON.stringify({
      offerId: offer.id, company: offer.company, title: offer.title,
      language, state: 'awaiting_review', preparedAt: new Date().toISOString(),
    }));
    setPrepared(true);
  }

  return (
    <section className="detail-section" aria-label="Préparer une candidature dans Studio">
      <h2>Préparer la candidature dans Studio</h2>
      <p>Le CV et la lettre sont préparés avec les modèles du Studio, puis restent modifiables. Aucun envoi sans ton accord explicite après relecture.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label>Langue <select value={language} onChange={(event) => { setLanguage(event.target.value as CvLanguage); setPrepared(false); }}><option value="FR">Français</option><option value="EN">English</option></select></label>
        <button className="button button--secondary" type="button" onClick={prepareInStudio}>Adapter dans Studio</button>
        {prepared ? <><Link className="button button--secondary" to={'/cv?language=' + language}>Vérifier le CV →</Link><Link className="button button--secondary" to={'/cl?language=' + language}>Vérifier la lettre →</Link></> : null}
      </div>
      {prepared ? <p role="status">Brouillons enregistrés dans Studio. En attente de ta vérification et de ton OK avant tout envoi.</p> : null}
    </section>
  );
}
