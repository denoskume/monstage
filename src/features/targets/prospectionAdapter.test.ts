import { beforeEach, expect, it } from 'vitest';
import { combineDossiers, readProspectionOffers } from './prospectionAdapter';
import { wasSent, targetOffers, sectors } from './targets';
beforeEach(() => localStorage.clear());
it('includes a relevant spontaneous lead without counting a contact as an application', () => {
  localStorage.setItem('monstage.prospection.v1', JSON.stringify([{id:'1',company:'Safran.AI',role:'Computer Vision',status:'Contacté',date:'2026-11-01',followUp:'2026-11-05'}]));
  const offers = readProspectionOffers();
  expect(targetOffers(offers, sectors[0])).toHaveLength(1);
  expect(wasSent(offers[0])).toBe(false);
  expect(offers[0].followUpAt).toBe('2026-11-05');
});
it('counts sent spontaneous applications and deduplicates exact remote copies', () => {
  localStorage.setItem('monstage.prospection.v1', JSON.stringify([{id:'1',company:'Safran',role:'Computer Vision',status:'Candidature envoyée',date:'2026-11-01'}]));
  const local = readProspectionOffers();
  expect(wasSent(local[0])).toBe(true);
  expect(combineDossiers([{...local[0],id:'remote',appliedAt:'01/11/2026'}],local)).toHaveLength(1);
});
it('survives invalid local data', () => {
  localStorage.setItem('monstage.prospection.v1', '{');
  expect(readProspectionOffers()).toEqual([]);
});
