export type CoverLetterLanguage = 'FR' | 'EN';

export interface CoverLetterDraft {
  language: CoverLetterLanguage;
  date: string;
  company: string;
  team: string;
  recipientName: string;
  recipientRole: string;
  recipientLocation: string;
  internshipTitle: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signer: string;
  signatureDataUrl: string;
}

const KEY = 'monstage:cl-studio:v1';

const frParagraphs = [
  "Je suis étudiant en dernière année de MSc Control and Robotics, spécialisation Data Science, Signal & Image Processing à l’École Centrale de Nantes. Je recherche un stage de fin d’études de six mois à partir de février 2027 afin de mettre en pratique mes bases en data science, machine learning, computer vision et traitement d’image, tout en continuant à progresser au sein d’une équipe technique expérimentée.",
  "Mon parcours associe un BSc en Computer Science & Electronics à ma formation actuelle en data science, traitement du signal et de l’image. À travers mes projets académiques et personnels, j’ai travaillé avec Python, PyTorch et OpenCV sur des sujets de segmentation, calibration caméra, suivi de points et évaluation de modèles. Mon projet CLAP de classification audio zero-shot a par exemple atteint 91,15 % de Top-1 sur ESC-50 après la comparaison structurée de dix stratégies de prompts, tandis que mon projet de soustraction de fond fluoroscopique a comparé trois approches de segmentation à l’aide de Dice, IoU et PSNR.",
  "J’ai également effectué un stage de fin de BSc comme Data Analyst Intern chez Unified Mentor, avec des missions de nettoyage, analyse exploratoire et restitution de données. Plus récemment, mon travail d’évaluation Speech AI chez RWS Moravia a renforcé ma rigueur, mon attention à la qualité et ma capacité à justifier des évaluations de manière factuelle.",
  "Ce qui m’intéresse chez [ENTREPRISE] est [1–2 PHRASES RELIANT L’OFFRE À L’ENTREPRISE, À L’ÉQUIPE ET AU PROBLÈME TECHNIQUE]. Les missions autour de [RESPONSABILITÉ CLÉ 1] et [RESPONSABILITÉ CLÉ 2] correspondent particulièrement aux compétences que je développe actuellement et au type d’expérience pratique que je souhaite approfondir.",
  "Je serais heureux de contribuer avec curiosité, rigueur et envie d’apprendre aux objectifs techniques de votre équipe. Je serais ravi d’échanger avec vous sur l’adéquation entre mon parcours et les besoins de [ENTREPRISE / ÉQUIPE].",
];

const enParagraphs = [
  "What draws me to this internship is the chance to work on real technical problems where data quality, experimentation and model evaluation all matter. I am particularly interested in environments where the goal is not only to build a model, but also to understand its limits, compare approaches and make the results useful in practice.",
  "My MSc work in Data Science, Signal & Image Processing has given me a solid foundation in machine learning, computer vision and evaluation. Through academic and personal projects, I have worked on segmentation, camera calibration, feature tracking and model comparison using Python, PyTorch and OpenCV. I have also gained practical experience through data analysis work at Unified Mentor and structured AI evaluation at RWS.",
  "I am looking for a six-month final-year internship from February 2027 where I can bring that combination of technical foundations, curiosity and careful evaluation to an experienced team. I would especially like to contribute to projects involving applied machine learning, anomaly detection, computer vision or image processing, while learning how these methods are used and improved in an industrial setting.",
  "I would be glad to discuss the internship, your team’s current challenges and how my background could be useful to the role.",
];

export const defaultCoverLetterFr: CoverLetterDraft = {
  language: 'FR',
  date: '',
  company: 'Assystem',
  team: '',
  recipientName: 'M. Karl Vallière',
  recipientRole: "Responsable d’équipe",
  recipientLocation: 'Nantes / Carquefou, France',
  internshipTitle: 'Ingénieur Data Science - février 2027',
  greeting: 'Monsieur Vallière,',
  paragraphs: [
    "Votre équipe m’intéresse parce que le travail ne s’arrête pas au modèle. Il commence par les données, passe par l’expérimentation et le benchmark, puis demande de comprendre les limites des résultats. C’est exactement ce que je veux découvrir dans un contexte industriel réel, avec des cas d’usage concrets et une équipe expérimentée.",
    "Mes projets m’ont appris à comparer des méthodes, à mesurer leurs performances et à regarder ce qui fonctionne moins bien. J’ai notamment travaillé sur plusieurs stratégies de segmentation en imagerie fluoroscopique. Chez RWS, j’ai évalué des sorties d’IA selon des critères précis et identifié leurs faiblesses. Chez Unified Mentor, j’ai travaillé sur le nettoyage, l’analyse, la visualisation et la restitution de données.",
    "Je souhaite rejoindre Assystem pour un stage de six mois en Data Science à partir de février 2027 afin d’appliquer ces bases à des problèmes industriels plus concrets, notamment autour de la détection et de la prédiction d’anomalies. Je peux apporter ma rigueur, ma curiosité et cette habitude de comparer les résultats avant de tirer des conclusions. De mon côté, je veux apprendre à travailler sur des problèmes plus complexes et progresser au contact de votre équipe.",
    "Je serais heureux d’échanger avec vous sur cette mission et de vous expliquer plus simplement ce que je pourrais apporter à l’équipe.",
  ],
  closing: 'Cordialement,',
  signer: 'Denos Kume',
  signatureDataUrl: '',
};

export const defaultCoverLetterEn: CoverLetterDraft = {
  language: 'EN',
  date: '',
  company: '',
  team: '',
  recipientName: '',
  recipientRole: '',
  recipientLocation: '',
  internshipTitle: '',
  greeting: 'Dear Hiring Manager,',
  paragraphs: enParagraphs,
  closing: 'Sincerely,',
  signer: 'Denos Kume',
  signatureDataUrl: '',
};

export function freshCoverLetter(language: CoverLetterLanguage): CoverLetterDraft {
  return structuredClone(language === 'FR' ? defaultCoverLetterFr : defaultCoverLetterEn);
}

export function loadCoverLetter(): CoverLetterDraft {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshCoverLetter('FR');

    const stored = JSON.parse(raw) as Partial<CoverLetterDraft>;
    const base = stored.language === 'EN' ? defaultCoverLetterEn : defaultCoverLetterFr;
    return { ...base, ...stored };
  } catch {
    return freshCoverLetter('FR');
  }
}

export function saveCoverLetter(draft: CoverLetterDraft): void {
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function resetCoverLetter(language: CoverLetterLanguage): CoverLetterDraft {
  const next = freshCoverLetter(language);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
