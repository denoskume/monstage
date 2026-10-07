export type CvLanguage = 'FR' | 'EN';

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
}

const KEY_PREFIX = 'monstage:cv-studio:v3:';
const PREVIOUS_KEY_PREFIX = 'monstage:cv-studio:v2:';
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
  summary: 'Final-year MSc. student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a 6-month end-of-studies internship from February 2027.',
  education: [
    { id: 'ecn', school: 'Centrale Nantes', degree: 'MSc. Control and Robotics — Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027', details: 'Program focused on understanding and developing state-of-the-art methodologies for data analysis, machine learning, and signal and image processing.' },
    { id: 'kju', school: 'Kristu Jayanti University', degree: 'BSc. Computer Science & Electronics', location: 'Bengaluru, India', period: '2021–2024', details: 'Dual-major programme focused on programming, algorithms, software development and data analysis alongside digital electronics, communication systems, embedded systems, and hardware–software integration.' },
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
    { id: 'fraud', name: 'Credit Card Fraud Detection', bullets: [
      'Built a leakage-safe fraud benchmark on 284,807 transactions including 492 fraud cases.',
      'Compared Logistic Regression, Random Forest, XGBoost and a compact PyTorch MLP using PR-AUC as the primary metric.',
      'Selected XGBoost with 0.8557 PR-AUC, 0.9763 ROC-AUC and 0.8384 recall on the final test set.',
      'Added validation-based threshold selection and global/local SHAP explanations.',
    ]},
    { id: 'flag', name: 'Flag Intelligence', bullets: [
      'Built and deployed a MobileNetV3-Small application covering 250 flag classes.',
      'Implemented confidence, decision margin, ranked alternatives and open-set logic.',
      'Evaluated Top-1/Top-5, macro precision/recall/F1, calibration and open-set robustness.',
      'Connected recognition to structured country intelligence generation with PDF/JSON export.',
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
  skills: 'Python, NumPy, pandas, SciPy, scikit-learn, Jupyter, PyTorch, OpenCV, Git, GitHub, Linux, FastAPI, Streamlit, React, TypeScript',
  languages: 'French — Native | English — C1',
  interests: 'Artificial Intelligence & Technology | Football',
};

export const defaultCvFr: CvDraft = {
  language: 'FR',
  name: 'Denos Kume',
  headline: 'Data Science | Machine Learning appliqué | Computer Vision | Traitement d’image',
  location: 'Nantes, France',
  email: 'denoskume@yahoo.com',
  phone: '',
  linkedin: 'linkedin.com/in/denoskume',
  github: 'github.com/denoskume',
  summary: 'Étudiant en dernière année de MSc. Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de 6 mois à partir de février 2027.',
  education: [
    { id: 'ecn', school: 'Centrale Nantes', degree: 'MSc. Control and Robotics — Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027', details: 'Formation centrée sur la compréhension et le développement de méthodes de pointe pour l’analyse de données, le machine learning et le traitement du signal et de l’image.' },
    { id: 'kju', school: 'Kristu Jayanti University', degree: 'BSc. Computer Science & Electronics', location: 'Bengaluru, Inde', period: '2021–2024', details: 'Double cursus centré sur la programmation, les algorithmes, le développement logiciel et l’analyse de données, ainsi que l’électronique numérique, les systèmes de communication, les systèmes embarqués et l’intégration matériel–logiciel.' },
  ],
  experience: [
    { id: 'unified', role: 'Stagiaire Data Analyst', company: 'Unified Mentor Pvt. Ltd.', location: 'Bengaluru, Inde', period: 'Sept.–Déc. 2024', bullets: [
      'Nettoyé et préparé des jeux de données structurés avec Python, pandas et NumPy.',
      'Réalisé des analyses exploratoires pour identifier tendances, distributions et anomalies.',
      'Créé des visualisations Matplotlib pour rendre les résultats lisibles et comparables.',
      'Synthétisé les résultats dans des rapports courts centrés sur l’interprétation.',
    ]},
    { id: 'rws', role: 'Spécialiste en évaluation Speech AI · Freelance', company: 'RWS Moravia', location: 'À distance', period: 'Août 2026', bullets: [
      'Évalué des sorties Speech-to-Speech selon leur qualité, cohérence, naturel et utilité.',
      'Identifié les erreurs linguistiques, conversationnelles et audio dans les réponses évaluées.',
      'Rédigé des justifications courtes et factuelles pour chaque décision d’évaluation.',
      'Appliqué un cadre de notation cohérent afin de maintenir des évaluations reproductibles.',
    ]},
  ],
  projects: [
    { id: 'fraud', name: 'Détection de fraude par carte bancaire', bullets: [
      'Construit un benchmark sans fuite de données sur 284 807 transactions, dont 492 cas de fraude.',
      'Comparé Logistic Regression, Random Forest, XGBoost et un MLP PyTorch compact avec la PR-AUC comme métrique principale.',
      'Retenu XGBoost avec 0,8557 de PR-AUC, 0,9763 de ROC-AUC et 0,8384 de rappel sur le jeu de test final.',
      'Ajouté une sélection du seuil sur validation et des explications SHAP globales et locales.',
    ]},
    { id: 'flag', name: 'Flag Intelligence', bullets: [
      'Développé et déployé une application MobileNetV3-Small couvrant 250 classes de drapeaux.',
      'Intégré confiance, marge de décision, alternatives classées et logique open-set.',
      'Évalué Top-1/Top-5, précision/rappel/F1 macro, calibration et robustesse open-set.',
      'Relié la reconnaissance à la génération structurée d’informations pays avec export PDF/JSON.',
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
  skills: 'Python, NumPy, pandas, SciPy, scikit-learn, Jupyter, PyTorch, OpenCV, Git, GitHub, Linux, FastAPI, Streamlit, React, TypeScript',
  languages: 'Français — Langue maternelle | Anglais — C1',
  interests: 'Intelligence artificielle & technologie | Football',
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
