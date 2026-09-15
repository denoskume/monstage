import { describe, expect, it } from 'vitest';
import { displayValue } from './display';

describe('displayValue', () => {
  it('translates known French sheet metadata to professional English', () => {
    expect(displayValue('À candidater')).toBe('To apply');
    expect(displayValue('Candidature envoyée')).toBe('Application sent');
    expect(displayValue('Vérifié <24h')).toBe('Verified <24h');
    expect(displayValue('Oui probable')).toBe('Likely yes');
    expect(displayValue('Officiel / direct')).toBe('Official / direct');
    expect(displayValue('À vérifier')).toBe('Needs verification');
  });

  it('preserves values that are not display metadata', () => {
    expect(displayValue('STAGE - Ingénieur.e Recherche Deep Learning')).toBe('STAGE - Ingénieur.e Recherche Deep Learning');
    expect(displayValue('Dassault Systèmes')).toBe('Dassault Systèmes');
  });

  it('preserves null values', () => {
    expect(displayValue(null)).toBeNull();
  });
});
