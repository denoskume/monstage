import { useState, type ReactNode } from 'react';
type Kind='workflow'|'types'|'source'|'grain'|'kpi'|'quality'|'classes'|'features'|'labels'|'knn'|'confusion';
function VisualShell({title,caption,children}:{title:string;caption:string;children:ReactNode}){
  return <figure className="learning-visual">
    <div className="learning-visual__header"><span>COMPRENDRE EN IMAGE</span><strong>{title}</strong></div>
    <div className="learning-visual__content">{children}</div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Workflow(){
  return <VisualShell title="Du besoin métier à l’action" caption="Un analyste ne commence pas par le graphique : il clarifie la question puis vérifie les chiffres.">
    <div className="learning-intro-flow">{[['01','Question','Quels équipements tombent en panne ?'],['02','Données','Historique des incidents'],['03','Analyse','Durée par machine'],['04','Décision','Inspecter les plus critiques']].map(([n,name,detail])=><div key={n}><b>{n}</b><strong>{name}</strong><small>{detail}</small></div>)}</div>
  </VisualShell>;
}
function Types(){
  return <VisualShell title="Trois types de valeurs, trois usages" caption="Une date entrée comme texte doit être convertie avant un calcul de durée.">
    <div className="learning-intro-types"><div><span>NOMBRE</span><strong>65,2 °C</strong><small>Mesure → moyenne possible</small></div><div><span>CATÉGORIE</span><strong>Machine A</strong><small>Libellé → regroupement</small></div><div><span>DATE</span><strong>19/11/2026</strong><small>Instant → calcul de durée</small></div></div>
  </VisualShell>;
}
function Sources(){
  return <VisualShell title="Une même question, plusieurs sources" caption="La source, les types et les unités doivent être vérifiés avant de joindre des données.">
    <div className="learning-intro-sources">{['CSV','Excel / Sheets','Base SQL'].map(s=><span key={s}>{s}</span>)}<b>↓ Lecture et contrôle des colonnes ↓</b><strong>Table d’analyse vérifiable</strong></div>
  </VisualShell>;
}
function Grain(){
  const [mode,setMode]=useState<'commandes'|'clients'>('commandes');
  const rows=[['1','A'],['2','A'],['3','B']];
  return <VisualShell title="Une ligne n’est pas forcément un client" caption="Le grain est l’unité d’observation : trois commandes ne représentent ici que deux clients.">
    <div className="learning-grain"><table><thead><tr><th>Commande</th><th>Client</th></tr></thead><tbody>{rows.map(([id,c])=><tr key={id}><td>{id}</td><td>{c}</td></tr>)}</tbody></table><div><div className="learning-grain__toggle"><button className={mode==='commandes'?'is-active':''} onClick={()=>setMode('commandes')}>Compter les lignes</button><button className={mode==='clients'?'is-active':''} onClick={()=>setMode('clients')}>Clients uniques</button></div><strong>{mode==='commandes'?3:2}</strong><span>{mode==='commandes'?'commandes':'clients distincts'}</span></div></div>
  </VisualShell>;
}
function KPI(){
  const [before,setBefore]=useState(100),[after,setAfter]=useState(125);
  const percent=before?((after-before)/before*100):null;
  return <VisualShell title="Un KPI = une formule + une période + une unité" caption="Changer l’une des deux valeurs modifie immédiatement le taux calculé.">
    <div className="learning-kpi"><label>Mois précédent <input type="number" min={0} max={10000} value={before} onChange={e=>setBefore(Number(e.target.value))}/></label><label>Ce mois <input type="number" min={0} max={10000} value={after} onChange={e=>setAfter(Number(e.target.value))}/></label><div><span>VARIATION RELATIVE</span><strong>{percent===null?'Indéfinie':percent.toFixed(1)+' %'}</strong><small>(Nouveau − Ancien) / Ancien × 100</small></div></div>
  </VisualShell>;
}
function Quality(){
  const values=[12,null,15,16,null,18];
  return <VisualShell title="Une donnée manquante ≠ zéro" caption="Les cases orangées sont inconnues ; elles ne doivent pas entrer comme zéros dans une moyenne.">
    <div className="learning-quality"><div>{values.map((v,i)=><span key={i} className={v===null?'is-missing':''}>{v===null?'?':v}</span>)}</div><p><strong>2 sur 6</strong> valeurs sont manquantes · <strong>4</strong> mesures exploitables.</p></div>
  </VisualShell>;
}
function Classes({labelsOnly=false}:{labelsOnly?:boolean}){
  const data=[['●','Normal'],['▲','Défaut'],['●','Normal'],['▲','Défaut']];
  return <VisualShell title={labelsOnly?'Images et étiquettes : deux informations liées':'Classer une image : reconnaître la catégorie'} caption="Chaque forme représente ici une image synthétique ; l’étiquette sert de référence pendant l’apprentissage.">
    <div className="learning-class-grid">{data.map(([shape,name],i)=><div key={i}><span className={name==='Défaut'?'is-defect':''}>{shape}</span><strong>{name}</strong></div>)}</div>
  </VisualShell>;
}
function Features(){
  const pixel=[0,1,2,3];
  return <VisualShell title="Des pixels aux caractéristiques d’entrée" caption="Aplatir les pixels ne permet pas au modèle de raisonner directement sur leurs positions spatiales.">
    <div className="learning-features"><div className="learning-features__matrix">{pixel.map((v,i)=><span key={i}>{v}</span>)}</div><b>→ flatten →</b><div className="learning-features__vector">{pixel.map((v,i)=><span key={i}>{v}</span>)}</div></div>
  </VisualShell>;
}
function KNN(){
  const [k,setK]=useState(3);
  const neighbours=['Normal','Défaut','Normal','Normal','Défaut'];
  const subset=neighbours.slice(0,k);
  const normal=subset.filter(v=>v==='Normal').length;
  return <VisualShell title="KNN : les voisins votent pour une classe" caption="L’exemple utilise une liste de voisins déjà triés du plus proche au plus éloigné.">
    <div className="learning-knn"><div>{neighbours.map((v,i)=><span key={i} className={i<k?'is-near':''}>{i+1}. {v}</span>)}</div><label>Voisins considérés : {k}<input type="range" min={1} max={5} step={2} value={k} onChange={e=>setK(+e.target.value)}/></label><strong>Prédiction : {normal>k-normal?'Normal':'Défaut'}</strong></div>
  </VisualShell>;
}
function Confusion(){
  return <VisualShell title="Matrice de confusion : où sont les erreurs ?" caption="Les lignes représentent la réalité ; les colonnes, la prédiction du modèle.">
    <div className="learning-confusion"><div className="learning-confusion__matrix"><span/><span>Prédit normal</span><span>Prédit défaut</span><span>Réel normal</span><strong>8</strong><b>2 faux positifs</b><span>Réel défaut</span><b>1 faux négatif</b><strong>9</strong></div><p><strong>17/20</strong> bonnes décisions · <strong>3</strong> erreurs à examiner.</p></div>
  </VisualShell>;
}
export function IntroLessonVisual({moduleId,topic}:{moduleId:string;topic:string}){
  if(moduleId==='metier-donnees'){
    const titles=['Métier, livrables','Données numériques','CSV, tableur','Unité d’analyse','Question métier','Qualité, confidentialité'];
    const i=titles.findIndex(t=>topic.startsWith(t));
    if(i===0)return <Workflow/>;
    if(i===1)return <Types/>;
    if(i===2)return <Sources/>;
    if(i===3)return <Grain/>;
    if(i===4)return <KPI/>;
    if(i===5)return <Quality/>;
  }
  if(moduleId==='classification-ml'){
    if(topic.startsWith('Images, étiquettes'))return <Classes/>;
    if(topic.startsWith('Features'))return <Features/>;
    if(topic.startsWith('Apprentissage supervisé'))return <Classes labelsOnly/>;
    if(topic.startsWith('KNN'))return <KNN/>;
    if(topic.startsWith('Matrice de confusion'))return <Confusion/>;
  }
  return null;
}
