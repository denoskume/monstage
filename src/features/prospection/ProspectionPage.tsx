import { useEffect, useMemo, useState } from 'react';
import './ProspectionPage.css';

type Status = 'À identifier' | 'À contacter' | 'Contacté' | 'Candidature envoyée' | 'Relance prévue' | 'Entretien' | 'Terminé';
type Lead = { id: string; company: string; site: string; team: string; role: string; contact: string; contactLink: string; channel: string; status: Status; date: string; followUp: string; notes: string; };
const KEY = 'monstage.prospection.v1';
const statuses: Status[] = ['À identifier', 'À contacter', 'Contacté', 'Candidature envoyée', 'Relance prévue', 'Entretien', 'Terminé'];
const empty = {company:'',site:'',team:'',role:'',contact:'',contactLink:'',channel:'',status:'À identifier' as Status,date:'',followUp:'',notes:''};
const targets: Omit<Lead,'id'>[] = [
  {company:'Safran Trusted 4D',site:'Nantes',team:'Méthodes & Data / industrialisation',role:'Stage de fin d’études — analyse de données et automatisation Python',contact:'',contactLink:'',channel:'Site carrières Safran — candidature spontanée',status:'À identifier',date:'',followUp:'',notes:'Piste à qualifier — pas une offre de stage confirmée. Activités documentées : indicateurs de performance, BI et automatisation IA. Source : https://www.safran-group.com/fr/offres/france/nantes/industrialization-engineer-fh-179825'},
  {company:'Safran Aircraft Engines',site:'Villaroche (Réau / Moissy-Cramayel)',team:'Essais moteurs / analyse de données',role:'Stage de fin d’études — traitement du signal et analyse de mesures moteur',contact:'',contactLink:'',channel:'Site carrières Safran — candidature spontanée',status:'À identifier',date:'',followUp:'',notes:'Piste à qualifier — pas une offre de stage confirmée. Activités documentées : données de capteurs, signaux acoustiques, tableaux de bord et ML. Source : https://www.safran-group.com/fr/offres/france/villaroche/exploitation-donnees-essais-moteurs-developpement-fh-179447'},
  {company:'Safran Helicopter Engines',site:'Bordes',team:'R&D / essais turbomoteurs',role:'Stage de fin d’études — analyse de données expérimentales et diagnostic',contact:'',contactLink:'',channel:'Site carrières Safran — candidature spontanée',status:'À identifier',date:'',followUp:'',notes:'Piste à qualifier — pas une offre de stage confirmée. Activités documentées : essais R&D de turbomoteurs hybridés. Source : https://www.safran-group.com/fr/offres/france/bordes/responsable-essais-r-turbomoteurs-hybrides-fh-173798'}
];
function load(): Lead[] {
  try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value.filter((v) => v && typeof v.id === 'string') : []; } catch { return []; }
}
export function ProspectionPage() {
  const [leads,setLeads] = useState<Lead[]>(load);
  const [draft,setDraft] = useState<Omit<Lead,'id'>>(empty);
  const [editing,setEditing] = useState<string | null>(null);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('Tous');
  const [showForm,setShowForm] = useState(false);
  useEffect(()=>{try {localStorage.setItem(KEY,JSON.stringify(leads));} catch {/* Browsers can disable storage. */}},[leads]);
  const visible = useMemo(()=>leads.filter(l=>(filter==='Tous'||l.status===filter)&&[l.company,l.site,l.team,l.role,l.contact,l.notes].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b)=>(a.followUp||'9999').localeCompare(b.followUp||'9999')),[leads,query,filter]);
  function save(e: React.FormEvent) {
    e.preventDefault();
    if(!draft.company.trim() || !draft.role.trim()) return;
    const item = {...draft,company:draft.company.trim(),role:draft.role.trim(),id:editing||crypto.randomUUID()};
    setLeads(old=>editing ? old.map(x=>x.id===editing?item:x) : [item,...old]);
    setDraft(empty);setEditing(null);setShowForm(false);
  }
  function edit(item:Lead) {const {id,...rest}=item;setDraft(rest);setEditing(id);setShowForm(true);window.scrollTo({top:0,behavior:'smooth'});}
  function addSafranTargets() {
    setLeads(old=>[...old,...targets.filter(t=>!old.some(l=>l.company===t.company && l.site===t.site && l.team===t.team)).map(t=>({...t,id:crypto.randomUUID()}))]);
  }
  function download() {const blob = new Blob([JSON.stringify(leads,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='monstage-prospection.json';link.click();URL.revokeObjectURL(url);}
  return <main className="prospection">
    <header className="prospection__head"><div><p className="prospection__eyebrow">Candidatures spontanées · Marché caché</p><h1>Prospection</h1><p>Identifie les équipes, contacte les bons interlocuteurs et suis les opportunités avant leur publication.</p></div><div className="prospection__actions"><button type="button" onClick={addSafranTargets}>Ajouter 3 pistes Safran</button><button type="button" onClick={download} disabled={!leads.length}>Exporter mes données</button><button type="button" className="prospection__primary" onClick={()=>{setDraft(empty);setEditing(null);setShowForm(s=>!s);}}>+ Nouvelle piste</button></div></header>
    <section className="prospection__stats" aria-label="Statistiques"><div><strong>{leads.length}</strong><span>Pistes identifiées</span></div><div><strong>{leads.filter(l=>['Contacté','Candidature envoyée','Relance prévue','Entretien'].includes(l.status)).length}</strong><span>Démarches engagées</span></div><div><strong>{leads.filter(l=>l.status==='Entretien').length}</strong><span>Entretiens</span></div><div><strong>{leads.filter(l=>l.followUp && l.followUp<=new Date().toLocaleDateString('en-CA') && l.status!=='Terminé').length}</strong><span>Relances à faire</span></div></section>
    {showForm && <form className="prospection__form" onSubmit={save}><h2>{editing?'Modifier la piste':'Ajouter une piste'}</h2><div className="prospection__fields">
    <label>Entreprise *<input required value={draft.company} onChange={e=>setDraft(d=>({...d,company:e.target.value}))} placeholder="Ex. Safran" /></label>
    <label>Site / ville<input value={draft.site} onChange={e=>setDraft(d=>({...d,site:e.target.value}))} placeholder="Ex. Nantes" /></label>
    <label>Équipe / département<input value={draft.team} onChange={e=>setDraft(d=>({...d,team:e.target.value}))} placeholder="Ex. Qualité, R&D" /></label>
    <label>Mission ciblée *<input required value={draft.role} onChange={e=>setDraft(d=>({...d,role:e.target.value}))} placeholder="Ex. Analyse de données industrielles" /></label>
    <label>Interlocuteur<input value={draft.contact} onChange={e=>setDraft(d=>({...d,contact:e.target.value}))} placeholder="Nom ou fonction" /></label>
    <label>Lien de contact<input type="url" value={draft.contactLink} onChange={e=>setDraft(d=>({...d,contactLink:e.target.value}))} placeholder="https://…" /></label>
    <label>Canal<input value={draft.channel} onChange={e=>setDraft(d=>({...d,channel:e.target.value}))} placeholder="Site carrières, LinkedIn, forum…" /></label>
    <label>Statut<select value={draft.status} onChange={e=>setDraft(d=>({...d,status:e.target.value as Status}))}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Date de candidature / contact<input type="date" value={draft.date} onChange={e=>setDraft(d=>({...d,date:e.target.value}))}/></label>
    <label>Date de relance<input type="date" value={draft.followUp} onChange={e=>setDraft(d=>({...d,followUp:e.target.value}))}/></label>
    <label className="prospection__wide">Notes / besoin potentiel<textarea rows={3} value={draft.notes} onChange={e=>setDraft(d=>({...d,notes:e.target.value}))} placeholder="Pourquoi cette équipe ? Quelle contribution concrète ?"/></label>
    </div><div className="prospection__actions"><button type="button" onClick={()=>{setShowForm(false);setEditing(null);}}>Annuler</button><button className="prospection__primary" type="submit">Enregistrer la piste</button></div></form>}
    <div className="prospection__toolbar"><input aria-label="Rechercher une piste" placeholder="Rechercher une entreprise, équipe ou mission…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Filtrer par statut" value={filter} onChange={e=>setFilter(e.target.value)}><option>Tous</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
    {visible.length===0 ? <section className="prospection__empty"><h2>{leads.length?'Aucune piste pour ce filtre':'Vos opportunités ne se limitent pas aux offres publiées.'}</h2><p>{leads.length?'Modifiez la recherche ou le statut.':'Commencez par identifier une entreprise, un site et une mission que vous pourriez proposer à une équipe.'}</p></section> : <section className="prospection__list" aria-label="Pistes">{visible.map(l=><article className="prospection__card" key={l.id}><div className="prospection__cardtop"><div><h2>{l.company}</h2><p>{[l.site,l.team].filter(Boolean).join(' · ')||'Site et équipe à préciser'}</p></div><span className="prospection__status">{l.status}</span></div><p><strong>Mission :</strong> {l.role}</p>{l.contact&&<p><strong>Contact :</strong> {l.contact} {l.contactLink&&<a href={l.contactLink} target="_blank" rel="noopener noreferrer">Voir le profil ↗</a>}</p>}{l.channel&&<p><strong>Canal :</strong> {l.channel}</p>}{l.notes&&<p className="prospection__notes">{l.notes}</p>}<div className="prospection__cardbottom"><span>{l.date?'Démarche : '+l.date:'Démarche non datée'}{l.followUp?' · Relance : '+l.followUp:''}</span><div><button type="button" onClick={()=>edit(l)}>Modifier</button><button type="button" onClick={()=>{if(window.confirm('Supprimer cette piste ?'))setLeads(old=>old.filter(x=>x.id!==l.id));}}>Supprimer</button></div></div></article>)}</section>}
    <p className="prospection__privacy">Données enregistrées uniquement dans ce navigateur. Exportez-les avant de changer d'appareil ou d'effacer les données du navigateur.</p>
  </main>;
}
