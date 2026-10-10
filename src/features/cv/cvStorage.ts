export type CvLanguage = 'FR' | 'EN';
export type CvSectionKey = 'education' | 'projects' | 'experience' | 'leadership' | 'skills' | 'languages' | 'interests';

export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  location: string;
  period: string;
  details: string;
}

export interface CvProject {
  id: string;
  name: string;
  period: string;
  bullets: string[];
}

export interface CvLeadership {
  id: string;
  role: string;
  organization: string;
  period: string;
  bullets: string[];
}

export interface CvDraft {
  language: CvLanguage;
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  education: CvEducation[];
  experience: CvExperience[];
  projects: CvProject[];
  leadership: CvLeadership[];
  skills: string;
  languages: string;
  interests: string;
  sectionOrder: CvSectionKey[];
}

const KEY_PREFIX = 'monstage:cv-studio:v10:';
const PREVIOUS_KEY_PREFIX = 'monstage:cv-studio:v9:';
const LEGACY_KEY = 'monstage:cv-studio:v1';

export const defaultCvEn: CvDraft = {
  language: 'EN',
  name: 'Denos Kume',
  headline: 'Data Science | Applied Machine Learning | Computer Vision | Image Processing',
  location: 'Nantes, France',
  email: 'denoskume@yahoo.com',
  phone: '',
  linkedin: 'linkedin.com/in/denoskume',
  github: 'github.com/denoskume',
  summary: 'I am seeking a 6-month end-of-studies internship from February 2027 in Computer Vision and Image Processing. I want to contribute to industrial vision projects focused on segmentation, robustness and system reliability.',
  education: [
    { id: 'ecn', school: 'Centrale Nantes', degree: 'MSc. Control and Robotics — Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027', details: 'Program focused on understanding and developing state-of-the-art methodologies for data analysis, machine learning, and signal and image processing.' },
    { id: 'kju', school: 'Kristu Jayanti University', degree: 'BSc. Computer Science & Electronics', location: 'Bengaluru, India', period: '2021–2024', details: 'Dual-major programme combining programming, software development and data analysis with digital electronics, communication systems and embedded technologies.' },
  ],
  experience: [
    { id: 'unified', role: 'Data Analyst Intern', company: 'Unified Mentor Pvt. Ltd.', location: 'Bengaluru, India', period: 'Sep–Dec 2024', bullets: [
      'Cleaned and prepared structured datasets using Python, pandas and NumPy.',
      'Performed exploratory analysis to identify trends, distributions and anomalies.',
      'Built Matplotlib visualizations to make results readable and comparable.',
      'Summarized findings in concise reports focused on interpretation and decision-making.',
    ]},
    { id: 'rws', role: 'Speech AI Evaluation Specialist · Freelance', company: 'RWS Moravia', location: 'Remote', period: 'Aug 2026', bullets: [
      'Evaluated Speech-to-Speech outputs for quality, coherence, naturalness and usefulness.',
      'Identified linguistic, conversational and audio errors in evaluated responses.',
      'Wrote concise evidence-based rationales for each evaluation decision.',
      'Applied a consistent scoring framework to maintain reproducible evaluations.',
    ]},
  ],
  projects: [
    { id: 'fraud', name: 'Credit Card Fraud Detection', period: 'Oct 2026', bullets: [
      'Built a leakage-safe fraud benchmark on 284,807 transactions including 492 fraud cases.',
      'Compared Logistic Regression, Random Forest, XGBoost and a compact PyTorch MLP using PR-AUC as the primary metric.',
      'Selected XGBoost with 0.8557 PR-AUC, 0.9763 ROC-AUC and 0.8384 recall on the final test set.',
      'Added validation-based threshold selection and global/local SHAP explanations.',
    ]},
    { id: 'flag', name: 'Flag Intelligence', period: 'Sep 2026–Ongoing', bullets: [
      'Developing a MobileNetV3-Small application covering 250 flag classes.',
      'Integrating confidence, decision margin, ranked alternatives and open-set logic.',
      'Evaluating Top-1/Top-5, macro precision/recall/F1, calibration and open-set robustness.',
      'Improving system robustness, error analysis and structured country intelligence generation with PDF/JSON export.',
    ]},
  ],
  leadership: [
    {
      id: 'secretary',
      role: 'Secretary',
      organization: 'Academic Student Leadership',
      period: '2 years',
      bullets: [
        'Supported coordination and communication across student activities and academic responsibilities.',
        'Helped organize information, follow-ups and day-to-day coordination between students and stakeholders.',
      ],
    },
  ],
  skills: 'Python & Scientific Computing: Python, NumPy, SciPy, pandas, Matplotlib, Jupyter\nMachine Learning: scikit-learn, PyTorch, classification, model evaluation\nComputer Vision & Image Processing: OpenCV, scikit-image, computer vision, image processing\nEngineering Tools: Git, GitHub, Linux, VS Code, Streamlit',
  languages: 'French — Native | English — C1',
  interests: 'Artificial Intelligence & Technology | Football',
  sectionOrder: ['education', 'projects', 'experience', 'skills', 'languages', 'leadership', 'interests'],
};

export const defaultCvFr: CvDraft = {
  language: 'FR',
  name: 'Denos Kume',
  headline: 'Data Science & IA appliquées | Qualité industrielle | Automatisation de processus',
  location: 'Nantes, France',
  email: 'denoskume@yahoo.com',
  phone: '',
  linkedin: 'linkedin.com/in/denoskume',
  github: 'github.com/denoskume',
  summary: 'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de 6 mois dès février 2027. Je souhaite appliquer l’analyse de données, l’IA et l’automatisation à des problématiques concrètes de qualité et d’amélioration de processus industriels, tout en progressant au contact d’une équipe expérimentée.',
  education: [
    { id: 'ecn', school: 'Centrale Nantes', degree: 'MSc. Control and Robotics — Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027', details: 'Formation centrée sur la compréhension et le développement de méthodes de pointe pour l’analyse de données, le machine learning et le traitement du signal et de l’image.' },
    { id: 'kju', school: 'Kristu Jayanti University', degree: 'BSc. Computer Science & Electronics', location: 'Bengaluru, Inde', period: '2021–2024', details: 'Double cursus combinant programmation, développement logiciel et analyse de données avec électronique numérique, systèmes de communication et technologies embarquées.' },
  ],
  experience: [
    { id: 'rws', role: 'Spécialiste en évaluation Speech AI · Freelance', company: 'RWS Moravia', location: 'À distance', period: 'Août 2026', bullets: [
      'Évalué des sorties d’IA selon des critères précis de qualité, cohérence, naturel et utilité.',
      'Identifié les erreurs et limites récurrentes afin de distinguer les résultats conformes des cas problématiques.',
      'Documenté chaque décision avec une justification courte, factuelle et traçable.',
      'Appliqué un cadre de contrôle constant afin de maintenir des évaluations reproductibles.',
    ]},
    { id: 'unified', role: 'Stagiaire Data Analyst', company: 'Unified Mentor Pvt. Ltd.', location: 'Bengaluru, Inde', period: 'Sept.–Déc. 2024', bullets: [
      'Nettoyé et structuré des jeux de données avec Python, pandas et NumPy pour fiabiliser leur analyse.',
      'Analysé tendances, distributions et anomalies afin d’identifier les principaux écarts dans les données.',
      'Créé des visualisations Matplotlib pour comparer les résultats et faciliter leur interprétation.',
      'Synthétisé les analyses dans des restitutions courtes orientées compréhension et décision.',
    ]},
  ],
  projects: [
    { id: 'background', name: 'Background Subtraction — Traitement d’images fluoroscopiques', period: '2026', bullets: [
      'Développé une chaîne de traitement combinant normalisation, filtrage et morphologie sur des séquences d’images.',
      'Comparé seuil fixe, Otsu et EM/GMM afin d’évaluer différentes approches de segmentation.',
      'Mesuré les performances avec SAD, MSE, PSNR, Dice et IoU pour comparer quantitativement les résultats.',
      'Analysé les erreurs avec overlays et courbes temporelles afin d’identifier les cas difficiles.',
    ]},
    { id: 'monstage', name: 'MonStage — Automatisation du suivi de candidatures', period: '2026–En cours', bullets: [
      'Développe une application centralisant offres, candidatures, statuts et actions de suivi dans un workflow unique.',
      'Automatise des flux avec Google Apps Script et des données structurées afin de réduire les tâches manuelles répétitives.',
      'Ajoute contrôles, filtres, tests et validations pour fiabiliser les données et sécuriser le fonctionnement de l’outil.',
      'Documente et fait évoluer la solution afin de faciliter sa prise en main, sa maintenance et son amélioration continue.',
    ]},
  ],
  leadership: [
    {
      id: 'secretary',
      role: 'Secrétaire',
      organization: 'Responsabilité étudiante',
      period: '2 ans',
      bullets: [
        'Contribué à la coordination et à la communication autour des activités étudiantes et académiques.',
        'Aidée à organiser les informations, les suivis et la coordination quotidienne entre étudiants et interlocuteurs.',
      ],
    },
  ],
  skills: 'Data & Analyse : Python, pandas, NumPy, SciPy, Matplotlib, Jupyter\nIA & Évaluation : scikit-learn, PyTorch, classification, évaluation de modèles, analyse d’erreurs\nAutomatisation & Outils : Google Apps Script, Google Sheets, Google Workspace, Git, GitHub, VS Code\nComputer Vision & Traitement d’image : OpenCV, scikit-image, segmentation, traitement d’image',
  languages: 'Français — Langue maternelle | Anglais — C1',
  interests: 'Intelligence artificielle & nouvelles technologies | Cuisine',
  sectionOrder: ['education', 'experience', 'projects', 'skills', 'languages', 'interests', 'leadership'],
};

export function freshCvDraft(language: CvLanguage): CvDraft {
  return structuredClone(language === 'FR' ? defaultCvFr : defaultCvEn);
}

function migrateCvDraft(language: CvLanguage, saved: Partial<CvDraft>): CvDraft {
  const defaults = freshCvDraft(language);
  const migrated = { ...defaults, ...saved, language };

  // Keep the user's saved CV content, but refresh the built-in education records
  // when MonStage ships an updated official degree title or programme description.
  migrated.education = (saved.education ?? defaults.education).map((item) => {
    const official = defaults.education.find((entry) => entry.id === item.id);
    if (!official || !['ecn', 'kju'].includes(item.id)) return item;
    return {
      ...item,
      school: official.school,
      degree: official.degree,
      location: official.location,
      period: official.period,
      details: official.details,
    };
  });

  migrated.projects = (saved.projects ?? defaults.projects).map((item) => {
    const official = defaults.projects.find((entry) => entry.id === item.id);
    if (item.id === 'flag' && official) {
      return {
        ...item,
        name: official.name,
        period: official.period,
        bullets: official.bullets,
      };
    }
    return {
      ...item,
      period: item.period || official?.period || '',
    };
  });

  // Refresh the built-in objective when MonStage ships a recruiter-focused version.
  migrated.summary = defaults.summary;

  if (language === 'FR') {
    migrated.headline = defaults.headline;
    migrated.experience = defaults.experience;
    migrated.projects = defaults.projects;
    migrated.skills = defaults.skills;
    migrated.languages = defaults.languages;
    migrated.sectionOrder = defaults.sectionOrder;
  }

  const validSections: CvSectionKey[] = ['education', 'projects', 'experience', 'leadership', 'skills', 'languages', 'interests'];
  const savedOrder = Array.isArray(saved.sectionOrder) ? saved.sectionOrder.filter((key): key is CvSectionKey => validSections.includes(key as CvSectionKey)) : [];
  migrated.sectionOrder = [...savedOrder, ...defaults.sectionOrder.filter((key) => !savedOrder.includes(key))];

  return migrated;
}

export function loadCvDraft(language: CvLanguage = 'EN'): CvDraft {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + language);
    if (raw) return { ...freshCvDraft(language), ...JSON.parse(raw), language };

    const previous = localStorage.getItem(PREVIOUS_KEY_PREFIX + language);
    if (previous) {
      const migrated = migrateCvDraft(language, JSON.parse(previous));
      localStorage.setItem(KEY_PREFIX + language, JSON.stringify(migrated));
      return migrated;
    }

    if (language === 'EN') {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const migrated = migrateCvDraft('EN', JSON.parse(legacy));
        localStorage.setItem(KEY_PREFIX + 'EN', JSON.stringify(migrated));
        return migrated;
      }
    }
    return freshCvDraft(language);
  } catch {
    return freshCvDraft(language);
  }
}

export function saveCvDraft(draft: CvDraft): void {
  localStorage.setItem(KEY_PREFIX + draft.language, JSON.stringify(draft));
}

export function resetCvDraft(language: CvLanguage): CvDraft {
  localStorage.removeItem(KEY_PREFIX + language);
  return freshCvDraft(language);
}
