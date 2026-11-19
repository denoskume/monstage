import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { zipSync, strToU8 } from 'fflate';
import type { FormationModule, FormationTrack } from './formationTypes';
import { dataAnalystTrack } from './dataAnalystTrack';
import { imageProcessingTrack } from './imageProcessingTrack';
import { computerVisionTrack } from './computerVisionTrack';
import { FormationLab } from './FormationLabs';
import { ImageWorkbench } from './ImageWorkbench';
import { DataWorkbench } from './DataWorkbench';
import { TopicLessons, topicGuide } from './TopicLessons';
import { validateFormationBackup } from './formationBackup';
import LegacyFormations from './LegacyFormations';
import './formations.css';

export const formationTracks = [imageProcessingTrack, computerVisionTrack, dataAnalystTrack];
const PROGRESS_KEY = 'monstage:formations:completed:v2';
const NOTES_KEY = 'monstage:formations:notes:v2';
const TOPICS_KEY = 'monstage:formations:topics:v3';
const CODE_KEY = 'monstage:formations:code:v3';
type Stage = 'comprendre' | 'pratiquer' | 'valider';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function notebookSource(track: FormationTrack, module: FormationModule, codeOverride?: string) {
  const exampleCode = codeOverride ?? module.code;
  const markdown = (source: string) => ({ cell_type: 'markdown', metadata: {}, source });
  const code = (source: string) => ({ cell_type: 'code', metadata: {}, source, outputs: [], execution_count: null });
  const packages: string[] = [];
  if (/\b(?:import|from)\s+numpy\b/.test(exampleCode)) packages.push('numpy');
  if (/\b(?:import|from)\s+pandas\b/.test(exampleCode)) packages.push('pandas');
  if (/\b(?:import|from)\s+matplotlib\b/.test(exampleCode)) packages.push('matplotlib');
  if (/\b(?:import|from)\s+cv2\b/.test(exampleCode)) packages.push('opencv-python-headless');
  if (/\b(?:import|from)\s+sklearn\b/.test(exampleCode)) packages.push('scikit-learn');
  if (/\b(?:import|from)\s+torch\b/.test(exampleCode)) packages.push('torch');

  const cells = [
    markdown('# ' + module.title + '\n\n**' + track.title + '**\n\n## Objectif\n' + module.objective),
    markdown('## Comprendre\n' + module.concept + '\n\n## Notions essentielles\n' + module.points.map(point => '- ' + point).join('\n')),
    markdown('## Situation professionnelle\n' + module.example),
    ...(module.codeLanguage === 'python'
      ? [...(packages.length ? [code('%pip install ' + [...new Set(packages)].join(' '))] : []), code(exampleCode)]
      : [markdown('## Exemple de ' + (module.codeLanguage || 'code') + '\n\n```' + (module.codeLanguage || '') + '\n' + exampleCode + '\n```')]),
    markdown('## Interpréter les résultats\n' + module.result),
    markdown('## À toi de modifier\n' + module.instructions),
    ...(module.codeLanguage === 'python' ? [code('# Écris ton expérimentation ici\n')] : []),
    markdown('## Mission à réaliser\n' + module.mission + '\n\n### Critère de réussite\n' + module.validation),
    ...(module.codeLanguage === 'python' ? [code('# Ton code final\n')] : []),
    markdown('## Auto-évaluation\n**Question :** ' + module.quiz.question + '\n\n' + module.quiz.options.map((v,i) => String(i+1) + '. ' + v).join('\n') + '\n\n**Correction :** ' + module.quiz.options[module.quiz.correct] + '\n\n' + module.quiz.explanation),
    markdown('## Mon diagnostic\nCe que j’ai compris :\n\nCe que je dois approfondir :\n\nQuestions à mon tuteur :')
  ];
  return JSON.stringify({
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {kernelspec: {name:'python3',display_name:'Python 3',language:'python'}, language_info: {name:'python'}},
    cells
  }, null, 2);
}

function downloadNotebook(track: FormationTrack, module: FormationModule, codeOverride?: string) {
  saveFile(track.id + '-' + module.id + '.ipynb', new Blob([notebookSource(track, module, codeOverride)], {type:'application/x-ipynb+json'}));
}
function downloadTrack(track: FormationTrack) {
  const archive: Record<string, Uint8Array> = {};
  track.modules.forEach((module, i) => {
    const prefix = String(i+1).padStart(2,'0') + '-' + module.id;
    const name = prefix + '/00-notebook-module.ipynb';
    archive[name] = strToU8(notebookSource(track, module));
    module.points.forEach((point, j) => {
      const guide = topicGuide(point, module);
      const markdown = (source:string) => ({cell_type:'markdown',metadata:{},source});
      const code=(source:string)=>({cell_type:'code',metadata:{},source,execution_count:null,outputs:[]});
      const cells = [
        markdown('# Leçon '+(j+1)+' — '+point+'\n\n'+track.title+' · '+module.title),
        markdown('## Pourquoi apprendre cette notion ?\n'+guide.explanation),
        markdown('## Exemple guidé\n'+guide.example),
        markdown('## Erreur à éviter\n'+guide.pitfall),
        markdown('## Code du module : retrouve la partie correspondante\nChaque leçon utilise le contexte de la mission du module pour que les notions restent liées à un projet réel.'),
        ...(module.codeLanguage === 'python' ? [code(module.code)] : [markdown('```'+(module.codeLanguage||'')+'\n'+module.code+'\n```')]),
        markdown('## Mission autonome\nDans ce code, retrouve la partie correspondant à « '+point+' ». Modifie un paramètre, prédis l’effet, vérifie le résultat et rédige une observation.'),
        ...(module.codeLanguage === 'python' ? [code('# Ton expérience pratique\n')] : []),
        markdown('## Validation\nExplique la notion sans lire ton code. Justifie les limites de ton résultat et ajoute une capture ou une mesure.\n\n**Carnet de bord :**')
      ];
      const notebook={nbformat:4,nbformat_minor:5,metadata:{kernelspec:{name:'python3',display_name:'Python 3',language:'python'},language_info:{name:'python'}},cells};
      archive[prefix+'/'+String(j+1).padStart(2,'0')+'-'+point.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)+'.ipynb']=strToU8(JSON.stringify(notebook,null,2));
    });
  });
  archive['LIRE-AVANT-DE-COMMENCER.md'] = strToU8(
    '# ' + track.title + '\n\n' + track.objective + '\n\n' +
    'L’archive comprend un notebook complet par module et un notebook ciblé pour chaque notion du sommaire. Tous utilisent le cas pratique du module comme fil conducteur.\n' +
    'Les notebooks Python peuvent être importés dans Jupyter ou Google Colab. Les exemples SQL, Excel et DAX doivent être exécutés dans leurs outils respectifs.\n\n' +
    track.modules.map((m,i)=> (i+1) + '. ' + m.title).join('\n') + '\n'
  );
  saveFile(track.id + '-notebooks.zip', new Blob([new Uint8Array(zipSync(archive))], {type:'application/zip'}));
}

function DoneMark({done}: {done:boolean}) {
  return <span className={'formation-done-mark' + (done?' is-done':'')} aria-label={done?'Module validé':'Module non validé'}>{done?'✓':'○'}</span>;
}
function ProgressBar({value, count}: {value:number;count:number}) {
  return <div className="formation-progress-line" role="progressbar" aria-label="Modules validés" aria-valuenow={value} aria-valuemin={0} aria-valuemax={count}>
    <div style={{width:count ? (100 * value / count) + '%' : '0%'}} />
  </div>;
}
function trackDoneCount(track: FormationTrack, completed: string[]) {
  return track.modules.filter(module => completed.includes(track.id + ':' + module.id)).length;
}
function TrackSymbol({id}: {id:string}) {
  return <span aria-hidden="true" className={'formation-track-symbol formation-track-symbol--' + id}>
    {id === 'traitement-images' ? '◈' : id === 'computer-vision' ? '⌘' : '▥'}
  </span>;
}
function Catalog({completed,onBackup,onRestore}: {completed:string[];onBackup:()=>void;onRestore:(file:File)=>Promise<void>}) {
  const [restoreMessage,setRestoreMessage]=useState('');
  const [search,setSearch] = useState('');
  const filtered = formationTracks.filter(t => [t.title,t.subtitle,...t.tools].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const total = formationTracks.reduce((n,t)=>n+t.modules.length,0);
  return <div className="formation-catalog">
    <header className="formation-hero">
      <div className="formation-hero__copy">
        <span className="formation-eyebrow">MONSTAGE LEARNING · FORMATIONS</span>
        <h1>Apprendre. Pratiquer.<br /><em>Devenir opérationnel.</em></h1>
        <p>De zéro à la première mission en entreprise. Des notions expliquées simplement, du code commenté, des laboratoires visuels et des livrables à présenter.</p>
        <div className="formation-hero__meta"><span>3 parcours structurés</span><span>{total} modules</span><span>Jupyter · Projets · Quiz</span></div>
      </div>
      <div className="formation-hero__progress">
        <span className="formation-eyebrow">MA PROGRESSION</span>
        <strong>{completed.length}<small> / {total}</small></strong>
        <ProgressBar value={completed.length} count={total}/>
        <p>modules validés</p>
      </div>
    </header>
    <div className="formation-section-heading">
      <div><span className="formation-eyebrow">CHOISIS TON PARCOURS</span><h2>Catalogue des formations</h2></div>
      <label className="formation-search"><span className="sr-only">Rechercher une formation</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un domaine ou un outil…" type="search"/>
      </label>
    </div>
    <div className="formation-tracks-grid">
      {filtered.map(track => {
        const done = trackDoneCount(track, completed);
        return <article key={track.id} className={'formation-track-card formation-track-card--' + track.id}>
          <div className="formation-track-card__top"><TrackSymbol id={track.id}/><span>{track.plan}</span></div>
          <h3>{track.title}</h3><p>{track.subtitle}</p>
          <div className="formation-tags">{track.tools.map(tool=><span key={tool}>{tool}</span>)}</div>
          <div className="formation-track-card__bottom">
            <div className="formation-track-card__numbers"><span>{track.modules.length} modules · {track.weeks}</span><strong>{Math.round(done/track.modules.length*100)} %</strong></div>
            <ProgressBar value={done} count={track.modules.length}/>
            <Link className="formation-primary-action" to={'/formations/' + track.id}>{done ? 'Reprendre ma formation':'Découvrir le parcours'} <span aria-hidden="true">→</span></Link>
          </div>
        </article>;
      })}
    </div>
    {!filtered.length && <div className="formation-empty">Aucun parcours ne correspond à cette recherche.</div>}
    <section className="formation-method">
      <div><span className="formation-eyebrow">MÉTHODE D’APPRENTISSAGE</span><h2>Une notion n’est acquise que si tu sais l’appliquer.</h2></div>
      <div className="formation-method__steps">
        <span><b>01</b> Comprendre la théorie essentielle</span>
        <span><b>02</b> Exécuter et modifier le code</span>
        <span><b>03</b> Interpréter et résoudre une mission</span>
        <span><b>04</b> Valider et expliquer les résultats</span>
      </div>
    </section>
    <section className="formation-backup"><div><strong>Conserver mes travaux</strong><p>Export local des notes, étapes étudiées et codes modifiés. Les données ne quittent pas le navigateur.</p></div><div className="formation-backup__actions"><button type="button" className="formation-secondary-action" onClick={onBackup}>↓ Sauvegarder mon parcours (JSON)</button>
      <label className="formation-workbench-upload">↑ Restaurer une sauvegarde <input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{await onRestore(file);setRestoreMessage('Sauvegarde restaurée.');}catch(error){setRestoreMessage(error instanceof Error?error.message:'Import impossible.');}e.target.value='';}}/></label>
      {restoreMessage&&<p role="status">{restoreMessage}</p>}</div></section>
    <div className="formation-existing"><strong>Ateliers précédents conservés</strong><p>Les mini-cours OpenCV / Data Analyst déjà présents restent disponibles.</p><Link to="/formations/vision">Atelier Vision historique</Link><Link to="/formations/data">Atelier Data historique</Link></div>
  </div>;
}
function Overview({track,completed}: {track:FormationTrack;completed:string[]}) {
  const done = trackDoneCount(track,completed);
  const firstIncomplete = track.modules.find(module => !completed.includes(track.id+':'+module.id)) || track.modules[0];
  return <div className="formation-overview">
    <nav className="formation-breadcrumb" aria-label="Fil d’Ariane"><Link to="/formations">Formations</Link><span> / </span><span>{track.title}</span></nav>
    <header className="formation-overview__hero">
      <div><span className="formation-eyebrow">{track.plan} · {track.level}</span><h1>{track.title}</h1><p>{track.objective}</p>
        <div className="formation-tags">{track.tools.map(t=><span key={t}>{t}</span>)}</div></div>
      <div className="formation-overview__aside">
        <div className="formation-overview__stats"><strong>{done} / {track.modules.length}</strong><span>modules validés</span></div>
        <ProgressBar value={done} count={track.modules.length}/>
        <Link className="formation-primary-action" to={'/formations/'+track.id+'/'+firstIncomplete.id}>{done ? 'Continuer le parcours':'Commencer le parcours'} <span aria-hidden="true">→</span></Link>
        <button className="formation-secondary-action" type="button" onClick={()=>downloadTrack(track)}>↓ Télécharger tous les notebooks (.zip)</button>
      </div>
    </header>
    <section className="formation-syllabus"><div className="formation-section-heading"><div><span className="formation-eyebrow">PROGRAMME DÉTAILLÉ</span><h2>Les {track.modules.length} modules</h2></div><span className="formation-syllabus__duration">{track.weeks}</span></div>
      <div className="formation-module-grid">{track.modules.map((module,index) => {
        const doneModule=completed.includes(track.id+':'+module.id);
        return <Link key={module.id} className="formation-module-card" to={'/formations/'+track.id+'/'+module.id}>
          <div className="formation-module-card__header"><span>MODULE {String(index+1).padStart(2,'0')}</span><DoneMark done={doneModule}/></div>
          <h3>{module.title}</h3><p>{module.objective}</p>
          <div className="formation-module-card__footer"><span>{module.points.length} notions · Notebook · Quiz</span><span aria-hidden="true">↗</span></div>
        </Link>;
      })}</div>
    </section>
    <section className="formation-final-project"><span className="formation-eyebrow">PROJET FINAL</span><h2>{track.project}</h2><p>À la fin du parcours : code reproductible, vérifications, résultats analysés, documentation et restitution professionnelle.</p></section>
  </div>;
}
function ModuleScreen({track,module,completed,onComplete,notes,onNote,topics,onToggleTopic,codeDrafts,onCodeDraft}: {
  track:FormationTrack;
  module:FormationModule;
  completed:string[];
  onComplete:(id:string)=>void;
  notes:Record<string,string>;
  onNote:(id:string,value:string)=>void;
  topics:Record<string,number[]>;
  onToggleTopic:(id:string,index:number)=>void;
  codeDrafts:Record<string,string>;
  onCodeDraft:(id:string,value:string)=>void;
}) {
  const [stage,setStage]=useState<Stage>('comprendre');
  const [answer,setAnswer]=useState<number|null>(null);
  const [checked,setChecked]=useState(false);
  const [missionReady,setMissionReady]=useState(false);
  const [copied,setCopied]=useState(false);
  const [editing,setEditing]=useState(false);
  const [editableCode,setEditableCode]=useState(codeDrafts[track.id+':'+module.id] ?? module.code);
  const index=track.modules.findIndex(item=>item.id===module.id);
  const key=track.id+':'+module.id;
  const done=completed.includes(key);
  const prev=track.modules[index-1];
  const next=track.modules[index+1];
  useEffect(()=>{setStage('comprendre');setAnswer(null);setChecked(false);setMissionReady(false);setCopied(false);setEditing(false);setEditableCode(codeDrafts[key] ?? module.code);},[key, module.code]);
  const topicProgress=(topics[key] || []).filter(i=>Number.isInteger(i)&&i>=0&&i<module.points.length);
  const allTopicsStudied=topicProgress.length===module.points.length;
  const right=checked && answer===module.quiz.correct;
  const stages: Array<[Stage,string,string]> = [['comprendre','01','Comprendre'],['pratiquer','02','Pratiquer'],['valider','03','Valider']];
  async function copyExample() {
    try { await navigator.clipboard.writeText(editableCode); setCopied(true); }
    catch { setCopied(false); }
  }
  return <div className="formation-lesson">
    <nav className="formation-breadcrumb" aria-label="Fil d’Ariane"><Link to="/formations">Formations</Link><span> / </span><Link to={'/formations/'+track.id}>{track.title}</Link><span> / </span><span>Module {index+1}</span></nav>
    <div className="formation-lesson__layout">
      <aside className="formation-lesson__sidebar" aria-label="Sommaire du parcours">
        <Link className="formation-sidebar-back" to={'/formations/'+track.id}>← Programme complet</Link>
        <div className="formation-sidebar-head"><span className="formation-eyebrow">{track.plan}</span><strong>{track.title}</strong><span>{trackDoneCount(track,completed)} sur {track.modules.length} modules</span><ProgressBar value={trackDoneCount(track,completed)} count={track.modules.length}/></div>
        <nav className="formation-sidebar-list" aria-label="Modules">
          {track.modules.map((m,i)=><Link key={m.id} aria-current={m.id===module.id?'page':undefined} className={m.id===module.id?'is-current':''} to={'/formations/'+track.id+'/'+m.id}>
            <span className="formation-sidebar-number">{String(i+1).padStart(2,'0')}</span>
            <span>{m.title}</span>
            {completed.includes(track.id+':'+m.id)&&<span className="formation-sidebar-check" aria-label="Validé">✓</span>}
          </Link>)}
        </nav>
      </aside>
      <main className="formation-lesson__main">
        <div className="formation-lesson__heading"><span className="formation-eyebrow">MODULE {String(index+1).padStart(2,'0')} / {track.modules.length} · {track.plan}</span><h1>{module.title}</h1><p>{module.objective}</p><div className="formation-lesson__status">{done ? '✓ Module validé':'○ En cours d’apprentissage'}</div></div>
        <div className="formation-step-tabs" role="tablist" aria-label="Étapes pédagogiques">
          {stages.map(([id,num,name])=><button key={id} type="button" role="tab" aria-selected={stage===id} className={stage===id?'is-active':''} onClick={()=>setStage(id)}><span>{num}</span>{name}</button>)}
        </div>
        {stage==='comprendre' && <div className="formation-content-section" role="tabpanel">
          <span className="formation-eyebrow">01 · THÉORIE ESSENTIELLE</span><h2>Comprendre avant de coder</h2>
          <p className="formation-featured-paragraph">{module.concept}</p>
          <div className="formation-notions"><h3>Ce que tu vas apprendre</h3><ol>{module.points.map((point,i)=><li key={point}><b>{String(i+1).padStart(2,'0')}</b><span>{point}</span></li>)}</ol></div>
          <div className="formation-business-case"><strong>Exemple concret</strong><p>{module.example}</p></div>
          <TopicLessons module={module} completed={topicProgress} onToggle={i=>onToggleTopic(key,i)}/>
          <FormationLab moduleId={module.id}/>
          <div className="formation-stage-footer"><p>Lis la théorie, essaie de reformuler le concept, puis explore le code.</p><button className="formation-primary-action" type="button" onClick={()=>setStage('pratiquer')}>Passer à la pratique <span aria-hidden="true">→</span></button></div>
        </div>}
        {stage==='pratiquer' && <div className="formation-content-section" role="tabpanel">
          <span className="formation-eyebrow">02 · APPLICATION GUIDÉE</span><h2>Observer le code et ses résultats</h2><p>Exemple autonome à reproduire dans un notebook. Lis les commentaires, exécute, puis modifie les paramètres pour vérifier ce que tu as compris.</p>
          {track.plan==='Plan A'?<ImageWorkbench moduleId={module.id}/>:<DataWorkbench/>}
          <div className="formation-code">
            <div className="formation-code__header"><span>{module.codeLanguage==='excel'?'FORMULES EXCEL':module.codeLanguage==='dax'?'MESURES DAX':module.codeLanguage==='sql'?'SQL / PYTHON':'PYTHON 3'}</span><div className="formation-code__controls"><button type="button" onClick={()=>setEditing(v=>!v)}>{editing?'Voir l’aperçu':'Modifier le code'}</button><button type="button" onClick={copyExample}>{copied?'✓ Copié':'Copier le code'}</button></div></div>
            {editing?<textarea className="formation-code__editor" spellCheck={false} aria-label="Éditeur de code de l’exemple" value={editableCode} onChange={e=>{setEditableCode(e.target.value);onCodeDraft(key,e.target.value);}} rows={Math.max(12,editableCode.split('\n').length+2)}/>:<pre><code>{editableCode}</code></pre>}
          </div>
          <p className="formation-code__notice">Tu peux modifier le code avant de le copier ou de télécharger le notebook. L’exécution Python se fait dans Jupyter ou Google Colab.</p>
          <div className="formation-code-actions"><button className="formation-secondary-action" type="button" onClick={()=>downloadNotebook(track,module,editableCode)}>↓ Télécharger mon notebook .ipynb</button><a className="formation-link-button" href="https://colab.research.google.com/" target="_blank" rel="noopener noreferrer">Ouvrir Google Colab ↗</a></div>
          <div className="formation-result"><strong>Comment interpréter le résultat ?</strong><p>{module.result}</p></div>
          <div className="formation-business-case"><strong>À toi de modifier</strong><p>{module.instructions}</p></div>
          {module.codeLanguage!=='python'&&<p className="formation-tool-warning">Cet exemple {module.codeLanguage?.toUpperCase()} doit être exécuté dans l’outil correspondant. Il est inclus comme référence dans le notebook, pas en cellule Python exécutable.</p>}
          <div className="formation-stage-footer"><p>Ne copie pas seulement le code : explique chaque transformation et vérifie les résultats.</p><button className="formation-primary-action" type="button" onClick={()=>setStage('valider')}>Passer à la validation <span aria-hidden="true">→</span></button></div>
        </div>}
        {stage==='valider' && <div className="formation-content-section" role="tabpanel">
          <span className="formation-eyebrow">03 · ÉVALUATION ET MISSION</span><h2>Prouver ce que tu as appris</h2>
          <section className="formation-quiz"><h3>Question de compréhension</h3><p>{module.quiz.question}</p>
            <fieldset><legend className="sr-only">Choisis une réponse</legend>{module.quiz.options.map((option,i)=><label className={'formation-quiz-option'+(answer===i?' is-selected':'')} key={option}>
              <input type="radio" name={'quiz-'+key} checked={answer===i} onChange={()=>{setAnswer(i);setChecked(false);}}/><span>{String.fromCharCode(65+i)}</span>{option}
            </label>)}</fieldset>
            <button className="formation-secondary-action" type="button" disabled={answer===null} onClick={()=>setChecked(true)}>Vérifier ma réponse</button>
            {checked&&<div className={'formation-quiz-feedback'+(right?' is-correct':' is-incorrect')} role="status"><strong>{right?'Bonne réponse !':'Pas encore.'}</strong><p>{module.quiz.explanation}</p></div>}
          </section>
          <section className="formation-mission"><span className="formation-eyebrow">MISSION DE STAGE SIMULÉE</span><h3>Livrable attendu</h3><p>{module.mission}</p><strong>Critère de réussite</strong><p>{module.validation}</p></section>
          <section className="formation-learning-note"><label htmlFor="formation-notes"><strong>Mon carnet de bord</strong><span>Note les difficultés, résultats et questions pour ton tuteur. Enregistré uniquement dans ce navigateur.</span></label>
            <textarea id="formation-notes" rows={5} value={notes[key]||''} onChange={e=>onNote(key,e.target.value)} placeholder="Ce que j’ai testé… Ce que j’ai compris… Ce que je veux approfondir…"/>
          </section>
          <label className="formation-self-check"><input type="checkbox" checked={missionReady} onChange={e=>setMissionReady(e.target.checked)}/><span>J’ai réalisé la mission et vérifié le livrable avec les critères annoncés.</span></label>
          <button className="formation-primary-action" type="button" disabled={done || !right || !missionReady || !allTopicsStudied} onClick={()=>onComplete(key)}>{done?'✓ Module déjà validé':'Valider ce module'} <span aria-hidden="true">→</span></button>
          {!done && <p className="formation-help-text">La validation demande toutes les notions étudiées ({topicProgress.length}/{module.points.length}), une bonne réponse au quiz et une mission effectivement réalisée. Le suivi est conservé sur cet appareil.</p>}
        </div>}
        <footer className="formation-lesson__navigation">
          {prev ? <Link to={'/formations/'+track.id+'/'+prev.id}>← Module précédent</Link> : <Link to={'/formations/'+track.id}>← Programme</Link>}
          {next ? <Link to={'/formations/'+track.id+'/'+next.id}>Module suivant →</Link> : <Link to={'/formations/'+track.id}>Voir ma progression →</Link>}
        </footer>
      </main>
    </div>
  </div>;
}
export default function Formations() {
  const {parcours,lecon} = useParams();
  const [completed,setCompleted] = useState<string[]>(()=>readStorage<string[]>(PROGRESS_KEY,[]));
  const [notes,setNotes] = useState<Record<string,string>>(()=>readStorage<Record<string,string>>(NOTES_KEY,{}));
  const [topics,setTopics] = useState<Record<string,number[]>>(()=>readStorage<Record<string,number[]>>(TOPICS_KEY,{}));
  const [codeDrafts,setCodeDrafts] = useState<Record<string,string>>(()=>readStorage<Record<string,string>>(CODE_KEY,{}));
  useEffect(()=>{try{window.localStorage.setItem(PROGRESS_KEY,JSON.stringify(completed));}catch{/* stockage indisponible */}},[completed]);
  useEffect(()=>{try{window.localStorage.setItem(NOTES_KEY,JSON.stringify(notes));}catch{/* stockage indisponible */}},[notes]);
  useEffect(()=>{try{window.localStorage.setItem(TOPICS_KEY,JSON.stringify(topics));}catch{/* stockage indisponible */}},[topics]);
  useEffect(()=>{try{window.localStorage.setItem(CODE_KEY,JSON.stringify(codeDrafts));}catch{/* stockage indisponible */}},[codeDrafts]);
  function backup() {
    const payload = {format:'monstage-formations-v3',date:new Date().toISOString(),completed,notes,topics,codeDrafts};
    saveFile('monstage-formations-sauvegarde.json',new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  }
  function toggleTopic(key:string,index:number){setTopics(previous=>{const old=previous[key]||[];return {...previous,[key]:old.includes(index)?old.filter(n=>n!==index):[...old,index].sort((a,b)=>a-b)};});}
  async function restore(file:File) {
    if(file.size>2_000_000)throw Error('Sauvegarde trop volumineuse (2 Mo max).');
    const backup=validateFormationBackup(JSON.parse(await file.text()));
    const allowed=new Set(formationTracks.flatMap(t=>t.modules.map(m=>t.id+':'+m.id)));
    setCompleted(backup.completed.filter(id=>allowed.has(id)));
    setNotes(Object.fromEntries(Object.entries(backup.notes).filter(([id])=>allowed.has(id))));
    setTopics(Object.fromEntries(Object.entries(backup.topics).filter(([id])=>allowed.has(id))));
    setCodeDrafts(Object.fromEntries(Object.entries(backup.codeDrafts).filter(([id])=>allowed.has(id))));
  }
  const track = useMemo(()=>formationTracks.find(t=>t.id===parcours),[parcours]);
  const module = track?.modules.find(m=>m.id===lecon);
  if (parcours==='vision' || parcours==='data') return <LegacyFormations/>;
  if ((parcours && !track) || (lecon && !module)) return <Navigate to="/formations" replace/>;
  const validCompleted=completed.filter(id=>formationTracks.some(t=>t.modules.some(m=>id===t.id+':'+m.id)));
  return <section className="page formations" lang="fr">
    {!track ? <Catalog completed={validCompleted} onBackup={backup} onRestore={restore}/> :
      !module ? <Overview track={track} completed={validCompleted}/> :
      <ModuleScreen track={track} module={module} completed={validCompleted} onComplete={id=>setCompleted(c=>c.includes(id)?c:[...c,id])} notes={notes} onNote={(id,value)=>setNotes(n=>({...n,[id]:value}))} topics={topics} onToggleTopic={toggleTopic} codeDrafts={codeDrafts} onCodeDraft={(id,value)=>setCodeDrafts(n=>({...n,[id]:value}))}/>}
  </section>;
}
