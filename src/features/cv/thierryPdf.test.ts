import { describe, expect, test } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { freshCvDraft, cvTemplateOptions } from './cvStorage';
import { buildCvPdfBytes } from './pdfExport';
import { thierryEntries, THIERRY_STYLE } from './thierryTemplate';

describe('Thierry KUME CV template', () => {
  test('is an additional template and preserves the seven originals', () => {
    expect(cvTemplateOptions.find(option => option.id === 'thierry')).toBeDefined();
    expect(cvTemplateOptions).toHaveLength(9);
    expect(THIERRY_STYLE.blue).toBe('#0070C0');
    expect(THIERRY_STYLE.gray).toBe('#BFBFBF');
    expect(THIERRY_STYLE.splitX).toBe(155.18);
  });

  test('produces an A4 one-page PDF from the current editable CV', async () => {
    const draft = freshCvDraft('FR', 'B');
    draft.template = 'thierry';
    draft.summary = 'Stage de six mois, reporting industriel et qualité des données.';
    draft.thierryShowProfile = true;
    draft.thierryTools = 'Python\nSQL\nPower BI';
    draft.experience[0].mission = 'Nettoyer les données et contrôler les indicateurs.';
    draft.experience[0].acquired = 'Python, SQL et esprit d’équipe.';
    draft.experience[0].results = 'Tableaux de bord livrés.';
    const doc = await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getWidth()).toBeCloseTo(595.32, 1);
    expect(doc.getPage(0).getHeight()).toBeCloseTo(841.92, 1);
    expect(doc.getTitle()).toContain('Thierry KUME');
  });

  test('uses explicit mission, acquired skills, and result without rewriting saved bullets', () => {
    const draft = freshCvDraft('FR', 'B');
    const before = [...draft.experience[0].bullets];
    draft.experience[0].mission = 'Contrôler la source.';
    draft.experience[0].acquired = 'SQL et vérification.';
    draft.experience[0].results = 'Rapport validé.';
    const row = thierryEntries(draft).find(e => e.id === draft.experience[0].id);
    expect(row).toMatchObject({
      mission: 'Contrôler la source.',
      acquired: 'SQL et vérification.',
      results: 'Rapport validé.',
    });
    expect(draft.experience[0].bullets).toEqual(before);
  });
});
