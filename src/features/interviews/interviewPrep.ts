import type { InternshipOffer } from '../../api/contract';

export const INSPemon_OFFER_ID = 'OFFRE-INSPEMON-ROS-2027';

export type PrepOffer = Pick<InternshipOffer, 'id' | 'company' | 'title' | 'city' | 'skills' | 'applicationUrl' | 'nextAction'>;

export const inspemonInterviewOffer: PrepOffer = {
  id: INSPemon_OFFER_ID,
  company: 'Inspemon',
  title: 'Stage — Robotics & Computer Vision Engineer (ROS)',
  city: 'Nantes',
  skills: ['Python', 'C++', 'ROS/ROS2', 'OpenCV', 'LiDAR', 'point clouds'],
  applicationUrl: 'https://www.inspemon.com/jobs/robotics-computer-vision-engineer-ros/',
  nextAction: 'Entretien vendredi 13 novembre 2026 — heure à confirmer',
};

export interface PracticeQuestion {
  id: string;
  prompt: string;
  example: string;
  advice: string;
  target: string;
}
export interface PracticeSession {
  id: string;
  title: string;
  aim: string;
  minutes: number;
  questions: PracticeQuestion[];
}

const inspemonQuestions: PracticeQuestion[] = [
  {
    id: 'pitch',
    prompt: 'Pouvez-vous vous présenter brièvement ?',
    example: 'Je termine mon MSc Control and Robotics à Centrale Nantes, avec une spécialisation en data science, traitement du signal et de l’image. Avant cela, j’ai étudié l’informatique et l’électronique, et j’ai travaillé sur des projets Python en traitement d’images et évaluation de modèles. Je cherche un stage de six mois dès février 2027 pour apprendre à appliquer ces compétences sur des systèmes de vision réels.',
    advice: '60 à 90 secondes. Parcours passé → compétences actuelles → ce que tu viens apprendre. Évite de réciter ton CV.',
    target: '60–90 s',
  },
  {
    id: 'motivation',
    prompt: 'Pourquoi Inspemon et ce stage en robotique / Computer Vision ?',
    example: 'Ce qui m’attire, c’est de passer du traitement d’images sur des jeux de données à un système de perception utilisé en robotique. Le poste relie OpenCV, ROS et les données LiDAR : je connais surtout Python et la vision par ordinateur, et je souhaite approfondir le reste en travaillant avec l’équipe.',
    advice: 'Parle des missions de l’offre, pas de compliments génériques sur l’entreprise. Ne présente pas ROS comme une expérience déjà acquise.',
    target: '30–45 s',
  },
  {
    id: 'vision-project',
    prompt: 'Présentez un projet de traitement d’images que vous pourriez défendre techniquement.',
    example: 'En M1, j’ai travaillé sur la soustraction de fond et la segmentation d’instruments en imagerie fluoroscopique. J’ai comparé des approches de seuillage et mesuré leurs résultats avec Dice et IoU ; le meilleur essai a atteint Dice = 0,475 et IoU = 0,332. Cette expérience m’a appris qu’une segmentation visuellement plausible doit aussi être évaluée objectivement.',
    advice: 'STAR court : objectif → ce que tu as fait → résultats réels → limite. Ces scores montrent justement la difficulté du problème, pas une solution parfaite.',
    target: '45–60 s',
  },
  {
    id: 'debugging',
    prompt: 'Si votre détection ou segmentation fonctionne mal sur de nouvelles images, que faites-vous ?',
    example: 'Je commence par visualiser les images en échec et comparer leurs caractéristiques aux exemples qui fonctionnent. Je vérifie ensuite les étapes de prétraitement, les seuils et les données d’entrée, puis je ne change qu’un élément à la fois. Enfin, je compare les résultats avec des mesures adaptées au problème.',
    advice: 'Montrer la méthode de diagnostic avant de proposer un algorithme compliqué.',
    target: '30–45 s',
  },
  {
    id: 'ros-level',
    prompt: 'Quel est votre niveau réel en ROS/ROS2 et en C++ ?',
    example: 'Mon expérience pratique est surtout en Python, OpenCV et traitement de données. Je n’ai pas encore développé un système complet sous ROS2 ; je préfère le dire clairement. Pour être utile rapidement, je commencerais par exécuter le projet existant, comprendre ses nœuds et messages, puis réaliser une petite tâche vérifiable avec l’équipe.',
    advice: 'Cette réponse suppose que tu n’as pas de projet ROS2 complet. Ajuste-la seulement avec des réalisations que tu peux démontrer.',
    target: '30–45 s',
  },
  {
    id: 'lidar',
    prompt: 'Comment distinguez-vous les informations d’une caméra et d’un LiDAR ?',
    example: 'Une caméra apporte l’apparence et les détails visuels, tandis que le LiDAR mesure des distances pour construire une représentation spatiale. Les associer peut être utile en robotique, mais cela suppose de vérifier les repères, la synchronisation et la calibration. C’est un sujet que je souhaite approfondir pendant le stage.',
    advice: 'Rester au niveau que tu maîtrises ; ne pas inventer une expérience personnelle de fusion multi-capteurs.',
    target: '30–45 s',
  },
  {
    id: 'teamwork',
    prompt: 'Comment travaillez-vous avec une équipe lorsque vous ne comprenez pas un résultat ?',
    example: 'J’essaie d’abord de reproduire le problème et de noter ce qui était attendu, ce que j’observe et ce que j’ai déjà testé. Je demande ensuite un retour ciblé plutôt qu’une solution complète. Dans mes travaux de données et d’évaluation IA, cette façon de documenter les écarts m’aide à progresser.',
    advice: 'Si le recruteur demande un exemple précis, utilise uniquement une situation réellement vécue en projet, chez Unified Mentor ou chez RWS.',
    target: '30–45 s',
  },
  {
    id: 'first-weeks',
    prompt: 'Comment aborderiez-vous vos premières semaines dans notre équipe ?',
    example: 'Je chercherais d’abord à comprendre le besoin, l’environnement logiciel et les résultats attendus. Ensuite, je reproduirais un petit pipeline existant, vérifierais les données et proposerais une amélioration limitée et testable. Mon objectif serait de gagner progressivement en autonomie sans casser ce qui fonctionne déjà.',
    advice: 'Montrer de l’initiative, de la prudence technique et une progression réaliste.',
    target: '30–45 s',
  },
];

function genericQuestions(offer: PrepOffer): PracticeQuestion[] {
  const role = offer.title || 'ce stage';
  const company = offer.company || 'cette équipe';
  const skills = offer.skills.slice(0, 3).join(', ') || 'les outils de l’offre';
  return [
    { id: 'pitch', prompt: 'Pouvez-vous vous présenter en une minute ?', example: 'Je termine mon MSc Control and Robotics à Centrale Nantes, après un BSc en informatique et électronique. Mes projets m’ont appris à travailler avec Python, des données et des méthodes de validation. Je recherche un stage de six mois dès février 2027 pour contribuer à un besoin concret et continuer à apprendre.', advice: 'Passé, présent, avenir ; pas une lecture intégrale du CV.', target: '60–90 s' },
    { id: 'motivation', prompt: 'Pourquoi ce stage chez ' + company + ' ?', example: 'Le poste « ' + role + ' » m’intéresse parce qu’il permet de travailler sur une problématique appliquée. Je voudrais comprendre les objectifs de l’équipe et mettre mes bases techniques au service de ses travaux, tout en progressant auprès de personnes expérimentées.', advice: 'Personnalise avec deux missions vérifiées dans l’annonce.', target: '30–45 s' },
    { id: 'vision-project', prompt: 'Quel projet personnel ou académique illustre le mieux votre profil ?', example: 'Sur un projet académique de segmentation d’images, j’ai comparé plusieurs méthodes et évalué leurs limites avec des métriques. Ce travail m’a appris à expliquer mes choix et à valider les résultats au lieu de me contenter d’une sortie visuelle.', advice: 'Choisis un projet présent sur ton CV pour cette candidature.', target: '45–60 s' },
    { id: 'debugging', prompt: 'Comment diagnostiquez-vous un résultat inattendu ?', example: 'Je reproduis le problème, vérifie les données et les hypothèses, puis teste une modification à la fois. Je documente ce qui a changé et j’utilise les bonnes mesures pour comparer.', advice: 'Illustrer par une erreur que tu as réellement corrigée.', target: '30–45 s' },
    { id: 'ros-level', prompt: 'Comment évaluez-vous votre niveau sur ' + skills + ' ?', example: 'Je distingue les outils que j’utilise déjà en pratique de ceux que je dois encore approfondir. J’explique ce que j’ai réellement réalisé et comment je pourrais apprendre l’environnement de l’équipe à partir d’une première tâche cadrée.', advice: 'N’affirme pas la maîtrise d’une technologie simplement parce qu’elle est citée dans l’offre.', target: '30–45 s' },
    { id: 'lidar', prompt: 'Quelle difficulté technique pensez-vous rencontrer dans ce poste ?', example: 'La première difficulté serait de comprendre les données, les contraintes de qualité et les outils de l’équipe. Je commencerais par reproduire l’existant et demander une validation sur une petite contribution avant d’aller plus loin.', advice: 'À adapter au contexte réellement mentionné dans l’offre.', target: '30–45 s' },
    { id: 'teamwork', prompt: 'Comment demandez-vous de l’aide ou travaillez-vous en équipe ?', example: 'Je commence par isoler le problème et noter les essais déjà faits. Ensuite, je pose une question précise et j’intègre le retour reçu dans mes prochaines vérifications.', advice: 'Prépare un seul exemple réel.', target: '30–45 s' },
    { id: 'first-weeks', prompt: 'Que feriez-vous pendant les deux premières semaines ?', example: 'Je prendrais connaissance des objectifs et de l’environnement, puis je chercherais une première tâche concrète et testable. Je partagerais régulièrement mes résultats pour gagner en autonomie.', advice: 'Montrer une méthode réaliste, pas une promesse d’expertise immédiate.', target: '30–45 s' },
  ];
}

export function questionsForOffer(offer: PrepOffer): PracticeQuestion[] {
  return offer.id === INSPemon_OFFER_ID ? inspemonQuestions : genericQuestions(offer);
}
export function sessionsForOffer(offer: PrepOffer): PracticeSession[] {
  const q = questionsForOffer(offer);
  return [
    { id: 'pitch', title: 'Présentation et motivation', aim: 'Présenter ton profil simplement et montrer que tu comprends le poste.', minutes: 15, questions: q.slice(0, 2) },
    { id: 'projects', title: 'Projets et méthode', aim: 'Défendre un projet réel et expliquer ta démarche de diagnostic.', minutes: 20, questions: q.slice(2, 4) },
    { id: 'technical', title: 'Technique et travail en équipe', aim: 'Répondre avec précision sans exagérer ton niveau.', minutes: 25, questions: q.slice(4, 8) },
  ];
}

export interface InterviewPrepState {
  date: string;
  time: string;
  format: string;
  contact: string;
  answers: Record<string, string>;
  practiced: Record<string, boolean>;
  sessionNotes: Record<string, string>;
  mockNotes: string;
  mockComplete: boolean;
}
export function defaultInterviewPrep(offerId: string): InterviewPrepState {
  return {
    date: offerId === INSPemon_OFFER_ID ? '2026-11-13' : '',
    time: '',
    format: '',
    contact: '',
    answers: {},
    practiced: {},
    sessionNotes: {},
    mockNotes: '',
    mockComplete: false,
  };
}
const keyFor = (offerId: string) => 'monstage:interview-preparation:v1:' + encodeURIComponent(offerId);
export function loadInterviewPrep(offerId: string): InterviewPrepState {
  const defaults = defaultInterviewPrep(offerId);
  try {
    const value = JSON.parse(localStorage.getItem(keyFor(offerId)) || 'null') as Partial<InterviewPrepState> | null;
    if (!value || typeof value !== 'object') return defaults;
    return {
      ...defaults, ...value,
      answers: value.answers && typeof value.answers === 'object' ? value.answers : {},
      practiced: value.practiced && typeof value.practiced === 'object' ? value.practiced : {},
      sessionNotes: value.sessionNotes && typeof value.sessionNotes === 'object' ? value.sessionNotes : {},
    };
  } catch {
    return defaults;
  }
}
export function saveInterviewPrep(offerId: string, value: InterviewPrepState): void {
  if (!offerId) return;
  try { localStorage.setItem(keyFor(offerId), JSON.stringify(value)); }
  catch { /* Local storage may be unavailable; the editor stays usable. */ }
}
export function practicedCount(state: InterviewPrepState, questions: readonly PracticeQuestion[]): number {
  return questions.filter(question => state.practiced[question.id]).length;
}
export function interviewPrepComplete(state: InterviewPrepState, questions: readonly PracticeQuestion[]): boolean {
  return practicedCount(state, questions) === questions.length && state.mockComplete;
}
