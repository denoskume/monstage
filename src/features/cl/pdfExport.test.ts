import { describe, expect, test } from 'vitest';
import { buildCoverLetterPdfBytes, normalizeCoverLetterPdfText } from './pdfExport';
import { freshCoverLetter } from './clStorage';

describe('cover letter PDF export', () => {
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
