import type { InternshipOffer } from '../../api/contract';

import { getBuiltInCvMatch, type CvMatch } from '../cv/cvMatcher';

export type { CvMatch } from '../cv/cvMatcher';

export function getCvMatch(offer: InternshipOffer): CvMatch {
  return getBuiltInCvMatch(offer);
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
