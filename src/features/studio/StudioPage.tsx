import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';
import { loadApplicationDossier, prepareApplicationDossier } from '../applications/applicationDossiers';
import { publicProjectCatalog } from '../applications/publicProjectCatalog';
import type { CvLanguage } from '../cv/cvStorage';
import { useAuth } from '../../auth/useAuth';
import { saveApplicationStatus } from '../../api/applications';
import { EDF_EOD_DOSSIER_ID, prepareEdfEodDossier, buildEdfEodCv, buildEdfEodLetter } from '../applications/edfEodDossier';
import { edfSavedOffer } from '../applications/edfSavedOffer';
import { THALES_DATA_DOSSIER_ID, prepareThalesDataDossier, buildThalesDataCv, buildThalesDataLetter } from '../applications/thalesDataDossier';
import { thalesSavedOffer } from '../applications/thalesSavedOffer';
import { useOfferActions } from '../offers/offerActions';
import { saveApplicationDossier } from '../applications/applicationDossiers';

export function StudioPage() {
  const [params] = useSearchParams();
  const { token } = useAuth();
  const actions = useOfferActions();
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const offerId = params.get('offer');
  const { data, loading, retry } = useOffers();
  const [language, setLanguage] = useState<CvLanguage>('FR');
  const [preparedId, setPreparedId] = useState<string | null>(null);
  const [chosenOfferId, setChosenOfferId] = useState('');
  const activeOfferId = offerId || chosenOfferId;
  const offer = activeOfferId === EDF_EOD_DOSSIER_ID ? edfSavedOffer
    : activeOfferId === THALES_DATA_DOSSIER_ID ? thalesSavedOffer
    : activeOfferId ? data?.offers.find(item => item.id === activeOfferId) : undefined;
  const selectedOfferId = offerId || chosenOfferId;

  // Each offer and language has its own saved, reviewable dossier.
  useEffect(() => {
    if (!offer) return;
    if (offer.id === EDF_EOD_DOSSIER_ID) prepareEdfEodDossier(language);
    else if (offer.id === THALES_DATA_DOSSIER_ID) prepareThalesDataDossier(language);
    else prepareApplicationDossier(offer, language);
    localStorage.setItem('monstage:application-review:v1', JSON.stringify({
      offerId: offer.id, company: offer.company, title: offer.title,
      language, state: 'awaiting_review', documentsVersion: 5,
      preparedAt: new Date().toISOString(),
    }));
    setPreparedId(offer.id + ':' + language);
  }, [offer?.id, language]);

  function prepare() {
    if (!offer) return;
    // Explicit regeneration only: preserve existing edited dossiers on normal navigation.
    if (offer.id === EDF_EOD_DOSSIER_ID) {
      const dossier = prepareEdfEodDossier(language);
      saveApplicationDossier({ ...dossier, cv: buildEdfEodCv(language), letter: buildEdfEodLetter(language) });
    } else if (offer.id === THALES_DATA_DOSSIER_ID) {
      const dossier = prepareThalesDataDossier(language);
      saveApplicationDossier({ ...dossier, cv: buildThalesDataCv(language), letter: buildThalesDataLetter(language) });
    } else prepareApplicationDossier(offer, language, true);
    localStorage.setItem('monstage:application-review:v1', JSON.stringify({
      offerId: offer.id, company: offer.company, title: offer.title,
      language, state: 'awaiting_review', documentsVersion: 5,
      preparedAt: new Date().toISOString(),
    }));
    setPreparedId(offer.id + ':' + language);
  }

  const dossier = offer ? loadApplicationDossier(offer.id, language) : null;

  async function confirmSent() {
    if (!offer || statusBusy) return;
    if (!window.confirm('Confirmer que cette candidature a réellement été envoyée ? Aucun document ne sera envoyé par MonStage.')) return;
    setStatusBusy(true);
    setStatusNotice('');
    try {
      if (offer.id === EDF_EOD_DOSSIER_ID || offer.id === THALES_DATA_DOSSIER_ID) {
        actions.setStage(offer.id, 'application');
        setStatusNotice('Candidature marquée envoyée dans le suivi local de MonStage.');
      } else {
        await saveApplicationStatus(token, offer.id, 'Candidature envoyée');
        retry();
        setStatusNotice('Candidature envoyée enregistrée dans la base. Consultez « Mes offres, rubrique Envoyées » pour le suivi.');
      }
    } catch (error) {
      setStatusNotice(error instanceof Error ? 'Statut non enregistré : ' + error.message : 'Statut non enregistré.');
    } finally { setStatusBusy(false); }
  }

  return (
    <section className="page studio-page">
      <h1 className="sr-only">Studio</h1>
      {!offerId && data?.offers?.length ? <div className="card" style={{ padding: 20, marginBottom: 20 }}><label>Choisir une offre à préparer <select aria-label="Choisir une offre à préparer" value={chosenOfferId} onChange={event => setChosenOfferId(event.target.value)}><option value="">Sélectionner une offre</option>{data.offers.filter(item => item.applicationStatus === 'À candidater').slice(0, 150).map(item => <option key={item.id} value={item.id}>{item.company} — {item.title}</option>)}</select></label></div> : null}
      {selectedOfferId ? (
        <section className="card" aria-label="Préparation de candidature" style={{ padding: 24, marginBottom: 24 }}>
          {loading && !data ? <p>Chargement de l’offre…</p> : offer ? (
            <>
              <h2 style={{ marginBottom: 8 }}>{offer.company} — {offer.title}</h2>
              <p>{offer.city} · {offer.duration || 'Durée à confirmer'} · {offer.skills.slice(0, 5).join(', ')}</p>
              <p>Régénérer remplace les brouillons de cette offre et de cette langue.</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <label>Langue <select value={language} onChange={event => setLanguage(event.target.value as CvLanguage)}><option value="FR">Français</option><option value="EN">English</option></select></label>
                <button className="button button--primary" type="button" onClick={prepare}>Régénérer CV + lettre pour cette offre</button>
              </div>
              {preparedId === offer.id + ':' + language ? (
                <div role="status" style={{ marginTop: 18 }}>
                  {dossier?.selectionReasons?.length ? <p><strong>Projets sélectionnés :</strong> {dossier.selectionReasons.join(' · ')}</p> : null}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link className="button button--secondary" to={`/cv?offer=${encodeURIComponent(offer.id)}&language=${language}`}>Examiner le CV</Link>
                    <Link className="button button--secondary" to={`/cl?offer=${encodeURIComponent(offer.id)}&language=${language}`}>Examiner la lettre</Link>
                    <Link className="button button--secondary" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Dossier et PDF</Link>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className="button button--primary" type="button" disabled={statusBusy} onClick={() => void confirmSent()}>{statusBusy ? 'Enregistrement…' : "J'ai envoyé cette candidature"}</button>
                    {statusNotice ? <p role="status">{statusNotice}</p> : null}
                    {statusNotice.startsWith('Candidature envoyée enregistrée') ? <div className="workspace-actions"><Link className="button button--secondary" to="/shortlist">Voir le suivi dans Mes offres</Link><Link className="button button--secondary" to={`/workspace?offer=${encodeURIComponent(offer.id)}`}>Retour au dossier</Link></div> : null}
                  </div>
                </div>
              ) : null}
            </>
          ) : <p>Cette offre n’est pas disponible dans la liste actuelle. Aucune donnée existante n’a été modifiée.</p>}
        </section>
      ) : null}
      <details className="card" style={{ padding: 18, marginBottom: 20 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Catalogue GitHub vérifié — {publicProjectCatalog.length} projets publics et laboratoires</summary>
        <ul style={{ paddingLeft: 20 }}>
          {publicProjectCatalog.map(entry => <li key={entry.id} style={{ marginBottom: 9 }}>
            <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.cv[language].name}</a>
            <span style={{ marginLeft: 8, opacity: .75, fontSize: 12 }}>{entry.tags.slice(0, 4).join(' · ')}</span>
          </li>)}
        </ul>
      </details>
      <div className="studio-grid">
        <article className="card studio-card">
          <div className="studio-card__icon" aria-hidden="true">CV</div>
          <div><h2>CV</h2></div>
          <Link className="button button--secondary" to={offer ? `/cv?offer=${encodeURIComponent(offer.id)}&language=${language}` : '/cv'} aria-label="Open CV Studio">Ouvrir le CV</Link>
        </article>
        <article className="card studio-card">
          <div className="studio-card__icon" aria-hidden="true">CL</div>
          <div><h2>Cover Letter</h2></div>
          <Link className="button button--secondary" to={offer ? `/cl?offer=${encodeURIComponent(offer.id)}&language=${language}` : '/cl'} aria-label="Open Cover Letter Studio">Ouvrir la lettre</Link>
        </article>
      </div>
    </section>
  );
}
