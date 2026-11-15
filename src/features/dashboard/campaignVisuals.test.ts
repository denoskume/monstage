import {describe,it,expect} from 'vitest';
import type {InternshipOffer} from '../../api/contract';
import {CAMPAIGN_MONTHS,campaignMonthly,campaignTimeline,campaignAxisMax,smoothCampaignPath,pieSector,statusPie,statusBucket} from './campaignVisuals';

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

describe('continuous campaign line plots with real X and Y axes',()=>{
  it('creates weekly observations, stops at today and does not project into the future',()=>{
    const rows=[
      make('sep','À candidater','2026-09-03',null),
      make('oct','Candidature envoyée','2026-10-04','2026-10-08'),
      make('nov','Candidature envoyée','2026-11-03','2026-11-11'),
      make('unknown','Candidature envoyée',null,'2026-11-11'),
    ];
    const timeline=campaignTimeline(rows,new Date('2026-11-15T14:00:00Z'));
    expect(timeline.points[0]).toEqual({date:'2026-09-01',total:0,applied:0,pending:0});
    expect(timeline.points.at(-1)).toEqual({date:'2026-11-15',total:3,applied:2,pending:1});
    expect(timeline.points).toHaveLength(12);
    expect(timeline.points.every(p=>p.total===p.applied+p.pending)).toBe(true);
    expect(timeline.points.every(p=>p.date<='2026-11-15')).toBe(true);
    expect(timeline.excluded).toBe(1);
  });
  it('interpolates actual points with smooth cubic sections and no overshoot',()=>{
    const path=smoothCampaignPath([{x:0,y:100},{x:10,y:50},{x:20,y:50},{x:30,y:80}]);
    expect(path).toContain(' C ');
    expect(path.startsWith('M 0.00 100.00')).toBe(true);
    expect(path.endsWith('30.00 80.00')).toBe(true);
    const numbers=path.match(/-?\d+\.\d+/g)?.map(Number)||[];
    const vertical=numbers.filter((_,i)=>i%2===1);
    expect(Math.min(...vertical)).toBeGreaterThanOrEqual(49.99);
    expect(Math.max(...vertical)).toBeLessThanOrEqual(100.01);
    expect(smoothCampaignPath([])).toBe('');
    expect(smoothCampaignPath([{x:0,y:0}])).toBe('M 0.00 0.00');
  });
  it('produces clearly graduated integer Y-axis ticks',()=>{
    expect(campaignAxisMax(72)).toBe(80);
    expect(campaignAxisMax(3)).toBe(4);
    expect(campaignAxisMax(0)).toBe(4);
    expect(campaignAxisMax(101)).toBe(200);
  });
});


describe('daily exploration',()=>{
  it('shows the exact day an offer appears and an application is sent',()=>{
    const rows=[make('daily','Candidature envoyée','2026-09-03','2026-09-05')];
    const {points}=campaignTimeline(rows,new Date('2026-09-06T12:00:00Z'),1);
    expect(points).toHaveLength(6);
    expect(points[2]).toEqual({date:'2026-09-03',total:1,applied:0,pending:1});
    expect(points[4]).toEqual({date:'2026-09-05',total:1,applied:1,pending:0});
  });
});
