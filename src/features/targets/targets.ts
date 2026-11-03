import { isVisionMission, getOfferPlan, type SearchPlan } from '../../../shared/searchScope';
import type { InternshipOffer } from '../../api/contract';
export const sectors = [
  { id: 'aeronautique', name: 'Aéronautique & aérospatial', companies: [
    ['Safran', 'safran-group.com/fr/offres', 'safran'], ['Airbus', 'airbus.com/en/careers', 'airbus'], ['Thales', 'careers.thalesgroup.com', 'thales'], ['Dassault Aviation', 'carriere.dassault-aviation.com', 'dassault aviation'], ['RTX / Collins Aerospace', 'careers.rtx.com', 'rtx|collins aerospace|raytheon'] ] },
  { id: 'ferroviaire', name: 'Ferroviaire', companies: [
    ['Alstom', 'jobsearch.alstom.com', 'alstom'], ['SNCF', 'emploi.sncf.com', 'sncf'], ['Siemens Mobility', 'jobs.siemens.com', 'siemens mobility'], ['Hitachi Rail', 'careers.hitachi.com', 'hitachi rail'], ['Wabtec', 'careers.wabtec.com', 'wabtec'] ] },
  { id: 'automobile', name: 'Automobile', companies: [
    ['Valeo', 'valeo.com/fr/carrieres', 'valeo'], ['Renault Group', 'renaultgroup.com/talents', 'renault|ampere'], ['Stellantis', 'careers.stellantis.com', 'stellantis'], ['Bosch', 'bosch.fr/carrieres', 'bosch'], ['FORVIA HELLA', 'forvia.com/en/careers', 'forvia|hella|faurecia'] ] },
  { id: 'sante', name: 'Santé & technologies médicales', companies: [
    ['GE HealthCare', 'careers.gehealthcare.com', 'ge healthcare|gehealthcare'], ['Siemens Healthineers', 'careers.siemens-healthineers.com', 'siemens healthineers'], ['Philips', 'careers.philips.com', 'philips'], ['Canon Medical Systems', 'fr.medical.canon', 'canon medical|olea medical'], ['Dassault Systèmes', '3ds.com/careers', 'dassault systemes|dassault systèmes'] ] },
] as const;
/** Original sectors remain untouched. The added ten only participate in Plan B. */
export const backupSectors = [
  { id: 'data-industrie', name: 'Data · Énergie & infrastructures', companies: [
    ['EDF / Enedis', 'edf.fr/edf-recrute', 'edf|enedis'], ['ENGIE', 'jobs.engie.com', 'engie'],
    ['TotalEnergies', 'careers.totalenergies.com', 'totalenergies'], ['Schneider Electric', 'careers.se.com', 'schneider electric'],
    ['VINCI', 'jobs.vinci.com', 'vinci'] ] },
  { id: 'data-services', name: 'Data · Technologie & finance', companies: [
    ['Orange', 'orange.jobs', 'orange'], ['Capgemini', 'capgemini.com/fr-fr/carrieres', 'capgemini'],
    ['AXA', 'careers.axa.com', 'axa'], ['BNP Paribas', 'group.bnpparibas/emploi-carriere', 'bnp paribas'],
    ['Société Générale', 'careers.societegenerale.com', 'societe generale|société générale|socgen'] ] },
] as const;
export const allSectors = [...sectors, ...backupSectors] as const;
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function matchesCompany(offer: InternshipOffer, aliases: string) {
  const company = normalize(offer.company);
  return aliases.split('|').some(alias => company.includes(normalize(alias)));
}
export function isVision(offer: InternshipOffer) {
  return isVisionMission(offer);
}
export function targetOffers(offers: InternshipOffer[], sector: typeof allSectors[number] = sectors[0], plan: SearchPlan = 'A') {
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
