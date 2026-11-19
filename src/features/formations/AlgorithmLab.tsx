import { useMemo, useState } from 'react';

/**
 * Didactic images are generated, not downloaded. The exact same input is reused
 * when changing parameters, so visual differences are meaningful.
 */
type Matrix=number[][];
const size=16;
const limit=(v:number)=>Math.max(0,Math.min(255,Math.round(v)));
const createImage=():Matrix=>Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>{
  const background=33+Math.round(x*2.1);
  const circle=((x-5)**2+(y-7)**2)<17;
  const box=x>=10&&x<=13&&y>=3&&y<=11;
  const signal=circle?180:box?224:background;
  const noise=((x*31+y*17+11)%23===0)?115:((x*13+y*19)%17===0)?-65:0;
  return limit(signal+noise);
}));
function smooth(image:Matrix,median=false):Matrix {
  const k=[[1,2,1],[2,4,2],[1,2,1]];
  return image.map((row,y)=>row.map((_,x)=>{
    const values:number[]=[]; let weighted=0,weights=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const v=image[Math.max(0,Math.min(size-1,y+dy))][Math.max(0,Math.min(size-1,x+dx))];
      values.push(v);weighted+=v*k[dy+1][dx+1];weights+=k[dy+1][dx+1];
    }
    return median?values.sort((a,b)=>a-b)[4]:limit(weighted/weights);
  }));
}
function magnitude(image:Matrix):Matrix {
  const kx=[[-1,0,1],[-2,0,2],[-1,0,1]];
  const ky=[[-1,-2,-1],[0,0,0],[1,2,1]];
  return image.map((row,y)=>row.map((_,x)=>{
    let gx=0,gy=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const v=image[Math.max(0,Math.min(size-1,y+dy))][Math.max(0,Math.min(size-1,x+dx))];
      gx+=v*kx[dy+1][dx+1];gy+=v*ky[dy+1][dx+1];
    }
    return limit(Math.hypot(gx,gy)/4);
  }));
}
function morph(image:Matrix, threshold:number,mode:'erode'|'dilate'):Matrix{
  const bin=image.map(row=>row.map(v=>v>=threshold?255:0));
  return bin.map((row,y)=>row.map((_,x)=>{
    const values:number[]=[];
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)
      values.push(bin[Math.max(0,Math.min(size-1,y+dy))][Math.max(0,Math.min(size-1,x+dx))]);
    return mode==='erode'?Math.min(...values):Math.max(...values);
  }));
}
function moving(frame:number):Matrix{
  return Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>
    x>=frame&&x<frame+4&&y>=5&&y<10?210:30
  ));
}
function change(image:Matrix, moduleId:string, param:number):Matrix {
  switch(moduleId) {
    case 'images-pixels': case 'python-images': case 'opencv-couleurs':
      return image.map(row=>row.map(v=>Math.round(v/64)*64));
    case 'contraste-histogrammes':
      return image.map(row=>row.map(v=>limit((v-128)*(param/100)+128)));
    case 'convolution':
      return smooth(image);
    case 'bruit-debruitage':
      return param>140?smooth(smooth(image,true),true):smooth(image,true);
    case 'transformations':
      return image.map((row,y)=>row.map((_,x)=>image[size-1-x][y]));
    case 'contours-gradients':
      return magnitude(smooth(image));
    case 'segmentation': case 'evaluation':
      return image.map(row=>row.map(v=>v>=param?255:0));
    case 'morphologie':
      return morph(image,param,'erode');
    case 'fourier': {
      // Spatial high-frequency component: useful visual proxy, not an FFT implementation
      const low=smooth(smooth(image));
      return image.map((row,y)=>row.map((v,x)=>limit(128+v-low[y][x])));
    }
    case 'video-mouvement':{
      const a=moving(2),b=moving(Math.floor(param/25)+2);
      return a.map((row,y)=>row.map((v,x)=>Math.abs(v-b[y][x])));
    }
    case 'pipeline-industrie':
      return morph(image,param,'dilate');
    case 'classification-ml': case 'reseaux-neurones': case 'convolutions-cnn':
      return magnitude(image);
    case 'pytorch-entrainement': case 'detection-objets': case 'segmentation-deep': case 'evaluation-robustesse': case 'projet-cv':
      return image.map(row=>row.map(v=>v>=param?255:0));
    default:return image.map(row=>row.map(v=>v>=param?255:0));
  }
}
const definitions:Record<string,[string,string,string]>={
  'images-pixels':['Niveaux et quantification','Image initiale','4 niveaux approximatifs'],
  'python-images':['Tableau NumPy','Intensités uint8','Valeurs quantifiées'],
  'opencv-couleurs':['Représentation de l’image','Niveaux d’origine','Niveaux quantifiés'],
  'contraste-histogrammes':['Contraste','Avant correction','Après correction'],
  'convolution':['Filtre spatial','Avant filtrage','Lissage gaussien 3×3'],
  'bruit-debruitage':['Réduction du bruit','Image bruitée','Filtre médian'],
  'transformations':['Transformation géométrique','Original','Rotation 90°'],
  'contours-gradients':['Gradient de Sobel','Image originale','Magnitude du gradient'],
  'segmentation':['Seuillage binaire','Image originale','Masque obtenu'],
  'morphologie':['Morphologie','Masque d’origine','Érosion 3×3'],
  'fourier':['Composantes spatiales','Image originale','Détails hautes fréquences (approximation)'],
  'video-mouvement':['Mouvement','Première image','Différence temporelle'],
  'evaluation':['Masque positif','Image de référence','Masque prédit'],
  'pipeline-industrie':['Chaîne simplifiée','Image initiale','Masque après dilatation'],
  'classification-ml':['Extraction de caractéristiques','Image de départ','Réponse spatiale'],
  'reseaux-neurones':['Carte de réponses','Entrée','Variation spatiale'],
  'convolutions-cnn':['Feature map illustrative','Entrée','Réponse d’un filtre Sobel fixe'],
  'pytorch-entrainement':['Prétraitement','Image brute','Masque pour comparaison'],
  'detection-objets':['Région détectée','Image initiale','Régions binaires'],
  'segmentation-deep':['Masque prédit illustratif','Image initiale','Masque binaire'],
  'evaluation-robustesse':['Influence du seuil','Intensités','Masque obtenu'],
  'projet-cv':['Chaîne de vision','Image de départ','Segmentation élémentaire']
};
function ImageMatrix({image,label}: {image:Matrix;label:string}) {
  const count=image.flat().filter(v=>v>=128).length;
  return <div className="formation-image-tile">
    <div className="formation-algorithm-image" role="img" aria-label={label+', '+count+' pixels de forte intensité'}>
      {image.flat().map((v,i)=><span key={i} style={{backgroundColor:`rgb(${v},${v},${v})`}} />)}
    </div>
    <span>{label}</span>
  </div>;
}
export function AlgorithmLab({moduleId}: {moduleId:string}) {
  const [param,setParam]=useState(120);
  const input=useMemo(()=>createImage(),[]);
  const [title,left,right]=definitions[moduleId]??definitions['segmentation'];
  const source=moduleId==='video-mouvement'?moving(2):input;
  const output=useMemo(()=>change(input,moduleId,param),[input,moduleId,param]);
  const mean=(image:Matrix)=>image.flat().reduce((sum,v)=>sum+v,0)/(size*size);
  const isAdjustable=['contraste-histogrammes','bruit-debruitage','segmentation','morphologie','video-mouvement','pipeline-industrie','evaluation','pytorch-entrainement','detection-objets','segmentation-deep','evaluation-robustesse','projet-cv'].includes(moduleId);
  return <section className="formation-algorithm-lab" aria-label="Démonstration interactive des images">
    <div className="formation-algorithm-head"><div><span>VISUALISATION INTERACTIVE</span><strong>{title}</strong></div><span>Images pédagogiques synthétiques</span></div>
    <div className="formation-algorithm-visuals">
      <ImageMatrix image={source} label={left}/>
      <div className="formation-algorithm-arrow" aria-hidden="true">→</div>
      <ImageMatrix image={output} label={right}/>
    </div>
    {isAdjustable&&<div className="formation-algorithm-slider"><label htmlFor={'algo-param-'+moduleId}>{moduleId==='contraste-histogrammes'?'Contraste (%)':moduleId==='video-mouvement'?'Déplacement temporel':'Seuil / intensité'} <strong>{param}</strong></label>
      <input id={'algo-param-'+moduleId} type="range" min="35" max="220" value={param} onChange={e=>setParam(Number(e.target.value))}/>
    </div>}
    <div className="formation-algorithm-stats">
      <span>Moyenne entrée <b>{mean(source).toFixed(1)}</b></span>
      <span>Moyenne sortie <b>{mean(output).toFixed(1)}</b></span>
      <span>Résolution <b>16 × 16</b></span>
    </div>
    <p>Ce laboratoire explique visuellement un principe. Il n’exécute pas le code Python du notebook ; pour les algorithmes de production, exécute et évalue le script OpenCV/PyTorch fourni.</p>
  </section>;
}
