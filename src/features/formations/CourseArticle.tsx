import { useEffect, useMemo, useState } from 'react';
import type { FormationModule, FormationTrack } from './formationTypes';
import type { CourseArticleData, ArticleSection } from './courseArticleContent';
import { getOpenCVArticle } from './courseArticleContent';
import { pandasNumpyArticle } from './pandasNumPyArticle';
import { pythonArticle, edaArticle } from './pythonEdaArticles';
import { sqlArticle, powerBIArticle } from './sqlPowerBIArticles';
import { visualizationArticle, spreadsheetArticle } from './visualSpreadsheetArticles';
import { getLessonExample } from './lessonExamples';
import { topicGuide } from './TopicLessons';
import { LessonVisual } from './LessonVisual';
import { deepConceptsFor } from './deepConceptIndex';
import { PythonConceptVisual, type PythonDiagramKind } from './PythonConceptVisual';
import { downloadConceptNotebook } from './conceptNotebook';

const articleDiagrams:Record<string,PythonDiagramKind> = {
 'python-introduction':'python-flow', 'jupyter-notebook':'jupyter',
 'python-variables':'variables','python-data-types':'types','python-operators':'operators',
 'python-lists':'lists','python-tuples':'tuples','python-dictionaries':'dictionaries',
 'python-conditions':'conditions','python-loops':'loops',
 'python-builtins':'builtins','python-user-defined-functions':'functions',
 'python-csv':'csv','python-json':'json','python-exceptions':'exceptions'
};
function createdArticle(track:FormationTrack,module:FormationModule):CourseArticleData {
  const sections:ArticleSection[]=module.points.map((topic,index)=>{
    const guide=topicGuide(topic,module),example=getLessonExample(topic,module,index);
    return {
      id:'section-'+index,
      title:topic,
      depth:1,
      pointIndex:index,
      paragraphs:[guide.explanation,guide.example,example.meaning],
      code:example.code,
      language:example.language,
      output:example.output,
      interpretation:example.meaning,
      visual:index===0||index===2||index===4?'operations':undefined,
      tip:guide.pitfall
    };
  });
  return {
    eyebrow:track.id==='data-analyst'?'DATA ANALYSIS · BEGINNER’S GUIDE':'IMAGE PROCESSING · BEGINNER’S GUIDE',
    title:module.title+' — A Beginner’s Guide',
    author:'MonStage Learning',
    intro:[module.concept,module.objective+' Dans ce cours, chaque section commence par une idée concrète, puis montre comment l’appliquer et vérifier son résultat.'],
    tldr:[
      module.concept,
      'Tu vas comprendre : '+module.points.slice(0,3).join(' ; ')+'.',
      'L’objectif est de savoir expliquer le traitement, modifier les exemples et réaliser la mission professionnelle du module.'
    ],
    sections,
    mistakes:[...new Set([module.points.length?topicGuide(module.points[0],module).pitfall:'Toujours vérifier les entrées.',module.points.length>1?topicGuide(module.points[1],module).pitfall:'Ne pas confondre l’objectif et le résultat.',module.points.length>2?topicGuide(module.points[2],module).pitfall:'Documenter les limites.', 'Recopier le code sans vérifier ses résultats.', 'Interpréter une observation sans préciser les données, les unités et le contexte.','Ne pas documenter la provenance ou la version des données.','Oublier de vérifier les cas limites et les valeurs absentes.','Confondre un résultat observé et la preuve d’une cause.'])],
    conclusion:[module.result,'La prochaine étape est d’exécuter le projet complet du module, comparer les résultats et documenter les limites de la méthode.'],
    faq:module.points.slice(0,4).map(point=>({question:'À quoi sert « '+point+' » ?',answer:topicGuide(point,module).explanation}))
  };
}
export function articleFor(track:FormationTrack,module:FormationModule):CourseArticleData{
 if(module.id==='opencv-couleurs')return getOpenCVArticle();
 if(module.id==='pandas-numpy')return pandasNumpyArticle;
 if(module.id==='python')return pythonArticle;
 if(module.id==='statistiques-eda')return edaArticle;
 if(module.id==='sql')return sqlArticle;
 if(module.id==='powerbi')return powerBIArticle;
 if(module.id==='visualisation')return visualizationArticle;
 if(module.id==='tableurs')return spreadsheetArticle;
 return createdArticle(track,module);
}

function OpenCVMap(){
 return <figure className="course-article-map" aria-label="OpenCV : fondation de trois domaines de vision">
   <h4>OpenCV: The Foundation of Computer Vision</h4>
   <div className="course-article-map__branches">
     <div><span aria-hidden="true">▧</span><strong>1. Classical Computer Vision</strong><p>Contours, seuils, morphologie et mesures</p></div>
     <div><span aria-hidden="true">◈</span><strong>2. Machine Learning Integration</strong><p>Features, préparation et classification</p></div>
     <div><span aria-hidden="true">⌘</span><strong>3. Deep Learning Deployment</strong><p>Images pour CNN, détection et segmentation</p></div>
   </div>
   <div className="course-article-map__arrows"><span>↑</span><span>↑</span><span>↑</span></div>
   <div className="course-article-map__foundation"><strong>OpenCV</strong><small>Image I/O · Processing · Colour Conversions · Filters · Video</small></div>
   <figcaption>Schéma pédagogique original : OpenCV prépare et transforme des images pour des applications de vision classique et de machine learning.</figcaption>
 </figure>;
}

function ConceptVisual({visual,module}:{visual:NonNullable<ArticleSection['visual']>;module:FormationModule;pointIndex:number}){
 if(Object.values(articleDiagrams).includes(visual as PythonDiagramKind))return <PythonConceptVisual kind={visual as PythonDiagramKind}/>;
 if(visual==='opencv')return <OpenCVMap/>;
 if(visual==='colors')return <div className="course-article-color-demo" aria-label="Comparaison des représentations d’une couleur"><div><b style={{background:'#bf3d49'}}/>RGB<br/><small>Rouge, vert, bleu</small></div><div><b style={{background:'#bf3d49'}}/>BGR<br/><small>Bleu, vert, rouge</small></div><div><b style={{background:'linear-gradient(90deg,#f34660,#faa354,#f5e55a,#5dc477,#53b7de,#9672bc)'}}/>HSV<br/><small>Teinte, saturation, valeur</small></div><p>Il s’agit de représentations numériques différentes : pour conserver l’aspect visuel, on convertit les canaux avec cv2.cvtColor.</p></div>;
 if(visual==='pixels')return <LessonVisual topic="Pixel, lignes/colonnes et origine des coordonnées" module={{...module,id:'images-pixels'}}/>;
 if(visual==='data'||visual==='pandas')return <LessonVisual topic="Question métier, indicateur, décision" module={{...module,id:'metier-donnees'}}/>;
 if(visual==='numpy')return <div className="course-article-array" aria-label="Tableau NumPy deux dimensions"><div>{[21,22,23,19,20,22].map((n,i)=><span key={i}>{n}</span>)}</div><p><strong>shape = (2, 3)</strong> · deux lignes et trois colonnes. La moyenne des six valeurs vaut environ 21,17.</p></div>;
 if(visual==='operations')return <figure className="course-article-diagram"><figcaption>Les opérations courantes d'une chaîne de traitement d'images</figcaption>
   <div className="course-article-diagram__steps"><div><strong>Image originale</strong><span className="image-demo image-demo--original">▣</span><small>Acquérir</small></div><b aria-hidden="true">→</b><div><strong>Resize / Blur</strong><span className="image-demo image-demo--blur">▣</span><small>Prétraiter</small></div><b aria-hidden="true">→</b><div><strong>Edges</strong><span className="image-demo image-demo--edge">▣</span><small>Analyser</small></div></div>
   <p>Un même objet est préparé puis analysé. Les formes sont schématiques ; le résultat réel est produit par le code OpenCV juste après.</p>
 </figure>;
 if(visual==='edges')return <figure className="course-article-diagram"><figcaption>Les étapes du détecteur Canny</figcaption><div className="course-article-canny">
   {['Image','Lissage gaussien','Gradient','Contours affinés','Double seuil'].map((step,i)=><div key={step}><span>{String(i+1).padStart(2,'0')}</span><strong>{step}</strong></div>)}
   </div><p>Canny ne prédit pas une classe d'objet : il détecte une frontière à partir des variations d'intensité.</p></figure>;
 if(visual==='video')return <figure className="course-article-diagram"><figcaption>Lire une vidéo image par image</figcaption><div className="course-article-frames">
    {[0,1,2,3].map((i)=><div key={i}><svg viewBox="0 0 120 75" role="img" aria-label={'Frame '+(i+1)}><rect width="120" height="75" fill="#182c40"/><circle cx={22+i*22} cy="39" r="14" fill="#d6f9e6"/></svg><span>Frame {i+1}</span></div>)}
   </div><p>Chaque frame est une nouvelle image. Il faut vérifier le succès de lecture avant toute transformation.</p></figure>;
 return null;
}

function CodeExample({section}:{section:ArticleSection}) {
 const [copied,setCopied]=useState(false);
 if(!section.code)return null;
 const lines=section.code.split('\n');
 const language=section.language||'python';
 async function copy(){try{await navigator.clipboard.writeText(section.code||'');setCopied(true);}catch{setCopied(false);}}
 return <div className="course-article-code">
   <div className="course-article-code__top"><span>{language.toUpperCase()} · CODE COMMENTÉ</span><button type="button" onClick={()=>void copy()}>{copied?'✓ Copié':'Copier le code'}</button></div>
   <pre><code>{lines.map((line,i)=><span className={'course-article-code__line'+(line.trimStart().startsWith('#')?' is-comment':'')} key={i}>{line||' '}{'\n'}</span>)}</code></pre>
   {section.output&&<div className="course-article-output"><strong>Résultat attendu</strong><p>{section.output}</p></div>}
   {section.interpretation&&<div className="course-article-interpretation"><strong>Comprendre le résultat</strong><p>{section.interpretation}</p></div>}
 </div>;
}

export function CourseArticle({track,module,learned,onToggle,onPractice,onValidate}:{
 track:FormationTrack;module:FormationModule;learned:number[];onToggle:(index:number)=>void;onPractice:()=>void;onValidate:()=>void;
}) {
 const concepts=useMemo(()=>deepConceptsFor(module.id),[module.id]);
 const [selectedSlug,setSelectedSlug]=useState<string|null>(null);
 useEffect(()=>{setSelectedSlug(null);},[module.id]);
 const selectedIndex=concepts.findIndex(x=>x.slug===(selectedSlug??concepts[0]?.slug));
 const concept=selectedIndex>=0?concepts[selectedIndex]:undefined;
 const article=useMemo(()=>{
   if(!concept)return articleFor(track,module);
   return {...concept.article,sections:concept.article.sections.map((part,i)=>
     i===0?{...part,visual:articleDiagrams[concept.slug]}:part)};
 },[concept,track,module]);
 const [copied,setCopied]=useState(false);
 const length=article.intro.join(' ').length+article.sections.map(s=>s.paragraphs.join(' ')+(s.code||'')).join(' ').length;
 const readTime=Math.max(4,Math.round(length/900));
 const prefix='course-'+module.id+'-'+(concept?.slug??'overview')+'-';
 const sections = [
   {id:'tldr',title:'TL;DR Summary',depth:1},
   ...article.sections.map(s=>({id:s.id,title:s.title,depth:s.depth||1})),
   {id:'mistakes',title:'Common Mistakes Beginners Make',depth:1},
   {id:'conclusion',title:'Conclusion',depth:1},
   {id:'faq',title:'FAQs',depth:1}
 ];
 async function share(){
   try{await navigator.clipboard.writeText(window.location.href);setCopied(true);}catch{setCopied(false);}
 }
 function scrollTo(id:string) {const target=document.getElementById(prefix+id);if(target&&typeof target.scrollIntoView==='function')target.scrollIntoView({behavior:'smooth',block:'start'});}
 return <div className="course-article-shell">
   {concepts.length>0&&<nav className="course-article-library" aria-label="Articles complets du module">
     <div className="course-article-library__heading"><span>{module.title.toUpperCase()} · COURS INDIVIDUELS</span><h2>{concepts.length} articles approfondis : {module.title}</h2><p>Choisis une notion. Chaque article contient son introduction, ses explications progressives, plusieurs exemples de code, leurs sorties, des erreurs fréquentes et une FAQ.</p></div>
     <ol>{concepts.map((item,i)=><li key={item.slug}><button type="button" className={concept?.slug===item.slug?'is-current':''} aria-current={concept?.slug===item.slug?'page':undefined} onClick={()=>setSelectedSlug(item.slug)}><span>{String(i+1).padStart(2,'0')}</span><strong>{item.article.title.replace(': A Complete Beginner’s Guide','').replace(': A Beginner’s Guide','')}</strong><span aria-hidden="true">›</span></button></li>)}</ol>
   </nav>}
   <article className="course-article" aria-label={article.title}>
   <header className="course-article__header">
     <span className="course-article__category">{article.eyebrow}</span>
     <h1>{article.title}</h1>
     <div className="course-article__meta">
       <span>By {article.author}</span><span aria-hidden="true">|</span>
       <span>Nov 19, 2026</span><span aria-hidden="true">|</span>
       <span>{readTime} Min Read</span>
       <button type="button" onClick={()=>void share()} aria-label="Copier le lien de cet article">{copied?'✓ Lien copié':'↗ Partager'}</button>
     </div>
     <div className="course-article__intro">{article.intro.map((p,i)=><p key={i}>{p}</p>)}</div>
   </header>

   <nav className="course-article__toc" aria-label="Table of contents">
     <h2>Table of contents</h2>
     <ol>{sections.map((s,i)=><li key={s.id} className={s.depth===2?'is-subsection':''}><button type="button" onClick={()=>scrollTo(s.id)}>{s.depth===2?'• ':String(sections.filter((x,k)=>k<=i&&x.depth!==2).length)+'. '}{s.title}</button></li>)}</ol>
   </nav>

   <section id={prefix+'tldr'} className="course-article__section">
     <h2>TL;DR Summary</h2>
     {article.tldr.map((p,i)=><p key={i}>{p}</p>)}
   </section>

   {article.sections.map((section,index)=><section key={section.id} id={prefix+section.id} className={'course-article__section'+(section.depth===2?' is-subsection':'')}>
     {section.depth===2?<h3>{section.title}</h3>:<h2>{section.title}</h2>}
     {section.visual&&<ConceptVisual visual={section.visual} module={module} pointIndex={section.pointIndex??index}/>}
     {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
     {section.bullets&&<ul>{section.bullets.map(b=><li key={b}>{b}</li>)}</ul>}
     <CodeExample key={section.id} section={section}/>
     {section.tip&&<p className="course-article__tip"><strong>À retenir :</strong> {section.tip}</p>}
   </section>)}

   <section id={prefix+'mistakes'} className="course-article__section">
     <h2>Common Mistakes Beginners Make</h2>
     <p>Ces erreurs sont fréquentes lorsque l’on commence. Lis-les avant d’aborder un projet avec des données réelles.</p>
     <ul>{article.mistakes.map((m,i)=><li key={i}>{m}</li>)}</ul>
   </section>

   <section id={prefix+'conclusion'} className="course-article__section">
     <h2>Conclusion</h2>
     {article.conclusion.map((p,i)=><p key={i}>{p}</p>)}
   </section>

   <section id={prefix+'faq'} className="course-article__section course-article__faq">
     <h2>FAQs</h2>
     {article.faq.map((f,i)=><details key={i}><summary>{f.question}</summary><p>{f.answer}</p></details>)}
   </section>

   <section className="course-article__practice" aria-label="Poursuivre la formation">
     <h2>Passer de la lecture à la pratique</h2>
     <p>Une lecture devient une compétence lorsque tu peux exécuter le code, observer le résultat, modifier un paramètre et expliquer ton choix.</p>
     <details><summary>Voir mon suivi des objectifs du module ({learned.length}/{module.points.length})</summary>
       <div className="course-article__checks">{module.points.map((topic,index)=><label key={index}><input type="checkbox" checked={learned.includes(index)} onChange={()=>onToggle(index)}/>{topic}</label>)}</div>
     </details>
     {concept&&<div className="course-article__notebook"><strong>Notebook de cette notion</strong><p>Un carnet Jupyter contient toutes les explications et tous les exemples de cet article, avec une cellule distincte par opération et les résultats attendus.</p><button className="formation-secondary-action" type="button" onClick={()=>downloadConceptNotebook(concept)}>↓ Télécharger le notebook complet de cet article (.ipynb)</button></div>}
     {concept&&selectedIndex<concepts.length-1&&<button className="course-article-library__next" type="button" onClick={()=>setSelectedSlug(concepts[selectedIndex+1].slug)}>Article suivant : {concepts[selectedIndex+1].article.title} →</button>}
     <div className="course-article__actions"><button className="formation-primary-action" type="button" onClick={onPractice}>Pratiquer avec le projet du module →</button><button className="formation-secondary-action" type="button" onClick={onValidate}>Évaluer mes connaissances</button></div>
   </section>
 </article></div>;
}
