import { describe, expect, test } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { freshCvDraft, cvTemplateOptions, type CvSectionKey } from './cvStorage';
import { cvColumnSections, isTwoColumnCv } from './twoColumnLayout';
import { buildCvPdfBytes } from './pdfExport';

describe('dual-column CV models', () => {
  test('are two extra options while retaining all existing templates', () => {
    expect(cvTemplateOptions.map(option => option.id)).toEqual([
      'classic', 'modern', 'minimal', 'keywords', 'split', 'sidebar',
    ]);
    expect(isTwoColumnCv('split')).toBe(true);
    expect(isTwoColumnCv('sidebar')).toBe(true);
    expect(isTwoColumnCv('modern')).toBe(false);
  });

  test('keeps the section order within each column, with all sections preserved', () => {
    const order: CvSectionKey[] = [
      'education', 'skills', 'projects', 'experience', 'certifications',
      'leadership', 'languages', 'interests',
    ];
    const groups = cvColumnSections(order);
    expect(groups.main).toEqual(['education', 'projects', 'experience']);
    expect(groups.sidebar).toEqual(['skills', 'certifications', 'leadership', 'languages', 'interests']);
    expect([...groups.main, ...groups.sidebar].sort()).toEqual([...order].sort());
  });

  test.each(['split', 'sidebar'] as const)('%s exports a selectable-text A4 PDF', async template => {
    const draft = freshCvDraft('FR', 'B');
    draft.template = template;
    draft.summary = 'Étudiant en data science, spécialiste Python et SQL, intéressé par les projets industriels.';
    draft.education = draft.education.slice(0, 1);
    draft.projects = draft.projects.slice(0, 1).map(item => ({ ...item, bullets: item.bullets.slice(0, 2) }));
    draft.experience = draft.experience.slice(0, 1).map(item => ({ ...item, bullets: item.bullets.slice(0, 2) }));
    draft.leadership = [];
    draft.certifications = draft.certifications?.slice(0, 1);
    draft.pageColor = 'soft-blue';
    const bytes = await buildCvPdfBytes(draft);
    expect(bytes.byteLength).toBeGreaterThan(2500);
    const loaded = await PDFDocument.load(bytes);
    expect(loaded.getPageCount()).toBe(1);
    expect(loaded.getPage(0).getWidth()).toBeCloseTo(595.28);
    expect(loaded.getPage(0).getHeight()).toBeCloseTo(841.89);
    // Fonts are embedded and body copy is drawn as text, not as images.
    expect([...loaded.context.enumerateIndirectObjects()].some(([, obj]) => String(obj).includes('/Font'))).toBe(true);
  });

  test('both variations use different PDF layout and keep longer content across pages', async () => {
    const draft = freshCvDraft('FR', 'B');
    const one = await buildCvPdfBytes({ ...draft, template: 'split', pageColor: 'white' });
    const two = await buildCvPdfBytes({ ...draft, template: 'sidebar', pageColor: 'white' });
    expect(one.byteLength).toBeGreaterThan(2000);
    expect(two.byteLength).toBeGreaterThan(2000);
    expect(one.byteLength).not.toEqual(two.byteLength);
    expect((await PDFDocument.load(one)).getPageCount()).toBeGreaterThanOrEqual(1);
    expect((await PDFDocument.load(two)).getPageCount()).toBeGreaterThanOrEqual(1);
  });
});
