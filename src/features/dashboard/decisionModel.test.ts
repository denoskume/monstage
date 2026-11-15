import { expect,test } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import {
  INITIAL_FILTERS, canonicalDate, dashboardMetrics, dashboardPlan, filterDashboardOffers,
  uniqueDashboardOffers, byStatus, applicationMonths, priorityQueue, statusGroup, hasSubmissionEvidence,
} from './decisionModel';
const offer = (id:string, title:string, company:string, status:string, partial:Partial<InternshipOffer>={}): InternshipOffer => ({
  id,company,title,domain:null,city:'Nantes',region:null,m2Fit:'Oui',start:null,duration:null,
  compensation:null,skills:[],publishedAt:'2026-11-12',offerStatus:'Active',applicationStatus:status,
  nextAction:null,applicationUrl:null,shortlist:false,appliedAt:null,followUpAt:null,specialization:null,
  technicalFit:null,decisionScore:null,priority:'A',freshness:null,verifiedAt:null,sourceQuality:null,
  actionLevel:null,calendarFit:null,confidence:null,relevance:null,gaps:null,...partial,
});
const sample=[
  offer('vision','Stage Computer Vision','Alstom','À candidater',{priority:'A+'}),
  offer('analyst','Stage Data Analyst Power BI','SNCF','Candidature envoyée',{appliedAt:'10/11/2026',followUpAt:'12/11/2026'}),
  offer('interview','Stage Computer Vision','Airbus','Entretien',{appliedAt:'2026-11-08'}),
  offer('refus','Stage Data Analyst','Valeo','Refus',{appliedAt:'2026-10-30',publishedAt:null}),
];
test('distinguishes an application status from genuine send and publication dates',()=>{
  expect(canonicalDate('12/11/2026')).toBe('2026-11-12');
  expect(canonicalDate('2026-11-12T12:00:00Z')).toBe('2026-11-12');
  expect(canonicalDate('Vérifié hier')).toBe('');
  expect(dashboardPlan(sample[0])).toBe('A');
  expect(dashboardPlan(sample[1])).toBe('B');
  expect(applicationMonths(sample).map(x=>x.count).reduce((a,b)=>a+b,0)).toBe(3);
});
test('reconciles filtered KPIs and queue with actual source rows',()=>{
  const m=dashboardMetrics(sample,'2026-11-15');
  expect(m.total).toBe(4);
  expect(m.toApply).toBe(1);
  expect(m.sent).toBe(3);
  expect(m.responses).toBe(2);
  expect(m.interviews).toBe(1);
  expect(m.due).toBe(1);
  expect(m.responseRate).toBe(67);
  expect(priorityQueue(sample,'2026-11-15')[0].id).toBe('analyst');
  expect(byStatus(sample).reduce((sum,row)=>sum+row.count,0)).toBe(4);
});
test('filters by plan, city, status and reliable publication rather than verification time',()=>{
  const b=filterDashboardOffers(sample,{...INITIAL_FILTERS,plan:'B'});
  expect(b).toHaveLength(2);
  const sent=filterDashboardOffers(sample,{...INITIAL_FILTERS,plan:'B',status:'Envoyée',city:'Nantes'});
  expect(sent.map(x=>x.id)).toEqual(['analyst']);
  const recent=filterDashboardOffers(sample,{...INITIAL_FILTERS,period:'7d'},new Date('2026-11-15T12:00:00'));
  expect(recent).toHaveLength(3);
  expect(recent.some(x=>x.id==='refus')).toBe(false);
});
test('a follow-up sent is not a recruiter reply',()=>{
  const rows=[offer('followup','Stage Data Analyst','Alstom','Relance',{appliedAt:'2026-11-02'})];
  const metrics=dashboardMetrics(rows,'2026-11-15');
  expect(metrics.sent).toBe(1);
  expect(metrics.responses).toBe(0);
  expect(metrics.responseRate).toBe(0);
  expect(byStatus(rows).find(row=>row.label==='Relance')?.count).toBe(1);
});
test('a job advert incorrectly marked "Offre reçue" is not an employment offer',()=>{
  const wrong=offer('listing','Stage Data Analyst','Michelin','Offre reçue',{appliedAt:null});
  const right=offer('real','Stage Data Analyst','Michelin','Offre reçue',{appliedAt:'2026-11-10'});
  expect(statusGroup(wrong)).toBe('À vérifier');
  expect(hasSubmissionEvidence(wrong)).toBe(false);
  const m=dashboardMetrics([wrong,right],'2026-11-15');
  expect(m.sent).toBe(1);
  expect(m.offersReceived).toBe(1);
  expect(m.unverifiedOutcomes).toBe(1);
});
test('does not duplicate source records and excludes untracked unrelated jobs',()=>{
  const extras=[...sample,sample[0],offer('noise','Stage Computer Vision','Unrelated Co','À candidater')];
  expect(uniqueDashboardOffers(extras)).toHaveLength(4);
});
