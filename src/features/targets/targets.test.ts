import { describe, expect, it } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { sectors, allSectors, targetOffers, followUpDue, dateKey, editableStatuses } from './targets';
const offer = (company: string, title: string, extra = {}) => ({company,title,skills:[],...extra}) as unknown as InternshipOffer;
describe('target strategy', () => {
  it('keeps twenty companies across four sectors', () => {
    expect(sectors).toHaveLength(4);
    expect(new Set(sectors.flatMap(s => s.companies.map(c => c[0]))).size).toBe(20);
  });
  it('adds exactly ten B-only companies across two new sectors', () => {
    expect(allSectors).toHaveLength(6);
    expect(allSectors.slice(4).flatMap(sector => sector.companies.map(company => company[0]))).toHaveLength(10);
    expect(targetOffers([offer('EDF Enedis','Stage Data Analyst maintenance prédictive')], allSectors[4], 'B1')).toHaveLength(1);
    expect(targetOffers([offer('EDF Enedis','Stage Computer Vision')], allSectors[4], 'A')).toHaveLength(0);
    expect(targetOffers([offer('BNP Paribas','Stage Data Analyst Power BI')], allSectors[5], 'B2')).toHaveLength(1);
    expect(targetOffers([offer('Alstom','Stage Data Analyst fiabilité RAMS')], allSectors[1], 'B1')).toHaveLength(1);
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
  it('uses only backend-supported write statuses and parses French dates', () => {
    expect(editableStatuses).not.toContain('À candidater');
    expect(editableStatuses).not.toContain('Réponse recruteur');
    expect(dateKey('02/11/2026')).toBe('2026-11-02');
    expect(dateKey('2026-11-02T10:00:00Z')).toBe('2026-11-02');
    expect(followUpDue(offer('Safran','CV',{followUpAt:'01/12/2026'}), '2026-11-02')).toBe(false);
    expect(followUpDue(offer('Safran','CV',{followUpAt:'02/11/2026'}), '2026-11-02')).toBe(true);
  });
  it('counts due dates inclusively and excludes closed dossiers', () => {
    expect(followUpDue(offer('Safran','CV',{followUpAt:'2026-11-02',applicationStatus:'Relance'}), '2026-11-02')).toBe(true);
    expect(followUpDue(offer('Safran','CV',{followUpAt:'2026-11-01',applicationStatus:'Refus'}), '2026-11-02')).toBe(false);
  });
});
