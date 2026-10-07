import type { InternshipOffer } from '../../api/contract';

export interface DashboardKpis {
  activeOpportunities: number;
  aOrAPlus: number;
  apply24h: number;
  shortlist: number;
  applicationsSent: number;
  interviews: number;
}

export interface ConversionMetrics {
  applications: number;
  recruiterResponses: number;
  interviews: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}

export interface CountItem {
  label: string;
  count: number;
}

const applicationProgressStatuses = ['Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue'];
const funnelOrder = ['Candidature envoyée', 'Réponse recruteur', 'Entretien', 'Test technique', 'Offre reçue'];

export function getDashboardKpis(offers: InternshipOffer[]): DashboardKpis {
  return {
    activeOpportunities: offers.filter((offer) => !['Refus', 'Abandonné'].includes(offer.applicationStatus ?? '')).length,
    aOrAPlus: offers.filter((offer) => ['A+', 'A'].includes(offer.priority)).length,
    apply24h: offers.filter((offer) => offer.actionLevel === 'CANDIDATER 24H').length,
    shortlist: offers.filter((offer) => offer.shortlist).length,
    applicationsSent: offers.filter((offer) => applicationProgressStatuses.includes(offer.applicationStatus ?? '')).length,
    interviews: offers.filter((offer) => ['Entretien', 'Test technique', 'Offre reçue'].includes(offer.applicationStatus ?? '')).length,
  };
}

export function getConversionMetrics(offers: InternshipOffer[]): ConversionMetrics {
  const applicationStatuses = ['Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus'];
  const responseStatuses = ['Réponse recruteur', 'Entretien', 'Test technique', 'Offre reçue', 'Refus'];
  const interviewStatuses = ['Entretien', 'Test technique', 'Offre reçue'];

  const applications = offers.filter((offer) => applicationStatuses.includes(offer.applicationStatus ?? '')).length;
  const recruiterResponses = offers.filter((offer) => responseStatuses.includes(offer.applicationStatus ?? '')).length;
  const interviews = offers.filter((offer) => interviewStatuses.includes(offer.applicationStatus ?? '')).length;
  const receivedOffers = offers.filter((offer) => offer.applicationStatus === 'Offre reçue').length;
  const rate = (value: number) => applications ? Math.round((value / applications) * 100) : 0;

  return {
    applications,
    recruiterResponses,
    interviews,
    offers: receivedOffers,
    responseRate: rate(recruiterResponses),
    interviewRate: rate(interviews),
    offerRate: rate(receivedOffers),
  };
}

function countBy(offers: InternshipOffer[], value: (offer: InternshipOffer) => string | null, limit?: number): CountItem[] {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    const label = value(offer);
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const result = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fr'));
  return typeof limit === 'number' ? result.slice(0, limit) : result;
}

export function countBySpecialization(offers: InternshipOffer[]): CountItem[] {
  return countBy(offers, (offer) => offer.specialization ?? offer.domain ?? 'Autre');
}

export function countByCity(offers: InternshipOffer[], limit = 8): CountItem[] {
  return countBy(offers, (offer) => offer.city, limit);
}

export function getApplicationFunnel(offers: InternshipOffer[]): CountItem[] {
  return funnelOrder.map((label) => ({
    label,
    count: offers.filter((offer) => offer.applicationStatus === label).length,
  }));
}
