import { useEffect, useRef, useState } from 'react';

type Operation='gris'|'contraste'|'seuil'|'flou'|'contours';
const allowedTypes=new Set(['image/png','image/jpeg','image/webp','image/bmp']);
const moduleOperation:Record<string,Operation>={
  'images-pixels':'gris','python-images':'gris','opencv-couleurs':'gris',
  'contraste-histogrammes':'contraste','convolution':'flou','bruit-debruitage':'flou',
  'transformations':'gris','contours-gradients':'contours',
  'segmentation':'seuil','morphologie':'seuil','fourier':'contours',
  'video-mouvement':'seuil','evaluation':'seuil','pipeline-industrie':'seuil',
  'classification-ml':'contours','reseaux-neurones':'contraste',
  'convolutions-cnn':'contours','pytorch-entrainement':'gris',
  'detection-objets':'seuil','segmentation-deep':'seuil',
  'evaluation-robustesse':'seuil','projet-cv':'seuil'
};
const clamp=(x:number)=>Math.max(0,Math.min(255,Math.round(x)));
function processPixels(raw:ImageData,operation:Operation,parameter:number):ImageData {
  const w=raw.width,h=raw.height;
  const source=raw.data;
  const gray=new Float32Array(w*h);
  for(let i=0;i<w*h;i++)gray[i]=.299*source[i*4]+.587*source[i*4+1]+.114*source[i*4+2];
  const at=(x:number,y:number)=>gray[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];
  const output=new Uint8ClampedArray(source);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x;
    let value=gray[i];
    if(operation==='seuil')value=value>=parameter?255:0;
    else if(operation==='contraste')value=clamp((value-128)*parameter/100+128);
    else if(operation==='flou'){
      let sum=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)sum+=at(x+dx,y+dy);
      value=sum/9;
    }else if(operation==='contours'){
      const gx=at(x+1,y-1)+2*at(x+1,y)+at(x+1,y+1)-at(x-1,y-1)-2*at(x-1,y)-at(x-1,y+1);
      const gy=at(x-1,y+1)+2*at(x,y+1)+at(x+1,y+1)-at(x-1,y-1)-2*at(x,y-1)-at(x+1,y-1);
      value=clamp(Math.hypot(gx,gy)/4);
    }
    output[i*4]=output[i*4+1]=output[i*4+2]=clamp(value);
    output[i*4+3]=255;
  }
  return new ImageData(output,w,h);
}
export default function ImageUploadLab({moduleId}:{moduleId:string}) {
  const [raw,setRaw]=useState<ImageData|null>(null);
  const [operation,setOperation]=useState<Operation>(moduleOperation[moduleId]||'gris');
  const [parameter,setParameter]=useState(125);
  const [error,setError]=useState('');
  const left=useRef<HTMLCanvasElement>(null);
  const right=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(!raw||!left.current||!right.current)return;
    left.current.width=right.current.width=raw.width;
    left.current.height=right.current.height=raw.height;
    left.current.getContext('2d')?.putImageData(raw,0,0);
    right.current.getContext('2d')?.putImageData(processPixels(raw,operation,parameter),0,0);
  },[raw,operation,parameter]);
  async function importImage(file:File|undefined) {
    if(!file)return;
    if(!allowedTypes.has(file.type)||file.size>10_000_000){
      setError('Choisir un PNG, JPEG, WebP ou BMP de moins de 10 Mo.');return;
    }
    setError('');
    const url=URL.createObjectURL(file);
    try{
      const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
        const im=new Image();
        im.onload=()=>resolve(im);
        im.onerror=()=>reject(new Error('Image illisible'));
        im.src=url;
      });
      const ratio=Math.min(1,160/Math.max(image.width,image.height));
      const width=Math.max(1,Math.round(image.width*ratio));
      const height=Math.max(1,Math.round(image.height*ratio));
      const temp=document.createElement('canvas');
      temp.width=width;temp.height=height;
      const ctx=temp.getContext('2d');
      if(!ctx)throw new Error('Canvas indisponible');
      ctx.drawImage(image,0,0,width,height);
      setRaw(ctx.getImageData(0,0,width,height));
    }catch(err){setError(err instanceof Error?err.message:'Impossible de charger cette image.');}
    finally{URL.revokeObjectURL(url);}
  }
  return <section className="formation-upload-lab" aria-label="Tester avec une vraie image">
    <div className="formation-algorithm-head"><div><span>TESTER SUR TES PROPRES IMAGES</span><strong>Laboratoire local — aucun envoi vers un serveur</strong></div></div>
    <p>Importe une image pour visualiser les effets d’un traitement sur ses pixels. L’aperçu utilise des opérations JavaScript simplifiées ; le notebook OpenCV fourni reste l’implémentation de référence.</p>
    <div className="formation-upload-controls">
      <label>Choisir une image<input type="file" accept="image/png,image/jpeg,image/webp,image/bmp" onChange={e=>importImage(e.target.files?.[0])}/></label>
      <label>Traitement
        <select value={operation} onChange={e=>setOperation(e.target.value as Operation)}>
          <option value="gris">Niveaux de gris</option><option value="contraste">Contraste</option>
          <option value="seuil">Seuillage binaire</option><option value="flou">Moyenne 3×3</option>
          <option value="contours">Contours (Sobel simplifié)</option>
        </select>
      </label>
    </div>
    {['contraste','seuil'].includes(operation)&&<label className="formation-upload-slider">Paramètre : {parameter}
      <input type="range" min="20" max="230" value={parameter} onChange={e=>setParameter(Number(e.target.value))}/>
    </label>}
    {error&&<p role="alert" className="formation-upload-error">{error}</p>}
    <div className="formation-upload-images">
      <figure><canvas ref={left} aria-label="Image originale"/><figcaption>Original</figcaption></figure>
      <figure><canvas ref={right} aria-label="Image après traitement"/><figcaption>Traitement : {operation}</figcaption></figure>
    </div>
    {!raw&&<p className="formation-upload-placeholder">Aucune image chargée. Le laboratoire synthétique au-dessus reste utilisable immédiatement.</p>}
  </section>;
}
