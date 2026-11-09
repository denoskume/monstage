/** Two-plan internship discovery: 30 target groups in France, identical for A and B. */
export interface ScopeOffer {
  company?: string | null;
  title?: string | null;
  domain?: string | null;
  specialization?: string | null;
  applicationStatus?: string | null;
  appliedAt?: string | null;
}
export type SearchPlan = 'A' | 'B';
export const PLAN_LABELS: Record<SearchPlan, string> = {
  A: 'Computer Vision & traitement d’images',
  B: 'Data Analyst · Industrie & opérations',
};
export function normalizeScope(value: string | null | undefined): string {
  return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
/** Fifteen original transport groups plus fifteen industrial, medical, energy and consumer groups.
 * Targeting shortlist, NOT an objective revenue ranking.
 * Both plans use exactly these same thirty groups.
 */
export const TARGET_COMPANIES = [
  ['Airbus', 'airbus'], ['Safran', 'safran', 'preligens'], ['Thales', 'thales'],
  ['Dassault Aviation', 'dassault aviation'], ['Air France-KLM', 'air france', 'air france klm'],
  ['Alstom', 'alstom'], ['SNCF', 'sncf'], ['RATP', 'ratp'],
  ['Siemens Mobility', 'siemens mobility'], ['Hitachi Rail', 'hitachi rail'],
  ['Renault Group', 'renault', 'ampere'], ['Stellantis', 'stellantis', 'psa'],
  ['Valeo', 'valeo'], ['FORVIA HELLA', 'forvia', 'hella', 'faurecia'], ['Michelin', 'michelin'],
  ['Danone', 'danone', 'volvic'], ['Nestlé', 'nestle', 'nestle france'], ['Lactalis', 'lactalis'], ['Bel Group', 'bel group', 'groupe bel'],
  ['GE HealthCare', 'ge healthcare', 'gehealthcare'], ['EssilorLuxottica', 'essilorluxottica', 'essilor', 'luxottica'],
  ['Sanofi', 'sanofi'], ['Siemens Healthineers', 'siemens healthineers'],
  ['Schneider Electric', 'schneider electric'], ['Saint-Gobain', 'saint gobain'],
  ['Veolia', 'veolia'], ['Air Liquide', 'air liquide'],
  ['EDF', 'edf'], ['ENGIE', 'engie', 'grdf'], ['L’Oréal', 'l oreal', 'loreal'],
] as const;

function matchingCompany(company: string | null | undefined): string | null {
  const text = ' ' + normalizeScope(company) + ' ';
  return TARGET_COMPANIES.find(([, ...aliases]) => aliases.some(alias =>
    text.includes(' ' + normalizeScope(alias) + ' ')))?.[0] || null;
}
export function targetCompany(company: string | null | undefined): string | null {
  return matchingCompany(company);
}
export function originalTargetCompany(company: string | null | undefined): string | null {
  return matchingCompany(company);
}

const VISION_TITLE = /\b(computer vision|vision par ordinateur|vision artificielle|vision industrielle|machine vision|vision 3d|image processing|traitement (d |des |de |d une |des donnees d )?images?|analyse (d |des |de )?images?|imagerie|imaging|recalage|image segmentation|segmentation|reconstruction d images?)\b/;
const FINANCIAL_ROLE = /\b(finance|financial|financier|financiere|financement|banque|bancaire|banking|insurance|assurance|actuariat|actuarial|comptabilite|accounting|controle de gestion|gestion financiere|tresorerie|treasury|trading|investment|investissement|credit risk|credit analyst|risque de credit|audit financier|audit comptable|marches financiers|financial markets)\b/;
const DATA_SCIENTIST_ROLE = /\b(data scientist|data science|scientifique des donnees|science des donnees|scientifique de donnees)\b/;
const NON_ANALYST_ROLE = /\b(data engineer|data engineering|ingenieur data|ingenieure data|machine learning engineer|ml engineer|ingenieur machine learning|ingenieure machine learning|consultant strateg|consultante strateg|developpeur logiciel|software engineer)\b/;
const ANALYST_ROLE = /\b(data analyst|analyste data|analyste de donnees|analyste des donnees|bi analyst|analyste bi|analyste business intelligence|business intelligence analyst|reporting analyst|analyste reporting|data analytics|data analysis|analyse de donnees|analyse des donnees|business intelligence|power bi|tableaux? de bord|data insights)\b/;
const INDUSTRIAL_CONTEXT = /\b(maintenance|predictive|predictif|fiabilite|rams|defaillances?|pannes?|condition monitoring|inspection|industriel|industrielle|industrial|industrialisation|moteurs?|turbomoteurs?|usine|production|manufacturing|equipements?|ferroviaire|railway|transport|mobilite|mobilite durable|flotte|fleet|aeronautique|automobile|qualite industrielle)\b/;
export function isFinanceRole(offer: ScopeOffer): boolean {
  return FINANCIAL_ROLE.test(normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' ')));
}
export function isDataScientistRole(offer: ScopeOffer): boolean {
  return DATA_SCIENTIST_ROLE.test(normalizeScope(offer.title));
}
export function isVisionMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  if (FINANCIAL_ROLE.test(title) || DATA_SCIENTIST_ROLE.test(title)) return false;
  return VISION_TITLE.test(normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' ')));
}
/** Data Analyst remains entry-level: never promote Data Scientist / ML Engineer / engineering-heavy titles to Plan B. */
export function isDataAnalystMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  return !FINANCIAL_ROLE.test(title) && !DATA_SCIENTIST_ROLE.test(title) && !NON_ANALYST_ROLE.test(title) && ANALYST_ROLE.test(title);
}
export function isIndustrialAnalyticsMission(offer: ScopeOffer): boolean {
  return isDataAnalystMission(offer) && INDUSTRIAL_CONTEXT.test(
    normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' ')));
}
/** Explicit Data Analyst role takes Plan B precedence even when the department mentions imaging. */
export function getOfferPlan(offer: ScopeOffer): SearchPlan | null {
  if (!matchingCompany(offer.company) || isFinanceRole(offer) || isDataScientistRole(offer)) return null;
  if (isDataAnalystMission(offer)) return 'B';
  if (isVisionMission(offer)) return 'A';
  return null;
}
export function isTargetOffer(offer: ScopeOffer): boolean {
  return getOfferPlan(offer) !== null;
}
/** Only hide records from discovery; never delete saved applications or archives. */
export function restrictOffersPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as {offers?: unknown}).offers)) return payload;
  const data = payload as {offers: ScopeOffer[]};
  return {...data, offers: data.offers.filter(isTargetOffer)};
}
