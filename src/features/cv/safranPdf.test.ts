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
    draft.summary = 'En dernière année du MSc Data Science, Signal and Image Processing à Centrale Nantes, je recherche un stage de six mois dès février 2027 en Machine Learning et Computer Vision.';
    draft.projects = ['background','clap'].map(id => {
      const entry = publicProjectCatalog.find(p => p.id === id);
      if (!entry) throw new Error('Missing verified project '+id);
      return entry.cv.FR;
    });
    draft.education = draft.education.map(item => item.id === 'kju' ? {...item, details: item.details + '\\nActivité associative : Secrétaire, International Students Forum (2022–2024) — coordination d’activités culturelles et accueil de plus de 100 étudiants internationaux.'} : item);
    draft.leadership = [];
    draft.sectionOrder = ['education','projects','experience','skills','languages','interests'];
    expect(draft.projects.every(p => p.bullets.length === 4)).toBe(true);
    expect(draft.experience.every(e => e.bullets.length === 4)).toBe(true);
    const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(pdf.getPageCount()).toBe(1);
  });
});
