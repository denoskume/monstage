import { useState } from 'react';
import { apiBaseUrl } from '../../api/authClient';
import { useAuth } from '../../auth/useAuth';
import {
  freshCoverLetter,
  loadCoverLetter,
  resetCoverLetter,
  saveCoverLetter,
  type CoverLetterDraft,
  type CoverLetterLanguage,
} from './clStorage';

function subjectLine(draft: CoverLetterDraft): string {
  if (draft.language === 'FR') return `Objet : Candidature — ${draft.internshipTitle || '[INTITULÉ DU STAGE]'}`;
  return `Re: Application for ${draft.internshipTitle || '[INTERNSHIP TITLE]'}`;
}

export function ClStudioPage() {
  const { token } = useAuth();
  const [draft, setDraft] = useState<CoverLetterDraft>(() => loadCoverLetter());
  const [saved, setSaved] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  function patch<K extends keyof CoverLetterDraft>(key: K, value: CoverLetterDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function switchLanguage(language: CoverLetterLanguage) {
    const next = freshCoverLetter(language);
    setDraft(next);
    setSaved(false);
  }

  function save() {
    saveCoverLetter(draft);
    setSaved(true);
  }

  function reset() {
    setDraft(resetCoverLetter(draft.language));
    setSaved(false);
  }

  function updateParagraph(index: number, value: string) {
    patch('paragraphs', draft.paragraphs.map((paragraph, current) => current === index ? value : paragraph));
  }

  function downloadPdf() {
    if (!token) {
      setDownloadError('Authentication required for PDF download.');
      return;
    }

    try {
      const iframeName = 'monstage-cl-download-' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = apiBaseUrl() + '/api/cl/pdf';
      form.target = iframeName;
      form.style.display = 'none';

      const credential = document.createElement('input');
      credential.type = 'hidden';
      credential.name = 'credential';
      credential.value = token;

      const payload = document.createElement('input');
      payload.type = 'hidden';
      payload.name = 'draft';
      payload.value = JSON.stringify(draft);

      form.appendChild(credential);
      form.appendChild(payload);
      document.body.appendChild(form);
      form.submit();
      form.remove();
      window.setTimeout(() => iframe.remove(), 15_000);
      setDownloadError('');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to download the cover letter PDF.');
    }
  }

  const recipient = [draft.company, draft.team].filter(Boolean).join(' — ');

  return (
    <section className="page cl-studio-page">
      <div className="page-header cl-studio-header">
        <div>
          <h1>CL Studio</h1>
          <p>Create and tailor a clean cover letter directly in MonStage.</p>
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

      {downloadError ? <div className="native-application-result native-application-result--error">{downloadError}</div> : null}

      <div className="cl-studio-layout">
        <aside className="cl-editor card">
          <section className="cv-editor-section">
            <h2>Application details</h2>
            <div className="cv-editor-grid">
              <label>Date<input value={draft.date} onChange={(e) => patch('date', e.target.value)} placeholder={draft.language === 'FR' ? '7 octobre 2026' : '7 October 2026'} /></label>
              <label>Company<input value={draft.company} onChange={(e) => patch('company', e.target.value)} /></label>
              <label>Team<input value={draft.team} onChange={(e) => patch('team', e.target.value)} /></label>
              <label>Internship title<input value={draft.internshipTitle} onChange={(e) => patch('internshipTitle', e.target.value)} /></label>
            </div>
          </section>

          <section className="cv-editor-section">
            <h2>Greeting</h2>
            <label>Greeting<input value={draft.greeting} onChange={(e) => patch('greeting', e.target.value)} /></label>
          </section>

          <section className="cv-editor-section">
            <h2>Letter body</h2>
            {draft.paragraphs.map((paragraph, index) => (
              <label key={index}>Paragraph {index + 1}
                <textarea rows={index === 3 ? 6 : 5} value={paragraph} onChange={(e) => updateParagraph(index, e.target.value)} />
              </label>
            ))}
          </section>

          <section className="cv-editor-section">
            <h2>Closing</h2>
            <label>Closing<input value={draft.closing} onChange={(e) => patch('closing', e.target.value)} /></label>
            <label>Name<input value={draft.signer} onChange={(e) => patch('signer', e.target.value)} /></label>
          </section>
        </aside>

        <article className="cl-preview">
          <header className="cl-preview__sender">
            <strong>{draft.signer}</strong>
            <span>Nantes, France</span>
            <span>denoskume@yahoo.com</span>
          </header>

          <div className="cl-preview__meta">
            {draft.date ? <p>{draft.date}</p> : null}
            {recipient ? <p><strong>{recipient}</strong></p> : null}
            <p className="cl-preview__subject"><strong>{subjectLine(draft)}</strong></p>
          </div>

          <p>{draft.greeting}</p>

          {draft.paragraphs.filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}

          <div className="cl-preview__closing">
            <p>{draft.closing}</p>
            <strong>{draft.signer}</strong>
          </div>
        </article>
      </div>
    </section>
  );
}
