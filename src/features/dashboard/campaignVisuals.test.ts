import {describe,it,expect} from 'vitest';
import type {InternshipOffer} from '../../api/contract';
import {CAMPAIGN_MONTHS,campaignMonthly,pieSector,statusPie,statusBucket} from './campaignVisuals';

const make=(id:string,status:string,publishedAt:string|null,appliedAt:string|null):InternshipOffer=>({
  id,company:'Airbus',title:'Stage Computer Vision',city:'Toulouse',region:null,
  domain:null,m2Fit:'Oui',start:null,duration:null,compensation:null,skills:[],
  publishedAt,offerStatus:'Active',applicationStatus:status,nextAction:null,applicationUrl:null,
  shortlist:false,appliedAt,followUpAt:null,specialization:null,technicalFit:null,
  decisionScore:null,priority:'A',freshness:null,verifiedAt:null,sourceQuality:null,
  actionLevel:null,calendarFit:null,confidence:null,relevance:null,gaps:null,
});
describe('September 2026 to February 2027 visual campaign',()=>{
  it('always displays exactly the six real campaign months in order',()=>{
    expect(CAMPAIGN_MONTHS.map(m=>m.month)).toEqual([
      '2026-09','2026-10','2026-11','2026-12','2027-01','2027-02',
    ]);
    expect(CAMPAIGN_MONTHS.map(m=>m.full)).toEqual([
      'septembre 2026','octobre 2026','novembre 2026',
      'décembre 2026','janvier 2027','février 2027',
    ]);
  });
  it('reconstructs historical totals as applied plus not yet applied and never forecasts',()=>{
    const rows=[
      make('a','À candidater','2026-09-15',null),
      make('b','Candidature envoyée','2026-10-04','2026-10-08'),
      make('c','Candidature envoyée','2026-09-03','2026-11-03'),
      make('d','À candidater',null,null),
      make('e','À candidater','2026-07-01',null),
      make('f','Candidature envoyée','2026-10-09',null),
      make('g','À candidater','2026-12-01',null),
    ];
    const result=campaignMonthly(rows,new Date('2026-11-15T14:00:00Z'));
    expect(result.tracked).toBe(3);
    expect(result.excluded).toBe(4);
    expect(result.points.map(p=>[p.total,p.applied,p.pending])).toEqual([
      [2,0,2],[3,1,2],[3,2,1],[null,null,null],[null,null,null],[null,null,null],
    ]);
    for(const point of result.points.filter(p=>p.total!==null)) {
      expect(point.total).toBe((point.applied||0)+(point.pending||0));
    }
  });
  it('keeps exactly five exclusive, exhaustive pie groups',()=>{
    const rows=[
      make('a','À candidater','2026-09-15',null),
      make('b','Candidature envoyée','2026-10-04','2026-10-08'),
      make('c','Entretien','2026-09-03','2026-09-17'),
      make('d','Refus','2026-10-09','2026-10-19'),
      make('e','Offre reçue','2026-11-01',null),
    ];
    expect(statusPie(rows).map(o=>o.count)).toEqual([1,1,1,1,1]);
    expect(new Set(rows.map(statusBucket)).size).toBe(5);
    expect(pieSector(0,120)).toContain(' A ');
    expect(pieSector(0,0)).toBe('');
  });
});
