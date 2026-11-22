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
  const reliable = historicalCohort(offers,today);
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


type DatedOffer = {published:string;applied:string};
/** Only recorded, chronologically coherent dates. */
function historicalCohort(offers:InternshipOffer[],today:string): DatedOffer[] {
  return offers.flatMap(offer=>{
    const published=canonicalDate(offer.publishedAt);
    if(!published || published<'2026-09-01' || published>today || published>'2027-02-28')return [];
    const isSent=hasSubmissionEvidence(offer);
    const applied=isSent?canonicalDate(offer.appliedAt):'';
    if(isSent && (!applied || applied>today || applied<published))return [];
    return [{published,applied}];
  });
}
export type CampaignObservation = {date:string;total:number;applied:number;pending:number};
/** Actual WEEKLY cumulative snapshots until today, plus the precise last day.
 * The smooth curve is a visualization between observed points, NOT a forecast. */
export function campaignTimeline(offers:InternshipOffer[],now:Date,stepDays:1|7=7) {
  const today=now.toISOString().slice(0,10);
  const cutoff=today<'2027-02-28'?today:'2027-02-28';
  const reliable=historicalCohort(offers,cutoff);
  if(cutoff<'2026-09-01')return {points:[] as CampaignObservation[],excluded:offers.length,tracked:0};
  const start=new Date('2026-09-01T12:00:00Z');
  const last=new Date(cutoff+'T12:00:00Z');
  const dates:string[]=[];
  for(let date=new Date(start);date<=last;date.setUTCDate(date.getUTCDate()+stepDays)) {
    dates.push(date.toISOString().slice(0,10));
  }
  if(dates.at(-1)!==cutoff)dates.push(cutoff);
  const points=dates.map(date=>{
    const published=reliable.filter(row=>row.published<=date);
    const applied=published.filter(row=>row.applied && row.applied<=date).length;
    return {date,total:published.length,applied,pending:published.length-applied};
  });
  return {points,excluded:offers.length-reliable.length,tracked:reliable.length};
}
/** Shape-preserving cubic Hermite interpolation with harmonic tangents.
 * Smooth, continuous plot without overshooting actual cumulative observations. */
export function smoothCampaignPath(points:Array<{x:number;y:number}>):string {
  if(!points.length)return '';
  const fmt=(p:{x:number;y:number})=>p.x.toFixed(2)+' '+p.y.toFixed(2);
  if(points.length===1)return 'M '+fmt(points[0]);
  const h:number[]=[],delta:number[]=[];
  for(let i=0;i<points.length-1;i++){
    const width=points[i+1].x-points[i].x;
    if(width<=0 || !Number.isFinite(width))return campaignPath(points);
    h.push(width);
    delta.push((points[i+1].y-points[i].y)/width);
  }
  const slope=new Array<number>(points.length).fill(0);
  slope[0]=delta[0];
  slope[points.length-1]=delta.at(-1)!;
  for(let i=1;i<points.length-1;i++){
    const before=delta[i-1],after=delta[i];
    if(before*after<=0){slope[i]=0;continue;}
    const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];
    slope[i]=(w1+w2)/(w1/before+w2/after);
  }
  let path='M '+fmt(points[0]);
  for(let i=0;i<points.length-1;i++){
    const p=points[i],q=points[i+1],offset=h[i]/3;
    path+=' C '+(p.x+offset).toFixed(2)+' '+(p.y+slope[i]*offset).toFixed(2)+
      ' '+(q.x-offset).toFixed(2)+' '+(q.y-slope[i+1]*offset).toFixed(2)+
      ' '+fmt(q);
  }
  return path;
}
/** Integer Y-axis with four equal steps and a rounded maximum. */
export function campaignAxisMax(max:number):number {
  if(!Number.isFinite(max)||max<=0)return 4;
  const target=max/4;
  const power=10**Math.floor(Math.log10(target));
  const step=[1,2,5,10].map(n=>n*power).find(s=>s>=target)||10*power;
  return step*4;
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
