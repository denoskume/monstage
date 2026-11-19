import { useState, type ReactNode } from 'react';
import type { FormationModule } from './formationTypes';
import { IntroLessonVisual } from './IntroLessonVisuals';

function VisualFrame({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}) {
  return <figure className="learning-visual">
    <div className="learning-visual__header"><span>COMPRENDRE EN IMAGE</span><strong>{title}</strong></div>
    <div className="learning-visual__content">{children}</div>
    <figcaption>{subtitle}</figcaption>
  </figure>;
}

function PixelVisual(){
  const [selected,setSelected]=useState(12);
  const pixels=[5,12,20,30,40,10,40,80,110,60,18,85,255,150,35,25,60,120,100,18,4,25,45,33,8];
  return <VisualFrame title="Un pixel = une position + une valeur" subtitle="Clique sur une case : la ligne, la colonne et l’intensité changent réellement.">
    <div className="learning-pixel-demo">
      <div className="learning-pixel-layout"><span className="learning-pixel-axis">colonnes →</span><div className="learning-pixel-rows">
        <span className="learning-pixel-axis">lignes ↓</span>
        <div className="learning-pixel-grid" role="group" aria-label="Image 5 par 5 pixels">
          {pixels.map((p,i)=><button key={i} className={selected===i?'is-selected':''} type="button" onClick={()=>setSelected(i)}
            aria-label={'Pixel ligne '+Math.floor(i/5)+' colonne '+i%5+' intensité '+p}
            style={{background:'rgb('+p+','+p+','+p+')'}}/>)}
        </div>
      </div></div>
      <div className="learning-pixel-reading">
        <span>PIXEL SÉLECTIONNÉ</span>
        <strong>I({Math.floor(selected/5)}, {selected%5}) = {pixels[selected]}</strong>
        <p>La première valeur indique la <b>ligne</b>, la deuxième la <b>colonne</b>. L’intensité est comprise entre 0 et 255.</p>
        <div className="learning-pixel-ramp"><span>0 · Noir</span><i/><span>255 · Blanc</span></div>
      </div>
    </div>
  </VisualFrame>;
}
function ColorVisual(){
  const [channel,setChannel]=useState<'R'|'G'|'B'>('R');
  const val={R:[245,65,65],G:[40,190,120],B:[40,95,230]} as const;
  const tuple=val[channel];
  return <VisualFrame title="Une couleur = trois composantes" subtitle="Choisis un canal pour voir comment une valeur RGB contribue à une couleur.">
    <div className="learning-color">
      <div className="learning-color__buttons">{(['R','G','B'] as const).map(c=><button key={c} type="button" className={c===channel?'is-active':''} onClick={()=>setChannel(c)}>{c} · {c==='R'?'Rouge':c==='G'?'Vert':'Bleu'}</button>)}</div>
      <div className="learning-color__swatch" style={{background:'rgb('+tuple.join(',')+')'}}/>
      <div><strong>RGB({tuple.join(', ')})</strong><p>Une image couleur possède trois valeurs par pixel. Attention : OpenCV charge souvent les images en <b>BGR</b> avant conversion.</p></div>
    </div>
  </VisualFrame>;
}
function ThresholdVisual(){
  const [t,setT]=useState(120);
  const values=[15,25,39,55,65,78,89,95,112,124,137,143,156,172,181,205,219,228,239,251];
  const active=values.filter(v=>v>=t).length;
  return <VisualFrame title="Le seuil sépare l’objet et le fond" subtitle="Les colonnes indiquent le niveau de chaque pixel. Le seuil agit directement sur la segmentation.">
    <div className="learning-threshold">
      <div className="learning-threshold__bars">{values.map((v,i)=><span key={i} style={{height:Math.max(4,v/255*100)+'%',background:v>=t?'#15a38f':'#cbd5e1'}} title={'Pixel '+i+' : '+v}/>)}</div>
      <div className="learning-threshold__axis"><span>0 · sombre</span><span>Intensité →</span><span>255 · clair</span></div>
      <label>Seuil T = <strong>{t}</strong><input aria-label="Seuil de segmentation" type="range" min={0} max={255} value={t} onChange={e=>setT(+e.target.value)}/></label>
      <div className="learning-threshold__result"><b>{active} / {values.length}</b> pixels appartiennent à la classe blanche.</div>
    </div>
  </VisualFrame>;
}
function KernelVisual(){
  const [mode,setMode]=useState<'mean'|'edge'>('mean');
  const image=[10,10,10,10,100,100,10,100,240];
  const weights=mode==='mean'?[1,1,1,1,1,1,1,1,1]:[-1,0,1,-2,0,2,-1,0,1];
  const result=image.reduce((sum,v,i)=>sum+v*weights[i],0)/(mode==='mean'?9:1);
  return <VisualFrame title="Convolution : multiplie, additionne, remplace" subtitle="Le même voisinage donne un résultat différent selon les poids du noyau.">
    <div className="learning-kernel">
      <div className="learning-kernel__choice"><button type="button" className={mode==='mean'?'is-active':''} onClick={()=>setMode('mean')}>Lisser</button><button type="button" className={mode==='edge'?'is-active':''} onClick={()=>setMode('edge')}>Gradient X</button></div>
      <div className="learning-kernel__flow">
        <div><span>Voisinage 3×3</span><div className="learning-kernel__grid">{image.map((v,i)=><b key={i}>{v}</b>)}</div></div>
        <strong className="learning-kernel__symbol">×</strong>
        <div><span>Noyau 3×3</span><div className="learning-kernel__grid">{weights.map((v,i)=><b key={i}>{v}</b>)}</div></div>
        <strong className="learning-kernel__symbol">→</strong>
        <div className="learning-kernel__result"><span>Nouvelle valeur</span><strong>{Math.round(result*100)/100}</strong></div>
      </div>
      <p>{mode==='mean'?'Somme pondérée ÷ 9 : on atténue les différences entre voisins.':'Le gradient signé peut être négatif. Une visualisation de magnitude prendra sa valeur absolue.'}</p>
    </div>
  </VisualFrame>;
}
function DataVisual(){
  const [metric,setMetric]=useState<'sales'|'orders'>('sales');
  const rows=[{site:'Nantes',sales:120,orders:4},{site:'Nantes',sales:90,orders:3},{site:'Paris',sales:150,orders:5},{site:'Lyon',sales:75,orders:3}];
  const groups=['Nantes','Paris','Lyon'].map(site=>({site,total:rows.filter(r=>r.site===site).reduce((n,r)=>n+r[metric],0)}));
  const max=Math.max(...groups.map(v=>v.total));
  return <VisualFrame title="Des lignes brutes à une réponse métier" subtitle="Les barres sont calculées à partir des lignes du tableau. Change l’indicateur.">
    <div className="learning-data">
      <div className="learning-data__table"><table><thead><tr><th>Magasin</th><th>Ventes (€)</th><th>Commandes</th></tr></thead><tbody>{rows.map((row,i)=><tr key={i}><td>{row.site}</td><td>{row.sales}</td><td>{row.orders}</td></tr>)}</tbody></table></div>
      <div className="learning-data__chart">
        <label>Mesurer <select aria-label="Indicateur graphique" value={metric} onChange={e=>setMetric(e.target.value as 'sales'|'orders')}><option value="sales">Ventes (€)</option><option value="orders">Commandes</option></select></label>
        {groups.map(row=><div className="learning-data__bar" key={row.site}><span>{row.site}</span><div><i style={{width:row.total/max*100+'%'}}/></div><strong>{row.total}</strong></div>)}
        <small>Sommes par magasin — {rows.length} lignes source</small>
      </div>
    </div>
  </VisualFrame>;
}
function SplitVisual(){
  const [test,setTest]=useState(20);
  return <VisualFrame title="Un modèle doit être évalué sur du jamais vu" subtitle="Change le pourcentage réservé au test. Les ensembles ne se chevauchent pas.">
    <div className="learning-split">
      <div className="learning-split__bar"><span style={{width:100-test+'%'}}>Train {100-test}%</span><span style={{width:test+'%'}}>Test {test}%</span></div>
      <label>Part du jeu test : {test}% <input type="range" min={10} max={40} step={5} value={test} onChange={e=>setTest(+e.target.value)}/></label>
      <p>Sur 100 images, <b>{100-test}</b> servent à l’entraînement et <b>{test}</b> restent inédites pour l’évaluation finale.</p>
    </div>
  </VisualFrame>;
}
function MaskVisual(){
  const truth=[0,0,1,1,0,0,1,1,1,0,0,1,1,0,0,0];
  const [shift,setShift]=useState(false);
  const predicted=shift?[0,0,0,1,0,0,1,1,0,0,0,0,1,1,0,0]:[0,0,1,1,0,0,1,1,1,0,0,0,1,0,0,0];
  let inter=0,union=0,positive=0;
  for(let i=0;i<truth.length;i++){if(truth[i]&&predicted[i])inter++;if(truth[i]||predicted[i])union++;positive+=truth[i]+predicted[i];}
  return <VisualFrame title="Comparer une prédiction à la référence" subtitle="Le recouvrement change lorsque tu déplaces le masque prédit.">
    <div className="learning-mask">
      <div className="learning-mask__cells">{truth.map((v,i)=><span key={i} className={v&&predicted[i]?'is-intersection':v?'is-truth':predicted[i]?'is-predicted':''}/>)}</div>
      <div className="learning-mask__read"><label><input type="checkbox" checked={shift} onChange={e=>setShift(e.target.checked)}/> Décaler le masque</label><strong>IoU {(inter/union).toFixed(2)}</strong><strong>Dice {(2*inter/positive).toFixed(2)}</strong><small>Vert = intersection ; violet = référence seulement ; orange = prédiction seulement.</small></div>
    </div>
  </VisualFrame>;
}
function NetworkVisual(){
  const [x,setX]=useState(-2);
  const z=2*x+1;
  return <VisualFrame title="Un neurone transforme une entrée" subtitle="Le calcul est réalisé ici, sans modèle pré-entraîné ni résultat simulé.">
    <div className="learning-network">
      <div className="learning-network__formula">x <span>→ ×2 + 1 →</span> z <span>→ ReLU →</span> y</div>
      <label>Entrée x = {x}<input type="range" min={-5} max={5} step={1} value={x} onChange={e=>setX(+e.target.value)}/></label>
      <strong>z = {z} · y = max(0, {z}) = {Math.max(0,z)}</strong>
    </div>
  </VisualFrame>;
}
function StepsVisual({module}:{module:FormationModule}){
  const parts=module.points.slice(0,4).map(s=>s.length>34?s.slice(0,31)+'…':s);
  return <VisualFrame title="L’idée dans son contexte" subtitle="Chaque étape prépare la suivante. Sélectionne un chapitre pour pratiquer avec son code.">
    <div className="learning-flow">{parts.map((part,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span><strong>{part}</strong></div>)}</div>
  </VisualFrame>;
}
export function LessonVisual({topic,module}:{topic:string;module:FormationModule}){
  const introductory=IntroLessonVisual({moduleId:module.id,topic});
  if(introductory)return introductory;
  const q=topic.toLowerCase();
  if(/pixel|lignes\/colonnes|intensité|signal 2d|résolution|échantillonnage|quantification/.test(q)&&module.id==='images-pixels')return <PixelVisual/>;
  if(/bgr|rgb|hsv|couleur|canaux/.test(q))return <ColorVisual/>;
  if(/seuillage|otsu|segmentation|masque binaire|seuil fixe/.test(q))return <ThresholdVisual/>;
  if(/convolution|filtre moyen|gaussien|sobel|noyau|kernel|voisinage/.test(q))return <KernelVisual/>;
  if(/iou|dice|masque.*classe|faux positif|faux négatif/.test(q))return <MaskVisual/>;
  if(/train|test|validation|surapprentissage|apprentissage supervisé|knn/.test(q)&&module.id!=='metier-donnees')return <SplitVisual/>;
  if(/relu|neurone|activation|couche|réseau|gradient/.test(q))return <NetworkVisual/>;
  if(module.id==='metier-donnees'||/kpi|agrégation|groupby|tableau croisé|ventes|graphique catégoriel|sum|group by/.test(q))return <DataVisual/>;
  if(module.id==='classification-ml')return <SplitVisual/>;
  return <StepsVisual module={module}/>;
}
