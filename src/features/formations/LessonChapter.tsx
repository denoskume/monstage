import { useEffect, useMemo, useState } from 'react';
import type { FormationModule } from './formationTypes';
import { getLessonExample } from './lessonExamples';
import { LessonVisual } from './LessonVisual';


/** The article follows the teaching structure demonstrated in the reference video:
 * plain-language idea → visual observation → short annotated code → output → practice → FAQ.
 * The chapter quiz is rendered by TopicLessons below this article.
 */
function CodePreview({code,language}:{code:string;language:string}){
  const lines=code.split('\n');
  return <pre className="learning-code__body"><code>{lines.map((line,i)=>{
    const trimmed=line.trimStart();
    const commentAt=language==='python'?line.indexOf('#'):line.indexOf('--');
    const isComment=trimmed.startsWith('#')||trimmed.startsWith('--');
    return <span className="learning-code__line" key={i}><span aria-hidden="true" className="learning-code__number">{i+1}</span>{isComment?<span className="learning-code__comment">{line||' '}</span>:commentAt>=0?<><span>{line.slice(0,commentAt)}</span><span className="learning-code__comment">{line.slice(commentAt)}</span></>:<span>{line||' '}</span>}</span>;
  })}</code></pre>;
}
function quickFact(module:FormationModule,topic:string) {
  if(module.id==='images-pixels')return 'Une image peut sembler grande à l’écran tout en ayant peu de pixels. La taille d’affichage et la résolution d’acquisition sont deux choses différentes.';
  if(module.id==='opencv-couleurs')return 'Le piège du débutant : OpenCV lit les images couleur en BGR, alors que Matplotlib les affiche généralement en RGB.';
  if(module.id==='classification-ml')return 'Un score parfait sur les images qui ont servi à entraîner un modèle ne suffit pas à prouver qu’il sait classer de nouvelles images.';
  if(module.id==='metier-donnees')return 'Avant le graphique, la première bonne question est : « Qu’est-ce que représente exactement une ligne dans mon fichier ? »';
  if(/IoU|Dice/.test(topic))return 'IoU et Dice mesurent tous deux le recouvrement, mais donnent des valeurs différentes pour la même paire de masques.';
  if(/SQL|JOIN|GROUP BY/.test(topic))return 'Une jointure mal définie peut augmenter les sommes sans déclencher aucune erreur technique.';
  return 'En entreprise, une bonne méthode est celle qu’un collègue peut comprendre, reproduire et vérifier sur de nouvelles données.';
}
export function LessonChapter({module,topic,index,guide}:{module:FormationModule;topic:string;index:number;guide:{explanation:string;example:string;pitfall:string}}){
  const example=useMemo(()=>getLessonExample(topic,module,index),[topic,module,index]);
  const [copied,setCopied]=useState(false);
  useEffect(()=>{setCopied(false);},[module.id,index]);
  const anchor=module.id+'-lesson-'+index;
  async function copy(){try{await navigator.clipboard.writeText(example.code);setCopied(true);}catch{setCopied(false);}}
  const desc=guide.explanation;
  return <div className="learning-article">
    <header className="learning-article__hero">
      <div className="learning-article__meta"><span>LEÇON {String(index+1).padStart(2,'0')}</span><span>Lecture courte · Application immédiate</span></div>
      <h4>{topic}</h4>
      <p>{desc}</p>
    </header>
    <section className="learning-tldr" aria-label="Résumé rapide">
      <div className="learning-tldr__icon" aria-hidden="true">↗</div>
      <div><strong>À comprendre en 30 secondes</strong><p>{example.meaning}</p></div>
    </section>
    <nav className="learning-article__toc" aria-label="Sommaire de cette leçon">
      <span>Dans cette leçon</span>
      {([['idea','1. L’idée'],['visual','2. Visualiser'],['code','3. Coder'],['exercise','4. Appliquer']] as const).map(([id,label])=>
        <button key={id} type="button" onClick={()=>document.getElementById(anchor+'-'+id)?.scrollIntoView({behavior:'smooth',block:'start'})}>{label}</button>)}
    </nav>
    <section id={anchor+'-idea'} className="learning-article__section">
      <div className="learning-article__section-marker">01</div>
      <h5>Comprendre avec des mots simples</h5>
      <p>{guide.explanation}</p>
      <p className="learning-article__context"><strong>Pourquoi c’est utile ?</strong> {guide.example}</p>
    </section>
    <section id={anchor+'-visual'} className="learning-article__section">
      <div className="learning-article__section-marker">02</div>
      <h5>Observe ce qui se passe</h5>
      <LessonVisual topic={topic} module={module}/>
    </section>
    <section id={anchor+'-code'} className="learning-article__section">
      <div className="learning-article__section-marker">03</div>
      <h5>Un petit exemple de code</h5>
      <p>L’objectif n’est pas de mémoriser une longue fonction. Comprends ces quelques lignes, exécute-les, puis vérifie le résultat.</p>
      <div className="learning-code">
        <div className="learning-code__toolbar"><span>{example.language.toUpperCase()} · EXEMPLE GUIDÉ</span><button type="button" onClick={()=>void copy()}>{copied?'✓ Copié':'Copier'}</button></div>
        <CodePreview code={example.code} language={example.language}/>
      </div>
      <div className="learning-output"><span>RÉSULTAT ATTENDU OU À OBSERVER</span><p>{example.output}</p></div>
      <div className="learning-explanation"><strong>Ce qui vient de se passer</strong><p>{example.meaning}</p></div>
    </section>
    <div className="learning-did-you-know"><strong><span aria-hidden="true">✦</span> Le savais-tu ?</strong><p>{quickFact(module,topic)}</p></div>
    <section id={anchor+'-exercise'} className="learning-article__section">
      <div className="learning-article__section-marker">04</div>
      <h5>À toi de jouer (2 minutes)</h5>
      <p>{example.challenge}</p>
      <p className="learning-exercise__method"><strong>La méthode :</strong> prédis le résultat, modifie une ligne, lance le code dans ton notebook, puis compare à ce que tu avais prévu.</p>
    </section>
    <aside className="learning-mistake"><strong>Attention à cette erreur fréquente</strong><p>{guide.pitfall}</p></aside>
    <section className="learning-faq">
      <h5>Questions fréquentes</h5>
      <details><summary>À quoi sert précisément cette notion ?</summary><p>{guide.example}</p></details>
      <details><summary>Comment vérifier que j’ai vraiment compris ?</summary><p>Refais le mini-exercice sans relire le code, annonce à l’avance le résultat attendu et explique pourquoi il change.</p></details>
      <details><summary>Quelle erreur dois-je éviter ?</summary><p>{guide.pitfall}</p></details>
    </section>
  </div>;
}
