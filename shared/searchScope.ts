/** MonStage's three-track discovery policy. Source archives are never deleted. */
export interface ScopeOffer {
  company?: string | null;
  title?: string | null;
  domain?: string | null;
  specialization?: string | null;
  applicationStatus?: string | null;
  appliedAt?: string | null;
}
export type SearchPlan = 'A' | 'B1' | 'B2';
export const PLAN_LABELS: Record<SearchPlan, string> = {
  A: 'Computer Vision & traitement d’images',
  B1: 'Data industrielle & maintenance prédictive',
  B2: 'Data Analyst & Business Intelligence',
};
export function normalizeScope(value: string | null | undefined): string {
  return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
/** Historical twenty: the ONLY companies eligible for Plan A. */
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
/** Ten additional giants, eligible ONLY for the B1/B2 backup plans. */
export const BACKUP_COMPANIES = [
  ['EDF / Enedis', 'edf', 'enedis'], ['ENGIE', 'engie'], ['TotalEnergies', 'totalenergies'],
  ['Schneider Electric', 'schneider electric'], ['VINCI', 'vinci'],
  ['Orange', 'orange'], ['Capgemini', 'capgemini'], ['Air Liquide', 'air liquide'],
  ['Veolia', 'veolia'], ['Michelin', 'michelin'],
] as const;
export const ALL_TARGET_COMPANIES = [...TARGET_COMPANIES, ...BACKUP_COMPANIES] as const;

function findCompany(company: string | null | undefined, groups: ReadonlyArray<readonly string[]>): string | null {
  const text = ' ' + normalizeScope(company) + ' ';
  return groups.find(([, ...aliases]) => aliases.some(alias => text.includes(' ' + normalizeScope(alias) + ' ')))?.[0] || null;
}
export function originalTargetCompany(company: string | null | undefined): string | null {
  return findCompany(company, TARGET_COMPANIES);
}
export function targetCompany(company: string | null | undefined): string | null {
  return findCompany(company, ALL_TARGET_COMPANIES);
}
export function isVisionMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  if (/\b(marketing|communication|commercial|sales|juridique|finance|ressources humaines)\b/.test(title)) return false;
  const text = normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' '));
  return /\b(computer vision|vision par ordinateur|vision artificielle|vision industrielle|machine vision|vision 3d|image processing|traitement (d |des |de |d une |des donnees d )?images?|analyse (d |des |de )?images?|imagerie|imaging|recalage|image segmentation|segmentation (cardiaque|medicale|d images)|reconstruction (d |des )?images?)\b/.test(text);
}
const INDUSTRIAL = /\b(maintenance|predictive|predictif|predictive|fiabilite|reliability|rams|pannes?|defaillances?|fault|failure|anomalies?|condition monitoring|inspection|industriel|industrielle|industrial|industrialisation|moteurs?|turbomoteurs?|usine|production|manufacturing|equipements?|equipments?|assets?|reseau electrique|energy grid|power grid|railway|ferroviaire|fleet|flotte|infrastructures?|qualite industrielle)\b/;
const DATA_ROLE = /\b(data analyst|analyste de donnees|analyste des donnees|analyse de donnees|analyse des donnees|data analytics|data analysis|analyse des mesures|analyse de mesures|analytics engineer|business intelligence|power bi|reporting|kpi|tableaux? de bord|dashboard|sql|statistical analysis|analyse statistique)\b/;
const PREDICTIVE = /\b(maintenance predictive|predictive maintenance|prediction de pannes?|anticipation des pannes?|analyse de fiabilite|fiabilite rams|reliability analytics|analyse des defaillances?|fault detection|failure prediction|remaining useful life|condition monitoring|industrial analytics)\b/;
const ANALYST = /\b(data analyst|analyste de donnees|analyste des donnees|analyse de donnees|analyse des donnees|data analytics|data analysis|analytics engineer|business intelligence|power bi|reporting automatise|reporting data|kpi|tableaux? de bord|dashboard|sql analyst|business analyst data|data insights)\b/;
export function isIndustrialAnalyticsMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  const context = normalizeScope([offer.domain, offer.specialization].filter(Boolean).join(' '));
  const full = [title, context].join(' ');
  if (PREDICTIVE.test(title)) return true;
  return INDUSTRIAL.test(full) && (DATA_ROLE.test(title) || /\b(modelisation predictive|analyses? statistiques?|data driven)\b/.test(title));
}
export function isDataAnalystMission(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  return ANALYST.test(title);
}
/** Priority is strict: A (historical 20 only), then B1, then B2. */
/** Business-finance specialization is not aligned with the user's training. */
const FINANCIAL_ROLE = /\b(finance|financial|financier|financiere|financement|banque|bancaire|banking|insurance|assurance|actuariat|actuarial|comptabilite|accounting|controle de gestion|gestion financiere|tresorerie|treasury|trading|investment|investissement|credit risk|credit analyst|risque de credit|audit financier|audit comptable|marches financiers|financial markets)\b/;
export function isFinanceRole(offer: ScopeOffer): boolean {
  return FINANCIAL_ROLE.test(normalizeScope([offer.title, offer.domain, offer.specialization].filter(Boolean).join(' ')));
}
/** Entry-level backup scope: no Data Scientist or general Data Science positions. */
export function isDataScientistRole(offer: ScopeOffer): boolean {
  const title = normalizeScope(offer.title);
  return /\b(data scientist|data science|scientifique des donnees|science des donnees|scientifique de donnees)\b/.test(title);
}
export function getOfferPlan(offer: ScopeOffer): SearchPlan | null {
  if (!targetCompany(offer.company) || isFinanceRole(offer) || isDataScientistRole(offer)) return null;
  if (originalTargetCompany(offer.company) && isVisionMission(offer)) return 'A';
  // Plan A keeps legitimate vision-oriented ML roles; backup plans remain analyst-led.
  if (/\b(ingenieur machine learning|ingenieure machine learning|machine learning engineer|ml engineer)\b/.test(normalizeScope(offer.title))) return null;
  if (isIndustrialAnalyticsMission(offer)) return 'B1';
  if (isDataAnalystMission(offer)) return 'B2';
  return null;
}
export function isTargetOffer(offer: ScopeOffer): boolean {
  return getOfferPlan(offer) !== null;
}
export function restrictOffersPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as {offers?: unknown}).offers)) return payload;
  const data = payload as {offers: ScopeOffer[]};
  return {...data, offers: data.offers.filter(isTargetOffer)};
}
