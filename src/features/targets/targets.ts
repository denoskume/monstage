import type { InternshipOffer } from '../../api/contract';
export const sectors = [
  { id: 'aeronautique', name: 'Aéronautique & aérospatial', companies: [
    ['Safran', 'safran-group.com/fr/offres', 'safran'], ['Airbus', 'airbus.com/en/careers', 'airbus'], ['Thales', 'careers.thalesgroup.com', 'thales'], ['Dassault Aviation', 'carriere.dassault-aviation.com', 'dassault aviation'], ['RTX / Collins Aerospace', 'careers.rtx.com', 'rtx|collins aerospace|raytheon'] ] },
  { id: 'ferroviaire', name: 'Ferroviaire', companies: [
    ['Alstom', 'jobsearch.alstom.com', 'alstom'], ['SNCF', 'emploi.sncf.com', 'sncf'], ['Siemens Mobility', 'jobs.siemens.com', 'siemens mobility'], ['Hitachi Rail', 'careers.hitachi.com', 'hitachi rail'], ['Wabtec', 'careers.wabtec.com', 'wabtec'] ] },
  { id: 'automobile', name: 'Automobile', companies: [
    ['Valeo', 'valeo.com/fr/carrieres', 'valeo'], ['Renault Group', 'renaultgroup.com/talents', 'renault'], ['Stellantis', 'careers.stellantis.com', 'stellantis'], ['Bosch', 'bosch.fr/carrieres', 'bosch'], ['FORVIA HELLA', 'forvia.com/en/careers', 'forvia|hella'] ] },
  { id: 'sante', name: 'Santé & technologies médicales', companies: [
    ['GE HealthCare', 'careers.gehealthcare.com', 'ge healthcare|gehealthcare'], ['Siemens Healthineers', 'careers.siemens-healthineers.com', 'siemens healthineers'], ['Philips', 'careers.philips.com', 'philips'], ['Canon Medical Systems', 'fr.medical.canon', 'canon medical'], ['Dassault Systèmes', '3ds.com/careers', 'dassault systemes|dassault systèmes'] ] },
] as const;
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function matchesCompany(offer: InternshipOffer, aliases: string) {
  const company = normalize(offer.company);
  return aliases.split('|').some(alias => company.includes(normalize(alias)));
}
export function isVision(offer: InternshipOffer) {
  return /computer vision|vision par ordinateur|vision artificielle|traitement.{0,8}image|image processing|imagerie|imaging|machine vision|vision industrielle/i.test([offer.title, offer.specialization, offer.domain, ...offer.skills].join(' '));
}
export function targetOffers(offers: InternshipOffer[], sector: typeof sectors[number] = sectors[0]) {
  return offers.filter(offer => isVision(offer) && sector.companies.some(company => matchesCompany(offer, company[2])));
}
export const statuses = ['À candidater', 'Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue', 'Refus', 'Abandonné'];
export function wasSent(offer: InternshipOffer) { return Boolean(offer.appliedAt) || statuses.slice(1, -1).includes(offer.applicationStatus || ''); }
export function followUpDue(offer: InternshipOffer, today: string) {
  return Boolean(offer.followUpAt && offer.followUpAt.slice(0, 10) <= today && !['Refus', 'Abandonné', 'Offre reçue'].includes(offer.applicationStatus || ''));
}
