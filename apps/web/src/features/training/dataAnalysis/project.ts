import { actions1to20 } from './actions1to20';
import { actions21to40 } from './actions21to40';
import type { ProjectMission } from './types';
export const actions = [...actions1to20, ...actions21to40];
const ids = (start: number) => Array.from({length:10},(_,i)=>`a${String(start+i).padStart(2,'0')}`);
export const missions: ProjectMission[] = [
 {id:'receive',title:'Fiabiliser le dossier reçu',brief:'Le responsable t’envoie des fichiers et une demande encore imprécise. Tu clarifies ce qu’il attend, examines les anomalies et proposes des règles qu’il peut valider.',deliverable:'Dossier de données contrôlé, registre d’anomalies et règles de traitement approuvées.',actionIds:ids(1)},
 {id:'report',title:'Livrer le premier bilan mensuel',brief:'Le responsable veut un bilan qu’il peut défendre en réunion. Tu relies les tables, calcules les bons indicateurs et rapproches Excel, SQL et Python.',deliverable:'Bilan mensuel daté, calculs reproductibles et écarts de réconciliation expliqués.',actionIds:ids(11)},
 {id:'diagnose',title:'Expliquer les écarts et proposer une action',brief:'Les coûts, délais et volumes ne racontent pas tous la même histoire. Tu testes les explications possibles et distingues ce que les données montrent de ce qui reste une hypothèse.',deliverable:'Diagnostic étayé, limites explicites et recommandation proportionnée aux preuves.',actionIds:ids(21)},
 {id:'deliver',title:'Transmettre un suivi actualisable',brief:'Le responsable veut suivre l’activité sans dépendre de toi pour chaque mise à jour. Tu livres le tableau de pilotage, les contrôles et une passation testée.',deliverable:'Rapport Power BI local, pipeline de préparation, dossier de preuves et guide de reprise.',actionIds:ids(31)},
];
