import { describe, expect, it } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { sectors, targetOffers, followUpDue } from './targets';
const offer = (company: string, title: string, extra = {}) => ({company,title,skills:[],...extra}) as unknown as InternshipOffer;
describe('target strategy', () => {
  it('keeps twenty companies across four sectors', () => {
    expect(sectors).toHaveLength(4);
    expect(new Set(sectors.flatMap(s => s.companies.map(c => c[0]))).size).toBe(20);
  });
  it('separates Siemens businesses and excludes unrelated missions', () => {
    const offers = [offer('Siemens Healthineers','Medical imaging'), offer('Siemens Mobility','Computer Vision'), offer('Alstom','Mechanical design'), offer('Alstom','Traitement d’images')];
    expect(targetOffers(offers, sectors[1]).map(o => o.company)).toEqual(['Siemens Mobility', 'Alstom']);
    expect(targetOffers(offers, sectors[3]).map(o => o.company)).toEqual(['Siemens Healthineers']);
  });
  it('handles accents and subsidiary names', () => {
    expect(targetOffers([offer('Safran.AI','Computer Vision'),offer('Dassault Systemes','Imagerie')], sectors[0])).toHaveLength(1);
    expect(targetOffers([offer('Dassault Systemes','Imagerie')], sectors[3])).toHaveLength(1);
  });
  it('counts due dates inclusively and excludes closed dossiers', () => {
    expect(followUpDue(offer('Safran','CV',{followUpAt:'2026-11-02',applicationStatus:'Relance'}), '2026-11-02')).toBe(true);
    expect(followUpDue(offer('Safran','CV',{followUpAt:'2026-11-01',applicationStatus:'Refus'}), '2026-11-02')).toBe(false);
  });
});
