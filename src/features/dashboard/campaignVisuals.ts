import type { InternshipOffer } from '../../api/contract';
import { canonicalDate, hasSubmissionEvidence, statusGroup } from './decisionModel';

/** Campaign started in September 2026, not January 2026.
 * Do not invent future data, publication dates or missing application dates. */
export const CAMPAIGN_MONTHS = [
  { month:'2026-09', label:'sept. 26', full:'septembre 2026' },
  { month:'2026-10', label:'oct. 26', full:'octobre 2026' },
  { month:'2026-11', label:'nov. 26', full:'novembre 2026' },
  { month:'2026-12', label:'déc. 26', full:'décembre 2026' },
  { month:'2027-01', label:'janv. 27', full:'janvier 2027' },
  { month:'2027-02', label:'févr. 27', full:'février 2027' },
] as const;

export type CampaignPoint = {
  month: string;
  label: string;
  full: string;
  total: number | null;
  applied: number | null;
  pending: number | null;
};
export type PieBucket = 'pending' | 'sent' | 'progress' | 'closed' | 'review';

export const PIE_BUCKETS: Array<{id:PieBucket;label:string;color:string}> = [
  {id:'pending',label:'À candidater',color:'#8075ed'},
  {id:'sent',label:'Envoyées / relances',color:'#4daea5'},
  {id:'progress',label:'Réponses / entretiens',color:'#eead70'},
  {id:'closed',label:'Clôturées',color:'#b6abc9'},
  {id:'review',label:'À qualifier / vérifier',color:'#d184aa'},
];

export function statusBucket(offer:InternshipOffer): PieBucket {
  const status=statusGroup(offer);
  if (status==='À candidater') return 'pending';
  if (status==='Envoyée' || status==='Relance') return 'sent';
  if (status==='Réponse' || status==='Entretien' || status==='Offre') return 'progress';
  if (status==='Refus' || status==='Archivée') return 'closed';
  return 'review';
}

export function statusPie(offers:InternshipOffer[]) {
  const counts = new Map<PieBucket,number>();
  for (const offer of offers) {
    const bucket=statusBucket(offer);
    counts.set(bucket,(counts.get(bucket)||0)+1);
  }
  return PIE_BUCKETS.map(bucket => ({...bucket,count:counts.get(bucket.id)||0}));
}

/**
 * Cohort: ONLY offers with real publication dates >= 2026-09-01.
 * Actual sent applications without a dated send cannot be reconstructed
 * historically and are excluded from every curve, not counted as "pending".
 * Thus for each known month: available = applied + not-yet-applied.
 */
export function campaignMonthly(offers:InternshipOffer[],now:Date) {
  const today=now.toISOString().slice(0,10);
  const currentMonth=today.slice(0,7);
  const reliable = offers.flatMap(offer => {
    const published=canonicalDate(offer.publishedAt);
    if(!published || published<'2026-09-01' || published>today) return [];
    const isSent=hasSubmissionEvidence(offer);
    const applied=isSent?canonicalDate(offer.appliedAt):'';
    if (isSent && (!applied || applied>today || applied<published)) return [];
    return [{published,applied}];
  });
  const points:CampaignPoint[]=CAMPAIGN_MONTHS.map(({month,label,full}) => {
    if(month>currentMonth) return {month,label,full,total:null,applied:null,pending:null};
    const end=month===currentMonth?today:month+'-31';
    const available=reliable.filter(row=>row.published<=end);
    const total=available.length;
    const applied=available.filter(row=>row.applied && row.applied<=end).length;
    return {month,label,full,total,applied,pending:total-applied};
  });
  return {points, excluded:offers.length-reliable.length, tracked:reliable.length};
}

export function campaignPath(points:Array<{x:number;y:number}>) {
  if(!points.length) return '';
  return points.map((p,i)=>(i===0?'M ':'L ')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
}

export function pieSector(startAngle:number, endAngle:number,center=60,radius=45):string {
  if(endAngle<=startAngle) return '';
  const angle=endAngle-startAngle;
  const point=(a:number)=>({x:center+radius*Math.cos((a-90)*Math.PI/180),
    y:center+radius*Math.sin((a-90)*Math.PI/180)});
  const from=point(startAngle),to=point(endAngle>=startAngle+360?endAngle-.001:endAngle);
  return 'M '+center+' '+center+' L '+from.x.toFixed(2)+' '+from.y.toFixed(2)+
    ' A '+radius+' '+radius+' 0 '+(angle>180?1:0)+' 1 '+to.x.toFixed(2)+' '+to.y.toFixed(2)+' Z';
}
