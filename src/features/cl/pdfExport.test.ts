import { describe, expect, test } from 'vitest';
import { buildCoverLetterPdfBytes, normalizeCoverLetterPdfText, LETTER_FIRST_LINE_INDENT, wrapCoverLetterLines } from './pdfExport';
import { freshCoverLetter } from './clStorage';

describe('cover letter PDF export', () => {
  test('first-line indent narrows only the opening line, without changing text', () => {
    // Fixed-width fake font makes line-wrap expectations deterministic.
    const font = { widthOfTextAtSize: (value: string) => value.length };
    const paragraph = 'Alpha bravo charlie delta echo foxtrot golf hotel';
    const withoutIndent = wrapCoverLetterLines(paragraph, 20, font, 10);
    const withIndent = wrapCoverLetterLines(paragraph, 20, font, 10, 6);
    expect(withIndent[0].length).toBeLessThanOrEqual(14);
    expect(withIndent[0].length).toBeLessThan(withoutIndent[0].length);
    expect(withIndent.slice(1).some(line => line.length > 14)).toBe(true);
    expect(withIndent.join(' ')).toBe(paragraph);
    expect(LETTER_FIRST_LINE_INDENT).toBeGreaterThan(0);
  });

  test('preserves French accents and ligatures', () => {
    const source = "À l’attention de l’équipe — Candidature ingénieur : expérience, sélection, procédé, œuvre, coût, février.";
    const normalized = normalizeCoverLetterPdfText(source);
    expect(normalized).toContain('À');
    expect(normalized).toContain('équipe');
    expect(normalized).toContain('ingénieur');
    expect(normalized).toContain('expérience');
    expect(normalized).toContain('sélection');
    expect(normalized).toContain('procédé');
    expect(normalized).toContain('œuvre');
    expect(normalized).toContain('coût');
    expect(normalized).toContain('février');
  });

  test('generates a French PDF without stripping accented content', async () => {
    const draft = freshCoverLetter('FR');
    draft.recipientName = "l’équipe Recrutement";
    draft.internshipTitle = "Industrialisation d’un système de vision pour la surveillance d’un procédé de fusion";
    draft.paragraphs = [
      "Votre offre a retenu mon attention. J’ai développé une chaîne intégrant normalisation, filtrage, morphologie et segmentation.",
      "Je souhaite contribuer à l’amélioration et à l’industrialisation de cette solution dès février 2027.",
    ];
    const bytes = await buildCoverLetterPdfBytes(draft);
    expect(bytes.byteLength).toBeGreaterThan(1000);
  });
});
