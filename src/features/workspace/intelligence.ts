import type { InternshipOffer } from '../../api/contract';

export interface CvMatch {
  score: number;
  matched: string[];
  missing: string[];
}

const candidateSkillAliases: Record<string, string[]> = {
  Python: ['python'],
  NumPy: ['numpy'],
  pandas: ['pandas'],
  SciPy: ['scipy'],
  'scikit-learn': ['scikit-learn', 'sklearn'],
  Matplotlib: ['matplotlib'],
  Jupyter: ['jupyter', 'notebook'],
  PyTorch: ['pytorch', 'torch'],
  OpenCV: ['opencv', 'cv2'],
  'Image Processing': ['image processing', 'traitement d image', 'traitement image'],
  Segmentation: ['segmentation', 'dice', 'iou'],
  'Camera Calibration': ['camera calibration', 'calibration camera', 'calibration caméra'],
  'Feature Tracking': ['feature tracking', 'tracking', 'suivi de points'],
  Git: ['git', 'github'],
  Linux: ['linux', 'wsl'],
  FastAPI: ['fastapi'],
};

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function candidateHasSkill(skill: string): boolean {
  const target = normalize(skill);
  return Object.entries(candidateSkillAliases).some(([label, aliases]) => {
    const normalizedLabel = normalize(label);
    return target.includes(normalizedLabel)
      || normalizedLabel.includes(target)
      || aliases.some((alias) => target.includes(normalize(alias)) || normalize(alias).includes(target));
  });
}

export function getCvMatch(offer: InternshipOffer): CvMatch {
  const required = offer.skills.filter(Boolean);
  const matched = required.filter(candidateHasSkill);
  const missing = required.filter((skill) => !candidateHasSkill(skill));

  if (!required.length) {
    const fallback = offer.technicalFit ?? offer.decisionScore ?? 0;
    return { score: Math.max(0, Math.min(100, Math.round(fallback))), matched: [], missing: [] };
  }

  const overlapScore = (matched.length / required.length) * 100;
  const technicalScore = offer.technicalFit ?? overlapScore;
  const score = Math.round((overlapScore * 0.65) + (technicalScore * 0.35));

  return {
    score: Math.max(0, Math.min(100, score)),
    matched,
    missing,
  };
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = trimmed.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dayDiff(target: Date, today: Date): number {
  const oneDay = 86_400_000;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.ceil((end - start) / oneDay);
}

export function getFollowUpAdvice(
  offer: InternshipOffer,
  localFollowUpDate?: string,
  today = new Date(),
): string {
  const status = offer.applicationStatus ?? '';

  if (status === 'Refus' || status === 'Abandonné') return 'No follow-up needed — application closed.';
  if (status === 'Offre reçue') return 'Review the offer and decision deadline.';
  if (status === 'Entretien') return 'Prepare the interview and confirm logistics.';
  if (status === 'Test technique') return 'Prioritize the technical test and submission deadline.';

  const planned = parseDate(localFollowUpDate ?? offer.followUpAt);
  if (planned) {
    const diff = dayDiff(planned, today);
    if (diff <= 0) return 'Follow up now.';
    if (diff === 1) return 'Follow up tomorrow.';
    return `Follow up in ${diff} days.`;
  }

  const applied = parseDate(offer.appliedAt);
  if (!applied) return 'Set a follow-up date after applying.';

  const recommended = new Date(applied);
  recommended.setDate(recommended.getDate() + 7);
  const diff = dayDiff(recommended, today);
  if (diff <= 0) return 'Follow up now — 7+ days since application.';
  if (diff === 1) return 'Follow up tomorrow.';
  return `Recommended follow-up in ${diff} days.`;
}
