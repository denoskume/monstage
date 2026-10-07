export type Priority = 'A+' | 'A' | 'B+' | 'B' | string;

export interface AutonomyEvidence {
  type: string | null;
  confidence: number | null;
  source: 'gmail' | 'calendar' | 'monstage' | string | null;
  detectedAt: string | null;
  evidence: string | null;
}

export interface InternshipOffer {
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
  priority: Priority;
  freshness: string | null;
  verifiedAt: string | null;
  sourceQuality: string | null;
  actionLevel: string | null;
  calendarFit: string | null;
  confidence: string | null;
  relevance: string | null;
  gaps: string | null;
  autonomy?: AutonomyEvidence | null;
}

export interface OffersApiResponse {
  generatedAt: string;
  source: 'Stage Intelligence France';
  autonomyLastSync?: string | null;
  offers: InternshipOffer[];
}
