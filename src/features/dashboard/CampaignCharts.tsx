import { useMemo } from 'react';
import type { InternshipOffer } from '../../api/contract';
import {
  CAMPAIGN_MONTHS, campaignMonthly, campaignPath, pieSector,
  PIE_BUCKETS, statusPie, type PieBucket,
} from './campaignVisuals';

type LinesProps={ offers:InternshipOffer[]; now:Date };

const SERIES=[
  {field:'total',label:'Offres repérées',color:'#766ef0'},
  {field:'applied',label:'Candidatures envoyées',color:'#2ead92'},
  {field:'pending',label:'Non postulées',color:'#ef807d'},
] as const;

export function CampaignLines({offers,now}:LinesProps) {
  const {points,excluded,tracked}=useMemo(()=>campaignMonthly(offers,now),[offers,now]);
  const max=Math.max(1,...points.flatMap(row=>[row.total||0,row.applied||0,row.pending||0]));
  const x=(i:number)=>33+i* (433/Math.max(1,CAMPAIGN_MONTHS.length-1));
  const y=(value:number)=>120-100*value/max;

  return <section className="db-mini-panel db-campaign-lines" aria-label="Évolution de la campagne">
    <div className="db-mini-panel-header">
      <h2>Campagne de stages</h2>
      <span>Sept. 2026 – févr. 2027</span>
    </div>
    <div className="db-campaign-legend" aria-label="Légende des trois courbes">
      {SERIES.map(series=><span key={series.field}>
        <i style={{backgroundColor:series.color}}/>{series.label}
      </span>)}
    </div>
    <div className="db-campaign-chart" role="img"
      aria-label={'Trois courbes cumulatives de septembre 2026 à février 2027, '+tracked+' annonces historiquement datées ; '+excluded+' dossiers non traçables'}>
      <svg viewBox="0 0 500 144" preserveAspectRatio="none" aria-hidden="true">
        {[20,70,120].map((line,i)=><g key={line}>
          <line x1="32" x2="473" y1={line} y2={line} stroke="#efedf6" strokeDasharray="3 5"/>
          <text x="5" y={line+4} fontSize="10" fill="#9b9aad">{Math.round(max*(1-i/2))}</text>
        </g>)}
        {SERIES.map(series=>{
          const pts=points.flatMap((row,i)=>row[series.field]===null?[]:[{x:x(i),y:y(row[series.field] as number),value:row[series.field] as number,full:row.full}]);
          return <g key={series.field}>
            <path d={campaignPath(pts)} fill="none" stroke={series.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
            {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.7" stroke={series.color} strokeWidth="2" fill="#fff">
              <title>{p.full} : {series.label} — {p.value}</title>
            </circle>)}
          </g>;
        })}
      </svg>
      <div className="db-campaign-months">
        {points.map(point=><span key={point.month} title={point.full}>
          {point.label}{point.total===null&&<i title="Période à venir : aucune projection">·</i>}
        </span>)}
      </div>
    </div>
    <p className="db-campaign-footnote">{excluded>0
      ? excluded+' dossier(s) exclus des courbes : dates manquantes, incohérentes ou hors campagne.'
      : 'Courbes cumulatives issues des dates enregistrées.'} Aucun chiffre futur n’est inventé.</p>
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
