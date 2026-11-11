import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildCvPdfBytes } from '../cv/pdfExport';
import { buildThalesDataCv, isCurrentThalesCv, isLegacyGeneratedThalesCv, refreshThalesCvContent, THALES_CV_REVISION } from './thalesDataDossier';

describe('Thales R0343178 strategic CV', () => {
  it('recognizes the current strategic CV and preserves style, contacts and experiences on refresh', () => {
    const current = buildThalesDataCv('FR');
    expect(THALES_CV_REVISION).toBe(2);
    expect(isCurrentThalesCv(current)).toBe(true);
    const old = {
      ...current,
      template: 'sidebar' as const,
      pageColor: 'soft-gray' as const,
      location: 'Nantes, France',
      projects: [
        {
          ...current.projects[0],
          bullets: [
            'Centralisé des données issues de plusieurs sources dans un outil de suivi structuré.',
            'Développé des filtres multicritères et des contrôles de cohérence des informations.',
            'Automatisé le suivi des candidatures et la préparation de documents avec React/TypeScript et Google Sheets.',
          ],
        },
        {
          id: 'insurance', name: 'Étude de cas — Modélisation prédictive', period: '2026',
          bullets: ['Prepared data for predictive modeling.'],
        },
      ],
      education: current.education.map(entry => entry.id === 'kju'
        ? { ...entry, keyCourses: 'Database Management Systems · Data Analysis using Spreadsheets · Programming (C, Java, PHP, Python)' }
        : entry),
    };
    expect(isLegacyGeneratedThalesCv(old)).toBe(true);
    const upgraded = refreshThalesCvContent(old);
    expect(isCurrentThalesCv(upgraded)).toBe(true);
    expect(upgraded.template).toBe('sidebar');
    expect(upgraded.pageColor).toBe('soft-gray');
    expect(upgraded.location).toBe('Nantes, France');
    expect(upgraded.experience).toEqual(old.experience);
    expect(upgraded.projects.map(project => project.id)).toEqual(['monstage']);
    expect(upgraded.education[1].keyCourses).toBe('Bases de données · Programmation Python');
  });

  it('does not auto-migrate a manually edited older MonStage project', () => {
    const draft = buildThalesDataCv('FR');
    const legacy = {
      ...draft,
      projects: [
        {
          ...draft.projects[0],
          bullets: [
            'Centralisé des données issues de plusieurs sources dans un outil de suivi structuré.',
            'Développé des filtres multicritères et des contrôles de cohérence des informations.',
            'Mon analyse personnelle et ses résultats.',
          ],
        },
        {
          id: 'insurance', name: 'Étude de cas — Modélisation', period: '2026',
          bullets: ['Analyse de modèles de prédiction.'],
        },
      ],
      education: draft.education.map(entry => entry.id === 'kju'
        ? { ...entry, keyCourses: 'Programming (C, Java, PHP, Python)' }
        : entry),
    };
    expect(isCurrentThalesCv(legacy)).toBe(false);
    expect(isLegacyGeneratedThalesCv(legacy)).toBe(false);
  });

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
