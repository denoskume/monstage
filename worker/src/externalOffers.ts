export interface ExternalOffer {
  id: string;
  company: string;
  title: string;
  domain: string | null;
  city: string | null;
  region: string | null;
  m2Fit: string | null;
  start: string | null;
  duration: string | null;
  compensation: string | null;
  skills: string[];
  publishedAt: string | null;
  offerStatus: string | null;
  applicationStatus: string | null;
  nextAction: string | null;
  applicationUrl: string | null;
  shortlist: boolean;
  appliedAt: string | null;
  followUpAt: string | null;
  specialization: string | null;
  technicalFit: number | null;
  decisionScore: number | null;
  priority: string;
  freshness: string | null;
  verifiedAt: string | null;
  sourceQuality: string | null;
  actionLevel: string | null;
  calendarFit: string | null;
  confidence: string | null;
  relevance: string | null;
  gaps: string | null;
  autonomy?: null;
}

type WorkdaySource = { tenant: string; host: string; site: string; company: string };
type SmartSource = { companyId: string; company: string };

const WORKDAY_SOURCES: WorkdaySource[] = [
  { tenant: 'ag', host: 'wd3', site: 'Airbus', company: 'Airbus' },
  { tenant: 'thales', host: 'wd3', site: 'Careers', company: 'Thales' },
  { tenant: 'evoyageurs', host: 'wd3', site: 'jobs', company: 'SNCF Connect & Tech' },
];

const SMART_SOURCES: SmartSource[] = [
  { companyId: 'SopraSteria1', company: 'Sopra Steria' },
  { companyId: 'BoschGroup', company: 'Bosch Group' },
  { companyId: 'Eurofins', company: 'Eurofins' },
  { companyId: 'veoliaenvironnementsa', company: 'Veolia' },
  { companyId: 'alten', company: 'ALTEN' },
  { companyId: 'GTT', company: 'GTT' },
  { companyId: 'Sia', company: 'Sia' },
  { companyId: 'ASSYSTEM', company: 'Assystem' },
  { companyId: 'octotechnology', company: 'OCTO Technology' },
  { companyId: 'Iliad-Free', company: 'Iliad-Free' },
];

const WORKDAY_SEARCHES = [
  'stage data', 'stage analytics', 'stage machine learning',
  'stage intelligence artificielle', 'stage ai', 'stage vision',
  'stage image', 'stage signal', 'stage digital',
];

const TARGET_TERMS = [
  'data', 'analytics', 'machine learning', 'deep learning',
  'artificial intelligence', 'intelligence artificielle', 'computer vision',
  'vision', 'image', 'signal', 'python', 'sql', 'data science',
  'data scientist', 'data engineer', 'data analyst', 'business intelligence',
  'digital', 'automation', 'optimisation', 'optimization',
];

function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isInternship(title: string): boolean {
  const text = normalize(title);
  return ['stage', 'stagiaire', 'internship', 'intern'].some((term) => text.includes(term));
}

function isRelevant(title: string): boolean {
  const text = normalize(title);
  return TARGET_TERMS.some((term) => text.includes(normalize(term)));
}

function specialization(title: string): string {
  const t = normalize(title);
  if (t.includes('vision') || t.includes('image')) return 'Computer Vision / Image Processing';
  if (t.includes('signal')) return 'Signal / Audio';
  if (t.includes('machine learning') || t.includes('deep learning') || t.includes('artificial intelligence') || t.includes('intelligence artificielle')) return 'Machine Learning / AI';
  if (t.includes('data scientist') || t.includes('data science')) return 'Data Science';
  if (t.includes('data engineer') || t.includes('analytics') || t.includes('data analyst') || t.includes('sql')) return 'Data Engineering / Analytics';
  if (t.includes('automation') || t.includes('digital')) return 'Industrial AI / Process';
  return 'Data / AI';
}

function fitScore(title: string): number {
  const t = normalize(title);
  let score = 72;
  if (t.includes('machine learning') || t.includes('deep learning')) score += 12;
  if (t.includes('vision') || t.includes('image')) score += 10;
  if (t.includes('signal')) score += 10;
  if (t.includes('data science') || t.includes('data scientist')) score += 9;
  if (t.includes('analytics') || t.includes('data analyst') || t.includes('data engineer')) score += 7;
  return Math.min(94, score);
}

function toOffer(input: {
  id: string; company: string; title: string; city: string | null;
  region?: string | null; url: string | null; publishedAt?: string | null;
}): ExternalOffer {
  const fit = fitScore(input.title);
  return {
    id: input.id,
    company: input.company,
    title: input.title,
    domain: specialization(input.title),
    city: input.city,
    region: input.region ?? null,
    m2Fit: 'Oui probable',
    start: normalize(input.title).includes('2027') ? '2027' : null,
    duration: null,
    compensation: null,
    skills: [],
    publishedAt: input.publishedAt ?? null,
    offerStatus: 'Active',
    applicationStatus: 'À candidater',
    nextAction: 'Vérifier les conditions puis candidater',
    applicationUrl: input.url,
    shortlist: false,
    appliedAt: null,
    followUpAt: null,
    specialization: specialization(input.title),
    technicalFit: fit,
    decisionScore: fit,
    priority: fit >= 88 ? 'A' : fit >= 80 ? 'B+' : 'B',
    freshness: 'Vérifié <24h',
    verifiedAt: new Date().toISOString(),
    sourceQuality: 'Officiel / direct',
    actionLevel: fit >= 88 ? 'CANDIDATER 48H' : 'À ÉVALUER',
    calendarFit: 'À confirmer',
    confidence: fit >= 86 ? 'Haute' : 'Moyenne',
    relevance: null,
    gaps: null,
    autonomy: null,
  };
}

async function fetchJson(url: string, init?: RequestInit): Promise<any | null> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchWorkday(source: WorkdaySource): Promise<ExternalOffer[]> {
  const base = `https://${source.tenant}.${source.host}.myworkdayjobs.com`;
  const endpoint = `${base}/wday/cxs/${source.tenant}/${source.site}/jobs`;
  const seen = new Set<string>();
  const offers: ExternalOffer[] = [];

  for (const searchText of WORKDAY_SEARCHES) {
    const payload = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText }),
    });
    const jobs = Array.isArray(payload?.jobPostings) ? payload.jobPostings : [];
    for (const job of jobs) {
      const title = String(job?.title ?? '');
      const path = String(job?.externalPath ?? '');
      if (!title || !path || seen.has(path) || !isInternship(title)) continue;
      seen.add(path);
      offers.push(toOffer({
        id: `workday:${source.tenant}:${path}`,
        company: source.company,
        title,
        city: String(job?.locationsText ?? '') || null,
        url: `${base}/en-US/${source.site}${path}`,
      }));
    }
  }

  return offers;
}

async function fetchSmart(source: SmartSource): Promise<ExternalOffer[]> {
  const url =
    `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(source.companyId)}/postings?limit=100&offset=0&country=fr&q=stage`;
  const payload = await fetchJson(url);
  const jobs = Array.isArray(payload?.content) ? payload.content : [];
  return jobs
    .filter((job: any) => {
      const title = String(job?.name ?? '');
      return title && isInternship(title) && isRelevant(title);
    })
    .map((job: any) => {
      const location = job?.location ?? {};
      return toOffer({
        id: `smartrecruiters:${source.companyId}:${String(job?.id ?? job?.uuid ?? job?.name)}`,
        company: source.company,
        title: String(job?.name ?? ''),
        city: [location.city, location.region, location.country].filter(Boolean).join(', ') || null,
        region: location.region ? String(location.region) : null,
        url: String(job?.ref ?? '') || null,
        publishedAt: job?.releasedDate ? String(job.releasedDate).slice(0, 10) : null,
      });
    });
}

function dedupe(offers: ExternalOffer[]): ExternalOffer[] {
  const seen = new Set<string>();
  return offers.filter((offer) => {
    const key = [
      normalize(offer.company),
      normalize(offer.title),
      normalize(offer.city),
      normalize(offer.applicationUrl),
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchExternalOffers(): Promise<ExternalOffer[]> {
  const [workday, smart] = await Promise.all([
    Promise.all(WORKDAY_SOURCES.map(fetchWorkday)),
    Promise.all(SMART_SOURCES.map(fetchSmart)),
  ]);
  return dedupe([...workday.flat(), ...smart.flat()]);
}

export function mergeOffersPayload(basePayload: unknown, external: ExternalOffer[]): unknown {
  if (!basePayload || typeof basePayload !== 'object') return basePayload;
  const payload = basePayload as { generatedAt?: unknown; source?: unknown; offers?: unknown[] };
  const baseOffers = Array.isArray(payload.offers) ? payload.offers : [];
  const combined = [...baseOffers, ...external] as any[];
  const seen = new Set<string>();
  const deduped = combined.filter((offer) => {
    const key = [
      normalize(offer?.company),
      normalize(offer?.title),
      normalize(offer?.city),
      normalize(offer?.applicationUrl),
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    ...payload,
    generatedAt: new Date().toISOString(),
    externalSourceCounts: { worker: external.length },
    offers: deduped,
  };
}
