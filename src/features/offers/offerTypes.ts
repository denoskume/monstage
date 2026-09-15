export interface OfferFilters {
  query: string;
  specialization: string | null;
  city: string | null;
  priority: string | null;
  minScore: number;
  freshness: string | null;
  m2Fit: string | null;
  sourceQuality: string | null;
  applicationStatus: string | null;
  onlyForMe: boolean;
}
