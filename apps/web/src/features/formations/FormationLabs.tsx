import { useMemo, useState } from 'react';

const initialPixels = [
  0, 0, 255, 0, 0,
  0, 0, 255, 0, 0,
  255, 255, 255, 255, 255,
  0, 0, 255, 0, 0,
  0, 0, 255, 0, 0
];

function PixelLab() {
  const [pixels, setPixels] = useState(initialPixels);
  return <div className="formation-lab" aria-label="Laboratoire de pixels">
    <div className="formation-lab__header"><strong>Laboratoire interactif · 5 × 5 pixels</strong><span>Clique sur une case pour changer son intensité</span></div>
    <div className="formation-pixel-lab">
      <div className="formation-pixel-grid" role="group" aria-label="Image de vingt-cinq pixels">
        {pixels.map((p, i) => <button key={i} type="button"
          aria-label={`Ligne ${Math.floor(i / 5) + 1}, colonne ${i % 5 + 1}, valeur ${p}`}
          style={{ background: `rgb(${p},${p},${p})`, color: p > 130 ? '#111827' : '#ffffff' }}
          onClick={() => setPixels(old => old.map((value, j) => j === i ? (value === 0 ? 128 : value === 128 ? 255 : 0) : value))}>{p}</button>)}
      </div>
      <div className="formation-lab__reading">
        <strong>Comprendre la matrice</strong>
        <p>Les valeurs 0, 128 et 255 représentent ici noir, gris et blanc. La position d’un pixel est donnée par sa ligne et sa colonne.</p>
        <button className="formation-link-button" type="button" onClick={() => setPixels(initialPixels)}>Réinitialiser l’image</button>
      </div>
    </div>
  </div>;
}

function ThresholdLab() {
  const [threshold, setThreshold] = useState(110);
  const intensity = [20,32,48,62,75,92,116,131, 26,48,70,125,170,205,143,88, 30,72,131,210,236,201,132,65, 44,85,160,226,250,214,149,74, 35,82,137,208,230,187,109,58, 18,43,80,138,171,123,67,31];
  const kept = intensity.filter(value => value >= threshold).length;
  return <div className="formation-lab">
    <div className="formation-lab__header"><strong>Laboratoire · Seuillage binaire</strong><span>Ajuste le seuil et observe la segmentation</span></div>
    <div className="formation-slider-row"><label htmlFor="formation-threshold">Seuil d’intensité</label><input id="formation-threshold" type="range" min="0" max="255" value={threshold} onChange={e => setThreshold(Number(e.target.value))}/><output>{threshold}</output></div>
    <div className="formation-image-compare">
      <div><div className="formation-demo-grid">{intensity.map((value, index) => <span key={index} style={{background:`rgb(${value},${value},${value})`}} />)}</div><small>Image en niveaux de gris</small></div>
      <div><div className="formation-demo-grid">{intensity.map((value, index) => <span key={index} style={{background:value >= threshold ? '#f8fafc':'#071629'}} />)}</div><small>Masque binaire : {kept} / {intensity.length} pixels positifs</small></div>
    </div>
    <p className="formation-lab__hint">Un seuil trop faible sélectionne beaucoup de fond ; un seuil trop élevé peut supprimer une partie de l’objet.</p>
  </div>;
}

function ContrastLab() {
  const [gain, setGain] = useState(100);
  const values = useMemo(() => Array.from({length:16}, (_,i) => Math.round(65+i*7)), []);
  const transformed = values.map(value => Math.max(0, Math.min(255, Math.round((value - 128) * gain / 100 + 128))));
  return <div className="formation-lab">
    <div className="formation-lab__header"><strong>Laboratoire · Contraste et saturation</strong><span>Compare les intensités avant et après</span></div>
    <div className="formation-slider-row"><label htmlFor="formation-gain">Facteur de contraste</label><input id="formation-gain" type="range" min="25" max="300" step="5" value={gain} onChange={e => setGain(Number(e.target.value))}/><output>{(gain/100).toFixed(2)}×</output></div>
    <div className="formation-image-compare">
      <div><div className="formation-intensity-strip">{values.map((v,i)=><span key={i} style={{background:`rgb(${v},${v},${v})`}} />)}</div><small>Original</small></div>
      <div><div className="formation-intensity-strip">{transformed.map((v,i)=><span key={i} style={{background:`rgb(${v},${v},${v})`}} />)}</div><small>Corrigé — {transformed.filter(v => v === 0 || v === 255).length} pixels saturés</small></div>
    </div>
  </div>;
}

function SalesLab() {
  const [nantes, setNantes] = useState(12);
  const [paris, setParis] = useState(18);
  const [lyon, setLyon] = useState(9);
  const rows: Array<[string,number]> = [['Nantes',nantes],['Paris',paris],['Lyon',lyon]];
  return <div className="formation-lab">
    <div className="formation-lab__header"><strong>Laboratoire · Lire et interpréter les KPI</strong><span>Données fictives en milliers d’euros</span></div>
    <div className="formation-bar-chart" role="img" aria-label={rows.map(([n,v])=>`${n} : ${v} milliers d’euros`).join(', ')}>
      {rows.map(([name,value])=><div className="formation-bar-line" key={name}><span>{name}</span><div><span style={{width:`${value/30*100}%`}} /></div><strong>{value} k€</strong></div>)}
    </div>
    <div className="formation-sliders">
      {([['Nantes',nantes,setNantes],['Paris',paris,setParis],['Lyon',lyon,setLyon]] as const).map(([name,value,setter])=><label key={name}>{name}<input type="range" min="1" max="30" value={value} onChange={e => setter(Number(e.target.value))}/></label>)}
    </div>
    <p className="formation-lab__hint">Total : {nantes+paris+lyon} k€. Le magasin leader est {rows.reduce((a,b)=>b[1]>a[1]?b:a)[0]}. Un revenu élevé ne prouve pas une meilleure marge.</p>
  </div>;
}

export function FormationLab({moduleId}: {moduleId:string}) {
  if (moduleId === 'images-pixels' || moduleId === 'python-images') return <PixelLab/>;
  if (moduleId === 'segmentation' || moduleId === 'morphologie') return <ThresholdLab/>;
  if (moduleId === 'contraste-histogrammes') return <ContrastLab/>;
  if (['metier-donnees','tableurs','pandas-numpy','kpi-decision'].includes(moduleId)) return <SalesLab/>;
  return null;
}
