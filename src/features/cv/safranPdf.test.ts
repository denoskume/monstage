import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { defaultCvFr } from './cvStorage';
import { publicProjectCatalog } from '../applications/publicProjectCatalog';
import { buildCvPdfBytes } from './pdfExport';

describe('Safran.AI one-page CV export', () => {
  it('fits a targeted dossier with two four-bullet projects onto one A4 page', async () => {
    const draft = structuredClone(defaultCvFr);
    draft.email = 'kamenan.kume@eleves.ec-nantes.fr';
    draft.headline = 'Stage de fin d’études — Machine Learning & Computer Vision';
    draft.summary = 'Étudiant en dernière année de MSc à Centrale Nantes, recherche un stage de six mois dès février 2027 en Machine Learning et Computer Vision.';
    draft.projects = ['background','clap'].map(id => {
      const entry = publicProjectCatalog.find(p => p.id === id);
      if (!entry) throw new Error('Missing verified project '+id);
      return entry.cv.FR;
    });
    draft.experience = draft.experience.map(x => ({...x,bullets:x.bullets.slice(0,3)}));
    draft.leadership = draft.leadership.map(x => ({...x,bullets:x.bullets.slice(0,2)}));
    draft.sectionOrder = ['education','projects','experience','skills','languages','leadership','interests'];
    const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(pdf.getPageCount()).toBe(1);
  });
});
