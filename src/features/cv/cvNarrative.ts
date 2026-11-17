import type { CvExperience, CvProject, CvLanguage } from './cvStorage';

// Shared semantics for ALL nine templates and all editable CV drafts.
// The structured fields stay separate from older bullet lists: selecting a
// different template changes the presentation, never the underlying data.
export type CvNarrativeEntry = Pick<CvExperience | CvProject, 'mission' | 'acquired' | 'results' | 'bullets'>;
export type CvNarrativeField = { key: 'mission' | 'acquired' | 'results'; label: string; value: string };

export function cvNarrativeFields(entry: CvNarrativeEntry, language: CvLanguage): CvNarrativeField[] {
  const fr = language === 'FR';
  const fields: CvNarrativeField[] = [
    { key: 'mission', label: 'Mission', value: entry.mission?.trim() ?? '' },
    { key: 'acquired', label: fr ? 'Expériences acquises' : 'Skills gained', value: entry.acquired?.trim() ?? '' },
    { key: 'results', label: fr ? 'Résultats' : 'Results', value: entry.results?.trim() ?? '' },
  ];
  return fields.filter(field => Boolean(field.value));
}

function normalized(value: string): string {
  return value.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().replace(/[.!;:,]+$/, '').toLocaleLowerCase();
}

/**
 * Preserve every legacy bullet unless it literally duplicates a structured
 * field. Empty structured fields do not hide previously saved work.
 */
export function cvNarrativeBullets(entry: CvNarrativeEntry): string[] {
  const detailed = new Set([entry.mission, entry.acquired, entry.results]
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .map(normalized));
  return entry.bullets.filter(bullet => bullet.trim() && !detailed.has(normalized(bullet)));
}
