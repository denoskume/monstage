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
  bySector, byStatus, byCity, applicationMonths, priorityQueue,
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
  const toggleFilter = (key: 'status'|'sector'|'city'|'sentMonth', value:string) =>
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
  const sentMonths = useMemo(() => applicationMonths(shown),[shown]);
  const queue = useMemo(() => priorityQueue(shown,today),[shown,today]);
  const maxStatus = Math.max(...statusGroups.map(x=>x.count), 1);
  const maxSector = Math.max(...sectorGroups.map(x=>x.A+x.B+x.other), 1);
  const maxMonth = Math.max(...sentMonths.map(x=>x.count), 1);
  const mapped = cityGroups.map(row => ({...row, point:cityPoint(row.city)}))
    .filter((row): row is typeof row & {point:{lon:number;lat:number}} => row.point!==null);
  const visiblePins = mapped.slice(0,25);
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
      {filters.sentMonth && <button className="db-filter-chip" type="button" onClick={()=>setFilter('sentMonth','')}>Envois : {formatMonth(filters.sentMonth)} ×</button>}
      {filters.period !== 'all' && <p className="db-caveat">Le filtre temporel exclut les offres sans date de publication fiable. La date de vérification ne remplace jamais la publication.</p>}
    </section>

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
        <PanelHeader title="Carte des opportunités" detail="France · Villes renseignées"/>
        <div className="db-map-layout">
          <div className="db-map-canvas" role="group" aria-label="Carte interactive des villes">
            <svg viewBox="0 0 620 440" xmlns="http://www.w3.org/2000/svg" aria-label="Contour simplifié de la France métropolitaine">
              <defs><pattern id="db-dot-grid" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="2" cy="2" r="0.8" fill="currentColor" opacity=".11"/></pattern></defs>
              <rect width="620" height="440" fill="url(#db-dot-grid)"/>
              <path d={francePath} fill="#e8f0fb" stroke="#a3bad4" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            {visiblePins.map(row=>{
              const coords=pointXY(row.point.lon,row.point.lat);
              const isActive=filters.city===row.city;
              const size=13+Math.min(19,Math.sqrt(row.count)*4);
              return <button type="button" key={row.city}
                className={'db-map-pin'+(isActive?' selected':'')}
                style={{left:(coords.x/620*100)+'%',top:(coords.y/440*100)+'%',width:size,height:size}}
                title={row.city+' · '+row.count+' dossier(s)'} aria-label={'Filtrer ville '+row.city+' ('+row.count+' dossiers)'}
                aria-pressed={isActive} onClick={()=>toggleFilter('city',row.city)}>
                <span className="sr-only">{row.city}</span>
              </button>;
            })}
          </div>
          <div className="db-map-cities">
            <strong>Villes principales</strong>
            {cityGroups.slice(0,7).map(row=><button className={'db-city-row'+(filters.city===row.city?' selected':'')} key={row.city} type="button"
              onClick={()=>toggleFilter('city',row.city)} aria-pressed={filters.city===row.city}>
              <span>{row.city}</span><b>{number.format(row.count)}</b>
            </button>)}
            {cityGroups.length===0 && <p className="db-empty">Aucune ville renseignée.</p>}
            <small>{number.format(coveredPins)}/{number.format(shown.length)} dossiers localisables · {unknownPositions} non cartographié(s)</small>
          </div>
        </div>
        <p className="db-note">Carte schématique, repères de centres-villes uniquement. Les localisations non reconnues ne sont pas placées arbitrairement.</p>
      </section>
      <section className="db-panel db-trend">
        <PanelHeader title="Chronologie des envois" detail="Uniquement les dates d’envoi enregistrées"/>
        {sentMonths.length ? <div className="db-month-chart">
          {sentMonths.map(row=><button key={row.month} type="button" aria-label={'Filtrer les envois de '+formatMonth(row.month)}
            className={'db-month-col'+(filters.sentMonth===row.month?' selected':'')} onClick={()=>toggleFilter('sentMonth',row.month)}
            aria-pressed={filters.sentMonth===row.month} title={row.count+' envoi(s) en '+formatMonth(row.month)}>
            <strong>{row.count}</strong><span className="db-month-bar-wrap"><span className="db-month-bar" style={{height:(row.count/maxMonth*100)+'%'}}/></span>
            <small>{formatMonth(row.month)}</small>
          </button>)}
        </div> : <p className="db-empty">Aucune date d’envoi disponible pour la sélection.</p>}
        <div className="db-conversion">
          <h3>Conversion des candidatures</h3>
          <div className="db-conversion-stages">
            {[['Envoyées',metrics.sent],['Réponses',metrics.responses],['Entretiens',metrics.interviews],['Offres',metrics.offersReceived]].map(([name,value])=>
              <div key={name} className="db-conversion-stage"><strong>{value}</strong><span>{name}</span></div>)}
          </div>
          <p className="db-note">Réponses = relances ou réponses, entretiens, offres et refus. Taux d’entretien : {percent(metrics.interviewRate)} des candidatures envoyées.</p>
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
            <td>{followUpDue(o,today)?'Relancer maintenant':o.nextAction|| (statusGroup(o)==='À candidater'?'Préparer la candidature':'Suivre le dossier')}</td>
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
