import { useMemo, useState } from 'react';

function ScalePlot({values,title,xLabel,yLabel,maxValue}:{values:number[];title:string;xLabel:string;yLabel:string;maxValue?:number}){
  const max=Math.max(1,maxValue||0,...values);
  const points=values.map((v,i)=>(40+(values.length===1?0:i/(values.length-1)*445))+','+(132-v/max*110)).join(' ');
  return <figure className="formation-advanced-plot">
    <figcaption>{title}</figcaption>
    <svg viewBox="0 0 510 169" role="img" aria-label={title}>
      <line x1="40" y1="17" x2="40" y2="132" stroke="currentColor" opacity=".6"/>
      <line x1="40" y1="132" x2="490" y2="132" stroke="currentColor" opacity=".6"/>
      <polyline points={points} stroke="#168f7c" strokeWidth="2.25" fill="none" strokeLinejoin="round"/>
      <text x="10" y="15" fill="currentColor" fontSize="10">{yLabel}</text>
      <text x="210" y="162" fill="currentColor" fontSize="11">{xLabel}</text>
      <text x="40" y="146" fill="currentColor" fontSize="10">0</text>
      <text x="467" y="146" fill="currentColor" fontSize="10">{values.length-1}</text>
    </svg>
  </figure>;
}
function FourierLab(){
  const [frequency,setFrequency]=useState(7);
  const [noise,setNoise]=useState(0);
  const count=128;
  const signal=useMemo(()=>Array.from({length:count},(_,x)=>
    0.48+0.27*Math.sin(2*Math.PI*frequency*x/count)+noise/100*0.12*Math.sin(2*Math.PI*23*x/count)),[frequency,noise]);
  const spectrum=useMemo(()=>Array.from({length:65},(_,k)=>{
    let real=0,imag=0;
    for(let x=0;x<count;x++){
      const angle=2*Math.PI*k*x/count;
      real+=signal[x]*Math.cos(angle);
      imag-=signal[x]*Math.sin(angle);
    }
    return Math.hypot(real,imag)/count;
  }),[signal]);
  return <section className="formation-advanced-lab">
    <div className="formation-lab__header"><strong>Laboratoire FFT — Vraies fréquences spatiales</strong><span>Transformée de Fourier discrète calculée dans ce navigateur</span></div>
    <div className="formation-workbench-controls">
      <label>Fréquence du motif : {frequency}<input type="range" min="1" max="24" value={frequency} onChange={e=>setFrequency(+e.target.value)}/></label>
      <label>Amplitude parasite : {noise}%<input type="range" min="0" max="100" step="10" value={noise} onChange={e=>setNoise(+e.target.value)}/></label>
    </div>
    <div className="formation-advanced-plots">
      <ScalePlot title="Profil spatial 1D" values={signal} xLabel="Position (pixels)" yLabel="Intensité"/>
      <ScalePlot title="Module de la DFT" values={spectrum} xLabel="Fréquence (cycles/128 px)" yLabel="Amplitude"/>
    </div>
    <p className="formation-lab__hint">Le pic principal se déplace à la fréquence {frequency}. Le parasite à 23 cycles apparaît lorsque son amplitude augmente. La DFT est ici calculée explicitement pour expliquer la FFT ; le notebook propose le passage à np.fft.fft2 pour les vraies images.</p>
  </section>;
}
function VideoLab(){
  const [frame,setFrame]=useState(10);
  const [lighting,setLighting]=useState(false);
  const cx=20+frame*6;
  const totalPixels=lighting? 192*96 : 0;
  return <section className="formation-advanced-lab">
    <div className="formation-lab__header"><strong>Laboratoire vidéo — Détection de mouvement</strong><span>Séquence synthétique de 25 frames</span></div>
    <div className="formation-workbench-controls">
      <label>Frame {frame+1}/25 <input type="range" min="0" max="24" value={frame} onChange={e=>setFrame(+e.target.value)}/></label>
      <label className="formation-video-toggle"><input type="checkbox" checked={lighting} onChange={e=>setLighting(e.target.checked)}/>Simuler une variation globale de lumière</label>
    </div>
    <div className="formation-advanced-plots">
      <figure className="formation-advanced-plot"><figcaption>Image de la caméra</figcaption><svg viewBox="0 0 192 96" role="img" aria-label={'Objet à la position x '+cx}><rect width="192" height="96" fill={lighting?'#646d7a':'#192c40'}/><circle cx={cx} cy="48" r="12" fill="#eaf8fc"/></svg></figure>
      <figure className="formation-advanced-plot"><figcaption>Différence avec le fond de référence</figcaption><svg viewBox="0 0 192 96" role="img" aria-label="Masque de différence avec le fond"><rect width="192" height="96" fill={lighting?'#f0f0f0':'#0b1322'}/><circle cx={cx} cy="48" r="12" fill={lighting?'#191919':'#f4f4f4'}/></svg></figure>
    </div>
    <p className="formation-lab__hint">L’objet se déplace sur un fond fixe. Une variation globale de luminosité peut déclencher une détection sur une grande partie de l’image ({lighting?'faux changements dans le fond':'pas de changement de fond'}). Démonstration par différence avec une référence fixe, pas MOG2. {totalPixels?'La majorité des pixels du fond a changé.':''}</p>
  </section>;
}
const kernels=[
  {name:'Moyenneur',weights:[1,1,1,1,1,1,1,1,1],factor:1/9},
  {name:'Contours horizontaux',weights:[-1,-2,-1,0,0,0,1,2,1],factor:1},
  {name:'Renforcement',weights:[0,-1,0,-1,5,-1,0,-1,0],factor:1}
];
const image=[0,0,0,0,0,0,0,2,2,2,0,0,2,8,8,0,0,2,8,8,0,0,2,8,8];
function CNNLab(){
  const [index,setIndex]=useState(1);
  const kernel=kernels[index];
  const output=useMemo(()=>{
    const result:number[][]=[];
    for(let y=1;y<4;y++){
      const row:number[]=[];
      for(let x=1;x<4;x++){
        let sum=0;
        for(let ky=-1;ky<=1;ky++)for(let kx=-1;kx<=1;kx++)sum+=image[(y+ky)*5+x+kx]*kernel.weights[(ky+1)*3+kx+1];
        row.push(Math.round(sum*kernel.factor*10)/10);
      }
      result.push(row);
    }
    return result;
  },[kernel]);
  return <section className="formation-advanced-lab">
    <div className="formation-lab__header"><strong>Laboratoire convolution — Filtres 3×3</strong><span>Produit-somme réellement calculé sur les pixels</span></div>
    <div className="formation-workbench-controls"><label>Choisir un noyau<select value={index} onChange={e=>setIndex(+e.target.value)}>{kernels.map((v,i)=><option value={i} key={v.name}>{v.name}</option>)}</select></label></div>
    <div className="formation-cnn-grids">
      <div><span>Image 5×5</span><div className="formation-cnn-grid formation-cnn-grid--five">{image.map((v,i)=><b key={i} style={{background:'rgb('+Math.round(v/8*255)+','+Math.round(v/8*255)+','+Math.round(v/8*255)+')',color:v>3?'#111':'#fff'}}>{v}</b>)}</div></div>
      <div><span>Noyau 3×3</span><div className="formation-cnn-grid">{kernel.weights.map((v,i)=><b key={i}>{v}</b>)}</div></div>
      <div><span>Sortie 3×3 (valid)</span><div className="formation-cnn-grid">{output.flat().map((v,i)=><b key={i}>{v}</b>)}</div></div>
    </div>
    <p className="formation-lab__hint">Un noyau glisse sur les pixels et forme un produit-somme à chaque position. Dans un CNN, les poids sont appris pendant l’entraînement : ici ce sont des noyaux fixes pour comprendre le mécanisme.</p>
  </section>;
}
export function AdvancedImageLab({moduleId}:{moduleId:string}){
  if(moduleId==='fourier')return <FourierLab/>;
  if(moduleId==='video-mouvement')return <VideoLab/>;
  if(['convolutions-cnn','reseaux-neurones','pytorch-entrainement'].includes(moduleId))return <CNNLab/>;
  return null;
}
