import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { formationProjects } from './formationProjects';
import type { FormationTrack } from './formationTypes';

const PROGRESS_KEY='monstage:formations:completed:v2';
const TOPICS_KEY='monstage:formations:topic-completed:v1';
const NOTES_KEY='monstage:formations:notes:v2';
const PROJECTS_KEY='monstage:formations:projects:v1';

type ProgressExport={version:1;kind:'monstage-learning';date:string;modules:string[];topics:string[];notes:Record<string,string>;projects:Record<string,boolean[]>};
function object(v:unknown):v is Record<string,unknown> {
  return v!==null&&typeof v==='object'&&!Array.isArray(v);
}
function read<T>(key:string, fallback:T):T {
  try {return JSON.parse(localStorage.getItem(key)||'null')??fallback;}
  catch {return fallback;}
}
function mergeItems(a:string[],b:string[],allowed:Set<string>) {
  return [...new Set([...a,...b].filter(s=>allowed.has(s)))];
}
export function backupModel(tracks:FormationTrack[]):ProgressExport {
  return {
    version:1,
    kind:'monstage-learning',
    date:new Date().toISOString(),
    modules:read<string[]>(PROGRESS_KEY,[]),
    topics:read<string[]>(TOPICS_KEY,[]),
    notes:read<Record<string,string>>(NOTES_KEY,{}),
    projects:read<Record<string,boolean[]>>(PROJECTS_KEY,{})
  };
}
export function importBackup(payload:unknown,tracks:FormationTrack[]):ProgressExport {
  if (!object(payload)||payload.kind!=='monstage-learning'||payload.version!==1)throw new Error('Ce fichier n’est pas une sauvegarde MonStage Learning valide.');
  if (!Array.isArray(payload.modules)||!Array.isArray(payload.topics)||!object(payload.notes)||!object(payload.projects))throw new Error('La structure du fichier est incomplète.');
  if (payload.modules.length>1000||payload.topics.length>3000||Object.keys(payload.notes).length>3000)throw new Error('La sauvegarde dépasse les limites acceptées.');
  if (![...payload.modules,...payload.topics].every(x=>typeof x==='string'))throw new Error('Le format de progression est incorrect.');
  const allowedModules=new Set(tracks.flatMap(t=>t.modules.map(m=>t.id+':'+m.id)));
  const allowedTopics=new Set(tracks.flatMap(t=>t.modules.flatMap(m=>m.points.map((_,i)=>t.id+':'+m.id+':lecon-'+(i+1)))));
  const allowedProjects=new Set(Object.entries(formationProjects).flatMap(([track,items])=>items.map(p=>track+':'+p.id)));
  const modules=mergeItems(read<string[]>(PROGRESS_KEY,[]),payload.modules as string[],allowedModules);
  const topics=mergeItems(read<string[]>(TOPICS_KEY,[]),payload.topics as string[],allowedTopics);
  const currentNotes=read<Record<string,string>>(NOTES_KEY,{});
  const notes={...currentNotes};
  for(const [key,val] of Object.entries(payload.notes)){
    if((allowedModules.has(key)||allowedTopics.has(key))&&typeof val==='string'&&val.length<=10000)notes[key]=val;
  }
  const projects={...read<Record<string,boolean[]>>(PROJECTS_KEY,{})};
  for(const [key,value] of Object.entries(payload.projects)) {
    if(allowedProjects.has(key)&&Array.isArray(value)&&value.length<20&&value.every(x=>typeof x==='boolean')){
      const old=Array.isArray(projects[key])?projects[key]:[];
      projects[key]=value.map((v,i)=>v||!!old[i]);
    }
  }
  localStorage.setItem(PROGRESS_KEY,JSON.stringify(modules));
  localStorage.setItem(TOPICS_KEY,JSON.stringify(topics));
  localStorage.setItem(NOTES_KEY,JSON.stringify(notes));
  localStorage.setItem(PROJECTS_KEY,JSON.stringify(projects));
  return {version:1,kind:'monstage-learning',date:new Date().toISOString(),modules,topics,notes,projects};
}
function download(text:string){
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;
  anchor.download='monstage-learning-progression.json';anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export function FormationBackup({tracks,onImported}:{
  tracks:FormationTrack[];onImported:(data:ProgressExport)=>void;
}){
  const ref=useRef<HTMLInputElement>(null);
  const [message,setMessage]=useState('');
  async function restore(e:ChangeEvent<HTMLInputElement>) {
    const file=e.target.files?.[0];
    e.target.value='';
    if(!file)return;
    if(file.size>2_000_000){setMessage('Fichier trop volumineux (max. 2 Mo).');return;}
    try{
      const data=JSON.parse(await file.text());
      const merged=importBackup(data,tracks);
      onImported(merged);
      setMessage('Progression importée et fusionnée. Les modules et notes existants ont été conservés.');
    }catch(error){setMessage(error instanceof Error?error.message:'Impossible de lire ce fichier.');}
  }
  return <section className="formation-backup" aria-label="Sauvegarde de ma progression">
    <div><strong>Sauvegarder mon apprentissage</strong><p>La progression reste locale à ce navigateur. Exporte un fichier pour la restaurer ailleurs ou après un changement d’appareil.</p></div>
    <div><button className="formation-secondary-action" type="button" onClick={()=>download(JSON.stringify(backupModel(tracks),null,2))}>↓ Exporter la progression</button>
      <button className="formation-secondary-action" type="button" onClick={()=>ref.current?.click()}>↑ Importer une sauvegarde</button>
      <input ref={ref} className="sr-only" type="file" accept=".json,application/json" aria-label="Fichier de sauvegarde" onChange={restore}/>
    </div>
    {message&&<p role="status">{message}</p>}
  </section>;
}
