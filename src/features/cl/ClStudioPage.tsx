import { useAuth } from '../../auth/useAuth';
import { SAFRAN_AI_DOSSIER_ID, prepareSafranAiDossier } from '../applications/safranAiDossier';
import { useEffect, useRef } from 'react';
import { loadApplicationDossier, updateApplicationLetter } from '../applications/applicationDossiers';
import { useOffers } from '../../hooks/useOffers';
import { recipientForOffer, tailorLetterForOffer } from '../applications/tailoredPackage';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import {
  freshCoverLetter,
  loadCoverLetter,
  resetCoverLetter,
  saveCoverLetter,
  type CoverLetterDraft,
  type CoverLetterLanguage,
} from './clStorage';
import { buildCoverLetterPdfBytes, coverLetterPdfFileName } from './pdfExport';
import { saveApplicationDocument } from '../workspace/documentVault';

function subjectLine(draft: CoverLetterDraft): string {
  if (draft.language === 'FR') return `Objet : ${/^Candidature/i.test(draft.internshipTitle) ? draft.internshipTitle : 'Candidature — ' + (draft.internshipTitle || '[INTITULÉ DU STAGE]')}`;
  return `Re: Application for ${draft.internshipTitle || '[INTERNSHIP TITLE]'}`;
}

export function ClStudioPage() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const activeReview = (() => {
    try {
      const review = JSON.parse(localStorage.getItem('monstage:application-review:v1') || 'null');
      return review?.state === 'awaiting_review' ? review : null;
    } catch { return null; }
  })();
  const offerParam = params.get('offer') || activeReview?.offerId || null;
  const languageParam: CoverLetterLanguage = params.get('language') === 'EN' ? 'EN' :
    params.get('language') === 'FR' ? 'FR' : activeReview?.language === 'EN' ? 'EN' : 'FR';
  const { data, loading: offersLoading } = useOffers();
  const job = offerParam ? data?.offers.find(item => item.id === offerParam) : undefined;
  const isSafranSpontaneous = offerParam === SAFRAN_AI_DOSSIER_ID;
  const [draft, setDraft] = useState<CoverLetterDraft>(() => loadCoverLetter());
  const [saved, setSaved] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const hydratedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!offerParam) return;
    if (isSafranSpontaneous) {
      setDraft(prepareSafranAiDossier(languageParam).letter);
      setDownloadError('');
      return;
    }
    if (!job) {
      if (!offersLoading) setDownloadError('Offre introuvable : la lettre existante ne peut pas être présentée comme adaptée.');
      return;
    }
    const key = job.id + ':' + languageParam;
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;
    let review: { offerId?: string; company?: string; title?: string; language?: string; documentsVersion?: number } | null = null;
    try { review = JSON.parse(localStorage.getItem('monstage:application-review:v1') || 'null'); } catch { /* ignore stale metadata */ }
    const stored = loadCoverLetter();
    const sameJob = review?.offerId === job.id && review?.company === job.company &&
      review?.title === job.title && review?.language === languageParam &&
      review?.documentsVersion === 4 && stored.company === job.company &&
      stored.internshipTitle === job.title && stored.language === languageParam;
    const prepared = loadApplicationDossier(job.id, languageParam)?.letter || (sameJob ? stored : tailorLetterForOffer(job, languageParam));
    // Upgrade only the addressee of already prepared letters. Never overwrite
    // user-edited paragraphs, company, signature, or verified named contacts.
    const genericRecipient = !prepared.recipientName.trim() &&
      (!prepared.recipientRole.trim() ||
        /^(?:À l’attention de l’équipe de recrutement|À l’attention du service recrutement|Recruitment Team|Talent Acquisition Team)$/i.test(prepared.recipientRole.trim()));
    const tailoredRecipient = recipientForOffer(job, languageParam);
    const shouldRefreshAddressee = sameJob && genericRecipient &&
      (prepared.recipientRole !== tailoredRecipient.recipientRole ||
       prepared.team !== tailoredRecipient.team);
    if (shouldRefreshAddressee) {
      prepared.recipientRole = tailoredRecipient.recipientRole;
      prepared.team = tailoredRecipient.team;
      prepared.recipientLocation = tailoredRecipient.recipientLocation;
    }
    if (!sameJob || shouldRefreshAddressee) {
      saveCoverLetter(prepared);
      localStorage.setItem('monstage:application-review:v1', JSON.stringify({
        offerId: job.id, company: job.company, title: job.title, language: languageParam,
        documentsVersion: 4, state: 'awaiting_review', preparedAt: new Date().toISOString(),
      }));
    }
    setDraft(prepared);
    setDownloadError('');
    setSaved(false);
  }, [job?.id, offerParam, languageParam, offersLoading, isSafranSpontaneous]);

  function patch<K extends keyof CoverLetterDraft>(key: K, value: CoverLetterDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function switchLanguage(language: CoverLetterLanguage) {
    const next = isSafranSpontaneous ? prepareSafranAiDossier(language).letter : job ? tailorLetterForOffer(job, language) : freshCoverLetter(language);
    setDraft(next);
    if (job) {
      saveCoverLetter(next);
      hydratedKey.current = job.id + ':' + language;
      localStorage.setItem('monstage:application-review:v1', JSON.stringify({
        offerId: job.id, company: job.company, title: job.title, language,
        documentsVersion: 4, state: 'awaiting_review', preparedAt: new Date().toISOString(),
      }));
    }
    setSaved(false);
  }

  function save() {
    if (isSafranSpontaneous) updateApplicationLetter(SAFRAN_AI_DOSSIER_ID, draft.language, draft);
    else if (job) updateApplicationLetter(job.id, draft.language, draft);
    else saveCoverLetter(draft);
    setSaved(true);
  }

  function reset() {
    if (isSafranSpontaneous) {
      setDraft(prepareSafranAiDossier(draft.language).letter);
    } else if (job) {
      const next = tailorLetterForOffer(job, draft.language);
      saveCoverLetter(next);
      setDraft(next);
    } else {
      setDraft(resetCoverLetter(draft.language));
    }
    setSaved(false);
  }

  function personalizeRecipient() {
    if (!job) return;
    const recipient = recipientForOffer(job, draft.language);
    setDraft(current => ({ ...current, ...recipient }));
    setSaved(false);
  }

  function updateParagraph(index: number, value: string) {
    patch('paragraphs', draft.paragraphs.map((paragraph, current) => current === index ? value : paragraph));
  }

  function uploadSignature(file: File | null) {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setDownloadError('Signature must be a PNG or JPG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setDownloadError('Signature image must be 2 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      patch('signatureDataUrl', String(reader.result || ''));
      setDownloadError('');
    };
    reader.onerror = () => setDownloadError('Unable to read the signature image.');
    reader.readAsDataURL(file);
  }

  async function downloadPdf() {
    try {
      const bytes = await buildCoverLetterPdfBytes(draft);
      const pdfBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      let archiveError = '';
      if (offerParam) {
        try { await saveApplicationDocument(offerParam, 'letter', new File([blob], coverLetterPdfFileName(draft), { type: 'application/pdf' }), token, draft.company); }
        catch (error) { archiveError = error instanceof Error ? error.message : 'Erreur Google Drive'; }
      }
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = coverLetterPdfFileName(draft);
      anchor.style.display = 'none';

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
      setDownloadError(archiveError ? 'PDF téléchargé, mais non enregistré dans Google Drive : ' + archiveError : '');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to download the cover letter PDF.');
    }
  }


  return (
    <section className="page cl-studio-page">
      <div className="page-header cl-studio-header">
        <div>
          <h1>CL Studio</h1>
          <p>Use exactly four paragraphs: Who you are + what you want → Why them → Why you → Interview close. Keep each paragraph short, specific and natural.</p>
        </div>
        <div className="cl-studio-actions">
          <div className="cl-language-toggle" aria-label="Cover letter language">
            <button type="button" className={draft.language === 'FR' ? 'is-active' : ''} onClick={() => switchLanguage('FR')}>FR</button>
            <button type="button" className={draft.language === 'EN' ? 'is-active' : ''} onClick={() => switchLanguage('EN')}>EN</button>
          </div>
          <button className="button button--secondary" type="button" onClick={reset}>Reset</button>
          <button className="button button--secondary" type="button" onClick={save}>{saved ? 'Saved' : 'Save'}</button>
          <button className="button button--primary cl-download-button" type="button" onClick={downloadPdf} aria-label="Download cover letter PDF" title="Download cover letter PDF">⇩</button>
        </div>
      </div>

      {(() => { try { const review = JSON.parse(localStorage.getItem('monstage:application-review:v1') || 'null'); return review?.state === 'awaiting_review' && review?.language === draft.language && review?.company === draft.company && review?.title === draft.internshipTitle ? <p role="status" className="workspace-note"><strong>Lettre pour {review.company} — {review.title}.</strong> Vérifie les quatre paragraphes, la signature et l’en-tête. Aucun envoi sans ton OK.</p> : null; } catch { return null; } })()}
      {downloadError ? <div className="native-application-result native-application-result--error">{downloadError}</div> : null}

      <div className="cl-studio-layout">
        <aside className="cl-editor card">
          <section className="cv-editor-section">
            <h2>En-tête — vos coordonnées (modifiable)</h2>
            <div className="cv-editor-grid">
              <label>Nom et prénom<input value={draft.signer} onChange={(e) => patch('signer', e.target.value)} /></label>
              <label>Ville<input value={draft.senderLocation ?? 'Nantes, France'} onChange={(e) => patch('senderLocation', e.target.value)} /></label>
              <label>Téléphone<input value={draft.senderPhone ?? '+33 6 62 91 94 68'} onChange={(e) => patch('senderPhone', e.target.value)} /></label>
              <label>Adresse e-mail<input type="email" value={draft.senderEmail ?? 'kamenan.kume@eleves.ec-nantes.fr'} onChange={(e) => patch('senderEmail', e.target.value)} /></label>
              <label>GitHub<input value={draft.senderGithub ?? 'github.com/denoskume'} onChange={(e) => patch('senderGithub', e.target.value)} /></label>
              <label>LinkedIn<input value={draft.senderLinkedin ?? 'linkedin.com/in/denoskume'} onChange={(e) => patch('senderLinkedin', e.target.value)} /></label>
            </div>
          </section>
          <section className="cv-editor-section">
            <h2>Application details</h2>
            {job ? <button type="button" className="button button--secondary" onClick={personalizeRecipient}>Adapter le destinataire à cette offre</button> : null}
            <div className="cv-editor-grid">
              <label>Date<input value={draft.date} onChange={(e) => patch('date', e.target.value)} placeholder={draft.language === 'FR' ? '7 octobre 2026' : '7 October 2026'} /></label>
              <label>Company<input value={draft.company} onChange={(e) => patch('company', e.target.value)} /></label>
              <label>Recipient<input value={draft.recipientName} onChange={(e) => patch('recipientName', e.target.value)} placeholder="M. / Mme Nom" /></label>
              <label>Service ou fonction destinataire<input value={draft.recipientRole} onChange={(e) => patch('recipientRole', e.target.value)} /></label>
              <label>Équipe ou département<input value={draft.team} onChange={(e) => patch('team', e.target.value)} /></label>
              <label>Recipient location<input value={draft.recipientLocation} onChange={(e) => patch('recipientLocation', e.target.value)} /></label>
              <label>Internship title<input value={draft.internshipTitle} onChange={(e) => patch('internshipTitle', e.target.value)} /></label>
            </div>
          </section>

          <section className="cv-editor-section">
            <h2>Greeting</h2>
            <label>Greeting<input value={draft.greeting} onChange={(e) => patch('greeting', e.target.value)} /></label>
          </section>

          <section className="cv-editor-section">
            <h2>Letter body</h2>
            {draft.paragraphs.map((paragraph, index) => {
              const labels = draft.language === 'FR'
                ? ['1 — Qui êtes-vous + que recherchez-vous ?', '2 — Pourquoi cette entreprise ?', '3 — Pourquoi vous choisir ?', '4 — Invitation à échanger']
                : ['1 — Who are you + what do you want?', '2 — Why this company?', '3 — Why should they choose you?', '4 — Interview close'];
              return (
                <label key={index}>{labels[index] || `Paragraph ${index + 1}`}
                  <textarea rows={index === 3 ? 6 : 5} value={paragraph} onChange={(e) => updateParagraph(index, e.target.value)} />
                </label>
              );
            })}
          </section>

          <section className="cv-editor-section">
            <h2>Closing</h2>
            <label>Closing<input value={draft.closing} onChange={(e) => patch('closing', e.target.value)} /></label>
            <label>Signature image
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => uploadSignature(e.target.files?.[0] ?? null)} />
            </label>
            {draft.signatureDataUrl ? (
              <div className="cl-signature-editor">
                <img src={draft.signatureDataUrl} alt="Signature preview" />
                <button className="button button--secondary" type="button" onClick={() => patch('signatureDataUrl', '')}>Remove signature</button>
              </div>
            ) : null}
          </section>
        </aside>

        <article className={`cl-preview cl-preview--template ${draft.language === 'FR' ? 'cl-preview--fr' : 'cl-preview--en'}`}>
          <header className={`cl-preview__sender ${draft.language === 'FR' ? 'cl-preview__sender--left' : 'cl-preview__sender--right'}`}>
            <strong>{draft.signer}</strong>
            {(draft.senderLocation ?? 'Nantes, France') ? <span>{draft.senderLocation ?? 'Nantes, France'}</span> : null}
            {(draft.senderPhone ?? '+33 6 62 91 94 68') ? <span>{draft.senderPhone ?? '+33 6 62 91 94 68'}</span> : null}
            {(draft.senderEmail ?? 'kamenan.kume@eleves.ec-nantes.fr') ? <span>{draft.senderEmail ?? 'kamenan.kume@eleves.ec-nantes.fr'}</span> : null}
            {(draft.senderGithub ?? 'github.com/denoskume') ? <span>{draft.senderGithub ?? 'github.com/denoskume'}</span> : null}
            {(draft.senderLinkedin ?? 'linkedin.com/in/denoskume') ? <span>{draft.senderLinkedin ?? 'linkedin.com/in/denoskume'}</span> : null}
          </header>

          <div className="cl-preview__recipient">
            {draft.recipientName ? <strong>{draft.language === 'FR' ? `À l’attention de ${draft.recipientName}` : draft.recipientName}</strong> : null}
            {draft.company ? <strong>{draft.company}</strong> : null}
            {draft.team ? <span>{draft.team}</span> : null}
            {draft.recipientRole ? <span>{draft.recipientRole}</span> : null}
            {draft.recipientLocation ? <span>{draft.recipientLocation}</span> : null}
          </div>

          {draft.date ? <p className="cl-preview__date">{draft.language === 'FR' ? `Nantes, le ${draft.date}` : `Nantes, ${draft.date}`}</p> : null}

          <p className="cl-preview__subject"><strong>{subjectLine(draft)}</strong></p>

          <p>{draft.greeting}</p>

          {draft.paragraphs.filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}

          <div className="cl-preview__closing">
            <p>{draft.closing}</p>
            <div className={`cl-preview__signature-block cl-preview__signature-block--${draft.language === 'FR' ? 'right' : 'left'}`}>
              {draft.signatureDataUrl ? <img className="cl-preview__signature" src={draft.signatureDataUrl} alt="Signature" /> : null}
              <strong className="cl-preview__signer">{draft.signer}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
