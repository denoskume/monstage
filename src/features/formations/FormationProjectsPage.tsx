import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { strToU8, zipSync } from 'fflate';
import type { FormationTrack } from './formationTypes';
import { formationProjects, type FormationProject } from './formationProjects';

const PROJECT_PROGRESS_KEY='monstage:formations:projects:v1';
type Checks=Record<string,boolean[]>;

function stored():Checks {
  try{return JSON.parse(localStorage.getItem(PROJECT_PROGRESS_KEY)||'{}') as Checks;}
  catch{return {};}
}
function generateNotebook(track:FormationTrack,project:FormationProject) {
  const markdown=(source:string)=>({cell_type:'markdown',metadata:{},source});
  const code=(source:string)=>({cell_type:'code',metadata:{},source,execution_count:null,outputs:[]});
  const cells=[
    markdown('# '+project.title+'\n\n**'+track.title+'**\n\n## Contexte professionnel\n'+project.brief),
    markdown('## Compétences\n'+project.objectives.map(x=>'- '+x).join('\n')),
    markdown('## Méthode de résolution\n'+project.steps.map((x,i)=>(i+1)+'. '+x).join('\n')),
    markdown('## Programme de départ\nLire les commentaires TODO puis implémenter progressivement les opérations.'),
    code(project.starterCode),
    markdown('## Livrables\n'+project.deliverables.map(x=>'- '+x).join('\n')),
    markdown('## Critères de réussite\n'+project.acceptance.map(x=>'- [ ] '+x).join('\n')),
    markdown('## Restitution\n1. Objectif\n2. Sources et qualité\n3. Méthode\n4. Résultats\n5. Erreurs et limites\n6. Recommandation')
  ];
  return JSON.stringify({nbformat:4,nbformat_minor:5,metadata:{kernelspec:{name:'python3',display_name:'Python 3',language:'python'},language_info:{name:'python'}},cells},null,2);
}
function downloadArchive(track:FormationTrack,project:FormationProject) {
  const entries:Record<string,Uint8Array>={
    'README.md':strToU8('# '+project.title+'\n\n'+project.brief+'\n\n## Étapes\n'+project.steps.map((s,i)=>String(i+1)+'. '+s).join('\n')+'\n\n## Livrables\n'+project.deliverables.map(s=>'- '+s).join('\n')+'\n'),
    'projet.ipynb':strToU8(generateNotebook(track,project))
  };
  if(project.dataName&&project.data)entries[project.dataName]=strToU8(project.data);
  const zip=new Uint8Array(zipSync(entries));
  const url=URL.createObjectURL(new Blob([zip],{type:'application/zip'}));
  const link=document.createElement('a');link.href=url;link.download=track.id+'-'+project.id+'-starter.zip';link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export default function FormationProjectsPage({track,projectId}:{track:FormationTrack;projectId?:string}){
  const projects=formationProjects[track.id]||[];
  const project=projects.find(p=>p.id===projectId);
  const [checks,setChecks]=useState<Checks>(stored);
  useEffect(()=>{try{localStorage.setItem(PROJECT_PROGRESS_KEY,JSON.stringify(checks));}catch{/* Un stockage inaccessible ne bloque pas l'exercice. */}},[checks]);
  const key=project?track.id+':'+project.id:'';
  const flags=checks[key]||[];
  const passed=project?project.acceptance.every((_,i)=>flags[i]):false;
  const count=useMemo(()=>projects.filter(p=>p.acceptance.every((_,i)=>(checks[track.id+':'+p.id]||[])[i])).length,[checks,projects,track.id]);
  if(projectId&&!project) return <section className="formation-projects"><Link to={'/formations/'+track.id+'/projets'}>← Projets du parcours</Link><p>Projet inconnu.</p></section>;
  return <div className="formation-projects">
    <nav className="formation-breadcrumb" aria-label="Fil d’Ariane"><Link to="/formations">Formations</Link><span>/</span><Link to={'/formations/'+track.id}>{track.title}</Link><span>/</span><Link to={'/formations/'+track.id+'/projets'}>Projets</Link>{project&&<><span>/</span><span>{project.title}</span></>}</nav>
    {!project?<>
      <header className="formation-projects-hero"><span className="formation-eyebrow">{track.plan} · PORTFOLIO</span><h1>Projets pratiques et missions d’entreprise</h1><p>Chaque projet contient un brief, les données nécessaires, des étapes à réaliser, un notebook de départ et des critères de validation. Les résultats ne sont pas prédéfinis à copier : tu dois produire et expliquer ton propre livrable.</p><strong>{count} / {projects.length} projets auto-validés</strong></header>
      <div className="formation-projects-grid">{projects.map((p,i)=><Link key={p.id} to={'/formations/'+track.id+'/projets/'+p.id} className="formation-project-card">
        <div><span>PROJET {String(i+1).padStart(2,'0')} · {p.level}</span><b>{p.acceptance.every((_,j)=>(checks[track.id+':'+p.id]||[])[j])?'✓':''}</b></div>
        <h2>{p.title}</h2><p>{p.brief}</p><div>{p.tools.map(tool=><span key={tool}>{tool}</span>)}</div>
        <footer>Voir le cahier des charges <span>→</span></footer>
      </Link>)}</div>
    </>:<>
      <header className="formation-projects-hero"><span className="formation-eyebrow">{project.level} · {project.duration}</span><h1>{project.title}</h1><p>{project.brief}</p>
        <div className="formation-tags">{project.tools.map(t=><span key={t}>{t}</span>)}</div>
        <button className="formation-primary-action" onClick={()=>downloadArchive(track,project)}>↓ Télécharger le dossier de projet (.zip)</button>
      </header>
      <div className="formation-project-detail">
        <section><span className="formation-eyebrow">01 · OBJECTIFS</span><h2>Ce que tu dois savoir faire</h2><ul>{project.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>
        <section><span className="formation-eyebrow">02 · MÉTHODE</span><h2>Parcours pratique</h2><ol>{project.steps.map(x=><li key={x}>{x}</li>)}</ol></section>
        <section><span className="formation-eyebrow">03 · LIVRABLES</span><h2>Ce que tu présenteras au tuteur</h2><ul>{project.deliverables.map(x=><li key={x}>{x}</li>)}</ul></section>
        <section><span className="formation-eyebrow">04 · POINT DE DÉPART</span><h2>Code de démarrage</h2><p>Les lignes TODO sont à compléter par l’apprenant. Le fichier notebook et, le cas échéant, le CSV se trouvent dans le dossier ZIP.</p>
          <pre className="formation-project-code"><code>{project.starterCode}</code></pre></section>
        <section><span className="formation-eyebrow">05 · VALIDATION</span><h2>Critères de réussite</h2><p>Après avoir exécuté et contrôlé le livrable, coche les critères vérifiés. Ce suivi est une auto-évaluation, et ne vaut pas certification par un correcteur.</p>
          <div className="formation-project-rubric">{project.acceptance.map((item,i)=><label key={item}>
            <input type="checkbox" checked={!!flags[i]} onChange={e=>setChecks(old=>({...old,[key]:project.acceptance.map((_,j)=>j===i?e.target.checked:!!(old[key]||[])[j])}))}/><span>{item}</span></label>)}</div>
          <p className="formation-project-outcome" role="status">{passed?'✓ Tous les critères déclarés validés. Présente maintenant le livrable à ton tuteur ou à un pair.':flags.filter(Boolean).length+' / '+project.acceptance.length+' critères vérifiés'}</p>
        </section>
      </div>
    </>}
  </div>;
}
