/** Exclusive MonStage scope. Source records remain archived outside the app. */
export interface ScopeOffer {
  company?: string | null;
  title?: string | null;
  domain?: string | null;
  specialization?: string | null;
  applicationStatus?: string | null;
  appliedAt?: string | null;
}
export function normalizeScope(value: string | null | undefined): string {
  return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
export const TARGET_COMPANIES = [
  ['Safran', 'safran', 'preligens'], ['Airbus', 'airbus'], ['Thales', 'thales'],
  ['Dassault Aviation', 'dassault aviation'], ['RTX / Collins Aerospace', 'rtx', 'collins aerospace', 'raytheon'],
  ['Alstom', 'alstom'], ['SNCF', 'sncf'], ['Siemens Mobility', 'siemens mobility'],
  ['Hitachi Rail', 'hitachi rail'], ['Wabtec', 'wabtec'], ['Valeo', 'valeo'],
  ['Renault Group', 'renault', 'ampere'], ['Stellantis', 'stellantis', 'psa'], ['Bosch', 'bosch'],
  ['FORVIA HELLA', 'forvia', 'hella', 'faurecia'], ['GE HealthCare', 'ge healthcare', 'gehealthcare'],
  ['Siemens Healthineers', 'siemens healthineers'], ['Philips', 'philips'],
  ['Canon Medical Systems', 'canon medical', 'olea medical'], ['Dassault Systèmes', 'dassault systemes'],
] as const;
export function targetCompany(company: string | null | undefined): string | null {
  const text = ' ' + normalizeScope(company) + ' ';
  return TARGET_COMPANIES.find(([, ...aliases]) => aliases.some(alias => text.includes(' ' + normalizeScope(alias) + ' ')))?.[0] || null;
}
export function isVisionMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  if (/\b(marketing|communication|commercial|sales|juridique|finance|ressources humaines)\b/.test(title)) return false;
  const text = normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' '));
  return /\b(computer vision|vision par ordinateur|vision artificielle|vision industrielle|machine vision|vision 3d|image processing|traitement (d |des |de |d une |des donnees d )?images?|analyse (d |des |de )?images?|imagerie|imaging|recalage|image segmentation|segmentation (cardiaque|medicale|d images)|reconstruction (d |des )?images?)\b/.test(text);
}
export function isTargetOffer(offer: ScopeOffer): boolean {
  return targetCompany(offer.company) !== null && isVisionMission(offer);
}
export function restrictOffersPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as {offers?: unknown}).offers)) return payload;
  const data = payload as {offers: ScopeOffer[]};
  return {...data, offers: data.offers.filter(offer => isTargetOffer(offer))};
}
