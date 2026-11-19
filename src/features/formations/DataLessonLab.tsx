import { useMemo, useState } from 'react';

const records = [
  { id:1, site:'Nantes', mois:'Sept.', ventes:12000, commandes:120, cout:7600 },
  { id:2, site:'Nantes', mois:'Oct.', ventes:15000, commandes:135, cout:9200 },
  { id:3, site:'Paris', mois:'Sept.', ventes:18000, commandes:161, cout:11800 },
  { id:4, site:'Paris', mois:'Oct.', ventes:20000, commandes:177, cout:12700 },
  { id:5, site:'Lyon', mois:'Sept.', ventes:9000, commandes:89, cout:6200 },
  { id:6, site:'Lyon', mois:'Oct.', ventes:11000, commandes:104, cout:7200 }
];
const inc = [
  {id:1,machine:'A',minutes:20},{id:2,machine:'A',minutes:40},
  {id:3,machine:'B',minutes:10},{id:3,machine:'B',minutes:10},
  {id:4,machine:'B',minutes:90},{id:5,machine:'C',minutes:null}
];

function currency(v:number) {return v.toLocaleString('fr-FR')+' €';}
function Bar({label,value,max}:{label:string;value:number;max:number}) {
  return <div className="formation-data-bar"><span>{label}</span><div><i style={{width:Math.max(0,value/max*100)+'%'}}/></div><strong>{currency(value)}</strong></div>;
}
function DataBusinessLab({moduleId}:{moduleId:string}) {
  const [site,setSite]=useState('Tous');
  const [month,setMonth]=useState('Tous');
  const [threshold,setThreshold]=useState(0);
  const displayed=useMemo(()=>records.filter(r=>(site==='Tous'||r.site===site)&&(month==='Tous'||r.mois===month)&&r.ventes>=threshold),[site,month,threshold]);
  const totals=useMemo(()=>['Nantes','Paris','Lyon'].map(name=>({name,value:displayed.filter(r=>r.site===name).reduce((s,r)=>s+r.ventes,0)})),[displayed]);
  const revenue=displayed.reduce((sum,r)=>sum+r.ventes,0);
  const margin=displayed.reduce((sum,r)=>sum+r.ventes-r.cout,0);
  const count=displayed.reduce((sum,r)=>sum+r.commandes,0);
  const labels:Record<string,[string,string]>={
    'metier-donnees':['Du besoin métier au KPI','Quelle mesure répond à notre question ?'],
    'tableurs':['Agrégation et filtres de tableur','Les totaux changent selon le filtre appliqué.'],
    'sql':['SELECT, WHERE et GROUP BY','La simulation reproduit un filtrage et un regroupement, sans exécuter SQL.'],
    'python':['Automatiser les calculs','Un même script peut recalculer le bilan après modification des données.'],
    'pandas-numpy':['DataFrame et groupby','Chaque groupe correspond à un magasin ; la somme est son indicateur.'],
    'visualisation':['Courbes et graphiques de comparaison','Les barres comparent des catégories distinctes et indiquent les unités.'],
    'powerbi':['Tableau de bord et interactions','Les KPI et les graphiques doivent répondre aux mêmes filtres.'],
    'kpi-decision':['KPI et décision','Le revenu ne démontre pas la rentabilité ; examiner aussi la marge.'],
    'simulation-stage':['Mini-reporting professionnel','Les métriques doivent être réconciliées avec les lignes du tableau.']
  };
  const [title,subtitle]=labels[moduleId]??labels['metier-donnees'];
  const max=Math.max(1,...totals.map(d=>d.value));
  return <section className="formation-data-lab">
    <div className="formation-algorithm-head"><div><span>LABORATOIRE DATA INTERACTIF</span><strong>{title}</strong></div><span>Données pédagogiques fictives</span></div>
    <p>{subtitle}</p>
    <div className="formation-data-controls">
      <label>Site
        <select value={site} onChange={e=>setSite(e.target.value)}><option>Tous</option><option>Nantes</option><option>Paris</option><option>Lyon</option></select>
      </label>
      <label>Période
        <select value={month} onChange={e=>setMonth(e.target.value)}><option>Tous</option><option>Sept.</option><option>Oct.</option></select>
      </label>
      <label>Ventes minimales (€)
        <select value={threshold} onChange={e=>setThreshold(Number(e.target.value))}><option value={0}>0</option><option value={11000}>11 000</option><option value={15000}>15 000</option></select>
      </label>
    </div>
    <div className="formation-data-kpi-grid">
      <div><span>Chiffre d’affaires</span><strong>{currency(revenue)}</strong></div>
      <div><span>Commandes</span><strong>{count}</strong></div>
      <div><span>Marge brute fictive</span><strong>{currency(margin)}</strong></div>
    </div>
    <div className="formation-data-chart">
      <strong>Ventes par site</strong>
      {totals.map(d=><Bar key={d.name} label={d.name} value={d.value} max={max}/>)}
    </div>
    <div className="formation-data-table-wrapper"><table><thead><tr><th>ID</th><th>Site</th><th>Mois</th><th>Ventes (€)</th><th>Commandes</th></tr></thead><tbody>
      {displayed.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.site}</td><td>{r.mois}</td><td>{r.ventes.toLocaleString('fr-FR')}</td><td>{r.commandes}</td></tr>)}
      {!displayed.length&&<tr><td colSpan={5}>Aucune ligne avec ces filtres.</td></tr>}
    </tbody></table></div>
    <p className="formation-data-lab-note">Contrôle : la somme des lignes visibles doit toujours correspondre au KPI affiché. Le jeu de données est fictif, et les résultats varient uniquement avec les filtres.</p>
  </section>;
}
function DataQualityLab({moduleId}:{moduleId:string}) {
  const [dedupe,setDedupe]=useState(true);
  const [includeUnknown,setIncludeUnknown]=useState(true);
  const rows=inc.filter((r,index)=>!dedupe || inc.findIndex(a=>a.id===r.id)===index).filter(r=>includeUnknown||r.minutes!==null);
  const known=rows.filter(r=>r.minutes!==null);
  const total=known.reduce((s,r)=>s+(r.minutes??0),0);
  const incidents=rows.length;
  const missing=rows.length-known.length;
  const [title,description]=moduleId==='industrie-maintenance'
    ? ['Maintenance industrielle','Compter les pannes et les durées connues sans masquer les données absentes.']
    : ['Nettoyage des données','Observer ce qu’un doublon et une durée manquante changent dans un reporting.'];
  return <section className="formation-data-lab">
    <div className="formation-algorithm-head"><div><span>EXERCICE DE QUALITÉ DATA</span><strong>{title}</strong></div><span>Événements synthétiques</span></div>
    <p>{description}</p>
    <div className="formation-data-checkboxes">
      <label><input type="checkbox" checked={dedupe} onChange={e=>setDedupe(e.target.checked)}/> Dédoublonner par ID d’incident</label>
      <label><input type="checkbox" checked={includeUnknown} onChange={e=>setIncludeUnknown(e.target.checked)}/> Conserver les durées inconnues</label>
    </div>
    <div className="formation-data-kpi-grid">
      <div><span>Incidents retenus</span><strong>{incidents}</strong></div>
      <div><span>Durée connue</span><strong>{total} min</strong></div>
      <div><span>Durées inconnues</span><strong>{missing}</strong></div>
    </div>
    <div className="formation-data-table-wrapper"><table><thead><tr><th>Incident</th><th>Machine</th><th>Minutes</th></tr></thead><tbody>
      {rows.map((r,i)=><tr key={r.id+'-'+i}><td>{r.id}</td><td>{r.machine}</td><td>{r.minutes===null?'Inconnue':r.minutes}</td></tr>)}
    </tbody></table></div>
    <p className="formation-data-lab-note">Une durée inconnue n’équivaut pas à zéro. Retirer un doublon doit être une règle documentée, et non une suppression arbitraire d’une vraie panne.</p>
  </section>;
}
function DataStatsLab() {
  const [outlier,setOutlier]=useState(150);
  const vals=[45,50,55,60,65,70,outlier];
  const sorted=[...vals].sort((a,b)=>a-b);
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  const median=sorted[Math.floor(sorted.length/2)];
  return <section className="formation-data-lab">
    <div className="formation-algorithm-head"><div><span>STATISTIQUES VISUELLES</span><strong>Moyenne, médiane et valeur extrême</strong></div><span>Valeurs fictives</span></div>
    <label className="formation-data-slider">Dernière observation : {outlier}<input type="range" min="70" max="300" step="5" value={outlier} onChange={e=>setOutlier(Number(e.target.value))}/></label>
    <div className="formation-data-kpi-grid"><div><span>Moyenne</span><strong>{mean.toFixed(1)}</strong></div><div><span>Médiane</span><strong>{median}</strong></div><div><span>Écart moyenne-médiane</span><strong>{(mean-median).toFixed(1)}</strong></div></div>
    <div className="formation-stat-bars">{vals.map((v,i)=><div key={i} title={'Valeur '+v}><i style={{height:(v/300*100)+'%'}}/><span>{v}</span></div>)}</div>
    <p className="formation-data-lab-note">Plus la dernière observation s’éloigne, plus elle influence la moyenne. La médiane reste 60. Une valeur extrême n’est pas automatiquement une erreur.</p>
  </section>;
}
export function DataLessonLab({moduleId}:{moduleId:string}) {
  if(moduleId==='nettoyage'||moduleId==='industrie-maintenance')return <DataQualityLab moduleId={moduleId}/>;
  if(moduleId==='statistiques-eda')return <DataStatsLab/>;
  return <DataBusinessLab moduleId={moduleId}/>;
}
