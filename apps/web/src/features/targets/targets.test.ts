import { describe, expect, it } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { sectors, allSectors, targetOffers, followUpDue, dateKey, editableStatuses } from './targets';
const offer = (company: string, title: string, extra = {}) => ({company,title,skills:[],...extra}) as unknown as InternshipOffer;
describe('thirty employers shared by both career plans', () => {
  it('uses exactly thirty companies across eight sectors', () => {
    expect(sectors).toHaveLength(8);
    expect(allSectors).toBe(sectors);
    expect(sectors.map(s=>s.companies.length)).toEqual([5,5,5,4,4,4,2,1]);
    expect(new Set(sectors.flatMap(s => s.companies.map(c => c[0]))).size).toBe(30);
  });
  it('allows both plans for the same employer and multiple B applications', () => {
    const offers = [
      offer('Alstom', 'Stage Computer Vision - inspection'),
      offer('Alstom', 'Stage Data Analyst - fiabilité'),
      offer('Alstom', 'Stage Data Analyst Power BI'),
      offer('SNCF', 'Stage Data Analyst SQL'),
    ];
    expect(targetOffers(offers,sectors[1],'A')).toHaveLength(1);
    expect(targetOffers(offers,sectors[1],'B')).toHaveLength(3);
    expect(targetOffers(offers,sectors[0],'B')).toHaveLength(0);
  });
  it('separates Siemens divisions and excludes unrelated roles', () => {
    const offers = [offer('Siemens Healthineers','Medical imaging'),offer('Siemens Mobility','Computer Vision'),offer('Alstom','Mechanical design'),offer('Alstom','Traitement d’images')];
    expect(targetOffers(offers,sectors[1]).map(o=>o.company)).toEqual(['Siemens Mobility','Alstom']);
    expect(targetOffers(offers,sectors[4]).map(o=>o.company)).toEqual(['Siemens Healthineers']);
  });
  it('matches subsidiaries without expanding the company roster', () => {
    expect(targetOffers([offer('Safran.AI','Computer Vision'),offer('Air France Industries','Data Analyst')],sectors[0],'A')).toHaveLength(1);
    expect(targetOffers([offer('Safran.AI','Computer Vision'),offer('Air France Industries','Data Analyst')],sectors[0],'B')).toHaveLength(1);
  });
  it('keeps application statuses and dates intact', () => {
    expect(editableStatuses).not.toContain('À candidater');
    expect(editableStatuses).not.toContain('Réponse recruteur');
    expect(dateKey('02/11/2026')).toBe('2026-11-02');
    expect(dateKey('2026-11-02T10:00:00Z')).toBe('2026-11-02');
    expect(followUpDue(offer('Safran','CV',{followUpAt:'01/12/2026'}),'2026-11-02')).toBe(false);
    expect(followUpDue(offer('Safran','CV',{followUpAt:'02/11/2026'}),'2026-11-02')).toBe(true);
    expect(followUpDue(offer('Safran','CV',{followUpAt:'2026-11-01',applicationStatus:'Refus'}),'2026-11-02')).toBe(false);
  });
});