import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildCvPdfBytes } from '../cv/pdfExport';
import { buildThalesDataCv } from './thalesDataDossier';

describe('Thales R0343178 strategic CV', () => {
  for (const language of ['FR', 'EN'] as const) {
    it(`${language}: selects only a single, defensible MonStage project with four relevant bullets`, () => {
      const cv = buildThalesDataCv(language);
      expect(cv.projects).toHaveLength(1);
      expect(cv.projects[0].id).toBe('monstage');
      expect(cv.projects[0].bullets).toHaveLength(4);
      expect(cv.projects[0].bullets.every(bullet => bullet.trim().length > 50)).toBe(true);
      expect(cv.experience).toHaveLength(2);
      expect(cv.experience.every(experience => experience.bullets.length >= 3 && experience.bullets.length <= 4)).toBe(true);
      expect(cv.sectionOrder[0]).toBe('education');
      expect(cv.sectionOrder).not.toContain('leadership');
      expect(cv.sectionOrder).not.toContain('interests');
      expect(cv.education.every(education => education.details.trim().length > 0 && !education.details.includes('\n'))).toBe(true);
      expect(cv.education[0].keyCourses).toContain(language === 'FR' ? 'Analyse de données' : 'Data Analysis');
      expect(cv.education[1].keyCourses).toContain(language === 'FR' ? 'Bases de données' : 'Databases');
      expect(cv.education[1].keyCourses).not.toMatch(/PHP|Java|Programming \(C|Data Analysis using Spreadsheets/);
      expect(cv.certifications?.map(cert => cert.id)).toEqual(['google-advanced', 'sql-az']);
    });
  }

  it('exports a one-page Thales CV using the conventional ATS option', async () => {
    const draft = buildThalesDataCv('FR');
    draft.template = 'modern';
    const pdf = await PDFDocument.load(await buildCvPdfBytes(draft));
    expect(pdf.getPageCount()).toBe(1);
  });
});
