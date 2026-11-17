import {
  cvExperienceDescription, cvProjectDescription, type CvDraft,
  type CvExperience, type CvProject,
} from './cvStorage';

// Thierry KUME reference: A4, Times New Roman, #BFBFBF rail,
// #0070C0 hairline frames and headings, 25% / 75% columns.
// The source CV's personal data are deliberately NOT bundled.
export const THIERRY_STYLE = {
  blue: '#0070C0',
  gray: '#BFBFBF',
  ink: '#000000',
  pageWidth: 595.32,
  pageHeight: 841.92,
  leftBorder: 5.64,
  topBorder: 7.08,
  rightBorder: 588.10,
  bottomBorder: 834.84,
  splitX: 155.18,
  contentX: 174.5,
} as const;

export type ThierryEntry = {
  id: string;
  title: string;
  period: string;
  organization: string;
  mission: string;
  acquired: string;
  results: string;
  /** Additional keyboard-entered bullet points not already represented in the 3 fields. */
  extraBullets: string[];
};

export function cleanThierryText(value: string | undefined): string {
  return (value ?? '').replace(/\*\*/g, '').trim();
}

function outcomeBullet(text: string): boolean {
  return /(?:\d+(?:[.,]\d+)?\s*%|\b(?:résultats?|obtained|achieved|amélior|déploy|réalis|génér|mis en place|mise en place|obt(?:enu|enus)|top-\d|r²|auc)\b)/i.test(text);
}

function structured(
  entry: CvExperience | CvProject,
  title: string,
  organization: string,
  description: string,
): ThierryEntry {
  const bullets = entry.bullets.map(bullet=>bullet.trim()).filter(Boolean);
  const resultCandidate = bullets.reduce((index, bullet, i) => outcomeBullet(bullet) ? i : index, -1);
  const used = new Set<number>();
  const raw = (value: string | undefined) => (value ?? '').trim();
  const mission = raw(entry.mission) || raw(description) || bullets[0] || '';
  if (!raw(entry.mission) && !raw(description) && bullets.length) used.add(0);
  const acquiredIndices = bullets.map((_,i)=>i).filter(i =>
    i !== resultCandidate && !(description === '' && i === 0)
  ).slice(0, 2);
  const acquired = raw(entry.acquired) || acquiredIndices.map(i=>bullets[i]).join(' ');
  if(!raw(entry.acquired)) acquiredIndices.forEach(i=>used.add(i));
  const results = raw(entry.results) || (resultCandidate >= 0 ? bullets[resultCandidate] : '');
  if(!raw(entry.results) && resultCandidate >= 0)used.add(resultCandidate);
  const extraBullets = bullets.filter((_,i)=>!used.has(i));
  return { id: entry.id, title: raw(title), period: entry.period,
    organization: raw(organization), mission, acquired, results, extraBullets };
}

export function thierryEntries(draft: CvDraft): ThierryEntry[] {
  // One shared EXPERIENCES section, matching the original: academic work and
  // professional experience are not split into separate visual headings.
  const projects = draft.projects.map(item => structured(
    item, item.name, draft.language === 'FR' ? 'Projet académique / personnel' : 'Academic / personal project',
    cvProjectDescription(item, draft.language),
  ));
  const experiences = draft.experience.map(item => structured(
    item, item.role, item.company + (item.location ? ' — ' + item.location : ''),
    cvExperienceDescription(item, draft.language),
  ));
  return draft.sectionOrder.indexOf('experience') < draft.sectionOrder.indexOf('projects')
    ? [...experiences, ...projects] : [...projects, ...experiences];
}

export function thierryEducation(draft: CvDraft): string[] {
  return [
    ...draft.education.map(item => [item.period, item.degree, item.school].filter(Boolean).join(' : ')),
    ...(draft.certifications ?? []).filter(item => item.visible !== false && item.title.trim())
      .map(item => [item.date, item.title, item.issuer].filter(Boolean).join(' : ')),
  ];
}

export function thierryTools(draft: CvDraft): string[] {
  if (draft.thierryTools?.trim()) return draft.thierryTools.split(/\n|\|/).map(cleanThierryText).filter(Boolean);
  return draft.skills.split(/\n/).map(line =>
    cleanThierryText(line.replace(/^([^:]{1,50}):\s*/, ''))
  ).filter(Boolean).slice(0, 5);
}

export function thierryAdvantages(draft: CvDraft): string[] {
  return (draft.thierryAdvantages ?? '').split(/\n|\|/).map(cleanThierryText).filter(Boolean);
}

export function thierryMethods(draft: CvDraft): string[] {
  return (draft.thierryStandards ?? '').split(/\n|\|/).map(cleanThierryText).filter(Boolean);
}

export function thierrySoftSkills(draft: CvDraft): string[] {
  return (draft.thierrySoftSkills ?? '').split(/\n|\|/).map(cleanThierryText).filter(Boolean);
}

export type ThierrySkillGroup = { title: string; bullets: string[] };
export function thierrySkillGroups(draft: CvDraft): ThierrySkillGroup[] {
  return draft.skills.split(/\n/).map(line=>line.trim()).filter(Boolean).map(line => {
    const pivot = line.indexOf(':');
    if (pivot < 0) return { title: line, bullets: [] };
    const title = cleanThierryText(line.slice(0, pivot));
    const detail = line.slice(pivot + 1).trim();
    return { title, bullets: detail ? [detail] : [] };
  }).filter(group => group.title);
}
