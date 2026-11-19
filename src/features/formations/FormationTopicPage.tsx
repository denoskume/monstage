import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FormationModule, FormationTrack } from './formationTypes';
import { allTopics, lessonNotebook, topicProgressKey, type LessonTopic } from './detailedLessons';
import { AlgorithmLab } from './AlgorithmLab';

type Step='theorie'|'code'|'exercice'|'quiz';

function triggerDownload(name:string,content:string,mime:string) {
  const url=URL.createObjectURL(new Blob([content],{type:mime}));
  const a=document.createElement('a'); a.href=url; a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function stepSlug(index:number) {return String(index+1).padStart(2,'0');}
function Progress({count,total}:{count:number,total:number}) {
  return <div className="formation-topic-progress" role="progressbar" aria-label="Leçons validées" aria-valuenow={count} aria-valuemin={0} aria-valuemax={total}>
    <div style={{width:100*count/total+'%'}} />
  </div>;
}

export default function FormationTopicPage({track,module,topic,topicCompleted,onTopicComplete,notes,onNote}:{
  track:FormationTrack;module:FormationModule;topic:LessonTopic;
  topicCompleted:string[];onTopicComplete:(key:string)=>void;
  notes:Record<string,string>;onNote:(key:string,value:string)=>void;
}){
  const [step,setStep]=useState<Step>('theorie');
  const [answer,setAnswer]=useState<number|null>(null);
  const [checked,setChecked]=useState(false);
  const [experimented,setExperimented]=useState(false);
  const [explained,setExplained]=useState(false);
  const [editableCode,setEditableCode]=useState(topic.code);
  const [editableFocusCode,setEditableFocusCode]=useState(topic.focusCode);
  const [editingFocus,setEditingFocus]=useState(false);
  const [editing,setEditing]=useState(false);
  const [copied,setCopied]=useState(false);
  const topics=useMemo(()=>allTopics(track,module),[track,module]);
  const index=topics.findIndex(t=>t.id===topic.id);
  const currentKey=topicProgressKey(topic);
  const done=topicCompleted.includes(currentKey);
  const doneCount=topics.filter(t=>topicCompleted.includes(topicProgressKey(t))).length;
  const next=topics[index+1];
  const previous=topics[index-1];
  const home='/formations/'+track.id+'/'+module.id;
  const linkTo=(t:LessonTopic)=>home+'/'+t.id;
  const quizPassed=checked&&answer===topic.quiz.correct;
  const steps:Array<[Step,string]>=[['theorie','Comprendre'],['code','Code & résultats'],['exercice','Pratiquer'],['quiz','Valider']];
  useEffect(()=>{
    setStep('theorie');setAnswer(null);setChecked(false);setExperimented(false);setExplained(false);
    setEditableCode(topic.code);setEditableFocusCode(topic.focusCode);setEditing(false);setEditingFocus(false);setCopied(false);
  },[topic.id,module.id,track.id,topic.code,topic.focusCode]);
  async function copyCode(){
    try {await navigator.clipboard.writeText(editableCode);setCopied(true);}
    catch {setCopied(false);}
  }
  return <div className="formation-topic">
    <nav className="formation-breadcrumb" aria-label="Fil d’Ariane">
      <Link to="/formations">Formations</Link><span>/</span><Link to={'/formations/'+track.id}>{track.title}</Link>
      <span>/</span><Link to={home}>{module.title}</Link><span>/</span><span>Leçon {topic.number}</span>
    </nav>
    <div className="formation-topic-layout">
      <aside className="formation-topic-nav" aria-label="Sommaire de ce module">
        <Link to={home} className="formation-sidebar-back">← Retour au module</Link>
        <div className="formation-topic-nav__heading"><span className="formation-eyebrow">MODULE · {module.title}</span><strong>{doneCount} / {topics.length} leçons validées</strong><Progress count={doneCount} total={topics.length}/></div>
        <div className="formation-topic-nav__links">
          {topics.map((item,i)=><Link key={item.id} to={linkTo(item)} aria-current={item.id===topic.id?'page':undefined} className={item.id===topic.id?'is-active':''}>
            <span>{stepSlug(i)}</span><span>{item.title}</span><b>{topicCompleted.includes(topicProgressKey(item))?'✓':''}</b>
          </Link>)}
        </div>
        <p>Chaque leçon comporte sa théorie, un exemple de référence, un exercice et une question de vérification.</p>
      </aside>
      <main className="formation-topic-main">
        <header className="formation-topic-hero">
          <div className="formation-topic-hero__top"><span className="formation-eyebrow">{track.plan} · LEÇON {stepSlug(index)} / {stepSlug(topics.length)}</span><span>{done?'✓ Terminée':'En apprentissage'}</span></div>
          <h1>{topic.title}</h1>
          <p>{topic.objective}</p>
          <div className="formation-topic-hero__tags"><span>Théorie</span><span>Exemple commenté</span><span>Expérimentation</span><span>Quiz</span></div>
        </header>
        <nav className="formation-topic-steps" aria-label="Étapes de la leçon">
          {steps.map(([value,title],i)=><button key={value} type="button" className={step===value?'is-active':''} aria-current={step===value?'step':undefined} onClick={()=>setStep(value)}><span>{stepSlug(i)}</span>{title}</button>)}
        </nav>
        {step==='theorie'&&<section className="formation-topic-panel">
          <span className="formation-eyebrow">PARTIE 01 — LA THÉORIE INDISPENSABLE</span>
          <h2>Comprendre la notion simplement</h2>
          <p className="formation-topic-key-concept">{topic.concept}</p>
          {topic.formula&&<div className="formation-topic-formula"><span>NOTATION À CONNAÎTRE</span><strong>{topic.formula.expression}</strong><p>{topic.formula.interpretation}</p></div>}
          <h3>Pourquoi est-ce utile en entreprise ?</h3><p>{topic.context}</p>
          <AlgorithmLab moduleId={module.id}/>
          <div className="formation-topic-caution"><strong>Erreur fréquente à éviter</strong><p>{topic.pitfall}</p></div>
          <div className="formation-topic-panel__footer"><button className="formation-primary-action" onClick={()=>setStep('code')}>Compris : voir la démonstration →</button></div>
        </section>}
        {step==='code'&&<section className="formation-topic-panel">
          <span className="formation-eyebrow">PARTIE 02 — DÉMONSTRATION GUIDÉE</span>
          <h2>Passer de la théorie au code</h2>
          <p>Ce script exécutable illustre le contexte général du module <strong>{module.title}</strong>. Repère l’opération correspondant à <strong>{topic.title}</strong> puis effectue la manipulation ciblée de la partie suivante.</p>
          <div className="formation-code">
            <div className="formation-code__header"><span>{topic.language==='dax'?'DAX':topic.language==='excel'?'EXCEL':topic.language==='sql'?'SQL':'PYTHON 3'} · EXEMPLE DU MODULE</span><div className="formation-code__controls">
              <button onClick={()=>setEditing(v=>!v)}>{editing?'Voir le code':'Modifier le code'}</button>
              <button onClick={copyCode}>{copied?'✓ Copié':'Copier'}</button>
            </div></div>
            {editing?<textarea className="formation-code__editor" spellCheck={false} aria-label="Éditeur du code du cours" value={editableCode} onChange={e=>setEditableCode(e.target.value)} rows={Math.max(12,editableCode.split('\n').length+2)}/>:<pre><code>{editableCode}</code></pre>}
          </div>
          <div className="formation-focus-example">
            <span className="formation-eyebrow">CODE SPÉCIFIQUE À LA LEÇON {String(topic.number).padStart(2,'0')}</span>
            <h3>Expérimentation ciblée : {topic.title}</h3>
            <p>{topic.exercise} Exécute cet exemple après le script de référence du module.</p>
            <div className="formation-code">
              <div className="formation-code__header"><span>{topic.focusLanguage.toUpperCase()} · EXERCICE GUIDÉ</span>
                <div className="formation-code__controls"><button type="button" onClick={()=>setEditingFocus(v=>!v)}>{editingFocus?'Afficher le code':'Modifier mon exercice'}</button></div>
              </div>
              {editingFocus?<textarea className="formation-code__editor" value={editableFocusCode} onChange={e=>setEditableFocusCode(e.target.value)} spellCheck={false} aria-label="Éditeur de l'exercice ciblé" rows={Math.max(8,editableFocusCode.split('\n').length+2)}/>:<pre><code>{editableFocusCode}</code></pre>}
            </div>
          </div>
          <div className="formation-code-actions">
            <button className="formation-secondary-action" onClick={()=>triggerDownload(track.id+'-'+module.id+'-'+topic.id+'.ipynb',lessonNotebook(track,module,topic,editableCode,editableFocusCode),'application/x-ipynb+json')}>↓ Télécharger le notebook de cette leçon</button>
            <a className="formation-link-button" href="https://colab.research.google.com/" target="_blank" rel="noopener noreferrer">Ouvrir Google Colab ↗</a>
          </div>
          <div className="formation-result"><strong>Comment lire le résultat ?</strong><p>{topic.interpretation}</p></div>
          <p>Le notebook contient la théorie, le script de base, le code ciblé de cette leçon, des cellules pour pratiquer, la mission et la correction du quiz. Le code Python s’exécute dans Jupyter ou Colab, pas directement dans ce panneau.</p>
          <div className="formation-topic-panel__footer"><button className="formation-primary-action" onClick={()=>setStep('exercice')}>Passer à l’expérimentation →</button></div>
        </section>}
        {step==='exercice'&&<section className="formation-topic-panel">
          <span className="formation-eyebrow">PARTIE 03 — ON APPREND EN FAISANT</span><h2>À toi de modifier et d’expliquer</h2>
          <div className="formation-topic-task"><span>EXERCICE CIBLÉ</span><p>{topic.exercise}</p></div>
          <h3>Une application professionnelle</h3><p>{topic.mission}</p>
          <div className="formation-topic-success"><strong>Critère d’un résultat réussi</strong><p>{topic.validation}</p></div>
          <label className="formation-topic-note"><strong>Journal d’expérimentation</strong><span>Décris le paramètre modifié, le résultat observé et ce qui pourrait échouer. Les notes sont sauvegardées dans ce navigateur.</span>
            <textarea rows={6} value={notes[currentKey]||''} onChange={e=>onNote(currentKey,e.target.value)} placeholder="J’ai changé… Le résultat montre… Je dois vérifier…" />
          </label>
          <label className="formation-self-check"><input type="checkbox" checked={experimented} onChange={e=>setExperimented(e.target.checked)}/><span>J’ai réalisé l’exercice dans l’outil adapté et comparé le résultat au comportement attendu.</span></label>
          <div className="formation-topic-panel__footer"><button className="formation-primary-action" onClick={()=>setStep('quiz')}>Vérifier mes acquis →</button></div>
        </section>}
        {step==='quiz'&&<section className="formation-topic-panel">
          <span className="formation-eyebrow">PARTIE 04 — VALIDER LA COMPRÉHENSION</span><h2>Question de vérification</h2>
          <div className="formation-quiz"><p><strong>{topic.quiz.question}</strong></p><fieldset><legend className="sr-only">Choisir la réponse</legend>
            {topic.quiz.options.map((choice,i)=><label key={choice} className={'formation-quiz-option'+(answer===i?' is-selected':'')}><input type="radio" name={'topic-quiz-'+currentKey} checked={answer===i} onChange={()=>{setAnswer(i);setChecked(false)}}/><span>{String.fromCharCode(65+i)}</span>{choice}</label>)}
          </fieldset>
          <button className="formation-secondary-action" disabled={answer===null} onClick={()=>setChecked(true)}>Corriger ma réponse</button>
          {checked&&<div role="status" className={'formation-quiz-feedback'+(quizPassed?' is-correct':' is-incorrect')}>
            <strong>{quizPassed?'Bonne réponse !':'À revoir'}</strong><p>{topic.quiz.explanation}</p>
          </div>}</div>
          <div className="formation-topic-task"><span>RAPPEL DE LA MISSION</span><p>{topic.exercise}</p></div>
          <label className="formation-self-check"><input type="checkbox" checked={experimented} onChange={e=>setExperimented(e.target.checked)}/><span>J’ai effectivement exécuté la manipulation et vérifié mon résultat.</span></label>
          <label className="formation-self-check"><input type="checkbox" checked={explained} onChange={e=>setExplained(e.target.checked)}/><span>Je peux expliquer le concept, le code et sa limite sans regarder la correction.</span></label>
          <button className="formation-primary-action" disabled={done||!quizPassed||!experimented||!explained} onClick={()=>onTopicComplete(currentKey)}>{done?'✓ Leçon déjà validée':'Valider cette leçon'} →</button>
          {!done&&<p className="formation-help-text">La validation repose sur une réponse correcte et ton auto-déclaration d’avoir réellement pratiqué. La plateforme ne peut pas certifier automatiquement ton code externe.</p>}
        </section>}
        <footer className="formation-topic-bottom">
          {previous?<Link to={linkTo(previous)}>← Leçon précédente</Link>:<Link to={home}>← Sommaire du module</Link>}
          {next?<Link to={linkTo(next)}>Leçon suivante →</Link>:<Link to={home}>Terminer le module →</Link>}
        </footer>
      </main>
    </div>
  </div>;
}
