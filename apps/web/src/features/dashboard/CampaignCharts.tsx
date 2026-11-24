import { useEffect, useId, useMemo, useState } from 'react';
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
  const {points,excluded,tracked}=useMemo(()=>campaignTimeline(offers,now,1),[offers,now]);
  const clipId=useId();
  const [windowDays,setWindowDays]=useState<'all'|'observed'|30|90>('observed');
  const [rangeStart,setRangeStart]=useState(0);
  const [pointerX,setPointerX]=useState<number|null>(null);
  const [hovered,setHovered]=useState<number|null>(null);
  const [visible,setVisible]=useState<SeriesField[]>(['total','applied','pending']);
  const max=campaignAxisMax(Math.max(0,...points.map(row=>row.total)));
  const left=68,right=610,top=24,bottom=262;
  const campaignStart=Date.parse('2026-09-01T12:00:00Z');
  const observedEnd=Math.max(campaignStart+86400000,Date.parse((points.at(-1)?.date||'2026-09-02')+'T12:00:00Z'));
  const domainEnd=windowDays==='all'?Date.parse('2027-03-01T12:00:00Z'):observedEnd;
  const baseStart=typeof windowDays==='number'?Math.max(campaignStart,domainEnd-windowDays*86400000):campaignStart;
  const domainStart=baseStart+(domainEnd-baseStart-86400000)*rangeStart/100;
  const chooseWindow=(value:typeof windowDays)=>{setWindowDays(value);setRangeStart(0);setHovered(null);setPointerX(null);};
  const px=(date:string)=>left+(Date.parse(date+'T12:00:00Z')-domainStart)/(domainEnd-domainStart)*(right-left);
  const py=(n:number)=>bottom-n/max*(bottom-top);
  const observed=points.length>0;
  const todayX=observed?px(points[points.length-1].date):left;
  const active=hovered===null ? null : points[hovered] || null;
  const activeX=pointerX??(active?px(active.date):left);
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
    if(!Number.isFinite(x))x=left;
    let index=0,dist=Infinity;
    points.forEach((row,i)=>{
      const difference=Math.abs(px(row.date)-x);
      if(difference<dist){dist=difference;index=i;}
    });
    setHovered(index);
    setPointerX(Math.max(left,Math.min(todayX,right,x)));
  };
  useEffect(()=>{setHovered(null);setPointerX(null);},[points,domainStart,domainEnd]);

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
    <div className="db-chart-toolbar" aria-label="Période affichée">
      {([{value:'all',label:'Campagne',title:'Toute la campagne'},
        {value:'observed',label:'À ce jour',title:'Du début à aujourd’hui'},
        {value:30,label:'30 j',title:'30 derniers jours'},
        {value:90,label:'90 j',title:'90 derniers jours'}] as const).map(option=>
        <button type="button" key={option.value} aria-label={option.title}
          aria-pressed={windowDays===option.value} onClick={()=>chooseWindow(option.value)}>{option.label}</button>)}
    </div>
    <div className="db-campaign-chart" role="group" tabIndex={0}
      aria-label="Explorer le graphique des offres. Survolez pour voir les trois valeurs, flèches gauche et droite pour les dates, Entrée pour filtrer par mois d’envoi."
      onKeyDown={event=>{
        if(!points.length)return;
        if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
          event.preventDefault();
          setPointerX(null);
          setHovered(index=>Math.min(points.length-1,Math.max(Math.max(0,points.findIndex(row=>px(row.date)>=left)),(index??Math.max(0,points.findIndex(row=>px(row.date)>=left)))+(event.key==='ArrowRight'?1:-1))));
        }else if((event.key==='Enter'||event.key===' ')&&hovered!==null){
          event.preventDefault();
          selectIndex(hovered);
        }else if(event.key==='Escape'){
          setHovered(null);setPointerX(null);
        }
      }}>
      <svg viewBox="0 0 640 325" preserveAspectRatio="none" role="img"
        aria-label={'Graphique en courbes lissées avec axes X et Y de septembre 2026 à février 2027, '+tracked+' offres datées et '+excluded+' dossiers sans historique exploitable'}>
        <defs><clipPath id={clipId}><rect x={left} y={top-6} width={right-left} height={bottom-top+12}/></clipPath></defs>
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
          if(x<left||x>right)return null;
          return <g key={month.month}>
            <line x1={x} y1={top} x2={x} y2={bottom} stroke="#eeeef6"
              strokeDasharray="3 7" strokeWidth="1"/>
            <line x1={x} y1={bottom} x2={x} y2={bottom+5} stroke="#818598"/>
            <text x={x} y={bottom+23} fontSize="12" fill="#73798d" textAnchor="middle">{month.label}</text>
          </g>;
        })}
        {windowDays!=='all'&&[domainStart,domainEnd].map((time,index)=><text key={time}
          x={index?right:left} y={bottom+43} textAnchor={index?'end':'start'} fontSize="12" fill="#73798d">
          {new Date(time).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</text>)}
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
          return <g key={series.field} clipPath={"url(#"+clipId+")"}>
            <path d={smoothCampaignPath(coords)} fill="none" stroke={series.color}
              strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>

          </g>;
        })}
        {active&&<g className="db-campaign-crosshair" pointerEvents="none" clipPath={"url(#"+clipId+")"}>
          <line x1={activeX} x2={activeX} y1={top} y2={bottom}
            stroke="#49485d" strokeWidth="1.5" strokeDasharray="5 4"/>
          {SERIES.filter(series=>visible.includes(series.field)).map(series=>
            <circle key={series.field} cx={px(active.date)} cy={py(active[series.field])}
              r="5.2" stroke={series.color} strokeWidth="3" fill="#fff"/>)}
        </g>}
        <rect className="db-campaign-hitarea" x={left} y={top} width={right-left} height={bottom-top}
          fill="transparent" data-testid="campaign-hover-area"
          onPointerMove={event=>{
            const bounds=event.currentTarget.ownerSVGElement?.getBoundingClientRect();
            if(!bounds?.width)return;
            setNearest((event.clientX-bounds.left)/bounds.width*640);
          }}
          onPointerLeave={()=>{setHovered(null);setPointerX(null);}}
          onPointerDown={event=>{
            const bounds=event.currentTarget.ownerSVGElement?.getBoundingClientRect();
            if(bounds?.width)setNearest((event.clientX-bounds.left)/bounds.width*640);
          }}
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
        <small>Valeurs enregistrées à cette date · cliquez pour filtrer les envois du mois</small>
      </div>}
    </div>
    <label className="db-chart-zoom">Zoom temporel
      <input type="range" min="0" max="95" step="1" value={rangeStart}
        aria-label="Zoom temporel" onChange={event=>{if(windowDays==='all')setWindowDays('observed');setRangeStart(Number(event.target.value));}}/>
      <button type="button" onClick={()=>chooseWindow('all')} aria-label="Réinitialiser le zoom">↺</button>
    </label>
    <p className="db-campaign-footnote">{excluded>0
      ? excluded+' dossier(s) sans dates historiques fiables : non représentés.'
      : 'Évolution cumulative calculée à partir des dates enregistrées.'}
      {' '}Survol : valeurs quotidiennes. Courbes lissées entre les observations, sans prévision.</p>
  </section>;
}
type PieProps={
  offers:InternshipOffer[];
  selected:PieBucket|null;
  onSelect:(bucket:PieBucket)=>void;
};

export function CampaignStatusPie({offers,selected,onSelect}:PieProps) {
  const [highlighted,setHighlighted]=useState<PieBucket|null>(null);
  const buckets=useMemo(()=>statusPie(offers),[offers]);
  const total=offers.length;
  const detail=buckets.find(part=>part.id===highlighted);
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
            style={{opacity:highlighted&&highlighted!==part.id?0.35:1}}
            onMouseEnter={()=>setHighlighted(part.id)} onMouseLeave={()=>setHighlighted(null)}
            onFocus={()=>setHighlighted(part.id)} onBlur={()=>setHighlighted(null)}
            fill={part.color} stroke="#ffffff" strokeWidth="1.5"
            role="button" tabIndex={0} aria-label={part.label+' : '+part.count}
            aria-pressed={selected===part.id} className={selected===part.id?'db-pie-slice selected':'db-pie-slice'}
            onClick={()=>onSelect(part.id)}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(part.id);}}}>
            <title>{part.label} · {part.count} ({total?Math.round(part.count/total*100):0} %)</title>
          </path>)}
          <circle cx="60" cy="60" r="29" fill="#fff" pointerEvents="none"/>
          <text x="60" y="59" textAnchor="middle" fontSize="15" fontWeight="800" fill="#29283f" pointerEvents="none">{total.toLocaleString('fr-FR')}</text>
          <text x="60" y="69" textAnchor="middle" fontSize="6" fill="#777389" pointerEvents="none">Dossiers</text>
        </svg>
      </div>
      {detail&&<div className="db-status-tooltip" role="tooltip">
        <i style={{background:detail.color}}/><strong>{detail.label}</strong>
        <span>{detail.count} dossier(s) · {total?(detail.count/total*100).toLocaleString('fr-FR',{maximumFractionDigits:1}):0} %</span>
      </div>}
      <div className="db-pie-legend">
        {PIE_BUCKETS.map(part=>{
          const found=buckets.find(b=>b.id===part.id);
          return <button key={part.id} type="button"
            className={'db-pie-item'+(selected===part.id?' selected':'')}
            onMouseEnter={()=>setHighlighted(part.id)} onMouseLeave={()=>setHighlighted(null)}
            onFocus={()=>setHighlighted(part.id)} onBlur={()=>setHighlighted(null)}
            onClick={()=>onSelect(part.id)} aria-pressed={selected===part.id}
            aria-label={'Filtrer statut '+part.label}>
            <i style={{backgroundColor:part.color}}/>
            <span>{part.label}</span>
            <strong>{found?.count||0}</strong><small>{total?((found?.count||0)/total*100).toLocaleString('fr-FR',{maximumFractionDigits:1}):0} %</small>
          </button>;
        })}
      </div>
    </div>
    <p className="db-pie-caption">Cliquez sur une catégorie pour filtrer tous les visuels.</p>
  </section>;
}
