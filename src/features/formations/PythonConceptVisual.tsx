import type {ReactNode} from 'react';

export type PythonDiagramKind =
  'python-flow'|'jupyter'|'variables'|'types'|'operators'|'lists'|'tuples'|
  'dictionaries'|'conditions'|'loops'|'builtins'|'functions'|'csv'|'json'|'exceptions';

function Diagram({title,caption,children}:{title:string;caption:string;children:ReactNode}){
 return <figure className="python-concept-figure">
  <div className="python-concept-figure__heading"><span>VISUAL EXPLANATION</span><strong>{title}</strong></div>
  <div className="python-concept-figure__body">{children}</div>
  <figcaption>{caption}</figcaption>
 </figure>;
}
function Flow({steps}:{steps:[string,string][]}){
 return <div className="python-concept-flow">{steps.map(([heading,text],i)=><div key={i} className="python-concept-flow__part"><span>{String(i+1).padStart(2,'0')}</span><strong>{heading}</strong><small>{text}</small></div>)}</div>;
}
export function PythonConceptVisual({kind}:{kind:PythonDiagramKind}){
 switch(kind){
 case 'python-flow':return <Diagram title="De la question au résultat" caption="Le programme exécute des instructions explicites ; le résultat doit ensuite être interprété dans son contexte.">
   <Flow steps={ [['Question','Quelle machine a le plus de pannes ?'],['Données','Liste de mesures contrôlées'],['Code','Calcul reproductible'],['Résultat','Total par machine'],['Décision','Vérification avec le tuteur']] }/>
 </Diagram>;
 case 'jupyter':return <Diagram title="Un notebook explique et exécute" caption="Les cellules Markdown sont du texte ; les cellules Python sont exécutées par le noyau.">
  <div className="python-concept-jupyter"><div><span>Markdown</span><strong>## Question métier</strong><small>Que montrent les mesures ?</small></div><div><span>Python</span><code>sum([10, 20, 30])</code><strong className="python-concept-jupyter__out">60</strong></div></div>
 </Diagram>;
 case 'variables':return <Diagram title="Un nom pointe vers un objet" caption="Affecter une nouvelle valeur change l'objet associé au nom ; les objets modifiables peuvent être partagés.">
   <div className="python-concept-pairs"><div><code>temperature</code><b>→</b><strong>72.5</strong></div><div><code>machine</code><b>→</b><strong>"M1"</strong></div><div><code>mesures</code><b>→</b><strong>[10,20,30]</strong></div></div>
 </Diagram>;
 case 'types':return <Diagram title="Les types déterminent les opérations" caption="Le texte '25' et le nombre 25 peuvent sembler similaires mais n'ont pas le même comportement.">
   <div className="python-concept-types">{[['int','25','Entier'],['float','25.5','Décimal'],['str','"25"','Texte'],['bool','True','Logique'],['NoneType','None','Absent']].map(([type,value,meaning])=><div key={type}><code>{type}</code><strong>{value}</strong><small>{meaning}</small></div>)}</div>
 </Diagram>;
 case 'operators':return <Diagram title="Calcul, comparaison, décision" caption="La valeur de comparaison est un booléen. Elle peut être combinée à d'autres conditions.">
   <Flow steps={ [['Opération','25 + 5 = 30'],['Comparaison','30 > 28'],['Booléen','True'],['Condition','Déclencher une alerte']] }/>
 </Diagram>;
 case 'lists':return <Diagram title="Chaque élément possède un indice" caption="L'indice commence à zéro ; le dernier élément est accessible avec -1.">
   <div className="python-concept-indexed">{[10,20,30,40].map((v,i)=><div key={i}><span>{i}</span><strong>{v}</strong><small>{i-4}</small></div>)}</div>
 </Diagram>;
 case 'tuples':return <Diagram title="Tuple : positions fixes" caption="Les positions du tuple ne peuvent pas être réaffectées directement, contrairement aux éléments d'une liste.">
   <div className="python-concept-pairs"><div><code>pixel</code><b>→</b><strong>(100, 200)</strong></div><div><code>ligne</code><b>→</b><strong>100</strong></div><div><code>colonne</code><b>→</b><strong>200</strong></div></div>
 </Diagram>;
 case 'dictionaries':return <Diagram title="Des champs nommés plutôt que des indices" caption="Chaque clé désigne un champ. Les clés doivent être uniques au sein d'un même dictionnaire.">
   <div className="python-concept-dict"><span>KEY</span><span>VALUE</span><code>"machine"</code><strong>"M1"</strong><code>"arret_min"</code><strong>25</strong><code>"site"</code><strong>"Nantes"</strong></div>
 </Diagram>;
 case 'conditions':return <Diagram title="Une condition détermine le chemin" caption="Un même programme prend un chemin différent selon que l'expression est True ou False.">
   <div className="python-concept-decision"><strong>Température {'>'} 80 ?</strong><div><span>True → Alerte</span><span>False → Seuil non dépassé</span></div></div>
 </Diagram>;
 case 'loops':return <Diagram title="La même instruction traite plusieurs valeurs" caption="Une boucle for parcourt toutes les valeurs de la collection dans l'ordre.">
   <div className="python-concept-indexed">{[70,82,90].map((v,i)=><div key={i}><span>Itération {i+1}</span><strong>{v}</strong><small>{v>80?'Alerte':'RAS'}</small></div>)}</div>
 </Diagram>;
 case 'builtins':return <Diagram title="Les built-ins transforment les observations" caption="Chaque fonction répond à une question différente : combien, quel total, quelle valeur maximale ?">
   <div className="python-concept-functions"><div><strong>mesures = [10, 20, 30]</strong></div><div><code>len(mesures)</code><b>3</b></div><div><code>sum(mesures)</code><b>60</b></div><div><code>max(mesures)</code><b>30</b></div></div>
 </Diagram>;
 case 'functions':return <Diagram title="Arguments → Fonction → Valeur retournée" caption="Une fonction définie avec def reçoit des arguments et renvoie une sortie réutilisable avec return.">
   <Flow steps={ [['Arguments','8 défauts, 200 pièces'],['Fonction','taux_defaut()'],['Calcul','100 × 8 / 200'],['return','4.0 %']] }/>
 </Diagram>;
 case 'csv':return <Diagram title="Une ligne = un événement" caption="L'en-tête définit les colonnes. Les champs sont lus comme du texte avec csv.DictReader.">
   <div className="python-concept-dict"><span>machine</span><span>minutes</span><strong>M1</strong><strong>10</strong><strong>M2</strong><strong>15</strong><strong>M1</strong><strong>25</strong></div>
 </Diagram>;
 case 'json':return <Diagram title="JSON : des objets et des tableaux imbriqués" caption="L'objet contient des clés ; sa clé machines contient un tableau d'objets d'équipements.">
   <div className="python-concept-json"><strong>{'{ "site": "Nantes",'}</strong><div><code>"machines"</code>: [</div><div className="python-concept-json__nested">{'{ "id": "M1", "arret": 10 }'},</div><div className="python-concept-json__nested">{'{ "id": "M2", "arret": 15 }'}</div><div>]</div><strong>{'}'}</strong></div>
 </Diagram>;
 case 'exceptions':return <Diagram title="Erreur prévue : récupérer, signaler, continuer" caption="Le code valide une entrée et trace les observations problématiques au lieu de les convertir arbitrairement en zéro.">
  <Flow steps={ [['Lire','"inconnu"'],['Essayer','float(texte)'],['ValueError','Conversion impossible'],['except','Signaler la ligne'],['Continuer','Autres observations']] }/>
 </Diagram>;
 }
}
