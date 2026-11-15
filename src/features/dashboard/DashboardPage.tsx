import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useOfferActions } from '../offers/offerActions';
import { withSavedManualOffers } from '../applications/thalesSavedOffer';
import { combineDossiers, PROSPECTION_EVENT, readProspectionOffers } from '../targets/prospectionAdapter';
import { sectors, followUpDue } from '../targets/targets';
import {
  INITIAL_FILTERS, filterDashboardOffers, uniqueDashboardOffers, dashboardMetrics,
  bySector, byStatus, byCity, applicationWeeks, priorityQueue, hasSubmissionEvidence, canonicalDate,
  routeForOffer, statusGroup, dashboardPlan, type DashboardFilters, type DashboardPeriod,
  type DashboardPlan,
} from './decisionModel';
import { cityPoint, pointXY, francePath } from './franceGeo';
import './dashboard.css';

const number = new Intl.NumberFormat('fr-FR');
const percent = (n: number) => String(n) + ' %';
function formatMonth(s: string) {
  const date = new Date(s + '-01T12:00:00');
  return Number.isNaN(date.getTime()) ? s : date.toLocaleDateString('fr-FR', {month:'short', year:'2-digit'});
}
function Metric({ label, value, hint, accent }: {label:string; value:number|string; hint:string; accent?:string}) {
  return <article className="db-metric" style={{'--metric-accent':accent || '#3168d5'} as React.CSSProperties}>
    <span>{label}</span><strong>{typeof value === 'number' ? number.format(value) : value}</strong>
    <small>{hint}</small>
  </article>;
}
function PanelHeader({title,detail}: {title:string;detail?:string}) {
  return <header className="db-panel-header"><h2>{title}</h2>{detail && <span>{detail}</span>}</header>;
}

export function DashboardPage() {
  const { sectorId } = useParams();
  const [params] = useSearchParams();
  const { data, loading, error, retry } = useOffers();
  const actions = useOfferActions();
  const [now, setNow] = useState(() => new Date());
  const [local, setLocal] = useState(readProspectionOffers);
  const [filters, setFilters] = useState<DashboardFilters>(() => ({
    ...INITIAL_FILTERS,
    plan: params.get('plan') === 'A' ? 'A' : params.get('plan') === 'B' ? 'B' : 'all',
    sector: sectorId && sectors.some(s => s.id === sectorId) ? sectorId : '',
  }));
  const [showAll, setShowAll] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapOrigin, setMapOrigin] = useState({x:310,y:220});

  useEffect(() => {
    const refreshLocal = () => { setLocal(readProspectionOffers()); setNow(new Date()); };
    window.addEventListener(PROSPECTION_EVENT, refreshLocal);
    window.addEventListener('storage', refreshLocal);
    window.addEventListener('focus', refreshLocal);
    return () => { window.removeEventListener(PROSPECTION_EVENT, refreshLocal); window.removeEventListener('storage', refreshLocal); window.removeEventListener('focus', refreshLocal); };
  }, []);
  useEffect(() => {
    if (sectorId && sectors.some(s => s.id === sectorId)) setFilters(f => ({...f, sector: sectorId}));
  }, [sectorId]);
  const setFilter = <K extends keyof DashboardFilters,>(key: K, value: DashboardFilters[K]) =>
    setFilters(f => ({...f, [key]:value}));
  const toggleFilter = (key: 'status'|'sector'|'city'|'sentMonth'|'sentWeek', value:string) =>
    setFilters(f => ({...f,[key]:f[key]===value?'':value}));
  const clear = () => {setFilters(INITIAL_FILTERS);setShowAll(false);};

  const all = useMemo(() => uniqueDashboardOffers(
    combineDossiers(withSavedManualOffers(data?.offers || []), local).filter(o => !actions.hidden[o.id])
  ), [data, local, actions.hidden]);
  const shown = useMemo(() => filterDashboardOffers(all, filters, now), [all, filters, now]);
  const today = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  const metrics = useMemo(() => dashboardMetrics(shown,today),[shown,today]);
  const statusGroups = useMemo(() => byStatus(shown),[shown]);
  const sectorGroups = useMemo(() => bySector(shown),[shown]);
  const cityGroups = useMemo(() => byCity(shown),[shown]);
  const activity = useMemo(() => applicationWeeks(shown, now, 12),[shown,now]);
  const datedSends = shown.filter(o => hasSubmissionEvidence(o) && Boolean(canonicalDate(o.appliedAt))).length;
  const queue = useMemo(() => priorityQueue(shown,today),[shown,today]);
  const maxStatus = Math.max(...statusGroups.map(x=>x.count), 1);
  const maxSector = Math.max(...sectorGroups.map(x=>x.A+x.B+x.other), 1);
  const maxWeek = Math.max(...activity.map(x=>x.count),1);
  const mapped = cityGroups.map(row => ({...row, point:cityPoint(row.city)}))
    .filter((row): row is typeof row & {point:{lon:number;lat:number}} => row.point!==null);
  // Cluster city points near one another on overview; split when zooming in.
  const clusters: Array<{x:number;y:number;count:number;cities:string[]}> = [];
  const radius=mapZoom>=2.5?9:mapZoom>=1.7?13:20;
  for(const item of mapped){
    const at=pointXY(item.point.lon,item.point.lat);
    const cluster=clusters.find(c=>Math.hypot(c.x-at.x,c.y-at.y)<radius);
    if(cluster){
      const total=cluster.count+item.count;
      cluster.x=(cluster.x*cluster.count+at.x*item.count)/total;
      cluster.y=(cluster.y*cluster.count+at.y*item.count)/total;
      cluster.count=total; cluster.cities.push(item.city);
    }else clusters.push({...at,count:item.count,cities:[item.city]});
  }
  const recentActivity=activity.slice(-4).reduce((sum,row)=>sum+row.count,0);
  const coveredPins = mapped.reduce((sum,row)=>sum+row.count,0);
  const unknownPositions = shown.length-coveredPins;
  const companyOptions = [...new Set(all.map(o=>o.company).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  const cityOptions = [...new Set(all.map(o=>o.city).filter((x): x is string => Boolean(x)))].sort((a,b)=>a.localeCompare(b,'fr'));
  const activeCount = (Object.keys(filters) as Array<keyof DashboardFilters>)
    .filter(key => filters[key] !== INITIAL_FILTERS[key]).length;
  const sourceTime = data?.generatedAt && Number.isFinite(Date.parse(data.generatedAt))
    ? new Date(data.generatedAt).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})
    : 'horodatage indisponible';

  if (loading && !data) return <section className="page"><LoadingSkeleton /></section>;
  if (error && !data) return <section className="page"><ErrorState onRetry={retry} /></section>;

  return <section className="page db-root">
    <div className="db-heading">
      <div>
        <h1>Dashboard</h1>
        <p>Décisions de candidature · Données MonStage · Actualisation : {sourceTime}</p>
      </div>
      <div className="db-header-actions">
        <span className="db-source-chip">{number.format(metrics.companies)}/30 entreprises cibles présentes</span>
        <button type="button" className="db-button" onClick={() => {setNow(new Date());retry();}}>↻ Actualiser</button>
      </div>
    </div>
    {error && <div className="db-warning" role="alert">Actualisation impossible : données précédemment chargées affichées.</div>}

    <section className="db-filters" aria-label="Filtres du Dashboard">
      <div className="db-filters-heading"><strong>Filtres d’analyse</strong><span>{activeCount ? String(activeCount)+' actif(s)' : 'Vue complète'}</span>
        <button type="button" onClick={clear}>Réinitialiser</button></div>
      <div className="db-filter-grid">
        <label className="db-field"><span>Plan</span>
          <select aria-label="Filtrer par plan" value={filters.plan} onChange={e=>setFilter('plan',e.target.value as DashboardPlan)}>
            <option value="all">Tous les plans</option><option value="A">Plan A · Computer Vision</option><option value="B">Plan B · Data Analyst</option>
          </select></label>
        <label className="db-field"><span>Secteur</span>
          <select aria-label="Filtrer par secteur" value={filters.sector} onChange={e=>setFilter('sector',e.target.value)}>
            <option value="">Tous les secteurs</option>{sectors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}<option value="autres">Hors des 30 groupes</option>
          </select></label>
        <label className="db-field"><span>Entreprise</span>
          <select aria-label="Filtrer par entreprise" value={filters.company} onChange={e=>setFilter('company',e.target.value)}>
            <option value="">Toutes les entreprises</option>{companyOptions.map(s=><option key={s}>{s}</option>)}
          </select></label>
        <label className="db-field"><span>Ville</span>
          <select aria-label="Filtrer par ville" value={filters.city} onChange={e=>setFilter('city',e.target.value)}>
            <option value="">Toutes les villes</option>{cityOptions.map(s=><option key={s}>{s}</option>)}
          </select></label>
        <label className="db-field"><span>Priorité</span>
          <select aria-label="Filtrer par priorité" value={filters.priority} onChange={e=>setFilter('priority',e.target.value)}>
            <option value="">Toutes</option>{['A+','A','B+','B'].map(s=><option key={s}>{s}</option>)}
          </select></label>
        <label className="db-field"><span>Statut</span>
          <select aria-label="Filtrer par statut" value={filters.status} onChange={e=>setFilter('status',e.target.value)}>
            <option value="">Tous les statuts</option>{statusGroups.map(s=><option key={s.label}>{s.label}</option>)}
          </select></label>
        <label className="db-field"><span>Publication vérifiable</span>
          <select aria-label="Filtrer par période" value={filters.period} onChange={e=>setFilter('period',e.target.value as DashboardPeriod)}>
            <option value="all">Toutes les dates</option><option value="7d">7 derniers jours</option><option value="30d">30 derniers jours</option><option value="90d">90 derniers jours</option>
          </select></label>
        <label className="db-field"><span>Recherche</span>
          <input aria-label="Rechercher dans le Dashboard" type="search" placeholder="Mission, compétence…" value={filters.search} onChange={e=>setFilter('search',e.target.value)}/>
        </label>
      </div>
      {filters.sentWeek && <button className="db-filter-chip" type="button" onClick={()=>setFilter('sentWeek','')}>Semaine du {new Date(filters.sentWeek+'T12:00:00Z').toLocaleDateString('fr-FR')} ×</button>}
      {filters.period !== 'all' && <p className="db-caveat">Le filtre temporel exclut les offres sans date de publication fiable. La date de vérification ne remplace jamais la publication.</p>}
    </section>

    {metrics.unverifiedOutcomes > 0 && <aside className="db-integrity" role="status">
      <span className="db-integrity__mark">!</span>
      <div><strong>{metrics.unverifiedOutcomes} statut(s) « Offre reçue » sans envoi daté</strong>
      <p>Ces annonces sont exclues des offres d’embauche confirmées et du taux de conversion tant que leur statut n’a pas été vérifié.</p></div>
      <button type="button" onClick={()=>setFilter('status','À vérifier')}>Examiner les dossiers</button>
    </aside>}
    <section className="db-kpis" aria-label="Indicateurs clés">
      <Metric label="Dossiers analysés" value={metrics.total} hint="Dans la sélection actuelle" />
      <Metric label="À candidater" value={metrics.toApply} hint={number.format(metrics.priority)+' de priorité A / A+'} accent="#b97b10"/>
      <Metric label="Candidatures envoyées" value={metrics.sent} hint="Envois déclarés ou statut avancé" accent="#4c70ca"/>
      <Metric label="Entretiens & suites" value={metrics.interviews} hint="Entretiens, tests ou offre" accent="#765ac7"/>
      <Metric label="Taux de réponse" value={percent(metrics.responseRate)} hint={number.format(metrics.responses)+' réponses / '+number.format(metrics.sent)+' envois'} accent="#168776"/>
      <Metric label="Relances échues" value={metrics.due} hint="Date de relance renseignée" accent="#d05a46"/>
    </section>

    <div className="db-analytics-grid">
      <section className="db-panel db-status">
        <PanelHeader title="Avancement des candidatures" detail="Clique sur un statut pour filtrer"/>
        <div className="db-status-list">
          {statusGroups.map(row=><button key={row.label} className={'db-status-item'+(filters.status===row.label?' selected':'')} type="button"
            onClick={()=>toggleFilter('status',row.label)} aria-pressed={filters.status===row.label} aria-label={'Filtrer statut '+row.label}>
            <span>{row.label}</span>
            <span className="db-bar-track"><span className={'db-status-bar db-status-bar--'+statusGroups.indexOf(row)} style={{width:(row.count/maxStatus*100)+'%'}}/></span>
            <strong>{number.format(row.count)}</strong>
          </button>)}
        </div>
        <p className="db-note">Chaque dossier compte dans un seul statut actuel. Les étapes ne sont pas additionnées.</p>
      </section>
      <section className="db-panel db-sectors">
        <PanelHeader title="Opportunités par secteur" detail="Plan A / Plan B · Cliquer pour filtrer"/>
        <div className="db-legend"><span><i className="db-dot db-dot--a"/>Plan A</span><span><i className="db-dot db-dot--b"/>Plan B</span><span><i className="db-dot db-dot--other"/>Autre</span></div>
        {sectorGroups.length ? <div className="db-sector-list">
          {sectorGroups.map(row=><button type="button" className={'db-sector-row'+(filters.sector===row.id?' selected':'')}
            key={row.id} onClick={()=>toggleFilter('sector',row.id)} aria-pressed={filters.sector===row.id}
            aria-label={'Filtrer secteur '+row.label}>
            <span className="db-sector-label" title={row.label}>{row.label}</span>
            <span className="db-sector-track">
              {row.A>0 && <span className="db-segment db-segment--a" style={{width:(row.A/maxSector*100)+'%'}}/>}
              {row.B>0 && <span className="db-segment db-segment--b" style={{width:(row.B/maxSector*100)+'%'}}/>}
              {row.other>0 && <span className="db-segment db-segment--other" style={{width:(row.other/maxSector*100)+'%'}}/>}
            </span><strong>{number.format(row.A+row.B+row.other)}</strong>
          </button>)}
        </div> : <p className="db-empty">Aucun dossier dans cette sélection.</p>}
      </section>
    </div>

    <div className="db-analytics-grid db-analytics-grid--second">

      <section className="db-panel db-map-panel">
        <PanelHeader title="Carte des opportunités" detail="France métropolitaine · Points géographiques réels"/>
        <div className="db-geo-summary"><span><strong>{coveredPins}</strong> dossiers localisés</span>
          <span><strong>{unknownPositions}</strong> non positionnés</span>
          <span>La taille du point représente le nombre de dossiers.</span></div>
        <div className="db-map-layout">
          <div className="db-map-canvas" role="group" aria-label="Carte interactive des villes">
            <div className="db-map-tools" aria-label="Zoom de la carte">
              <button type="button" aria-label="Agrandir la carte" disabled={mapZoom>=3.8}
                onClick={()=>setMapZoom(z=>Math.min(4,Math.round((z+.5)*10)/10))}>+</button>
              <button type="button" aria-label="Réduire la carte" disabled={mapZoom<=1}
                onClick={()=>setMapZoom(z=>Math.max(1,Math.round((z-.5)*10)/10))}>−</button>
              <button type="button" aria-label="Réinitialiser le zoom" onClick={()=>{setMapZoom(1);setMapOrigin({x:310,y:220});}}>⌂</button>
            </div>
            <div className="db-map-world" style={{
              transform:'scale('+mapZoom+')',
              transformOrigin:(mapOrigin.x/620*100)+'% '+(mapOrigin.y/440*100)+'%',
            }}>
              <svg viewBox="0 0 620 440" xmlns="http://www.w3.org/2000/svg"
                aria-label="France métropolitaine d'après le tracé public IGN">
                <defs>
                  <pattern id="db-geo-dots" patternUnits="userSpaceOnUse" width="22" height="22">
                    <circle cx="1" cy="1" r=".6" fill="#7c94ad" opacity=".23"/>
                  </pattern>
                </defs>
                <rect width="620" height="440" fill="url(#db-geo-dots)"/>
                <path d={francePath} fill="#e9f1f9" stroke="#91aac5" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              {clusters.map((cluster,i)=>{
                const hasSingle=cluster.cities.length===1;
                const active=hasSingle && filters.city===cluster.cities[0];
                const size=25+Math.min(23,Math.sqrt(cluster.count)*3.8);
                return <button type="button" key={cluster.cities.join('|')+i}
                  className={'db-map-pin db-map-cluster'+(active?' selected':'')}
                  style={{left:(cluster.x/620*100)+'%',top:(cluster.y/440*100)+'%',width:size,height:size}}
                  aria-label={hasSingle?'Filtrer ville '+cluster.cities[0]+' ('+cluster.count+' dossiers)':'Zoomer sur '+cluster.cities.slice(0,3).join(', ')}
                  title={cluster.cities.join(' · ')+' — '+cluster.count+' dossier(s)'}
                  aria-pressed={active} onClick={()=>{
                    if(hasSingle) toggleFilter('city',cluster.cities[0]);
                    else{setMapOrigin({x:cluster.x,y:cluster.y});setMapZoom(z=>Math.min(4,Math.max(2,z*1.8)));}
                  }}>{cluster.count}</button>;
              })}
            </div>
            <span className="db-map-attribution">Fond géographique : © IGN / France GeoJSON · Licence Ouverte</span>
          </div>
          <div className="db-map-cities">
            <strong>Répartition par ville</strong>
            {cityGroups.slice(0,9).map(row=><button className={'db-city-row'+(filters.city===row.city?' selected':'')}
              key={row.city} type="button" aria-label={'Afficher les dossiers à '+row.city}
              onClick={()=>toggleFilter('city',row.city)} aria-pressed={filters.city===row.city}>
              <span>{row.city}</span><b>{number.format(row.count)}</b>
            </button>)}
            {cityGroups.length===0&&<p className="db-empty">Aucune ville connue.</p>}
            <small>{cityGroups.length} villes distinctes · {unknownPositions} dossier(s) sans localisation exploitable</small>
          </div>
        </div>
        <p className="db-note">Les points voisins sont regroupés au zoom général. Cliquez sur un groupe pour agrandir, ou sur une ville pour filtrer les KPIs et les dossiers. Les lieux ambigus restent non positionnés.</p>
      </section>
      <section className="db-panel db-trend">
        <PanelHeader title="Chronologie des envois" detail="12 semaines · Activité hebdomadaire réelle"/>
        <div className="db-trend-summary">
          <span><strong>{recentActivity}</strong> envois datés / 4 dernières semaines</span>
          <span><strong>{Math.max(0,metrics.sent-datedSends)}</strong> envoi(s) sans date</span>
        </div>
        <div className="db-week-chart" role="group" aria-label="Histogramme hebdomadaire des candidatures">
          <div className="db-week-grid" aria-hidden="true">
            <span>{maxWeek}</span><span>{Math.round(maxWeek/2)}</span><span>0</span>
          </div>
          <div className="db-week-bars">
            {activity.map(row=><button key={row.week} type="button"
              className={'db-week-col'+(filters.sentWeek===row.week?' selected':'')}
              title={row.count+' envoi(s) pour la semaine du '+new Date(row.week+'T12:00:00Z').toLocaleDateString('fr-FR')}
              aria-label={'Filtrer les envois semaine du '+row.week}
              aria-pressed={filters.sentWeek===row.week}
              onClick={()=>toggleFilter('sentWeek',row.week)}>
              <span className="db-week-plot"><span className="db-week-count">{row.count||''}</span>
              <span className="db-week-fill" style={{height:(row.count/maxWeek*100)+'%'}}/></span>
              <small>{new Date(row.week+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}</small>
            </button>)}
          </div>
        </div>
        <p className="db-note">Semaines sans envoi affichées à zéro. Cliquez sur une semaine pour filtrer l’ensemble du Dashboard. Les envois sans date ne sont pas placés dans l’historique.</p>
        <div className="db-conversion">
          <h3>Entonnoir de candidatures</h3>
          <div className="db-conversion-stages">
            {[['Envoyées',metrics.sent],['Réponses',metrics.responses],['Entretiens',metrics.interviews],['Offres confirmées',metrics.offersReceived]].map(([name,value])=>
              <div key={name} className="db-conversion-stage"><strong>{value}</strong><span>{name}</span></div>)}
          </div>
          <p className="db-note">{metrics.responses}/{metrics.sent} réponses de recruteurs · Taux de réponse : {percent(metrics.responseRate)} · Taux d’entretien : {percent(metrics.interviewRate)}. Les réponses et entretiens sont des sous-ensembles, pas des étapes additionnables.</p>
          {metrics.unverifiedOutcomes>0&&<p className="db-conversion-warning">{metrics.unverifiedOutcomes} offre(s) signalées sans preuve d’envoi — exclues des offres confirmées.</p>}
        </div>
      </section>
    </div>

    <section className="db-panel db-actions">
      <div className="db-panel-header"><div><h2>À traiter en priorité</h2><span>Relances échues, puis offres à candidater selon la priorité et la publication</span></div>
        <button className="db-button" type="button" onClick={()=>setShowAll(!showAll)}>{showAll?'Voir les priorités':'Voir tous les dossiers'}</button>
      </div>
      <div className="db-table-wrap">
        <table className="db-table">
          <thead><tr><th>Entreprise / mission</th><th>Plan</th><th>Priorité</th><th>Statut</th><th>Prochaine étape</th><th>Dossier</th></tr></thead>
          <tbody>{(showAll?shown:queue).slice(0,showAll?150:12).map(o=><tr key={o.id}>
            <td><strong>{o.company}</strong><span>{o.title}</span><small>{o.city||'Ville non renseignée'}</small></td>
            <td>{dashboardPlan(o)||'—'}</td>
            <td><span className="db-priority">{o.priority||'—'}</span></td>
            <td>{statusGroup(o)}</td>
            <td>{(hasSubmissionEvidence(o)&&followUpDue(o,today))?'Relancer maintenant':statusGroup(o)==='À vérifier'?'Vérifier le statut enregistré avant de compter une offre d’embauche':o.nextAction|| (statusGroup(o)==='À candidater'?'Préparer la candidature':'Suivre le dossier')}</td>
            <td><Link className="db-open" to={routeForOffer(o)}>Ouvrir <span aria-hidden="true">↗</span></Link></td>
          </tr>)}</tbody>
        </table>
        {(!shown.length || (!showAll&&!queue.length)) && <p className="db-empty">{!shown.length?'Aucun dossier correspondant aux filtres.':'Aucune action urgente ou candidature en attente pour cette sélection.'}</p>}
      </div>
      {showAll&&shown.length>150&&<p className="db-note">Les 150 premiers dossiers sont affichés ; affinez les filtres pour voir les autres.</p>}
    </section>
    <footer className="db-footer">
      <span>Données : MonStage / Google Sheets et candidatures spontanées locales. Les filtres s’appliquent à tous les visuels.</span>
      <span>Dernière synchronisation connue : {sourceTime}</span>
    </footer>
  </section>;
}
