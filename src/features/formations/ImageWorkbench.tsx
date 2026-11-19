import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

type ImagePixels = { width: number; height: number; pixels: Uint8ClampedArray };
type Operation = 'original'|'contrast'|'gaussian'|'median'|'sobel'|'canny-like'|'threshold'|'morphology'|'invert';

function demoImage(width=192,height=128):ImagePixels {
  const pixels = new Uint8ClampedArray(width*height);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){
    const base=24 + Math.floor(40*x/width);
    const circle=(x-61)**2+(y-63)**2<33**2;
    const rect=x>112 && x<170 && y>35 && y<105;
    const grain=Math.round(12*Math.sin(x*43.71+y*29.3));
    pixels[y*width+x]=Math.max(0,Math.min(255,base + (circle?140:0)+(rect?175:0)+grain));
  }
  return {width,height,pixels};
}
function convolve(src:Uint8ClampedArray,w:number,h:number,kernel:number[],divisor:number) {
  const dst=new Uint8ClampedArray(src.length);
  const n=Math.sqrt(kernel.length),half=Math.floor(n/2);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let sum=0;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const xx=Math.max(0,Math.min(w-1,x+i-half)),yy=Math.max(0,Math.min(h-1,y+j-half));
      sum+=src[yy*w+xx]*kernel[j*n+i];
    }
    dst[y*w+x]=Math.max(0,Math.min(255,Math.round(sum/divisor)));
  }
  return dst;
}
function median(src:Uint8ClampedArray,w:number,h:number) {
  const dst=new Uint8ClampedArray(src.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const items:number[]=[];
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++) {
      const xx=Math.max(0,Math.min(w-1,x+i)),yy=Math.max(0,Math.min(h-1,y+j));
      items.push(src[yy*w+xx]);
    }
    items.sort((a,b)=>a-b);
    dst[y*w+x]=items[4];
  }
  return dst;
}
function sobel(src:Uint8ClampedArray,w:number,h:number) {
  const sx=convolveSigned(src,w,h,[-1,0,1,-2,0,2,-1,0,1]);
  const sy=convolveSigned(src,w,h,[-1,-2,-1,0,0,0,1,2,1]);
  return Uint8ClampedArray.from(sx,(v,i)=>Math.min(255,Math.hypot(v,sy[i])));
}
function convolveSigned(src:Uint8ClampedArray,w:number,h:number,k:number[]) {
  const dst=new Float32Array(src.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
    let sum=0;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++) {
      const xx=Math.max(0,Math.min(w-1,x+i)),yy=Math.max(0,Math.min(h-1,y+j));
      sum+=src[yy*w+xx]*k[(j+1)*3+i+1];
    }
    dst[y*w+x]=sum;
  }
  return dst;
}
function morphology(src:Uint8ClampedArray,w:number,h:number,t:number) {
  const binary=Uint8ClampedArray.from(src,v=>v>=t?255:0);
  const erode=new Uint8ClampedArray(src.length);
  const dilate=new Uint8ClampedArray(src.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let all=true;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const xx=x+i,yy=y+j;
      if(xx<0||yy<0||xx>=w||yy>=h||binary[yy*w+xx]===0) all=false;
    }
    erode[y*w+x]=all?255:0;
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let any=false;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const xx=x+i,yy=y+j;
      if(xx>=0&&yy>=0&&xx<w&&yy<h&&erode[yy*w+xx]>0)any=true;
    }
    dilate[y*w+x]=any?255:0;
  }
  return dilate;
}
export function processImage(image:ImagePixels, operation:Operation, amount:number):Uint8ClampedArray {
  const {width:w,height:h,pixels:p}=image;
  switch(operation) {
    case 'original': return p.slice();
    case 'invert': return Uint8ClampedArray.from(p,v=>255-v);
    case 'contrast':return Uint8ClampedArray.from(p,v=>Math.max(0,Math.min(255,128+(v-128)*amount/100)));
    case 'gaussian':return convolve(p,w,h,[1,2,1,2,4,2,1,2,1],16);
    case 'median':return median(p,w,h);
    case 'sobel':return sobel(p,w,h);
    case 'canny-like':{
      const blurred=convolve(p,w,h,[1,2,1,2,4,2,1,2,1],16);
      const grad=sobel(blurred,w,h);
      return Uint8ClampedArray.from(grad,v=>v>amount?255:0);
    }
    case 'threshold':return Uint8ClampedArray.from(p,v=>v>=amount?255:0);
    case 'morphology':return morphology(p,w,h,amount);
  }
}
function draw(canvas:HTMLCanvasElement|null,image:ImagePixels,p:Uint8ClampedArray) {
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  canvas.width=image.width;canvas.height=image.height;
  const buffer=ctx.createImageData(image.width,image.height);
  for(let i=0;i<p.length;i++){
    buffer.data[i*4]=p[i];
    buffer.data[i*4+1]=p[i];
    buffer.data[i*4+2]=p[i];
    buffer.data[i*4+3]=255;
  }
  ctx.putImageData(buffer,0,0);
}
const tasks:Record<string,Operation>={
  'images-pixels':'original','python-images':'contrast','opencv-couleurs':'invert',
  'contraste-histogrammes':'contrast','convolution':'gaussian',
  'bruit-debruitage':'median','transformations':'original',
  'contours-gradients':'sobel','segmentation':'threshold',
  'morphologie':'morphology','fourier':'sobel',
  'video-mouvement':'threshold','evaluation':'canny-like',
  'pipeline-industrie':'morphology',
  'classification-ml':'threshold','reseaux-neurones':'sobel',
  'convolutions-cnn':'gaussian','pytorch-entrainement':'sobel',
  'detection-objets':'canny-like','segmentation-deep':'threshold',
  'evaluation-robustesse':'threshold','projet-cv':'morphology'
};
const labels:Record<Operation,string>={
  original:'Original',contrast:'Contraste',gaussian:'Filtre gaussien 3×3',
  median:'Filtre médian 3×3',sobel:'Gradient de Sobel',
  'canny-like':'Gradient seuillé (non Canny)',threshold:'Seuillage binaire',
  morphology:'Ouverture morphologique',invert:'Inversion des intensités'
};
function thumbInfo(operation:Operation) {
  if(operation==='canny-like') return 'Démonstration pédagogique : gradient lissé puis seuillé. Ce n’est pas le détecteur Canny complet (sans suppression des non-maxima ni hystérésis).';
  if(operation==='morphology')return 'Ouverture = érosion puis dilatation, avec un noyau 3×3. Les petits objets peuvent disparaître.';
  if(operation==='fourier')return '';
  return 'Les deux images proviennent exactement de la même source. Les traitements sont calculés dans ce navigateur.';
}
export function ImageWorkbench({moduleId}:{moduleId:string}) {
  const before=useRef<HTMLCanvasElement>(null);
  const after=useRef<HTMLCanvasElement>(null);
  const [image,setImage]=useState<ImagePixels>(()=>demoImage());
  const [operation,setOperation]=useState<Operation>(()=>tasks[moduleId]||'contrast');
  const [amount,setAmount]=useState(120);
  const [error,setError]=useState('');
  const processed=useMemo(()=>processImage(image,operation,amount),[image,operation,amount]);
  const metrics=useMemo(()=>{
    const min=Math.min(...processed),max=Math.max(...processed);
    const avg=Math.round(processed.reduce((a,v)=>a+v,0)/processed.length);
    return {min,max,avg,active:processed.filter(v=>v>0).length};
  },[processed]);
  useEffect(()=>{setOperation(tasks[moduleId]||'contrast');setAmount(120);},[moduleId]);
  useEffect(()=>{draw(before.current,image,image.pixels);draw(after.current,image,processed);},[image,processed]);
  async function upload(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return;
    if(!file.type.startsWith('image/')){setError('Choisis une image PNG, JPEG ou WebP.');return;}
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      const ratio=Math.min(1,320/img.width,240/img.height);
      const width=Math.max(1,Math.round(img.width*ratio)),height=Math.max(1,Math.round(img.height*ratio));
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d');
      if(!ctx){URL.revokeObjectURL(url);setError('Canvas indisponible.');return;}
      ctx.drawImage(img,0,0,width,height);
      const rgba=ctx.getImageData(0,0,width,height).data;
      const gray=new Uint8ClampedArray(width*height);
      for(let i=0;i<gray.length;i++)gray[i]=Math.round(.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2]);
      setImage({width,height,pixels:gray});setError('');URL.revokeObjectURL(url);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);setError('Impossible de lire cette image.');};
    img.src=url;
    e.target.value='';
  }
  function download(){
    const a=document.createElement('a');
    a.download='monstage-image-traitee.png';
    a.href=after.current?.toDataURL('image/png')||'';
    if(a.href)a.click();
  }
  return <section className="formation-image-workbench" aria-label="Laboratoire de traitement d’images">
    <div className="formation-lab__header">
      <div><strong>Laboratoire Image Processing</strong><p>Applique un algorithme à une image réelle, sans quitter MonStage.</p></div>
      <label className="formation-workbench-upload">Importer une image <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload}/></label>
    </div>
    <div className="formation-workbench-controls">
      <label>Traitement<select value={operation} onChange={e=>setOperation(e.target.value as Operation)}>
        {Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}
      </select></label>
      {['contrast','threshold','morphology','canny-like'].includes(operation)&&<label>Paramètre : {amount}<input aria-label="Paramètre de traitement" type="range" min={operation==='contrast'?30:0} max={operation==='contrast'?300:255} value={amount} onChange={e=>setAmount(+e.target.value)}/></label>}
      <button type="button" className="formation-secondary-action" onClick={()=>{setImage(demoImage());setError('');}}>Image de démonstration</button>
    </div>
    {error&&<p role="alert">{error}</p>}
    <div className="formation-workbench-canvases">
      <figure><canvas ref={before} role="img" aria-label="Image originale en niveaux de gris"/><figcaption>Image originale · {image.width} × {image.height}</figcaption></figure>
      <figure><canvas ref={after} role="img" aria-label="Résultat du traitement sélectionné"/><figcaption>Résultat · {labels[operation]}</figcaption></figure>
    </div>
    <div className="formation-workbench-metrics">
      <span>Intensité minimale <strong>{metrics.min}</strong></span>
      <span>Moyenne <strong>{metrics.avg}</strong></span>
      <span>Maximum <strong>{metrics.max}</strong></span>
      <span>Pixels non nuls <strong>{metrics.active.toLocaleString('fr-FR')}</strong></span>
    </div>
    <p className="formation-lab__hint">{thumbInfo(operation)}</p>
    <button type="button" className="formation-secondary-action" onClick={download}>↓ Enregistrer le résultat PNG</button>
  </section>;
}
