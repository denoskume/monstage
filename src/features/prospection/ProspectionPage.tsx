import { isTargetOffer, getOfferPlan, PLAN_LABELS, type SearchPlan } from '../../../shared/searchScope';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import './ProspectionPage.css';
import { PROSPECTION_EVENT } from '../targets/prospectionAdapter';

type Status = 'À identifier' | 'À contacter' | 'Contacté' | 'Candidature envoyée' | 'Relance prévue' | 'Entretien' | 'Refus' | 'Terminé';
type Lead = { id: string; company: string; site: string; team: string; role: string; contact: string; contactLink: string; channel: string; status: Status; date: string; followUp: string; notes: string; };
function inScope(lead: Omit<Lead, 'id'>) { return isTargetOffer({company:lead.company,title:lead.role,domain:lead.team}); }
const KEY = 'monstage.prospection.v1';
const SAFRAN_REFUS_NOTE = 'Refus reçu par email Safran.AI le 02/11/2026 à 17 h 31 : aucune opportunité cohérente identifiée avec le profil. Candidature spontanée déposée le 25/10/2026. Pas de relance sur ce même dossier.';
const SAFRAN_ORIGINAL_ROLE = 'Stage de fin d’études — Machine Learning et Computer Vision';
function isSafranOriginalApplication(company: string, role: string, date?: string) {
  const c = company.trim().toLowerCase().replace(/[.\s]/g,'');
  return c === 'safranai'
    && [SAFRAN_ORIGINAL_ROLE, 'Candidature spontanée — Stage Machine Learning & Computer Vision'].includes(role.trim())
    && (!date || date === '2026-10-25' || date === '25/10/2026');
}
/** A lead may be saved before qualification; any attempted contact needs a clear business case. */
function qualificationError(lead: Omit<Lead, 'id'>): string | null {
  if (lead.status === 'À identifier' || lead.status === 'Refus' || lead.status === 'Terminé') return null;
  if (!lead.site.trim() || !lead.team.trim()) return 'Avant toute prise de contact : préciser le site et l’équipe ciblée.';
  if (lead.notes.trim().length < 30) return 'Avant toute prise de contact : expliquer le besoin de l’équipe et ta contribution concrète (au moins 30 caractères).';
  if (!lead.channel.trim()) return 'Avant toute prise de contact : préciser le canal officiel ou vérifié.';
  if (lead.status === 'Candidature envoyée' && !lead.date) return 'Pour indiquer « Candidature envoyée », renseigner la date réelle de soumission.';
  return null;
}
const statuses: Status[] = ['À identifier', 'À contacter', 'Contacté', 'Candidature envoyée', 'Relance prévue', 'Entretien', 'Refus', 'Terminé'];
const empty = {company:'',site:'',team:'',role:'',contact:'',contactLink:'',channel:'',status:'À identifier' as Status,date:'',followUp:'',notes:''};
const targets: Omit<Lead,'id'>[] = [
  {company:'Safran Trusted 4D',site:'Nantes',team:'Méthodes & Data / industrialisation',role:'Stage de fin d’études — analyse de données et automatisation Python',contact:'',contactLink:'',channel:'Site carrières Safran — candidature spontanée',status:'À identifier',date:'',followUp:'',notes:'Piste à qualifier — pas une offre de stage confirmée. Activités documentées : indicateurs de performance, BI et automatisation IA. Source : https://www.safran-group.com/fr/offres/france/nantes/industrialization-engineer-fh-179825'},
  {company:'Safran Aircraft Engines',site:'Villaroche (Réau / Moissy-Cramayel)',team:'Essais moteurs / analyse de données',role:'Stage de fin d’études — traitement du signal et analyse de mesures moteur',contact:'',contactLink:'',channel:'Site carrières Safran — candidature spontanée',status:'À identifier',date:'',followUp:'',notes:'Piste à qualifier — pas une offre de stage confirmée. Activités documentées : données de capteurs, signaux acoustiques, tableaux de bord et ML. Source : https://www.safran-group.com/fr/offres/france/villaroche/exploitation-donnees-essais-moteurs-developpement-fh-179447'},
  {company:'Safran.AI',site:'Paris (9e)',team:'Computer Vision / Deep Learning / traitement d’images',role:SAFRAN_ORIGINAL_ROLE,contact:'',contactLink:'',channel:'Lever — candidature spontanée',status:'Refus',date:'2026-10-25',followUp:'',notes:SAFRAN_REFUS_NOTE},
  {company:'Safran Helicopter Engines',site:'Bordes',team:'R&D / essais turbomoteurs',role:'Stage de fin d’études — analyse de données expérimentales et diagnostic',contact:'',contactLink:'',channel:'Site carrières Safran — candidature spontanée',status:'À identifier',date:'',followUp:'',notes:'Piste à qualifier — pas une offre de stage confirmée. Activités documentées : essais R&D de turbomoteurs hybridés. Source : https://www.safran-group.com/fr/offres/france/bordes/responsable-essais-r-turbomoteurs-hybrides-fh-173798'}
];
function load(): Lead[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(value)) return [];
    let saved = value.filter((v): v is Lead => Boolean(v && typeof v.id === 'string' && typeof v.company === 'string' && typeof v.role === 'string'));
    // Idempotent repair on each read: a lead imported AFTER an earlier
    // visit must also be closed. Never alter unrelated Safran applications.
    saved = saved.map(lead => isSafranOriginalApplication(lead.company, lead.role, lead.date)
      ? {...lead, status:'Refus' as Status, date:lead.date || '2026-10-25', followUp:'',
          notes:(lead.notes || '').includes(SAFRAN_REFUS_NOTE) ? lead.notes :
            [lead.notes, SAFRAN_REFUS_NOTE].filter(Boolean).join('\n\n')} : lead);
    const originalSafran = targets.filter(t => t.company !== 'Safran.AI');
    const hasPreviousThree = originalSafran.every(t => saved.some(l => l.company === t.company && l.site === t.site));
    const alreadyHasAI = saved.some(l => l.company === 'Safran.AI');
    if (hasPreviousThree && !alreadyHasAI) {
      const ai = targets.find(t => t.company === 'Safran.AI');
      return ai ? [...saved, {...ai, id:crypto.randomUUID()}] : saved;
    }
    return saved;
  } catch { return []; }
}
export function ProspectionPage() {
  const [params] = useSearchParams();

  const [leads,setLeads] = useState<Lead[]>(load);
  const [draft,setDraft] = useState<Omit<Lead,'id'>>(() => {
    if (!params.get('company')) return empty;
    const requested = params.get('plan');
    const mission = (requested === 'B' || requested === 'B1' || requested === 'B2') ? 'Stage de fin d’études — Data Analyst / analyse de données de maintenance et des opérations'
      : 'Stage de fin d’études — Computer Vision / traitement d’images';
    return {...empty, company: params.get('company')!, role: mission};
  });
  const [scopeError,setScopeError] = useState('');
  const scopedLeads = leads.filter(inScope);
  const [editing,setEditing] = useState<string | null>(null);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('Tous');
  const [planFilter,setPlanFilter] = useState<SearchPlan | 'all'>('all');
  const [showForm,setShowForm] = useState(Boolean(params.get('company')));
  useEffect(()=>{try {localStorage.setItem(KEY,JSON.stringify(leads));window.dispatchEvent(new Event(PROSPECTION_EVENT));} catch {/* Browsers can disable storage. */}},[leads]);
  const visible = useMemo(()=>leads.filter(l=>inScope(l)&&(planFilter==='all'||getOfferPlan({company:l.company,title:l.role,domain:l.team})===planFilter)&&(filter==='Tous'||l.status===filter)&&[l.company,l.site,l.team,l.role,l.contact,l.notes].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b)=>(a.followUp||'9999').localeCompare(b.followUp||'9999')),[leads,query,filter,planFilter]);
  useEffect(() => {
    const id = params.get('lead');
    if (!id) return;
    const item = leads.find(lead => lead.id === id);
    if (item && inScope(item)) { const {id: leadId, ...rest} = item; setDraft(rest); setEditing(leadId); setShowForm(true); }
  }, [params]);
  function save(e: React.FormEvent) {
    e.preventDefault();
    if(!draft.company.trim() || !draft.role.trim()) return;
    if (!inScope(draft)) { setScopeError('Choisis l’une des 15 entreprises du transport et une mission Plan A ou Plan B (Data Analyst).'); return; }
    const qualification = qualificationError(draft);
    if (qualification) { setScopeError(qualification); return; }
    if (draft.status === 'Candidature envoyée' && !window.confirm('Confirmer que cette candidature a réellement été envoyée ?')) return;
    setScopeError('');
    const item = {...draft,company:draft.company.trim(),role:draft.role.trim(),id:editing||crypto.randomUUID()};
    setLeads(old=>editing ? old.map(x=>x.id===editing?item:x) : [item,...old]);
    setDraft(empty);setEditing(null);setShowForm(false);
  }
  function edit(item:Lead) {const {id,...rest}=item;setDraft(rest);setEditing(id);setShowForm(true);window.scrollTo({top:0,behavior:'smooth'});}
  function addSafranTargets() {
    setLeads(old=>[...old,...targets.filter(t=>inScope(t)&&!old.some(l=>l.company===t.company && l.site===t.site && l.team===t.team)).map(t=>({...t,id:crypto.randomUUID()}))]);
  }
  function download() {const blob = new Blob([JSON.stringify(leads,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='monstage-prospection.json';link.click();URL.revokeObjectURL(url);}
  return <main className="prospection">
    <header className="prospection__head"><h1 className="sr-only">Prospection</h1><div className="prospection__actions"><button type="button" onClick={addSafranTargets}>Ajouter les pistes Safran</button><button type="button" onClick={download} disabled={!leads.length}>Exporter mes données</button><button type="button" className="prospection__primary" onClick={()=>{setDraft(empty);setEditing(null);setShowForm(s=>!s);}}>+ Nouvelle piste</button></div></header>
    <section className="prospection__stats" aria-label="Statistiques"><div><strong>{scopedLeads.length}</strong><span>Pistes identifiées</span></div><div><strong>{scopedLeads.filter(l=>['Contacté','Candidature envoyée','Relance prévue','Entretien'].includes(l.status)).length}</strong><span>Démarches engagées</span></div><div><strong>{scopedLeads.filter(l=>l.status==='Entretien').length}</strong><span>Entretiens</span></div><div><strong>{scopedLeads.filter(l=>l.followUp && l.followUp<=new Date().toLocaleDateString('en-CA') && l.status!=='Terminé' && l.status!=='Refus').length}</strong><span>Relances à faire</span></div></section>
    {scopeError && <p role="alert">{scopeError}</p>}
    {showForm && <form className="prospection__form" onSubmit={save}><h2>{editing?'Modifier la piste':'Ajouter une piste'}</h2><p className="prospection__qualify-help">Une piste peut rester « À identifier ». Avant de contacter l’entreprise, précise l’équipe, le site, le besoin et le canal vérifié. Ne marque jamais une candidature envoyée sans confirmation réelle.</p><div className="prospection__fields">
    <label>Entreprise *<input required value={draft.company} onChange={e=>setDraft(d=>({...d,company:e.target.value}))} placeholder="Ex. Safran" /></label>
    <label>Site / ville<input value={draft.site} onChange={e=>setDraft(d=>({...d,site:e.target.value}))} placeholder="Ex. Nantes" /></label>
    <label>Équipe / département<input value={draft.team} onChange={e=>setDraft(d=>({...d,team:e.target.value}))} placeholder="Ex. Qualité, R&D" /></label>
    <label>Mission ciblée *<input required value={draft.role} onChange={e=>setDraft(d=>({...d,role:e.target.value}))} placeholder="Ex. Computer Vision / traitement d’images" /></label>
    <label>Interlocuteur<input value={draft.contact} onChange={e=>setDraft(d=>({...d,contact:e.target.value}))} placeholder="Nom ou fonction" /></label>
    <label>Lien de contact<input type="url" value={draft.contactLink} onChange={e=>setDraft(d=>({...d,contactLink:e.target.value}))} placeholder="https://…" /></label>
    <label>Canal<input value={draft.channel} onChange={e=>setDraft(d=>({...d,channel:e.target.value}))} placeholder="Site carrières, LinkedIn, forum…" /></label>
    <label>Statut<select value={draft.status} onChange={e=>setDraft(d=>({...d,status:e.target.value as Status}))}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Date de candidature / contact<input type="date" value={draft.date} onChange={e=>setDraft(d=>({...d,date:e.target.value}))}/></label>
    <label>Date de relance<input type="date" value={draft.followUp} onChange={e=>setDraft(d=>({...d,followUp:e.target.value}))}/></label>
    <label className="prospection__wide">Besoin ciblé et contribution concrète<textarea rows={3} value={draft.notes} onChange={e=>setDraft(d=>({...d,notes:e.target.value}))} placeholder="Pourquoi cette équipe ? Quelle contribution concrète ?"/></label>
    </div><div className="prospection__actions"><button type="button" onClick={()=>{setShowForm(false);setEditing(null);}}>Annuler</button><button className="prospection__primary" type="submit">Enregistrer la piste</button></div></form>}
    <div className="prospection__toolbar"><input aria-label="Rechercher une piste" placeholder="Rechercher une entreprise, équipe ou mission…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Filtrer par plan" value={planFilter} onChange={e=>setPlanFilter(e.target.value as SearchPlan | 'all')}><option value="all">Tous les plans</option>{(['A','B'] as SearchPlan[]).map(p=><option key={p} value={p}>Plan {p} · {PLAN_LABELS[p]}</option>)}</select><select aria-label="Filtrer par statut" value={filter} onChange={e=>setFilter(e.target.value)}><option>Tous</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
    {visible.length===0 ? <section className="prospection__empty"><h2>{leads.length?'Aucune piste pour ce filtre':'Vos opportunités ne se limitent pas aux offres publiées.'}</h2><p>{leads.length?'Modifiez la recherche ou le statut.':'Commencez par identifier une entreprise, un site et une mission que vous pourriez proposer à une équipe.'}</p></section> : <section className="prospection__list" aria-label="Pistes">{visible.map(l=><article className="prospection__card" key={l.id}><div className="prospection__cardtop"><div><h2>{l.company}</h2><p>{[l.site,l.team].filter(Boolean).join(' · ')||'Site et équipe à préciser'}</p></div><span className="prospection__status">{l.status}</span></div><p><strong>Mission :</strong> {l.role} <small>· Plan {getOfferPlan({company:l.company,title:l.role,domain:l.team})}</small></p>{isSafranOriginalApplication(l.company,l.role,l.date) && <div className="prospection__safran-panel"><div className="prospection__safran-panel-head"><strong>Candidature spontanée clôturée · Refus le 02/11/2026</strong><span>Dépôt du 25/10/2026 · aucune relance</span></div><p>Safran.AI n’a pas identifié d’opportunité cohérente avec le profil. Ne pas renvoyer cette même candidature. D’autres missions distinctes chez Safran peuvent être examinées individuellement.</p><Link className="button button--secondary" to="/workspace?offer=EXT-SAFRANAI-20261025">Consulter le dossier conservé</Link></div>}{l.contact&&<p><strong>Contact :</strong> {l.contact} {l.contactLink&&<a className="button button--secondary" href={l.contactLink} target="_blank" rel="noopener noreferrer">Voir le profil</a>}</p>}{l.channel&&<p><strong>Canal :</strong> {l.channel}</p>}{l.notes&&<p className="prospection__notes">{l.notes}</p>}<div className="prospection__cardbottom"><span>{l.date?'Démarche : '+l.date:'Démarche non datée'}{l.followUp?' · Relance : '+l.followUp:''}</span><div><button type="button" onClick={()=>edit(l)}>Modifier</button><button type="button" onClick={()=>{if(window.confirm('Supprimer cette piste ?'))setLeads(old=>old.filter(x=>x.id!==l.id));}}>Supprimer</button></div></div></article>)}</section>}
    <p className="prospection__privacy">Sauvegarde dans ce navigateur.</p>
  </main>;
}
