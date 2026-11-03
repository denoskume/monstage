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
it('preserves Safran.AI rejection date and deduplicates its local spontaneous lead against the verified submission', () => {
  localStorage.setItem('monstage.prospection.v1', JSON.stringify([{
    id: 'legacy-ai', company: 'Safran.AI', role: 'Stage de fin d’études — Machine Learning et Computer Vision',
    status: 'Candidature envoyée', date: '2026-10-25', followUp: '2026-11-09',
    notes: 'CV v9 et lettre v3 envoyés', site: 'Paris',
  }]));
  const local = readProspectionOffers();
  expect(local).toHaveLength(1);
  expect(local[0].applicationStatus).toBe('Refus');
  expect(local[0].appliedAt).toBe('2026-10-25');
  expect(local[0].followUpAt).toBeNull();
  expect(local[0].nextAction).toContain('Refus du 02/11/2026');
  const verified = {...local[0],
    id: 'EXT-SAFRANAI-20261025', title: 'Candidature spontanée — Stage Machine Learning & Computer Vision',
    applicationStatus: 'Refus', appliedAt: '25/10/2026',
  };
  expect(combineDossiers([verified], local)).toEqual([verified]);
  expect(combineDossiers([], local)).toEqual(local);
});
it('does not suppress distinct Safran.AI applications or interpret a rejected contact as a submitted application', () => {
  localStorage.setItem('monstage.prospection.v1', JSON.stringify([
    {id:'another-ai',company:'Safran.AI',role:'Stage Computer Vision - inspection aéronautique',status:'À contacter',date:'2026-11-01'},
    {id:'contact-only',company:'Safran',role:'Stage Data Analyst',status:'Refus',date:'2026-11-02'},
  ]));
  const local = readProspectionOffers();
  expect(local[0].applicationStatus).toBe('À candidater');
  expect(local[0].appliedAt).toBeNull();
  expect(local[1].applicationStatus).toBe('Refus');
  expect(local[1].appliedAt).toBeNull();
  const verified = { ...local[0], id:'EXT-SAFRANAI-20261025', title:'Candidature spontanée — Stage Machine Learning & Computer Vision' };
  expect(combineDossiers([verified],local)).toHaveLength(3);
});
it('survives invalid local data', () => {
  localStorage.setItem('monstage.prospection.v1', '{');
  expect(readProspectionOffers()).toEqual([]);
});
