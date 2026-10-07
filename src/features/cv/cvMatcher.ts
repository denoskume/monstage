import type { InternshipOffer } from '../../api/contract';
import { builtInCvProfile } from './builtInCvProfile';

export interface CvMatchBreakdown {
  skills: number;
  projects: number;
  education: number;
  experience: number;
  domain: number;
  constraints: number;
}

export interface CvMatch {
  score: number;
  matched: string[];
  missing: string[];
  alignedProjects: string[];
  breakdown: CvMatchBreakdown;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function offerCorpus(offer: InternshipOffer): string {
  return normalize([
    offer.title,
    offer.domain,
    offer.specialization,
    offer.m2Fit,
    offer.duration,
    offer.start,
    offer.relevance,
    offer.gaps,
    ...offer.skills,
  ].filter(Boolean).join(' '));
}

function aliasesMatch(value: string, aliases: string[]): boolean {
  const target = normalize(value);
  return aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return target.includes(normalizedAlias) || normalizedAlias.includes(target);
  });
}

function skillMatch(skill: string): boolean {
  return Object.entries(builtInCvProfile.skills).some(([label, aliases]) => {
    const normalized = normalize(skill);
    const normalizedLabel = normalize(label);
    return normalized.includes(normalizedLabel)
      || normalizedLabel.includes(normalized)
      || aliasesMatch(skill, aliases);
  });
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreSkills(offer: InternshipOffer): { score: number; matched: string[]; missing: string[] } {
  const required = offer.skills.filter(Boolean);
  const matched = required.filter(skillMatch);
  const missing = required.filter((skill) => !skillMatch(skill));

  if (!required.length) {
    return { score: 50, matched: [], missing: [] };
  }

  return {
    score: clampScore((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

function scoreProjects(offer: InternshipOffer): { score: number; alignedProjects: string[] } {
  const corpus = offerCorpus(offer);
  const ranked = builtInCvProfile.projects
    .map((project) => ({
      name: project.name,
      hits: project.keywords.filter((keyword) => corpus.includes(normalize(keyword))).length,
    }))
    .filter((project) => project.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  const alignedProjects = ranked.slice(0, 2).map((project) => project.name);
  if (!ranked.length) return { score: 20, alignedProjects: [] };

  const best = ranked[0].hits;
  const second = ranked[1]?.hits ?? 0;
  return {
    score: clampScore(Math.min(100, 25 + (best * 18) + (second * 9))),
    alignedProjects,
  };
}

function scoreEducation(offer: InternshipOffer): number {
  const corpus = offerCorpus(offer);
  const educationKeywords = builtInCvProfile.education.flatMap((item) => item.keywords).map(normalize);
  const hits = educationKeywords.filter((keyword) => corpus.includes(keyword)).length;
  const explicitM2 = normalize(offer.m2Fit ?? '');
  if (explicitM2.includes('oui') || explicitM2.includes('yes')) return 100;
  if (hits >= 3) return 90;
  if (hits === 2) return 80;
  if (hits === 1) return 70;
  return 55;
}

function scoreExperience(offer: InternshipOffer): number {
  const corpus = offerCorpus(offer);
  const hits = builtInCvProfile.experienceKeywords.filter((keyword) => corpus.includes(normalize(keyword))).length;
  if (hits >= 3) return 90;
  if (hits === 2) return 80;
  if (hits === 1) return 65;
  return 45;
}

function scoreDomain(offer: InternshipOffer): number {
  const corpus = offerCorpus(offer);
  const hits = builtInCvProfile.target.domains.filter((domain) => corpus.includes(normalize(domain))).length;
  if (hits >= 2) return 100;
  if (hits === 1) return 90;

  const technical = offer.technicalFit;
  return technical === null ? 45 : clampScore(technical);
}

function scoreConstraints(offer: InternshipOffer): number {
  let score = 50;

  const duration = normalize(offer.duration ?? '');
  if (duration.includes('6 mois') || duration.includes('6 months') || duration.includes('6 month')) score += 30;
  else if (duration.includes('5 mois') || duration.includes('5 months') || duration.includes('4 mois') || duration.includes('4 months')) score += 15;

  const start = normalize(offer.start ?? '');
  if (start.includes('fevrier 2027') || start.includes('february 2027') || start.includes('02/2027')) score += 20;
  else if (start.includes('2027')) score += 10;

  return clampScore(score);
}

export function getBuiltInCvMatch(offer: InternshipOffer): CvMatch {
  const skills = scoreSkills(offer);
  const projects = scoreProjects(offer);
  const education = scoreEducation(offer);
  const experience = scoreExperience(offer);
  const domain = scoreDomain(offer);
  const constraints = scoreConstraints(offer);

  const breakdown: CvMatchBreakdown = {
    skills: skills.score,
    projects: projects.score,
    education,
    experience,
    domain,
    constraints,
  };

  const score = clampScore(
    (breakdown.skills * 0.35) +
    (breakdown.projects * 0.25) +
    (breakdown.education * 0.15) +
    (breakdown.experience * 0.10) +
    (breakdown.domain * 0.10) +
    (breakdown.constraints * 0.05),
  );

  return {
    score,
    matched: skills.matched,
    missing: skills.missing,
    alignedProjects: projects.alignedProjects,
    breakdown,
  };
}
