import { describe, expect, test } from 'vitest';
import { normalizeCvPdfText } from './pdfExport';

describe('CV PDF text normalization', () => {
  test('preserves French accents and ligatures', () => {
    const source = "École Centrale de Nantes — Expérience, compétences, traitement d’image, ingénieur, cœur, février.";
    const normalized = normalizeCvPdfText(source);
    expect(normalized).toContain('École');
    expect(normalized).toContain('Expérience');
    expect(normalized).toContain('compétences');
    expect(normalized).toContain('image');
    expect(normalized).toContain('ingénieur');
    expect(normalized).toContain('cœur');
    expect(normalized).toContain('février');
  });
});
