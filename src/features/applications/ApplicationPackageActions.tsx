import { useState } from 'react';
import type { InternshipOffer } from '../../api/contract';
import { tailorCvForOffer, tailorLetterForOffer } from './tailoredPackage';
import { buildCvPdfBytes } from '../cv/pdfExport';
import { buildCoverLetterPdfBytes } from '../cl/pdfExport';
import type { CvLanguage } from '../cv/cvStorage';

function downloadPdf(bytes: Uint8Array, filename: string) {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function ApplicationPackageActions({ offer }: { offer: InternshipOffer }) {
  const [language, setLanguage] = useState<CvLanguage>('FR');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function generate() {
    setBusy(true);
    setError('');
    try {
      const cv = tailorCvForOffer(offer, language);
      const letter = tailorLetterForOffer(offer, language);
      const [cvBytes, letterBytes] = await Promise.all([buildCvPdfBytes(cv), buildCoverLetterPdfBytes(letter)]);
      if (!cvBytes.length || !letterBytes.length) throw new Error('PDF generation returned an empty document.');
      const slug = offer.company.replace(/[^a-z0-9]+/gi, '_').slice(0, 45) || 'Entreprise';
      downloadPdf(cvBytes, 'Denos_Kume_CV_' + slug + '_' + language + '.pdf');
      downloadPdf(letterBytes, 'Denos_Kume_Lettre_' + slug + '_' + language + '.pdf');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Document generation failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="detail-section" aria-label="Dossier de candidature adapté">
      <h2>Dossier adapté à cette offre</h2>
      <p>CV et lettre personnalisés à partir de ton profil et des informations vérifiées de l’offre. Les expériences et résultats ne sont jamais inventés.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label>Langue <select value={language} onChange={(e) => setLanguage(e.target.value as CvLanguage)}><option value="FR">Français</option><option value="EN">English</option></select></label>
        <button type="button" className="button button--secondary" disabled={busy} onClick={generate}>{busy ? 'Génération…' : 'Télécharger CV + lettre adaptés'}</button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <p><small>La soumission à l’employeur reste distincte : ce bouton ne prétend pas avoir envoyé la candidature.</small></p>
    </section>
  );
}
