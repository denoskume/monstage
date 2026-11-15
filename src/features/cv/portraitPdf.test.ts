import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { freshCvDraft } from './cvStorage';
import { buildCvPdfBytes } from './pdfExport';

const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGNU3rKKgYGBiYGBgYGBAQARrwGFrq2uMwAAAABJRU5ErkJggg==';

describe('portrait CV with optional photograph', () => {
  const compact = () => {
    const draft = freshCvDraft('FR', 'B');
    draft.template = 'portrait';
    draft.education = draft.education.slice(0, 1).map(item => ({
      ...item, details: 'MSc Data Science', bullets: [], keyCourses: '',
    }));
    draft.projects = draft.projects.slice(0, 1).map(item => ({ ...item, bullets: item.bullets.slice(0, 2) }));
    draft.experience = draft.experience.slice(0, 1).map(item => ({ ...item, bullets: item.bullets.slice(0, 2) }));
    draft.certifications = [];
    draft.leadership = [];
    draft.skills = 'Python, SQL, Power BI';
    draft.summary = 'Stage de fin d’études de six mois.';
    draft.languages = 'Français, Anglais';
    draft.interests = '';
    return draft;
  };

  it('exports A4 text-based CV even when no photo has been supplied', async () => {
    const data = await buildCvPdfBytes(compact());
    const pdf = await PDFDocument.load(data);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(595.28);
    expect(pdf.getPage(0).getHeight()).toBeCloseTo(841.89);
    expect(data.byteLength).toBeGreaterThan(2000);
  });

  it('embeds a real uploaded picture instead of a decorative placeholder', async () => {
    const draft = compact();
    const plain = await buildCvPdfBytes(draft);
    draft.photoDataUrl = 'data:image/png;base64,' + TINY_PNG;
    const photographed = await buildCvPdfBytes(draft);
    const pdf = await PDFDocument.load(photographed);
    expect(pdf.getPageCount()).toBe(1);
    expect(photographed.byteLength).toBeGreaterThan(plain.byteLength);
    // A PDF image stream exists, while the text remains independently selectable.
    const objects = [...pdf.context.enumerateIndirectObjects()].map(([, value]) => String(value));
    expect(objects.some(value => value.includes('/Subtype /Image'))).toBe(true);
    expect(objects.some(value => value.includes('/Type /Font'))).toBe(true);
  });
});
