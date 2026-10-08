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

function subjectLine(draft: CoverLetterDraft): string {
  if (draft.language === 'FR') return `Objet : Candidature au stage ${draft.internshipTitle || '[INTITULÉ DU STAGE]'}`;
  return `Re: Application for ${draft.internshipTitle || '[INTERNSHIP TITLE]'}`;
}

export function ClStudioPage() {
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
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = coverLetterPdfFileName(draft);
      anchor.style.display = 'none';

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
      setDownloadError('');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to download the cover letter PDF.');
    }
  }

  const recipientCompany = [draft.recipientRole, draft.company].filter(Boolean).join(' - ');

  return (
    <section className="page cl-studio-page">
      <div className="page-header cl-studio-header">
        <div>
          <h1>CL Studio</h1>
          <p>Keep the structure clear and specific: You → Me → Us → Conclusion. Avoid generic formulas; every paragraph should connect directly to the offer.</p>
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
              <label>Recipient<input value={draft.recipientName} onChange={(e) => patch('recipientName', e.target.value)} placeholder="M. / Mme Nom" /></label>
              <label>Recipient role<input value={draft.recipientRole} onChange={(e) => patch('recipientRole', e.target.value)} /></label>
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
                ? ['Vous — Pourquoi cette entreprise', 'Moi — Preuves concrètes', 'Nous — Contribution + apprentissage', 'Conclusion — Invitation à échanger']
                : ['You — Why this company', 'Me — Concrete evidence', 'Us — Contribution + learning', 'Conclusion — Invite a discussion'];
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

        <article className="cl-preview cl-preview--template">
          <header className="cl-preview__sender cl-preview__sender--right">
            <strong>{draft.signer}</strong>
            <span>Nantes, France</span>
            <span>+33 6 62 91 94 68</span>
            <span>denoskume@yahoo.com</span>
            <span>github.com/denoskume</span>
            <span>linkedin.com/in/denoskume</span>
          </header>

          <div className="cl-preview__recipient">
            {draft.recipientName ? <strong>{draft.language === 'FR' ? `À l’attention de ${draft.recipientName}` : draft.recipientName}</strong> : null}
            {recipientCompany ? <strong>{recipientCompany}</strong> : null}
            {draft.recipientLocation ? <span>{draft.recipientLocation}</span> : null}
          </div>

          {draft.date ? <p className="cl-preview__date">{draft.language === 'FR' ? `Nantes, le ${draft.date}` : `Nantes, ${draft.date}`}</p> : null}

          <p className="cl-preview__subject"><strong>{subjectLine(draft)}</strong></p>

          <p>{draft.greeting}</p>

          {draft.paragraphs.filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}

          <div className="cl-preview__closing">
            <p>{draft.closing}</p>
            {draft.signatureDataUrl ? <img className="cl-preview__signature" src={draft.signatureDataUrl} alt="Signature" /> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
