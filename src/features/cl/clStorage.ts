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
  "I am a final-year MSc student in Control and Robotics, specializing in Data Science, Signal & Image Processing at École Centrale de Nantes. I am seeking a six-month final-year internship from February 2027 where I can apply my academic foundations in data science, machine learning, computer vision and image processing while continuing to learn from an experienced technical team.",
  "My background combines a BSc in Computer Science and Electronics with current graduate work in data science, signal and image processing. Through academic laboratories and personal projects, I have worked with Python, PyTorch and OpenCV on tasks including segmentation, camera calibration, feature tracking and model evaluation. For example, my CLAP zero-shot audio classification project reached 91.15% Top-1 accuracy on ESC-50 after systematically evaluating ten prompt strategies, while my fluoroscopic background-subtraction project compared three segmentation approaches using Dice, IoU and PSNR.",
  "I also completed a final-year BSc internship as a Data Analyst Intern at Unified Mentor, where I cleaned and analyzed structured data, performed exploratory analysis and communicated findings through visualizations and reports. More recently, I worked on French speech-AI evaluation at RWS Moravia, which strengthened my attention to quality, consistency and evidence-based assessment.",
  "What interests me in [COMPANY] is [1–2 SENTENCES LINKING THE OFFER TO THE COMPANY / TEAM / TECHNICAL PROBLEM]. The responsibilities around [KEY RESPONSIBILITY 1] and [KEY RESPONSIBILITY 2] are particularly aligned with the skills I am currently developing and the type of practical experience I want to deepen.",
  "I would be glad to contribute with curiosity, rigor and a strong willingness to learn while supporting the team’s technical objectives. I would welcome the opportunity to discuss how my background and current training could fit the needs of [COMPANY / TEAM].",
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
  greeting: 'Madame, Monsieur,',
  paragraphs: [
    "Je souhaite rejoindre Assystem pour un stage de six mois en Data Science à partir de février 2027. L’IA m’intéresse autant par ce qu’elle permet de construire que par la façon dont ses résultats sont évalués. Je veux mettre cette curiosité au service de problématiques industrielles concrètes. La performance, la qualité et la fiabilité y ont un impact direct.",
    "Votre équipe m’attire par son approche complète du problème. Le travail ne s’arrête pas au modèle. Il part de la qualité des données. Il passe par l’automatisation, l’expérimentation et le benchmark. Il va jusqu’à l’analyse des limites et aux recommandations. C’est cette chaîne complète que je veux découvrir et à laquelle je veux contribuer. Votre accompagnement structuré et vos cas d’usage réels sont aussi une vraie occasion de progresser au sein d’une équipe expérimentée.",
    "Mes projets académiques m’ont appris à comparer des méthodes et à mesurer leurs performances. Ils m’ont aussi appris à regarder leurs limites. J’ai notamment travaillé sur plusieurs stratégies de segmentation en imagerie fluoroscopique. Chez RWS, j’ai évalué des sorties d’IA selon des critères structurés. J’y ai identifié leurs défaillances. Chez Unified Mentor, j’ai travaillé sur le nettoyage, l’analyse, la visualisation et la restitution de données. Je veux maintenant transposer ces bases à la détection et à la prédiction d’anomalies industrielles.",
    "Je veux apporter à votre équipe cette manière d’expérimenter, comparer et expliquer les résultats avec rigueur. En retour, je souhaite apprendre à traiter des problématiques industrielles plus complexes. Je veux aussi contribuer progressivement aux différentes étapes du projet. Je serais heureux d’échanger avec vous pour vous présenter ma démarche et ce que je pourrais apporter à cette mission.",
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
    return raw ? { ...defaultCoverLetterEn, ...JSON.parse(raw) } : freshCoverLetter('FR');
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
