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

const KEY = 'monstage:cl-studio:v8';

const frParagraphs = [
  "Je suis étudiant en dernière année de MSc Control and Robotics, spécialisation Data Science, Signal & Image Processing à l’École Centrale de Nantes. Je recherche un stage de fin d’études de six mois à partir de février 2027 afin de mettre en pratique mes bases en data science, machine learning, computer vision et traitement d’image, tout en continuant à progresser au sein d’une équipe technique expérimentée.",
  "Mon parcours associe un BSc en Computer Science & Electronics à ma formation actuelle en data science, traitement du signal et de l’image. À travers mes projets académiques et personnels, j’ai travaillé avec Python, PyTorch et OpenCV sur des sujets de segmentation, calibration caméra, suivi de points et évaluation de modèles. Mon projet CLAP de classification audio zero-shot a par exemple atteint 91,15 % de Top-1 sur ESC-50 après la comparaison structurée de dix stratégies de prompts, tandis que mon projet de soustraction de fond fluoroscopique a comparé trois approches de segmentation à l’aide de Dice, IoU et PSNR.",
  "J’ai également effectué un stage de fin de BSc comme Data Analyst Intern chez Unified Mentor, avec des missions de nettoyage, analyse exploratoire et restitution de données. Plus récemment, mon travail d’évaluation Speech AI chez RWS Moravia a renforcé ma rigueur, mon attention à la qualité et ma capacité à justifier des évaluations de manière factuelle.",
  "Ce qui m’intéresse chez [ENTREPRISE] est [1–2 PHRASES RELIANT L’OFFRE À L’ENTREPRISE, À L’ÉQUIPE ET AU PROBLÈME TECHNIQUE]. Les missions autour de [RESPONSABILITÉ CLÉ 1] et [RESPONSABILITÉ CLÉ 2] correspondent particulièrement aux compétences que je développe actuellement et au type d’expérience pratique que je souhaite approfondir.",
  "Je serais heureux de contribuer avec curiosité, rigueur et envie d’apprendre aux objectifs techniques de votre équipe. Je serais ravi d’échanger avec vous sur l’adéquation entre mon parcours et les besoins de [ENTREPRISE / ÉQUIPE].",
];

const enParagraphs = [
  "I am a final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes. I am looking for a six-month end-of-studies internship from February 2027 where I can apply my technical foundations to real industrial problems.",
  "I chose to apply because this opportunity connects directly with the type of environment I want to discover. I am particularly interested in teams where data, experimentation and engineering decisions are linked to concrete operational needs.",
  "My academic projects and previous experience have trained me to analyse data, compare approaches and evaluate results carefully. I have worked on model evaluation, error analysis, data cleaning and structured reporting using Python and related tools. I can therefore bring a solid technical base, curiosity and a rigorous way of working.",
  "I would highly appreciate the opportunity to discuss my skills and motivation with you at your earliest convenience."
]

export const defaultCoverLetterFr: CoverLetterDraft = {
  language: 'FR',
  date: '10 octobre 2026',
  company: 'Airbus Atlantic',
  team: 'Département Qualité — site de Nantes',
  recipientName: '',
  recipientRole: 'Équipe Recrutement',
  recipientLocation: 'Nantes, France',
  internshipTitle: 'STAGE 2027 - Ingénieur Processus Qualité & IA (H/F)',
  greeting: 'Madame, Monsieur,',
  paragraphs: [
    "Je suis étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes. Je recherche un stage de fin d’études de six mois à partir de février 2027. Je souhaite mettre mes compétences en analyse de données et intelligence artificielle au service de problématiques industrielles concrètes.",
    "J’ai choisi de postuler chez Airbus Atlantic parce que cette mission relie directement qualité industrielle, données et intelligence artificielle. Le travail de l’équipe Qualité autour du caisson central de voilure A320 me paraît particulièrement concret. La recherche de leviers pour réduire les tâches à faible valeur ajoutée et améliorer les processus correspond exactement au type d’environnement que je veux découvrir.",
    "Mon parcours m’a appris à analyser, comparer et documenter des résultats avec rigueur. Chez RWS, j’ai évalué des sorties d’IA selon des critères précis de qualité et identifié leurs limites. Chez Unified Mentor, j’ai travaillé sur le nettoyage, l’analyse et la restitution de données. Avec MonStage, j’ai aussi automatisé des flux avec Google Apps Script. Je peux donc apporter une base Data/IA solide, une approche structurée et une vraie attention à la fiabilité des résultats.",
    "Je serais heureux d’avoir l’occasion d’échanger avec vous sur ma motivation et sur ce que je pourrais apporter à votre équipe."
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
  closing: 'Sincerely,'
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
