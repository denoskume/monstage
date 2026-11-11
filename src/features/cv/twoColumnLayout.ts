import type { CvSectionKey, CvTemplate } from './cvStorage';

// Semantic order is preserved within each column. The professional content is
// emitted first in the PDF's content stream for better text-extraction behavior.
export const CV_MAIN_COLUMN_SECTIONS: ReadonlySet<CvSectionKey> = new Set([
  'education', 'experience', 'projects',
]);
export const CV_SIDEBAR_SECTIONS: ReadonlySet<CvSectionKey> = new Set([
  'skills', 'certifications', 'languages', 'interests', 'leadership',
]);

export function isTwoColumnCv(template?: CvTemplate): boolean {
  return template === 'split' || template === 'sidebar';
}

export function cvColumnSections(sectionOrder: readonly CvSectionKey[]): {
  main: CvSectionKey[];
  sidebar: CvSectionKey[];
} {
  return {
    main: sectionOrder.filter(section => CV_MAIN_COLUMN_SECTIONS.has(section)),
    sidebar: sectionOrder.filter(section => CV_SIDEBAR_SECTIONS.has(section)),
  };
}
