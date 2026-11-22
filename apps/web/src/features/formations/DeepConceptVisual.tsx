import {useState, type ReactNode} from 'react';

function Figure({title,caption,children}:{title:string;caption:string;children:ReactNode}){
 return <figure className="concept-deep-visual">
  <div className="concept-deep-visual__head"><span>ILLUSTRATION DU CONCEPT</span><strong>{title}</strong></div>
  <div className="concept-deep-visual__body">{children}</div>
  <figcaption>{caption}</figcaption>
 </figure>;
}
function Table({head,rows}:{head:string[];rows:Array<Array<string|number>>}){
 return <table className="concept-deep-visual__table"><thead><tr>{head.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table>;
}
function Arrows({items}:{items:Array<[string,string]>}){
 return <div className="concept-deep-visual__arrows">{items.map(([title,description],i)=><div key={i}><strong>{title}</strong><small>{description}</small></div>)}</div>;
}
export function DeepConceptVisual({slug}:{slug:string}){
 const [selected,setSelected]=useState(5);
 const [threshold,setThreshold]=useState(20);
 const matrix=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
 switch(slug){
 case 'image-roi-slicing':return <Figure title="Une ROI est une fenêtre sur la matrice" caption="image[2:5,4:8] sélectionne les lignes 2–4 et les colonnes 4–7 ; la forme est (3,4).">
  <div className="concept-deep-visual__side"><Table head={['x4','x5','x6','x7']} rows={[[24,25,26,27],[34,35,36,37],[44,45,46,47]]}/><div className="concept-deep-visual__reading"><span>Origine locale</span><strong>ROI[0,0] = 24</strong><small>Image[2,4] = 24</small></div></div>
 </Figure>;
 case 'image-boolean-masks':return <Figure title="Chaque pixel est classé True ou False" caption="Un seuil transforme la matrice de niveaux de gris en masque qui conserve les positions des pixels.">
  <div className="concept-deep-visual__equation"><Table head={['p0','p1','p2','p3']} rows={[[50,100,150,220]]}/><b> &gt; 120 → </b><Table head={['p0','p1','p2','p3']} rows={[[0,0,1,1]]}/></div>
 </Figure>;
 case 'image-vectorization-clipping':return <Figure title="Augmenter l'intensité sans déborder de uint8" caption="La valeur 250 + 20 doit être limitée à 255 au lieu de produire une valeur hors plage.">
  <div className="concept-deep-visual__equation"><Table head={['Pixel 1','Pixel 2']} rows={[[200,250]]}/><b> +20 → </b><Table head={['Pixel 1','Pixel 2']} rows={[[220,255]]}/></div>
 </Figure>;
 case 'image-compare-matplotlib':return <Figure title="Comparer les traitements, pas seulement la sortie" caption="Montre l'image originale, la version traitée et une mesure de leurs différences à échelle identique.">
  <Arrows items={[[ 'Original','Matrice initiale'],['Traitement','Transformation explicite'],['Différence','Carte |après - avant|'],['Conclusion','Effet et limites']]}/>
 </Figure>;
 case 'images-signal-2d':return <Figure title="Une image est une fonction I(y,x)" caption="Un même profil d’intensité se répète sur toutes les lignes, formant une transition verticale.">
  <Table head={['x=0','x=1','x=2','x=3','x=4']} rows={[[0,0,0,100,100],[0,0,0,100,100],[0,0,0,100,100]]}/>
 </Figure>;
 case 'image-resolution':return <Figure title="Largeur × hauteur = nombre de pixels" caption="Attention : l’image est annoncée comme 640 × 480, mais NumPy l’enregistre avec shape (480,640).">
  <div className="concept-deep-visual__stats"><div><span>Largeur</span><strong>640</strong><small>Colonnes</small></div><div><span>Hauteur</span><strong>480</strong><small>Lignes</small></div><div><span>Pixels</span><strong>307 200</strong><small>640 × 480</small></div><div><span>Rapport</span><strong>4:3</strong><small>1,333...</small></div></div>
 </Figure>;
 case 'image-quantization':return <Figure title="Même nombre de pixels, moins de niveaux" caption="La quantification conserve ici les 8 positions, mais transforme leurs intensités vers seulement 4 niveaux.">
  <div className="concept-deep-visual__equation"><Table head={['p0','p1','p2','p3']} rows={[[0,50,100,150]]}/><b>→</b><Table head={['p0','p1','p2','p3']} rows={[[0,0,64,128]]}/></div>
 </Figure>;
 case 'image-industry-examples':return <Figure title="La même logique pour trois domaines" caption="Les données et les métriques diffèrent selon la mission ; la validation reste indispensable.">
  <div className="concept-deep-visual__stats"><div><span>INDUSTRIE</span><strong>Défauts</strong><small>Détection, vitesse, faux rejets</small></div><div><span>MÉDECINE</span><strong>Structures</strong><small>Segmentation et annotations</small></div><div><span>ROBOTIQUE</span><strong>Objets</strong><small>Localisation, calibration</small></div></div>
 </Figure>;
 case 'numpy-introduction':return <Figure title="Des mesures à un tableau NumPy" caption="Deux lignes représentent deux machines ; trois colonnes représentent trois périodes.">
   <div className="concept-deep-visual__side"><Table head={['Période 1','Période 2','Période 3']} rows={[[20,22,24],[19,21,23]]}/><div className="concept-deep-visual__reading"><strong>ndarray</strong><p>shape = (2, 3)</p><p>ndim = 2</p><p>size = 6</p></div></div>
 </Figure>;
 case 'image-channels':
 case 'numpy-shape-dtype':return <Figure title="Shape, ndim, dtype : trois informations différentes" caption="La forme concerne les axes ; dtype concerne la représentation des valeurs.">
   <div className="concept-deep-visual__stats"><div><span>shape</span><strong>(4, 6, 3)</strong><small>Hauteur × largeur × canaux</small></div><div><span>ndim</span><strong>3</strong><small>Trois axes</small></div><div><span>dtype</span><strong>uint8</strong><small>0–255 par composante</small></div></div>
 </Figure>;
 case 'pixels-coordinates':
 case 'numpy-indexing':return <Figure title="Sélectionne un élément de la matrice 4×4" caption="La ligne et la colonne commencent à zéro ; modifier la sélection permet de comprendre l'indexation.">
   <div className="concept-deep-visual__side"><div className="concept-deep-visual__matrix">{matrix.map((v,i)=><button key={i} type="button" onClick={()=>setSelected(i)} className={selected===i?'is-selected':''} aria-label={'Ligne '+Math.floor(i/4)+' colonne '+i%4+' valeur '+v}>{v}</button>)}</div><div className="concept-deep-visual__reading"><span>Valeur sélectionnée</span><strong>m[{Math.floor(selected/4)},{selected%4}] = {selected}</strong><small>m[ligne, colonne]</small></div></div>
 </Figure>;
 case 'numpy-vectorization':return <Figure title="Un tableau reçoit une correction par colonne" caption="La forme (3,) est compatible avec la dernière dimension de (2,3) : le broadcasting applique la correction aux deux lignes.">
   <div className="concept-deep-visual__equation"><Table head={['A','B','C']} rows={[[10,20,30],[40,50,60]]}/><b>+</b><Table head={['A','B','C']} rows={[[1,2,3]]}/><b>=</b><Table head={['A','B','C']} rows={[[11,22,33],[41,52,63]]}/></div>
 </Figure>;
 case 'numpy-statistics':return <Figure title="Une valeur extrême augmente la moyenne" caption="Moyenne de 30 contre médiane de 13 : les statistiques décrivent des aspects différents de la distribution.">
   <div className="concept-deep-visual__bars">{[10,12,13,15,100].map((v,i)=><div key={i}><span style={{height:(v/100*100)+'%'}}/><small>{v}</small></div>)}</div><div className="concept-deep-visual__pair"><strong>Moyenne = 30</strong><strong>Médiane = 13</strong></div>
 </Figure>;
 case 'pandas-dataframe':return <Figure title="Un DataFrame : des observations et des colonnes nommées" caption="M1 apparaît deux fois parce que chaque ligne est un événement. Trois lignes ne signifient pas trois machines.">
   <Table head={['Index','Machine','Arrêt (min)']} rows={[[0,'M1',10],[1,'M2',15],[2,'M1',25]]}/>
 </Figure>;
 case 'pandas-import':return <Figure title="Le CSV texte devient un DataFrame typé" caption="L'import ne garantit pas la bonne conversion : les séparateurs et types doivent être contrôlés.">
   <Arrows items={[[ 'CSV','machine;minutes → M1;10'],['read_csv(sep=";")','Interprétation des colonnes'],['DataFrame','machine=str · minutes=int']]}/>
 </Figure>;
 case 'pandas-exploration':return <Figure title="Les quatre questions de diagnostic" caption="L'exploration donne une fiche d'identité du tableau avant le calcul des KPI.">
   <div className="concept-deep-visual__stats"><div><span>shape</span><strong>3 × 2</strong><small>Combien de lignes ?</small></div><div><span>dtypes</span><strong>str / int</strong><small>Quels types ?</small></div><div><span>isna()</span><strong>1</strong><small>Combien de manquants ?</small></div><div><span>describe()</span><strong>min / max</strong><small>Quelle plage ?</small></div></div>
 </Figure>;
 case 'pandas-filtering':return <Figure title="Un masque booléen filtre les observations" caption="Le seuil modifie immédiatement les lignes retenues. Le symbole > exclut la valeur égale au seuil.">
   <div className="concept-deep-visual__filter"><label>Arrêts supérieurs à {threshold} min <input type="range" min="10" max="35" value={threshold} step="5" onChange={e=>setThreshold(Number(e.target.value))}/></label><Table head={['Machine','Arrêt (min)','Retenu ?']} rows={[[ 'M1',10],[ 'M2',25],[ 'M3',40]].map(([m,v])=>[String(m),v,Number(v)>threshold?'✓ Oui':'— Non'])}/></div>
 </Figure>;
 case 'pandas-groupby':return <Figure title="GroupBy : les lignes deviennent des totaux par groupe" caption="Deux événements de M1 deviennent une seule ligne totalisant 35 minutes.">
   <div className="concept-deep-visual__equation"><Table head={['Machine','Minutes']} rows={[[ 'M1',10],['M2',15],['M1',25]]}/><b>→</b><Table head={['Machine','Total']} rows={[[ 'M1',35],['M2',15]]}/></div>
 </Figure>;
 case 'pandas-merge-dates':return <Figure title="Merge associe des événements à un référentiel" caption="Une relation many-to-one conserve deux événements de M1 tout en leur ajoutant le même site.">
   <div className="concept-deep-visual__equation"><Table head={['Événement','Machine']} rows={[[1,'M1'],[2,'M1']]}/><b>+</b><Table head={['Machine','Site']} rows={[[ 'M1','Nantes']]}/><b>→</b><Table head={['Événement','Site']} rows={[[1,'Nantes'],[2,'Nantes']]}/></div>
 </Figure>;
 case 'opencv-introduction':return <Figure title="OpenCV dans une chaîne de traitement d'images" caption="La même bibliothèque peut préparer et transformer les images avant une mesure classique ou un modèle appris.">
   <Arrows items={[[ 'Acquisition','imread / VideoCapture'],['Prétraitement','cvtColor / filtres'],['Analyse','Canny / seuillage'],['Mesure','Comptage / régions']]}/>
 </Figure>;
 case 'opencv-installation':return <Figure title="Le package installé est importé comme cv2" caption="Installer dans le mauvais environnement est la cause fréquente de ModuleNotFoundError.">
   <Arrows items={[[ 'python -m pip','Installe opencv-python'],['import cv2','Charge le module'],['cv2.__version__','Contrôle la version']]}/>
 </Figure>;
 case 'opencv-loading':return <Figure title="Une image devient une matrice de pixels" caption="Une photographie de 640 × 480 en couleur BGR donne souvent un ndarray shape=(480,640,3).">
   <Arrows items={[[ 'photo.jpg','Fichier source'],['cv2.imread','Décodage et BGR'],['NumPy ndarray','(480, 640, 3)'],['imwrite','Image transformée']]}/>
 </Figure>;
 case 'opencv-bgr-rgb':return <Figure title="Même couleur, ordre des canaux différent" caption="La valeur 255 est dans le dernier canal BGR, mais dans le premier canal RGB pour le rouge pur.">
   <div className="concept-deep-visual__side"><div className="concept-deep-visual__channels"><strong>BGR</strong><div><span>0</span><span>0</span><span>255</span></div><small>Bleu · Vert · Rouge</small></div><b>cvtColor →</b><div className="concept-deep-visual__channels"><strong>RGB</strong><div><span>255</span><span>0</span><span>0</span></div><small>Rouge · Vert · Bleu</small></div></div>
 </Figure>;
 case 'opencv-grayscale':return <Figure title="La couleur devient une intensité unique" caption="Un pixel vert pur de [B,G,R]=[0,255,0] donne une intensité d'environ 150 en niveaux de gris.">
   <div className="concept-deep-visual__side"><div className="concept-deep-visual__channels"><strong>BGR</strong><div><span>0</span><span>255</span><span>0</span></div></div><b>cvtColor →</b><div className="concept-deep-visual__channels"><strong>Gray</strong><div><span>150</span></div><small>Un canal par pixel</small></div></div>
 </Figure>;
 case 'opencv-hsv':return <Figure title="HSV : Hue, Saturation and Value" caption="Pour uint8, OpenCV code la teinte H sur 0–179 et la saturation/valeur sur 0–255.">
   <div className="concept-deep-visual__hsv"><div className="concept-deep-visual__hue"/><div className="concept-deep-visual__stats"><div><span>H</span><strong>0–179</strong><small>Teinte circulaire</small></div><div><span>S</span><strong>0–255</strong><small>Saturation</small></div><div><span>V</span><strong>0–255</strong><small>Luminosité</small></div></div></div>
 </Figure>;
 case 'opencv-formats-validation':return <Figure title="Choisir le format selon les valeurs à préserver" caption="L'extension ne suffit pas : inspecte également la profondeur, les canaux et la réussite du chargement.">
   <div className="concept-deep-visual__stats"><div><span>JPEG</span><strong>Avec perte</strong><small>Photographies</small></div><div><span>PNG</span><strong>Sans perte</strong><small>Masques et valeurs</small></div><div><span>TIFF</span><strong>Formats variés</strong><small>Images scientifiques</small></div></div>
 </Figure>;
 default:return null;
 }
}
