import { isVisionMission, getOfferPlan, type SearchPlan } from '../../../shared/searchScope';
import type { InternshipOffer } from '../../api/contract';
/** Thirty large employers in France. Both A and B share the same roster. */
export const sectors = [
  { id: 'aeronautique', name: 'Transport aérien & aéronautique', companies: [
    ['Airbus', 'airbus.com/en/careers', 'airbus'],
    ['Safran', 'safran-group.com/fr/offres', 'safran'],
    ['Thales', 'careers.thalesgroup.com', 'thales'],
    ['Dassault Aviation', 'carriere.dassault-aviation.com', 'dassault aviation'],
    ['Air France-KLM', 'recrutement.airfrance.com', 'air france'] ] },
  { id: 'ferroviaire', name: 'Ferroviaire & transport public', companies: [
    ['Alstom', 'jobsearch.alstom.com', 'alstom'],
    ['SNCF', 'emploi.sncf.com', 'sncf'],
    ['RATP', 'ratpgroup.com/fr/rejoignez-nous', 'ratp'],
    ['Siemens Mobility', 'jobs.siemens.com', 'siemens mobility'],
    ['Hitachi Rail', 'careers.hitachi.com', 'hitachi rail'] ] },
  { id: 'automobile', name: 'Automobile & équipementiers', companies: [
    ['Renault Group', 'renaultgroup.com/talents', 'renault|ampere'],
    ['Stellantis', 'careers.stellantis.com', 'stellantis|psa'],
    ['Valeo', 'valeo.com/fr/carrieres', 'valeo'],
    ['FORVIA HELLA', 'forvia.com/en/careers', 'forvia|hella|faurecia'],
    ['Michelin', 'jobs.michelin.com', 'michelin'] ] },
  { id: 'agroalimentaire', name: 'Agroalimentaire', companies: [
    ['Danone', 'careers.danone.com', 'danone|volvic'],
    ['Nestlé', 'www.nestle.com/jobs', 'nestle'],
    ['Lactalis', 'www.lactalis.fr', 'lactalis'],
    ['Bel Group', 'www.groupe-bel.com', 'bel group|groupe bel'] ] },
  { id: 'sante', name: 'Santé & technologies médicales', companies: [
    ['GE HealthCare', 'careers.gehealthcare.com', 'ge healthcare|gehealthcare'],
    ['EssilorLuxottica', 'careers.essilorluxottica.com', 'essilorluxottica|essilor|luxottica'],
    ['Sanofi', 'jobs.sanofi.com', 'sanofi'],
    ['Siemens Healthineers', 'jobs.siemens-healthineers.com', 'siemens healthineers'] ] },
  { id: 'industrie', name: 'Industrie & environnement', companies: [
    ['Schneider Electric', 'careers.se.com', 'schneider electric'],
    ['Saint-Gobain', 'joinus.saint-gobain.com', 'saint gobain|saint-gobain'],
    ['Veolia', 'jobs.veolia.com', 'veolia'],
    ['Air Liquide', 'careers.airliquide.com', 'air liquide'] ] },
  { id: 'energie', name: 'Énergie', companies: [
    ['EDF', 'www.edf.fr/edf-recrute', 'edf'],
    ['ENGIE', 'jobs.engie.com', 'engie|grdf'] ] },
  { id: 'cosmetique', name: 'Cosmétique', companies: [
    ['L’Oréal', 'careers.loreal.com', 'loreal|l oreal'] ] },
] as const;
export const allSectors = sectors;

export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function matchesCompany(offer: InternshipOffer, aliases: string) {
  const company = normalize(offer.company);
  return aliases.split('|').some(alias => company.includes(normalize(alias)));
}
export function isVision(offer: InternshipOffer) {
  return isVisionMission(offer);
}
export function targetOffers(offers: InternshipOffer[], sector: typeof sectors[number] = sectors[0], plan: SearchPlan = 'A') {
  return offers.filter(offer => getOfferPlan(offer) === plan && sector.companies.some(company => matchesCompany(offer, company[2])));
}
export const statuses = ['À candidater', 'Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus', 'Abandonné'];
export function wasSent(offer: InternshipOffer) { return Boolean(offer.appliedAt) || statuses.slice(1, -1).includes(offer.applicationStatus || ''); }
export const editableStatuses = statuses.filter(status => !['À candidater', 'Réponse recruteur'].includes(status));
export function dateKey(value: string | null | undefined): string {
  if (!value) return '';
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const fr = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return fr ? `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}` : '';
}
export function followUpDue(offer: InternshipOffer, today: string) {
  return Boolean(dateKey(offer.followUpAt) && dateKey(offer.followUpAt) <= today && !['Refus', 'Abandonné', 'Offre reçue'].includes(offer.applicationStatus || ''));
}
