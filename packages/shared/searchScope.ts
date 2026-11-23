/** Two-plan internship discovery: 30 target groups in France, identical for A and B. */
export interface ScopeOffer {
  id?: string | null;
  company?: string | null;
  title?: string | null;
  domain?: string | null;
  specialization?: string | null;
  applicationStatus?: string | null;
  appliedAt?: string | null;
  duration?: string | null;
  start?: string | null;
  m2Fit?: string | null;
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

/** Named employers are a ranking preference, NEVER a gate on discoveries.
 * The internship mission (Plan A / Plan B), not the corporate name, defines scope.
 */
export const EXPANDED_LARGE_EMPLOYERS = [
  ['Groupe Atlantic', 'groupe atlantic'],
  ['Caterpillar', 'caterpillar'],
  ['RTE', 'rte reseau de transport electricite', 'rte'],
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
const ANALYST_ROLE = /\b(data analyst(?:e|s)?|analyste data|analyste de donnees|analyste des donnees|bi analyst|analyste bi|analyste business intelligence|business intelligence analyst|reporting analyst|analyste reporting|data analytics|data analysis|analyse de donnees|analyse des donnees|business intelligence|power bi|tableaux? de bord|data insights)\b/;
const INDUSTRIAL_ML_TITLE = /\b(machine learning|apprentissage automatique|deep learning|apprentissage profond|modeles? predictifs?|predictive modeling|predictive modelling|ia predictive|intelligence artificielle pour la maintenance)\b/;
const INDUSTRIAL_ML_CONTEXT = /\b(maintenance|fiabilite|reliability|pannes?|defaillances?|fault detection|condition monitoring|prognostic|inspection industrielle|aeronautique|ferroviaire|railway|capteurs industriels|industrial maintenance)\b/;
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
/** Maintenance titles are Plan B only if their verified domain carries data/BI work. */
export function isDataDrivenMaintenanceMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  const context = normalizeScope([offer.domain, offer.specialization].filter(Boolean).join(' '));
  return !FINANCIAL_ROLE.test(title) && !DATA_SCIENTIST_ROLE.test(title)
    && /\b(maintenance|performance industrielle|maintenance predictive)\b/.test(title)
    && ANALYST_ROLE.test(context);
}
/** Applied ML belongs to Plan A only when tied to concrete industrial reliability or maintenance work. */
export function isIndustrialMachineLearningMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  const context = normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' '));
  return !FINANCIAL_ROLE.test(context) && !DATA_SCIENTIST_ROLE.test(title)
    && INDUSTRIAL_ML_TITLE.test(title) && INDUSTRIAL_ML_CONTEXT.test(context);
}
/** Explicit Data Analyst role takes Plan B precedence even when the department mentions imaging. */
/** Nationwide discovery in fields relevant to the user's MSc.
 * Location and the 30 target companies affect ranking only. Tracking is kept
 * independent from discovery, so previous applications remain untouched.
 */
const APPLIED_ML_ROLE = /\b(machine learning|deep learning|apprentissage automatique|apprentissage profond|ml engineer|machine learning engineer|ingenieur ia|ingenieure ia|ai engineer|ingenieur intelligence artificielle|artificial intelligence|intelligence artificielle|computer vision|signal processing|traitement du signal|audio signal|image processing|robotic perception|perception robotique|data scientist|data science|scientifique des donnees|science des donnees)\b/;
const SIGNAL_AND_ROBOTICS = /\b(signal|audio|acoustique|speech|lidar|radar|robotique|robotics|robotique mobile|systemes autonomes|autonomous systems|calibration de camera)\b/;
const ENGINEERING_CONTEXT = /\b(python|pytorch|tensorflow|opencv|machine learning|deep learning|vision|imagerie|traitement d images|segmentation|classification|capteurs|sensors|algorithme|algorithm|intelligence artificielle|image processing|signal processing)\b/;

export function getOfferPlan(offer: ScopeOffer): SearchPlan | null {
  const title = normalizeScope(offer.title);
  const context = normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' '));
  // One verified internship signal is required: title, length or the MSc
  // internship metadata. Never widen discovery to ordinary full-time jobs.
  const internship = /\b(stage|stagiaire|internship|intern|pfe)\b/.test(title) ||
    /\b(mois|months|internship|stage)\b/.test(normalizeScope(offer.duration)) ||
    (Boolean(offer.start) && /\b(2027|fevrier|february)\b/.test(normalizeScope(offer.start)) &&
      /\b(oui|master|m2|bac 5)\b/.test(normalizeScope(offer.m2Fit)));
  if (!title || !internship || isFinanceRole(offer)) return null;
  // Titles explicitly indicating data analysis/BI are Plan B even in medical
  // imaging or manufacturing contexts. Engineering and scientist titles belong
  // to applied ML / Plan A, not to the junior Data Analyst backup.
  if (isDataAnalystMission(offer) || isDataDrivenMaintenanceMission(offer)) return 'B';
  if (isVisionMission(offer) || isIndustrialMachineLearningMission(offer)) return 'A';
  if (APPLIED_ML_ROLE.test(title)) return 'A';
  if (SIGNAL_AND_ROBOTICS.test(title) && ENGINEERING_CONTEXT.test(context)) return 'A';
  // This includes a verified industrial data-analysis mission with an
  // engineering title, without admitting generic software development.
  if (/\b(data analysis|analyse de donnees|business intelligence|data analytics|power bi|tableau de bord)\b/.test(context)
      && /\b(stage|stagiaire|intern|analys|performance industrielle|donnees|data|reporting)\b/.test(title)
      && !/\b(developpeur logiciel|software engineer|backend|frontend)\b/.test(title)) return 'B';
  return null;
}
export function isTargetOffer(offer: ScopeOffer): boolean {
  return getOfferPlan(offer) !== null;
}
/** Preserve already-tracked applications even outside the 30-company discovery scope.
 * This affects the applications/interviews archive, not new-offer discovery.
 */
export function isTrackedApplication(offer: ScopeOffer): boolean {
  const status = normalizeScope(offer.applicationStatus);
  return Boolean(offer.appliedAt?.trim())
    || ['candidature envoyee', 'relance', 'reponse recruteur', 'entretien',
      'test technique', 'offre recue', 'refus', 'abandonne'].includes(status);
}
export function isTargetOrTrackedOffer(offer: ScopeOffer): boolean {
  return isTargetOffer(offer) || isTrackedApplication(offer);
}
/** Filter new-offer discovery but retain historical candidatures and interviews. */
export function restrictOffersPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as {offers?: unknown}).offers)) return payload;
  const data = payload as {offers: ScopeOffer[]};
  return {...data, offers: data.offers.filter(isTargetOrTrackedOffer)};
}
