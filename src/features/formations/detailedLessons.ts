import type { FormationModule, FormationTrack, FormationQuiz } from './formationTypes';
import { dataLessonNotes } from './dataLessonNotes';
import { imageLessonNotes } from './imageLessonNotes';
import { visionLessonNotes } from './visionLessonNotes';
import { dataFocusCode } from './dataFocusCode';
import { imageFocusCode } from './imageFocusCode';
import { visionFocusCode } from './visionFocusCode';

export type LessonTopic = {
  id: string;
  moduleId: string;
  trackId: string;
  number: number;
  title: string;
  objective: string;
  concept: string;
  context: string;
  exercise: string;
  pitfall: string;
  code: string;
  focusCode: string;
  focusLanguage: string;
  language: FormationModule['codeLanguage'];
  interpretation: string;
  mission: string;
  validation: string;
  quiz: FormationQuiz;
  formula?: { expression: string; interpretation: string };
};

const snippetsByTrack = {
  'data-analyst':dataFocusCode,
  'traitement-images':imageFocusCode,
  'computer-vision':visionFocusCode
} as const;

const notesByTrack = {
  'data-analyst': dataLessonNotes,
  'traitement-images': imageLessonNotes,
  'computer-vision': visionLessonNotes
} as const;

const math: Record<string,{expression:string;interpretation:string}> = {
  'traitement-images/images-pixels/4': {expression:'n niveaux = 2^b, où b est le nombre de bits.',interpretation:'Un pixel uint8 peut prendre 2⁸ = 256 niveaux possibles.'},
  'traitement-images/images-pixels/3': {expression:'N pixels = hauteur × largeur.',interpretation:'Une image 640 × 480 contient 307 200 positions spatiales.'},
  'traitement-images/contraste-histogrammes/3': {expression:'I_corrigée = clip(a · I + b, 0, 255)',interpretation:'a règle le contraste ; b décale la luminosité.'},
  'traitement-images/contraste-histogrammes/5': {expression:'I_corrigée = I_normalisée ^ γ',interpretation:'Sur une plage 0–1, γ < 1 augmente les tons moyens ; γ > 1 les réduit.'},
  'traitement-images/convolution/2': {expression:'I_sortie(x,y) = Σᵢ Σⱼ K(i,j) · I(x−i,y−j)',interpretation:'Le résultat au pixel central combine les intensités des voisins pondérées par le noyau.'},
  'traitement-images/contours-gradients/2': {expression:'||∇I|| = √(Gx² + Gy²)',interpretation:'La norme du gradient mesure l’intensité des variations spatiales.'},
  'traitement-images/evaluation/2': {expression:'MSE = moyenne[(I − Référence)²] ; PSNR = 10 log₁₀(MAX² / MSE)',interpretation:'MSE est une erreur quadratique ; un PSNR plus élevé est généralement meilleur à plage identique.'},
  'traitement-images/evaluation/4': {expression:'IoU = |P ∩ G| / |P ∪ G|',interpretation:'P est le masque prédit, G la référence, et la division mesure leur recouvrement.'},
  'traitement-images/evaluation/5': {expression:'Dice = 2 |P ∩ G| / (|P| + |G|)',interpretation:'Le score est compris entre 0 et 1 lorsque la comparaison est définie.'},
  'data-analyst/statistiques-eda/1': {expression:'Moyenne = Σxᵢ / n ; variance = Σ(xᵢ−moyenne)² / n',interpretation:'La première résume le centre ; la seconde mesure la dispersion de la population.'},
  'data-analyst/kpi-decision/3': {expression:'Variation (%) = 100 × (nouveau−ancien) / ancien',interpretation:'La formule nécessite ancien ≠ 0 ; sinon il faut définir un traitement adapté.'},
  'data-analyst/industrie-maintenance/3': {expression:'Disponibilité = temps disponible / temps planifié',interpretation:'Le périmètre des arrêts inclus doit être défini par la règle métier.'},
  'computer-vision/reseaux-neurones/1': {expression:'z = w·x + b ; a = activation(z)',interpretation:'Les paramètres w et b sont ajustés au cours de l’entraînement.'},
  'computer-vision/reseaux-neurones/2': {expression:'ReLU(x) = max(0, x)',interpretation:'Les valeurs négatives deviennent zéro et les valeurs positives sont conservées.'},
  'computer-vision/evaluation-robustesse/2': {expression:'Précision = TP / (TP+FP) ; Rappel = TP / (TP+FN)',interpretation:'Précision mesure la fiabilité des détections positives, rappel les positifs retrouvés.'},
  'computer-vision/detection-objets/3': {expression:'IoU_box = aire(intersection) / aire(union)',interpretation:'Ce ratio compare les boîtes prédites aux boîtes de référence.'}
};

export function allTopics(track:FormationTrack,module:FormationModule): LessonTopic[] {
  const notes = notesByTrack[track.id as keyof typeof notesByTrack]?.[module.id];
  const snippets=snippetsByTrack[track.id as keyof typeof snippetsByTrack]?.[module.id];
  if (!notes || notes.length !== module.points.length || !snippets || snippets.length !== module.points.length) {
    throw new Error('Contenu détaillé incomplet : ' + track.id + '/' + module.id);
  }
  return module.points.map((title,index) => {
    const [concept,exercise,pitfall] = notes[index];
    const n = notes.length;
    const answers = [pitfall,notes[(index+1)%n][2],notes[(index+2)%n][2]];
    const rotate = index%3;
    const options = [answers[(rotate+2)%3],answers[rotate],answers[(rotate+1)%3]] as [string,string,string];
    const correct=options.indexOf(pitfall);
    return {
      id:'lecon-'+String(index+1),
      moduleId:module.id,
      trackId:track.id,
      number:index+1,
      title,
      objective:'Comprendre et appliquer : '+title.toLocaleLowerCase('fr'),
      concept,
      context:module.example,
      exercise,
      pitfall,
      code:module.code,
      focusCode:snippets[index],
      focusLanguage:track.id==='data-analyst' && module.id==='powerbi' && index<2 ? 'm' : (module.codeLanguage||'python'),
      language:module.codeLanguage,
      interpretation:module.result,
      mission:module.mission,
      validation:module.validation,
      formula:math[track.id+'/'+module.id+'/'+(index+1)],
      quiz:{
        question:'Quel piège concerne directement cette notion ?',
        options,
        correct,
        explanation:pitfall
      }
    };
  });
}

export function topicById(track:FormationTrack,module:FormationModule,id:string) {
  return allTopics(track,module).find(topic=>topic.id===id);
}

export function topicProgressKey(topic:LessonTopic) {
  return [topic.trackId,topic.moduleId,topic.id].join(':');
}

function detectPackages(code:string) {
  const packages:[RegExp,string][] = [
    [/\b(?:import|from)\s+numpy\b/,'numpy'],
    [/\b(?:import|from)\s+pandas\b/,'pandas'],
    [/\b(?:import|from)\s+matplotlib\b/,'matplotlib'],
    [/\b(?:import|from)\s+cv2\b/,'opencv-python-headless'],
    [/\b(?:import|from)\s+sklearn\b/,'scikit-learn'],
    [/\b(?:import|from)\s+torch\b/,'torch'],
    [/\b(?:import|from)\s+plotly\b/,'plotly']
  ];
  return packages.filter(([test])=>test.test(code)).map(([,name])=>name);
}

export function lessonNotebook(track:FormationTrack,module:FormationModule,topic:LessonTopic,editedCode?:string,editedFocusCode?:string) {
  const markdown=(source:string)=>({cell_type:'markdown',metadata:{},source});
  const code=(source:string)=>({cell_type:'code',metadata:{},source,outputs:[],execution_count:null});
  const example=editedCode??topic.code;
  const focused=editedFocusCode??topic.focusCode;
  const packages=detectPackages(example+'\n'+focused);
  const cells = [
    markdown('# '+track.title+'\n\n## Module : '+module.title+'\n### Leçon '+topic.number+' — '+topic.title+'\n\n**Objectif.** '+topic.objective),
    markdown('## Théorie expliquée\n\n'+topic.concept+'\n\n**Contexte professionnel.** '+topic.context),
    ...(topic.formula?[markdown('## Formule essentielle\n\n`'+topic.formula.expression+'`\n\n'+topic.formula.interpretation)]:[]),
    markdown('## Démonstration accompagnée\nLe script est fourni avec les autres notions du même module. Repère la partie qui illustre cette leçon et explique-la avant de l’exécuter.'),
    ...(topic.language==='python'
       ? [...(packages.length ? [code('%pip install '+packages.join(' '))] : []),code(example)]
       : [markdown('Exécuter dans l’outil '+(topic.language||'correspondant')+' :\n\n```'+(topic.language||'')+'\n'+example+'\n```')]),
    markdown('## Comment interpréter les résultats\n'+topic.interpretation),
    markdown('## Expérimentation de cette leçon\n'+topic.exercise+'\n\nExécuter ce bloc **après** le script de référence du module.'),
    ...(topic.focusLanguage==='python' ? [code(focused)] : [markdown('Code à exécuter dans l’outil '+topic.focusLanguage+' :\n\n```'+topic.focusLanguage+'\n'+focused+'\n```')]),
    markdown('## À toi de modifier\n'+topic.exercise),
    ...(topic.language==='python'?[code('# Ton expérimentation sur : '+topic.title+'\n')]:[]),
    markdown('## Erreur fréquente\n'+topic.pitfall),
    markdown('## Exercice d’application\n'+topic.mission+'\n\n**Critère de validation :** '+topic.validation),
    ...(topic.language==='python'?[code('# Ta solution commentée\n')]:[]),
    markdown('## Compréhension\n**'+topic.quiz.question+'**\n\n'+topic.quiz.options.map((v,i)=>(i+1)+'. '+v).join('\n')+'\n\n**Correction :** '+topic.quiz.explanation),
    markdown('## Bilan personnel\nCe que je sais expliquer :\n\nCe que je sais faire sans aide :\n\nCe que je dois revoir :')
  ];
  return JSON.stringify({nbformat:4,nbformat_minor:5,metadata:{kernelspec:{name:'python3',display_name:'Python 3',language:'python'},language_info:{name:'python'}},cells},null,2);
}
