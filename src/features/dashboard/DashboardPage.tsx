import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AccountMenu } from '../auth/AccountMenu';
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
import { cityPoint } from './franceGeo';
import { GoogleFranceMap } from './GoogleFranceMap';
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


function ActivityGraph({weeks, selected, onSelect}:{
  weeks:Array<{week:string;count:number}>; selected:string; onSelect:(week:string)=>void;
}) {
  const peak=Math.max(1,...weeks.map(w=>w.count));
  const points=weeks.map((item,index)=>({
    ...item, x:52+(index*822/Math.max(1,weeks.length-1)),
    y:207-item.count/peak*152,
  }));
  const path=points.map((p,i)=>{
    if(i===0)return 'M '+p.x.toFixed(1)+' '+p.y.toFixed(1);
    const q=points[i-1],mid=(q.x+p.x)/2;
    return 'C '+mid.toFixed(1)+' '+q.y.toFixed(1)+' '+mid.toFixed(1)+' '+p.y.toFixed(1)+' '+p.x.toFixed(1)+' '+p.y.toFixed(1);
  }).join(' ');
  const area=path+' L '+(points.at(-1)?.x||874)+' 219 L '+(points[0]?.x||52)+' 219 Z';
  return <div className="db-activity-chart" role="group" aria-label="Activité hebdomadaire des candidatures">
    <svg viewBox="0 0 920 255" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="db-activity-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7772f7" stopOpacity=".23"/>
          <stop offset="100%" stopColor="#7772f7" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[55,131,207].map((y,i)=><g key={y}><line x1="51" y1={y} x2="883" y2={y} stroke="#e9e8f1" strokeDasharray="5 6"/><text x="19" y={y+4} fontSize="13" fill="#a1a4b2">{Math.round(peak*(1-i/2))}</text></g>)}
      <path d={area} fill="url(#db-activity-gradient)"/>
      <path d={path} fill="none" stroke="#7772f7" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map(p=><circle key={p.week} cx={p.x} cy={p.y} r={selected===p.week?7:4.2} fill={selected===p.week?'#5348d7':'#fff'} stroke="#7772f7" strokeWidth="2.5"/>)}
    </svg>
    <div className="db-activity-clicks">
      {points.map(p=><button key={p.week} type="button"
        className={'db-activity-point'+(selected===p.week?' selected':'')}
        style={{left:(p.x/920*100)+'%',top:(p.y/255*100)+'%'}}
        title={p.count+' candidature(s) envoyée(s) · semaine du '+p.week}
        aria-label={'Filtrer les envois semaine du '+p.week}
        aria-pressed={selected===p.week}
        onClick={()=>onSelect(p.week)}><span>{p.count} envoi(s)</span></button>)}
    </div>
    <div className="db-activity-axis">{weeks.filter((_,i)=>i%2===0).map(row=><span key={row.week}>
      {new Date(row.week+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}
    </span>)}</div>
  </div>;
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
  const [panel, setPanel] = useState<'filters'|'analytics'|'map'|'queue'|null>(null);

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
  useEffect(() => {
    if (!panel) return;
    const close = (event:KeyboardEvent) => { if (event.key === 'Escape') setPanel(null); };
    window.addEventListener('keydown',close);
    return () => window.removeEventListener('keydown',close);
  },[panel]);

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
  const mapped = cityGroups.map(row => ({...row, point:cityPoint(row.city)}))
    .filter((row): row is typeof row & {point:{lon:number;lat:number}} => row.point!==null);
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

  return <section className="db-root db-screen" aria-label="Dashboard MonStage">
    <nav className="db-left-rail" aria-label="Navigation MonStage">
      <Link className="db-rail-brand" to="/offers" title="MonStage — Offers" aria-label="MonStage — Offers">✦</Link>
      <div className="db-rail-group">
        <Link to="/offers" aria-label="Offers" title="Offers" className="db-rail-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="7" height="7" rx="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.7"/></svg>
        </Link>
        <Link to="/dashboard" aria-current="page" aria-label="Dashboard" title="Dashboard" className="db-rail-icon active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17V7m0 10h18M7 14l4-4 3 3 5-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
        <Link to="/studio" aria-label="Studio" title="Studio" className="db-rail-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m9 15 3-7 3 7M10 13h4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
        <Link to="/shortlist" aria-label="Saved jobs" title="Saved jobs" className="db-rail-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3.5h12v17l-6-4-6 4z" strokeLinejoin="round"/></svg>
        </Link>
        <button type="button" aria-label="Analyses avancées" title="Analyses avancées" className="db-rail-icon" onClick={()=>setPanel('analytics')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20V11m5 9V6m5 14v-8m5 8V4" strokeLinecap="round"/></svg>
        </button>
        <button type="button" aria-label="Carte géographique" title="Carte" className="db-rail-icon" onClick={()=>setPanel('map')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="db-rail-bottom">
        <button type="button" className="db-rail-icon" title="Filtres" aria-label="Filtres avancés" onClick={()=>setPanel('filters')}>⚙</button>
        <Link to="/offers" className="db-rail-icon" aria-label="Retour aux offres" title="Retour aux offres">↩</Link>
      </div>
    </nav>
    <div className="db-stage">
      <header className="db-topbar">
        <div className="db-topsearch">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input type="search" aria-label="Rechercher dans le Dashboard" placeholder="Search" value={filters.search} onChange={e=>setFilter('search',e.target.value)}/>
        </div>
        <label className="db-plan-picker">
          <span className="sr-only">Filtrer le Dashboard par plan</span>
          <select aria-label="Choisir un plan" value={filters.plan}
            onChange={event => setFilter('plan', event.target.value as DashboardPlan)}>
            <option value="all">Tous les plans</option>
            <option value="A">Plan A</option>
            <option value="B">Plan B</option>
          </select>
        </label>
        <div className="db-topbar-actions">
          {activeCount>0&&<button type="button" onClick={clear} className="db-clear-chip" aria-label="Réinitialiser">Effacer {activeCount} filtre(s) ×</button>}
          <button type="button" title="Filtres et période" onClick={()=>setPanel('filters')} className="db-mini-tool" aria-label="Ouvrir les filtres">☷</button>
          <button type="button" title="Actualiser les données" onClick={()=>{setNow(new Date());retry();}} className="db-mini-tool" aria-label="Actualiser">↻</button>
          <span className="db-topbar-identity"><strong>MonStage</strong><small>Suivi de candidatures</small></span>
          <AccountMenu/>
        </div>
      </header>
      <main className="db-stage-content">
        <div className="db-primary">
          <div className="db-mobile-section-title"><strong>Dashboard</strong><span>Vue d’ensemble</span></div>
          <h1 className="sr-only">Dashboard</h1>
          <section className="db-kpis" aria-label="Indicateurs clés">
            <Metric label="Opportunités" value={metrics.total} hint={metrics.toApply+' à candidater'} accent="#9d86f6"/>
            <Metric label="Progression" value={metrics.sent} hint="Candidatures envoyées" accent="#7679dc"/>
            <Metric label="Taux de réponse" value={percent(metrics.responseRate)} hint={metrics.responses+' retour(s) recruteur'} accent="#7dc4ad"/>
            <Metric label="Entretiens" value={metrics.interviews} hint={metrics.due+' relance(s) échue(s)'} accent="#b898f1"/>
          </section>
          <section className="db-panel db-activity-card">
            <div className="db-hero-panel-title">
              <div><h2>Activité des candidatures</h2><p>12 dernières semaines · envois datés</p></div>
              <span className="db-chart-tag">12 semaines</span>
            </div>
            <ActivityGraph weeks={activity} selected={filters.sentWeek} onSelect={week=>toggleFilter('sentWeek',week)}/>
            <div className="db-activity-footer">
              <div><strong>{recentActivity}</strong><span>Envois / 4 semaines</span></div>
              <div><strong>{metrics.responses}</strong><span>Réponses recruteur</span></div>
              <div><strong>{Math.max(0,metrics.sent-datedSends)}</strong><span>Envois non datés</span></div>
            </div>
          </section>
          <div className="db-visual-space" aria-hidden="true" />
          <button className="db-primary-cta" type="button" onClick={()=>setPanel('queue')}>Voir toutes mes candidatures <span aria-hidden="true">↗</span></button>
        </div>

      </main>
      <span className="db-sync-caption" aria-label="Dernière synchronisation">Données MonStage · {sourceTime}</span>
    </div>
    {panel!==null&&<div className="db-dialog-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)setPanel(null);}}>
      <section className="db-dialog" role="dialog" aria-modal="true" aria-label={panel==='map'?'Carte des opportunités':panel==='filters'?'Filtres du Dashboard':panel==='analytics'?'Analyses avancées':'Dossiers prioritaires'}>
        <header className="db-dialog-header">
          <div><strong>{panel==='filters'?'Filtres avancés':panel==='analytics'?'Analyses des candidatures':panel==='map'?'Carte des opportunités':'Mes candidatures'}</strong>
            <small>Ces vues s’ouvrent sans faire défiler le Dashboard</small>
          </div>
          <button type="button" aria-label="Fermer le panneau" onClick={()=>setPanel(null)}>×</button>
        </header>
        <div className="db-dialog-body">
          {panel==='filters'&&    <section className="db-filters" aria-label="Filtres du Dashboard">
      <div className="db-filters-heading"><strong>Filtres d’analyse</strong><span>{activeCount ? String(activeCount)+' actif(s)' : 'Vue complète'}</span>
        <button type="button" onClick={clear}>Effacer les filtres avancés</button></div>
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
    </section>}
          {panel==='analytics'&&    <div className="db-analytics-grid db-insights-grid">
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

}
          {panel==='map'&&    <div id="dashboard-map-panel" className="db-wide-map">
      <section className="db-panel db-map-panel">
        <PanelHeader title="Carte des opportunités" detail="Google Maps réel · Zoom, déplacement et recherche"/>
        <div className="db-geo-summary">
          <span><strong>{coveredPins}</strong> dossiers localisés</span>
          <span><strong>{unknownPositions}</strong> localisations inconnues</span>
          <span>Une position par ville connue.</span>
        </div>
        <div className="db-map-layout">
          <GoogleFranceMap cities={mapped} selectedCity={filters.city}
            onCitySelect={city => toggleFilter('city', city)}/>
          <div className="db-map-cities">
            <strong>Villes principales</strong>
            {cityGroups.slice(0,10).map(row => <button key={row.city} type="button"
              className={'db-city-row'+(filters.city===row.city?' selected':'')}
              aria-label={'Afficher les dossiers à '+row.city}
              aria-pressed={filters.city===row.city}
              onClick={()=>toggleFilter('city',row.city)}>
              <span>{row.city}</span><b>{number.format(row.count)}</b>
            </button>)}
            {cityGroups.length===0&&<p className="db-empty">Aucune ville connue.</p>}
            <small>{cityGroups.length} villes distinctes · {unknownPositions} dossier(s) non localisable(s)</small>
          </div>
        </div>
        <p className="db-note">Le fond est Google Maps. Les positions correspondent aux centres-villes, pas aux adresses précises des entreprises.</p>
      </section>
    </div>
}
          {panel==='queue'&&    <section id="dashboard-queue-panel" className="db-panel db-actions">
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
}
        </div>
      </section>
    </div>}
  </section>;
}
