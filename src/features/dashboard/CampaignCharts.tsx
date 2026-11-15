import { useEffect, useMemo, useState } from 'react';
import type { InternshipOffer } from '../../api/contract';
import {
  CAMPAIGN_MONTHS, campaignTimeline, campaignAxisMax, smoothCampaignPath, pieSector,
  PIE_BUCKETS, statusPie, type PieBucket,
} from './campaignVisuals';

type LinesProps={ offers:InternshipOffer[]; now:Date; selectedMonth:string; onMonthSelect:(month:string)=>void };

const SERIES=[
  {field:'total',label:'Offres repérées',color:'#766ef0'},
  {field:'applied',label:'Candidatures envoyées',color:'#2ead92'},
  {field:'pending',label:'Non postulées',color:'#ef807d'},
] as const;

type SeriesField = typeof SERIES[number]['field'];

export function CampaignLines({offers,now,selectedMonth,onMonthSelect}:LinesProps) {
  const {points,excluded,tracked}=useMemo(()=>campaignTimeline(offers,now),[offers,now]);
  const [hovered,setHovered]=useState<number|null>(null);
  const [visible,setVisible]=useState<SeriesField[]>(['total','applied','pending']);
  const max=campaignAxisMax(Math.max(0,...points.map(row=>row.total)));
  const left=68,right=610,top=24,bottom=262;
  const domainStart=Date.parse('2026-09-01T12:00:00Z');
  const domainEnd=Date.parse('2027-03-01T12:00:00Z');
  const px=(date:string)=>left+(Date.parse(date+'T12:00:00Z')-domainStart)/(domainEnd-domainStart)*(right-left);
  const py=(n:number)=>bottom-n/max*(bottom-top);
  const observed=points.length>0;
  const todayX=observed?px(points[points.length-1].date):left;
  const active=hovered===null ? null : points[hovered] || null;
  const activeX=active?px(active.date):left;
  const monthFor=(date:string)=>date.slice(0,7);
  const toggleSeries=(field:SeriesField)=>{
    setVisible(current=>current.includes(field)
      ? current.length===1?current:current.filter(item=>item!==field)
      : [...current,field]);
  };
  const selectIndex=(index:number)=>{
    const row=points[index];
    if(row)onMonthSelect(selectedMonth===monthFor(row.date)?'':monthFor(row.date));
  };
  const setNearest=(x:number)=>{
    if(!points.length)return;
    let index=0,dist=Infinity;
    points.forEach((row,i)=>{
      const difference=Math.abs(px(row.date)-x);
      if(difference<dist){dist=difference;index=i;}
    });
    setHovered(index);
  };
  useEffect(()=>setHovered(null),[points]);

  return <section className="db-mini-panel db-campaign-lines" aria-label="Évolution de la campagne">
    <div className="db-mini-panel-header">
      <h2>Campagne de stages</h2>
      {selectedMonth
        ? <button className="db-campaign-clear" type="button"
            aria-label="Effacer le filtre du mois" onClick={()=>onMonthSelect('')}>
            {new Date(selectedMonth+'-01T12:00:00Z').toLocaleDateString('fr-FR',{month:'short',year:'numeric'})} ×
          </button>
        : <span>Sept. 2026 – févr. 2027</span>}
    </div>
    <div className="db-campaign-legend" aria-label="Légende des trois courbes">
      {SERIES.map(series=><button key={series.field} type="button"
        className={'db-campaign-series'+(visible.includes(series.field)?'':' muted')}
        aria-pressed={visible.includes(series.field)}
        aria-label={'Afficher la courbe '+series.label}
        onClick={()=>toggleSeries(series.field)}>
        <i style={{backgroundColor:series.color}}/>{series.label}
      </button>)}
    </div>
    <div className="db-campaign-chart" role="group" tabIndex={0}
      aria-label="Explorer le graphique des offres. Survolez pour voir les trois valeurs, flèches gauche et droite pour les dates, Entrée pour filtrer par mois d’envoi."
      onKeyDown={event=>{
        if(!points.length)return;
        if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
          event.preventDefault();
          setHovered(index=>Math.min(points.length-1,Math.max(0,(index??0)+(event.key==='ArrowRight'?1:-1))));
        }else if((event.key==='Enter'||event.key===' ')&&hovered!==null){
          event.preventDefault();
          selectIndex(hovered);
        }else if(event.key==='Escape'){
          setHovered(null);
        }
      }}>
      <svg viewBox="0 0 640 325" preserveAspectRatio="none" role="img"
        aria-label={'Graphique en courbes lissées avec axes X et Y de septembre 2026 à février 2027, '+tracked+' offres datées et '+excluded+' dossiers sans historique exploitable'}>
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
        {SERIES.filter(series=>visible.includes(series.field)).map(series=>{
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
        {active&&<g className="db-campaign-crosshair" pointerEvents="none">
          <line x1={activeX} x2={activeX} y1={top} y2={bottom}
            stroke="#49485d" strokeWidth="1.5" strokeDasharray="5 4"/>
          {SERIES.filter(series=>visible.includes(series.field)).map(series=>
            <circle key={series.field} cx={activeX} cy={py(active[series.field])}
              r="5.2" stroke={series.color} strokeWidth="3" fill="#fff"/>)}
        </g>}
        <rect className="db-campaign-hitarea" x={left} y={top} width={right-left} height={bottom-top}
          fill="transparent" data-testid="campaign-hover-area"
          onPointerMove={event=>{
            const bounds=event.currentTarget.ownerSVGElement?.getBoundingClientRect();
            if(!bounds?.width)return;
            setNearest((event.clientX-bounds.left)/bounds.width*640);
          }}
          onPointerLeave={()=>setHovered(null)}
          onClick={()=>{if(hovered!==null)selectIndex(hovered);}}
        />
      </svg>
      {active && <div className="db-campaign-tooltip" role="status" aria-live="polite"
        style={{left:Math.max(30,Math.min(71,activeX/640*100))+'%'}}>
        <strong>{new Date(active.date+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</strong>
        {SERIES.map(series=><div key={series.field} className="db-campaign-tooltip-row">
          <i style={{backgroundColor:series.color}}/><span>{series.label}</span>
          <b>{active[series.field]}</b>
        </div>)}
        <small>Cliquez pour filtrer les envois de ce mois</small>
      </div>}
    </div>
    <p className="db-campaign-footnote">{excluded>0
      ? excluded+' dossier(s) sans dates historiques fiables : non représentés.'
      : 'Évolution cumulative calculée à partir des dates enregistrées.'}
      {' '}Survolez les courbes pour comparer les valeurs. Cliquez pour filtrer le mois d’envoi.</p>
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
