import { useMemo } from 'react';
import type { InternshipOffer } from '../../api/contract';
import {
  CAMPAIGN_MONTHS, campaignTimeline, campaignAxisMax, smoothCampaignPath, pieSector,
  PIE_BUCKETS, statusPie, type PieBucket,
} from './campaignVisuals';

type LinesProps={ offers:InternshipOffer[]; now:Date };

const SERIES=[
  {field:'total',label:'Offres repérées',color:'#766ef0'},
  {field:'applied',label:'Candidatures envoyées',color:'#2ead92'},
  {field:'pending',label:'Non postulées',color:'#ef807d'},
] as const;

export function CampaignLines({offers,now}:LinesProps) {
  const {points,excluded,tracked}=useMemo(()=>campaignTimeline(offers,now),[offers,now]);
  const max=campaignAxisMax(Math.max(0,...points.map(row=>row.total)));
  const left=68,right=610,top=24,bottom=262;
  const domainStart=Date.parse('2026-09-01T12:00:00Z');
  const domainEnd=Date.parse('2027-03-01T12:00:00Z');
  const px=(date:string)=>left+(Date.parse(date+'T12:00:00Z')-domainStart)/(domainEnd-domainStart)*(right-left);
  const py=(n:number)=>bottom-n/max*(bottom-top);
  const observed=points.length>0;
  const todayX=observed?px(points[points.length-1].date):left;

  return <section className="db-mini-panel db-campaign-lines" aria-label="Évolution de la campagne">
    <div className="db-mini-panel-header">
      <h2>Campagne de stages</h2><span>Sept. 2026 – févr. 2027</span>
    </div>
    <div className="db-campaign-legend" aria-label="Légende des trois courbes">
      {SERIES.map(series=><span key={series.field}>
        <i style={{backgroundColor:series.color}}/>{series.label}</span>)}
    </div>
    <div className="db-campaign-chart" role="img"
      aria-label={'Graphique en courbes lissées avec axes X et Y de septembre 2026 à février 2027, '+tracked+' offres datées et '+excluded+' dossiers sans historique exploitable'}>
      <svg viewBox="0 0 640 325" preserveAspectRatio="none" aria-hidden="true">
        {observed&&todayX<right&&<rect x={todayX} y={top} width={right-todayX} height={bottom-top}
          fill="#faf9ff" opacity=".8"/>}
        {[0,1,2,3,4].map(index=>{
          const value=index*max/4,y=py(value);
          return <g key={index}>
            <line x1={left} y1={y} x2={right} y2={y} stroke="#e8e8f2"
              strokeDasharray={index===0?undefined:"4 5"} strokeWidth="1"/>
            <text x={left-12} y={y+4} textAnchor="end" fill="#71778b" fontSize="13">{value}</text>
          </g>;
        })}
        {CAMPAIGN_MONTHS.map(month=>{
          const x=px(month.month+'-01');
          return <g key={month.month}>
            <line x1={x} y1={top} x2={x} y2={bottom} stroke="#eeeef6"
              strokeDasharray="3 7" strokeWidth="1"/>
            <line x1={x} y1={bottom} x2={x} y2={bottom+5} stroke="#818598"/>
            <text x={x} y={bottom+23} fontSize="12" fill="#73798d" textAnchor="middle">{month.label}</text>
          </g>;
        })}
        <path d={'M '+left+' '+top+' V '+bottom+' H '+right} fill="none"
          stroke="#636779" strokeWidth="1.8" strokeLinecap="round"/>
        <text x={(left+right)/2} y="318" fontSize="13" fill="#50576e"
          fontWeight="700" textAnchor="middle">Date (mois)</text>
        <text transform={'translate(19 '+((top+bottom)/2)+') rotate(-90)'}
          fontSize="13" fill="#50576e" fontWeight="700" textAnchor="middle">Nombre de dossiers</text>
        {observed&&todayX<right&&<g>
          <line x1={todayX} y1={top} x2={todayX} y2={bottom}
            stroke="#b9aefa" strokeWidth="1.3" strokeDasharray="5 5"/>
          <text x={todayX+7} y={top+12} fill="#776ed1" fontSize="11">Aujourd’hui</text>
        </g>}
        {SERIES.map(series=>{
          const coords=points.map(row=>({
            x:px(row.date),y:py(row[series.field]),value:row[series.field],date:row.date,
          }));
          return <g key={series.field}>
            <path d={smoothCampaignPath(coords)} fill="none" stroke={series.color}
              strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>
            {coords.filter((_,index)=>index===0||index===coords.length-1||index%3===0)
              .map(p=><circle key={p.date} cx={p.x} cy={p.y} r="3.1"
                fill="#fff" stroke={series.color} strokeWidth="2">
                <title>{series.label} : {p.value} — {new Date(p.date+'T12:00:00Z').toLocaleDateString('fr-FR')}</title>
              </circle>)}
          </g>;
        })}
      </svg>
    </div>
    <p className="db-campaign-footnote">{excluded>0
      ? excluded+' dossier(s) sans dates historiques fiables : non représentés.'
      : 'Évolution cumulative calculée à partir des dates enregistrées.'}
      {' '}Lissage visuel des observations, sans prévision future.</p>
  </section>;
}
type PieProps={
  offers:InternshipOffer[];
  selected:PieBucket|null;
  onSelect:(bucket:PieBucket)=>void;
};

export function CampaignStatusPie({offers,selected,onSelect}:PieProps) {
  const buckets=useMemo(()=>statusPie(offers),[offers]);
  const total=offers.length;
  let angle=0;
  const arcs=buckets.filter(part=>part.count>0).map(part=>{
    const from=angle;
    const to=angle+(total?part.count/total*360:0);
    angle=to;
    return {...part,path:pieSector(from,to)};
  });
  return <section className="db-mini-panel db-pie-panel" aria-label="Répartition des statuts">
    <div className="db-mini-panel-header">
      <h2>Statut des dossiers</h2><span>{total} dossier(s)</span>
    </div>
    <div className="db-pie-layout">
      <div className="db-pie-graphic">
        <svg viewBox="0 0 120 120" aria-label="Pie chart des candidatures" role="img">
          <circle cx="60" cy="60" r="45" fill="#eceaf5"/>
          {arcs.map(part=><path key={part.id} d={part.path}
            fill={part.color} stroke="#ffffff" strokeWidth="1.5"
            role="button" tabIndex={0} aria-label={part.label+' : '+part.count}
            aria-pressed={selected===part.id} className={selected===part.id?'db-pie-slice selected':'db-pie-slice'}
            onClick={()=>onSelect(part.id)}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(part.id);}}}>
            <title>{part.label} · {part.count} ({total?Math.round(part.count/total*100):0} %)</title>
          </path>)}
        </svg>
      </div>
      <div className="db-pie-legend">
        {PIE_BUCKETS.map(part=>{
          const found=buckets.find(b=>b.id===part.id);
          return <button key={part.id} type="button"
            className={'db-pie-item'+(selected===part.id?' selected':'')}
            onClick={()=>onSelect(part.id)} aria-pressed={selected===part.id}
            aria-label={'Filtrer statut '+part.label}>
            <i style={{backgroundColor:part.color}}/>
            <span>{part.label}</span>
            <strong>{found?.count||0}</strong>
          </button>;
        })}
      </div>
    </div>
    <p className="db-pie-caption">Cliquez sur une catégorie pour filtrer tous les visuels.</p>
  </section>;
}
