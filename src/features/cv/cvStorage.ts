import { cvPresets, selectedCertifications } from './cvEvidenceCatalog';

// Application-specific drafts are kept separately from CV master.
export type CvLanguage = 'FR' | 'EN';
export type CvPlan = 'A' | 'B';
export type CvSummaryHeading = 'profile' | 'objective';
export function cvSummaryTitle(heading: CvSummaryHeading | undefined, language: CvLanguage): string {
  return heading === 'objective' ? (language === 'FR' ? 'Objectif professionnel' : 'Career Objective')
    : (language === 'FR' ? 'Profil' : 'Profile');
}

export type CvTemplate = 'classic' | 'modern' | 'minimal' | 'keywords';
export type CvPageColor = 'white' | 'soft-gray' | 'soft-blue';
export const cvPageColorOptions: { id: CvPageColor; fr: string; en: string; hex: string }[] = [
  { id: 'white', fr: 'Blanc', en: 'White', hex: '#FFFFFF' },
  { id: 'soft-gray', fr: 'Gris clair', en: 'Soft gray', hex: '#FBFBFB' },
  { id: 'soft-blue', fr: 'Bleu très pâle', en: 'Soft blue', hex: '#F4F7FB' },
];
export function cvPageColorHex(color?: CvPageColor): string {
  return cvPageColorOptions.find(option => option.id === color)?.hex ?? '#FFFFFF';
}

export const cvTemplateOptions: { id: CvTemplate; fr: string; en: string }[] = [
  { id: 'classic', fr: '1 · Classique', en: '1 · Classic' },
  { id: 'modern', fr: '2 · Moderne', en: '2 · Modern' },
  { id: 'minimal', fr: '3 · Épuré', en: '3 · Minimal' },
  { id: 'keywords', fr: '4 · ATS / Compétences clés', en: '4 · ATS / Key Skills' },
];
export type CvSectionKey = 'education' | 'projects' | 'experience' | 'leadership' | 'skills' | 'certifications' | 'languages' | 'interests';
export interface CvCertification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description?: string;
  bullets: string[];
}

// Default summaries for existing RWS / Unified Mentor records. Saved edits take priority.
export function cvExperienceDescription(experience: CvExperience, language: CvLanguage): string {
  if (experience.description !== undefined) return experience.description;
  const role = experience.role.toLowerCase();
  const company = experience.company.toLowerCase();
  if (company.includes('rws') || role.includes('speech ai')) {
    return language === 'FR'
      ? 'Évaluation comparative de la qualité des réponses de modèles d’IA vocale.'
      : 'Comparative quality evaluation of speech AI model responses.';
  }
  if (company.includes('unified mentor') || role.includes('data analyst intern')) {
    return language === 'FR'
      ? 'Analyse de données et restitution des résultats à l’aide d’outils de visualisation.'
      : 'Data analysis and communication of findings using visualization tools.';
  }
  return '';
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  location: string;
  period: string;
  details: string;
  keyCourses?: string;
  bullets?: string[];
}

// Shared presentation rule for Studio preview and exported PDF.
// Preserve the diploma and its programme ("Parcours") exactly as entered.
// Only remove an already repeated city/country at the END of the school line.
export function cvEducationDisplay(education: CvEducation): { school: string; location: string } {
  const location = education.location.trim()
    .replace(/^Bangalore(?=\s*,\s*Inde\b)/i, 'Bengaluru');
  const school = education.school.trim().replace(/[.,]\s*(?:Bengaluru|Bangalore)\s*,\s*Inde\s*$/i, '').trim();
  return { school, location };
}

export interface CvProject {
  id: string;
  name: string;
  period: string;
  description?: string;
  bullets: string[];
}

// Provide short descriptions for the two M1 academic projects in existing saved CVs.
// An explicitly edited description (including an empty string) always wins.
export function cvProjectDescription(project: CvProject, language: CvLanguage): string {
  if (project.description !== undefined) return project.description;
  const id = project.id.toLowerCase();
  const name = project.name.toLowerCase();
  if (id === 'background' || name.includes('background subtraction') || name.includes('soustraction de fond')) {
    return language === 'FR'
      ? 'Segmentation d’images fluoroscopiques pour mettre en évidence des instruments médicaux.'
      : 'Fluoroscopic image segmentation to highlight medical instruments.';
  }
  if (id === 'clap' || name.includes('clap')) {
    return language === 'FR'
      ? 'Classification de sons environnementaux à partir de descriptions textuelles, sans réentraînement.'
      : 'Environmental sound classification from text descriptions without model retraining.';
  }
  return '';
}

export interface CvLeadership {
  id: string;
  role: string;
  organization: string;
  period: string;
  bullets: string[];
}

// Display-only normalization: keeps original saved CV text unchanged.
export function cvExperienceLocationForDisplay(location: string): string {
  return location
    .replace(/\bBengalore\b|\bBangalore\b/gi, 'Bengaluru')
    .replace(/\s+,/g, ',')
    .trim();
}

export function cvLanguagesForDisplay(languages: string): string {
  return languages.trim().replace(/^(?:\*\*)?Langues\s*:(?:\*\*)?\s*/i, '');
}

function cvSkillCategoryForDisplay(line: string, language: CvLanguage): string {
  if (language !== 'FR') return line;
  const categories: Record<string, string> = {
    'programming': 'Programmation',
    'computer vision & image processing': 'Vision par ordinateur & traitement d’images',
    'machine learning': 'Machine Learning',
    'tools & visualization': 'Outils & visualisation',
  };
  const colon = line.indexOf(':');
  if (colon < 0) return line;
  const category = line.slice(0, colon).replace(/\*\*/g, '').trim().toLowerCase();
  const translated = categories[category];
  if (!translated) return line;
  const content = line.slice(colon + 1).replace(/^\s*\*\*/, '').trim();
  return '**' + translated + ' :** ' + content;
}

// Four distinct Plan B categories. Upgrade only the original, unedited
// four-line Plan B skills block when rendering previously saved drafts.
export function cvPlanBSkills(language: CvLanguage): string[] {
  return language === 'FR' ? [
    '**Programmation & analyse :** Python, pandas, NumPy, SciPy, nettoyage et analyse exploratoire',
    '**Bases de données :** SQL, SQL Server (SSMS), jointures, agrégations, sous-requêtes',
    '**Modélisation & statistiques :** régression, classification, scikit-learn, évaluation de modèles',
    '**Outils & visualisation :** Power BI, Matplotlib, Jupyter, Git',
  ] : [
    '**Programming & Analysis:** Python, pandas, NumPy, SciPy, data cleaning and exploratory analysis',
    '**Databases:** SQL, SQL Server (SSMS), joins, aggregations, subqueries',
    '**Modeling & Statistics:** regression, classification, scikit-learn, model evaluation',
    '**Tools & Visualization:** Power BI, Matplotlib, Jupyter, Git',
  ];
}

// Merge only duplicate tool rows; keep every distinct skill and its category.
// This is a display helper, so previously saved CV drafts are never overwritten.
export function cvSkillsForDisplay(skills: string, language: CvLanguage): string[] {
  const lines = skills.split('\n').map(line => line.trim()).filter(Boolean);
  const oldPlanB = language === 'FR'
    ? ['Programmation & analyse', 'Bases de données', 'Business Intelligence', 'Outils & reporting']
    : ['Programming & Analytics', 'Databases', 'Business Intelligence', 'Reporting & Tools'];
  const categories = lines.map(line => line.split(':')[0].replace(/\*\*/g, '').trim());
  if (categories.length === 4 && oldPlanB.every((category, i) => categories[i] === category)) {
    return cvPlanBSkills(language);
  }
  // The user may have bolded the entire tool list in saved CV data.
  // Remove bold markers only from this merged presentation, not the saved data.
  const toolCategory = /^(?:Tools\s*&\s*Visualization|Outils(?:\s*&\s*visualisation)?)\s*:/i;
  const isTools = (line: string) => toolCategory.test(line.replace(/\*\*/g, '').trim());
  const toolRows = lines.filter(isTools);
  if (!toolRows.length) return lines.map(line => cvSkillCategoryForDisplay(line, language));

  const firstIndex = lines.findIndex(isTools);
  const seen = new Set<string>();
  const values: string[] = [];
  for (const row of toolRows) {
    const clean = row.replace(/\*\*/g, '').trim().replace(toolCategory, '');
    for (const rawItem of clean.split(',')) {
      const item = rawItem.trim();
      if (!item) continue;
      const key = /^jupyter(?:\s+notebook)?$/i.test(item) ? 'jupyter' : item.toLowerCase();
      if (!seen.has(key)) { seen.add(key); values.push(item); }
    }
  }
  const isSimpleTools = toolRows.length === 1 && /^Outils\s*:/i.test(toolRows[0].replace(/\*\*/g, '').trim());
  const heading = isSimpleTools && language === 'FR' ? '**Outils :** '
    : language === 'FR' ? '**Outils & visualisation :** ' : '**Tools & Visualization:** ';
  return lines.flatMap((line, index) => index === firstIndex
    ? [heading + values.join(', ')]
    : isTools(line) ? [] : [cvSkillCategoryForDisplay(line, language)]);
}

// Key Skills are a short, editable shortlist of demonstrable skills, not
// invented keywords from an offer. Existing local drafts get a safe fallback.
export function cvKeySkillsForDisplay(draft: CvDraft): string {
  if (draft.keySkills !== undefined) return draft.keySkills.trim();
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const line of cvSkillsForDisplay(draft.skills, draft.language)) {
    const category = line.replace(/^\\*\\*|\\*\\*$/g, '').split(':')[0].toLowerCase();
    if (/tools|outils|visualization|visualisation/.test(category)) continue;
    const entries = line.slice(line.indexOf(':') + 1).split(',').map(part => part.trim()).filter(Boolean);
    for (const entry of entries.slice(0, 2)) {
      const key = entry.toLowerCase();
      if (!seen.has(key)) { terms.push(entry); seen.add(key); }
      if (terms.length >= 6) return terms.join(' · ');
    }
  }
  return terms.join(' · ');
}

export interface CvDraft {
  language: CvLanguage;
  plan?: CvPlan;
  template?: CvTemplate;
  pageColor?: CvPageColor;
  // False hides the extra 'Missions' line in selected targeted CVs.
  showMissionLabels?: boolean;
  name: string;
  headline: string;
  academicHeadline?: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  summaryHeading?: CvSummaryHeading;
  keySkills?: string;
  education: CvEducation[];
  experience: CvExperience[];
  projects: CvProject[];
  certifications?: CvCertification[];
  leadership: CvLeadership[];
  skills: string;
  languages: string;
  interests: string;
  sectionOrder: CvSectionKey[];
}

const KEY_PREFIX = 'monstage:cv-studio:v12:';
const PREVIOUS_KEY_PREFIX = 'monstage:cv-studio:v11:';
const LEGACY_KEY = 'monstage:cv-studio:v1';

export const CV_ACADEMIC_HEADLINE = "Master's student in Control and Robotics | Data Science, Signal and Image Processing";

export const defaultCvEn: CvDraft = {
  language: 'EN',
  name: 'Denos Kume',
  academicHeadline: CV_ACADEMIC_HEADLINE,
  headline: 'Data Science | Applied Machine Learning | Computer Vision | Image Processing',
  location: 'Nantes, France',
  email: 'kamenan.kume@eleves.ec-nantes.fr',
  phone: '+33 6 62 91 94 68',
  linkedin: 'linkedin.com/in/denoskume',
  github: 'github.com/denoskume',
  summary: 'I am seeking a 6-month end-of-studies internship from February 2027 in Computer Vision and Image Processing. I want to contribute to industrial vision projects focused on segmentation, robustness and system reliability.',
  education: [
    { id: 'ecn', school: 'Centrale Nantes', degree: 'MSc. Control and Robotics — Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027', details: 'Program focused on understanding and developing state-of-the-art methodologies for data analysis, machine learning, and signal and image processing.' },
    { id: 'kju', school: 'Kristu Jayanti University', degree: 'BSc. Computer Science & Electronics', location: 'Bengaluru, India', period: '2021–2025', details: 'Dual-major programme combining programming, software development and data analysis with digital electronics, communication systems and embedded technologies.' },
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
  skills: '**Programming:** Python, NumPy, pandas, SciPy, SQL\n**Computer Vision:** OpenCV, segmentation, camera calibration, feature tracking\n**Machine Learning:** scikit-learn, PyTorch, classification, regression\n**Signal & Tools:** signal processing, Jupyter, Matplotlib, Git, Linux',
  languages: '**French:** Native | **English:** C1 (4+ years of higher education in English)',
  interests: 'Artificial Intelligence & Technology | Football',
  certifications: selectedCertifications(cvPresets.A.certificates),
  sectionOrder: ['education', 'projects', 'experience', 'skills', 'certifications', 'languages', 'leadership', 'interests'],
};

export const defaultCvFr: CvDraft = {
  language: 'FR',
  name: 'Denos Kume',
  academicHeadline: CV_ACADEMIC_HEADLINE,
  headline: 'Data Science & IA appliquées | Automatisation & optimisation de processus',
  location: 'Nantes, France',
  email: 'kamenan.kume@eleves.ec-nantes.fr',
  phone: '+33 6 62 91 94 68',
  linkedin: 'linkedin.com/in/denoskume',
  github: 'github.com/denoskume',
  summary: 'Étudiant en dernière année de MSc Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de 6 mois dès février 2027. Je souhaite appliquer l’analyse de données, l’IA et l’automatisation à des problématiques concrètes de qualité et d’amélioration de processus industriels, tout en progressant au contact d’une équipe expérimentée.',
  education: [
    { id: 'ecn', school: 'Centrale Nantes', degree: 'MSc. Control and Robotics — Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027', details: 'Mise en pratique du machine learning, de l’optimisation et du traitement d’images dans des travaux en Python et MATLAB, notamment en segmentation, filtrage et analyse de données.' },
    { id: 'kju', school: 'Kristu Jayanti University', degree: 'BSc. Computer Science & Electronics', location: 'Bengaluru, Inde', period: '2021–2025', details: 'Formation pluridisciplinaire en informatique et électronique, avec des bases en programmation, développement logiciel, analyse de données, électronique numérique et systèmes embarqués.' },
  ],
  experience: [
    { id: 'rws', role: 'Spécialiste en évaluation Speech AI · Freelance', company: 'RWS Moravia', location: 'À distance', period: 'Août 2026–En cours', bullets: [
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
    { id: 'fraud', name: 'Credit Card Fraud Detection — Machine Learning', period: 'Oct. 2026', bullets: [
      'Construit un benchmark anti-fuite sur 284 807 transactions, dont 492 cas de fraude.',
      'Comparé Logistic Regression, Random Forest, XGBoost et un MLP PyTorch avec PR-AUC comme métrique principale.',
      'Sélectionné XGBoost avec 0,8557 de PR-AUC, 0,9763 de ROC-AUC et 0,8384 de rappel sur le jeu de test final.',
      'Ajouté une sélection de seuil sur validation et des explications SHAP globales et locales.',
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
        'Coordonné la planification et l’organisation d’activités étudiantes et d’événements culturels.',
        'Assuré le suivi logistique, la communication et la coordination entre étudiants et interlocuteurs.',
        'Participé à l’accueil et à l’intégration de plus de 100 nouveaux étudiants.',
        'Facilité leur prise de repères en centralisant les informations utiles et en accompagnant leur arrivée.',
      ],
    },
  ],
  skills: '**Programmation :** Python, NumPy, pandas, SciPy, SQL\n**Vision & Image :** OpenCV, segmentation, calibration caméra, suivi de points\n**Machine Learning :** scikit-learn, PyTorch, classification, régression\n**Signal & Outils :** traitement du signal, Jupyter, Matplotlib, Git, Linux',
  languages: '**Français :** Langue maternelle | **Anglais :** C1 (plus de 4 ans d’études supérieures en anglais)',
  interests: 'Intelligence artificielle & nouvelles technologies | Cuisine',
  certifications: selectedCertifications(cvPresets.A.certificates),
  sectionOrder: ['education', 'experience', 'projects', 'skills', 'certifications', 'leadership', 'languages', 'interests'],
};

// Separate, focused Data Analysis master. Never mutate or overwrite Plan A.
export function freshPlanBCvDraft(language: CvLanguage): CvDraft {
  const fr = language === 'FR';
  const draft = structuredClone(fr ? defaultCvFr : defaultCvEn);
  draft.plan = 'B';
  draft.name = 'Denos KUME';
  draft.academicHeadline = fr
    ? 'Étudiant en Master 2 Control and Robotics | Data Science, Signal and Image Processing'
    : 'Master’s student in Control and Robotics | Data Science, Signal and Image Processing';
  draft.headline = fr
    ? 'Analyse de données | Business Intelligence | Analyse de données industrielles'
    : 'Data Analysis | Business Intelligence | Industrial Analytics';
  draft.summaryHeading = 'objective';
  draft.summary = fr
    ? 'À la recherche d’un **stage de fin d’études de 6 mois dès février 2027** en analyse de données, avec un intérêt particulier pour les applications industrielles. Je souhaite mettre à profit mes compétences en Python, SQL et analyse de données pour contribuer à l’exploitation des données et à la prise de décision, tout en renforçant mon expérience au sein d’une équipe expérimentée.'
    : 'Seeking a **6-month final-year internship starting in February 2027** in Data Analysis, with a particular interest in industrial applications. I aim to apply my skills in Python, SQL, and data analysis to support data-driven decision-making and contribute to meaningful projects while gaining practical experience alongside an experienced team.';
  draft.education = [
    { id: 'ecn', school: 'Master of Science - Control and Robotics, Centrale Nantes', degree: 'Parcours: Data Science, Signal & Image Processing', location: 'Nantes, France', period: '2025–2027',
      details: fr ? 'Formation axée sur les méthodes avancées d’analyse de données, d’apprentissage automatique et de traitement d’images.' : 'Advanced methods in data analysis, machine learning, and image processing.',
      keyCourses: cvPresets.B.ecn.join(' · ') },
    { id: 'kju', school: 'Bachelor of Science - Computer Science & Electronics, Kristu Jayanti University', degree: 'Parcours: Informatique et Électronique', location: 'Bengaluru, Inde', period: '2021–2025',
      details: fr ? 'Programme établissant des bases solides en programmation, développement logiciel, systèmes numériques et électronique.' : 'Foundations in programming, software development, digital systems, and electronics.',
      keyCourses: cvPresets.B.kju.join(' · ') },
  ];
  draft.experience = [
    { id: 'unified', role: 'Data Analyst Intern', company: 'Unified Mentor Pvt. Ltd.', period: fr ? 'Sept.–Déc. 2024' : 'Sep–Dec 2024',
      location: fr ? 'Stage • Bengaluru, Inde' : 'Internship • Bengaluru, India',
      description: fr
        ? 'Nettoyage des données avec Python et création de tableaux de bord interactifs avec Power BI pour l’aide à la décision.'
        : 'Data cleaning with Python and development of interactive Power BI dashboards for decision-making.',
      bullets: fr
        ? ['Nettoyé les données avec Python et Pandas : valeurs manquantes, doublons et formats.',
          'Effectué des requêtes et jointures SQL, puis calculé des indicateurs métier avec DAX.',
          'Conçu des tableaux de bord Power BI interactifs pour visualiser les KPI et faciliter les décisions.']
        : ['Cleaned data with Python and Pandas, handling missing values, duplicates, and formats.',
          'Performed SQL queries and joins, and calculated business KPIs using DAX measures.',
          'Built interactive Power BI dashboards to visualize KPIs and support business decisions.'] },
    { id: 'rws', role: 'Speech AI Evaluation Specialist', company: 'RWS Moravia', period: fr ? 'Août–Oct. 2026' : 'Aug–Oct 2026',
      location: fr ? 'Freelance • Remote, France' : 'Freelance • Remote, France',
      description: fr
        ? 'Évaluation et comparaison des réponses de modèles d’IA (texte, audio et images) selon leur qualité, leur pertinence et leur précision.'
        : 'Evaluation and comparison of AI model responses (text, audio, and images) based on quality, relevance, and accuracy.',
      bullets: fr
        ? ['Évalué la pertinence, la précision et la qualité linguistique des réponses d’IA aux requêtes.',
          'Vérifié la qualité des images générées : netteté, luminosité, contraste et résolution.',
          'Comparé les résultats des modèles sur des tests textuels, visuels et audio, avec des évaluations justifiées.']
        : ['Evaluated the relevance, accuracy, and linguistic quality of AI responses to user prompts.',
          'Assessed generated image quality, including sharpness, brightness, contrast, and resolution.',
          'Compared model outputs across text, image, and audio tasks, with evidence-based ratings.'] },
  ];
  draft.projects = [
    { id: 'nova', name: fr ? 'Nova Distribution — Analyse de rentabilité (cas pratique simulé)' : 'Nova Distribution — Profitability Analysis (simulated case)',
      period: fr ? 'mars–juin 2025' : 'Mar–Jun 2025', description: fr
        ? 'Diagnostic d’une baisse de rentabilité à partir de données financières fictives.'
        : 'Profitability diagnosis based on a simulated business dataset.',
      bullets: fr
        ? ['Examiné une hausse de 12 % du chiffre d’affaires malgré une baisse de 8 % du bénéfice opérationnel.',
          'Calculé une marge opérationnelle passée de 20 % à 16,43 % sur les deux périodes.',
          'Rapproché les charges avec Python et Pandas pour relever un écart de 1,4 M€ dans le scénario.']
        : ['Investigated a 12% revenue increase alongside an 8% operating profit decline.',
          'Calculated an operating margin decrease from 20% to 16.43%.',
          'Reconciled expenses with Python and Pandas, identifying a €1.4M scenario discrepancy.'] },
    { id: 'monstage', name: 'MonStage — Internship Application Tracker', period: fr ? 'juin–octobre 2026' : 'Jun–Oct 2026',
      description: fr ? 'Application personnelle de suivi des offres et candidatures.' : 'Personal application to track internship offers and applications.',
      bullets: fr
        ? ['Développé une application centralisant les offres de stage et le suivi des candidatures.',
          'Structuré les données à l’aide de filtres multicritères et de statuts de candidature.',
          'Créé un tableau de bord pour visualiser les opportunités et suivre leur évolution.']
        : ['Built an application centralizing internship offers and application tracking.',
          'Organized records using multi-criteria filters and application statuses.',
          'Created a dashboard to visualize opportunities and monitor their evolution.'] },
  ];
  draft.skills = cvPlanBSkills(language).join('\n');
  draft.languages = fr ? '**Français :** Langue maternelle | **Anglais :** C1 (plus de 4 ans d’études supérieures en anglais)' : '**French:** Native | **English:** C1 (4+ years of higher education in English)';
  draft.interests = fr ? 'Négociation • Échanges interculturels • Cuisine' : 'Negotiation • Intercultural exchange • Cooking';
  draft.leadership = [];
  draft.certifications = selectedCertifications(cvPresets.B.certificates);
  draft.sectionOrder = ['education', 'projects', 'experience', 'skills', 'certifications', 'languages', 'interests'];
  draft.template = 'modern';
  draft.pageColor = 'white';
  return draft;
}

export function freshCvDraft(language: CvLanguage, plan: CvPlan = 'A'): CvDraft {
  if (plan === 'B') return freshPlanBCvDraft(language);
  const base = structuredClone(language === 'FR' ? defaultCvFr : defaultCvEn);
  base.education = base.education.map(item => item.id === 'ecn' ? { ...item, keyCourses: cvPresets.A.ecn.join(' · ') } : item.id === 'kju' ? { ...item, keyCourses: cvPresets.A.kju.join(' · ') } : item);
  return base;
}

function migrateCvDraft(language: CvLanguage, saved: Partial<CvDraft>): CvDraft {
  const defaults = freshCvDraft(language);
  const migrated = { ...defaults, ...saved, language, academicHeadline: saved.academicHeadline ?? defaults.academicHeadline };

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
  // Keep core contact links present when older saved drafts stored them as blank.
  migrated.github = saved.github?.trim() ? saved.github : defaults.github;
  migrated.linkedin = saved.linkedin?.trim() ? saved.linkedin : defaults.linkedin;
  migrated.phone = saved.phone?.trim() ? saved.phone : defaults.phone;


  if (language === 'FR') {
    migrated.headline = defaults.headline;
    migrated.experience = defaults.experience;
    migrated.projects = defaults.projects;
    migrated.skills = defaults.skills;
    migrated.languages = defaults.languages;
    migrated.leadership = defaults.leadership;
    migrated.interests = defaults.interests;
    migrated.sectionOrder = defaults.sectionOrder;
  }

  const validSections: CvSectionKey[] = ['education', 'projects', 'experience', 'leadership', 'skills', 'certifications', 'languages', 'interests'];
  const savedOrder = Array.isArray(saved.sectionOrder) ? saved.sectionOrder.filter((key): key is CvSectionKey => validSections.includes(key as CvSectionKey)) : [];
  migrated.sectionOrder = [...savedOrder, ...defaults.sectionOrder.filter((key) => !savedOrder.includes(key))];

  return migrated;
}

// Apply narrowly scoped corrections to the Plan B master only.
// Keep user-authored text, project metrics and all Plan A records unchanged.
export function normalizePlanBDraft(draft: CvDraft): CvDraft {
  if (draft.plan !== 'B') return draft;
  const projects = draft.projects.map(project => {
    // Restore the user's confirmed reference periods in previously saved Plan B drafts.
    // Leave other manually edited dates untouched.
    const period = project.period.trim();
    if (project.id === 'nova' && (!period || /^mars\s*[-–]\s*ju(?:n|in)\s+2025$/i.test(period))) {
      return { ...project, period: draft.language === 'FR' ? 'mars–juin 2025' : 'Mar–Jun 2025' };
    }
    if (project.id === 'monstage' && (/^2026$/.test(period) || /^jul\s*[-–]\s*oct\s+2026$/i.test(period))) {
      return { ...project, period: draft.language === 'FR' ? 'juin–octobre 2026' : 'Jun–Oct 2026' };
    }
    return project;
  });
  const skills = draft.skills.split('\n').map(line => {
    const category = line.split(':')[0].replace(/\*\*/g, '').trim().toLowerCase();
    if (category !== 'bases de données' && category !== 'databases') return line;
    // Fix the mistaken MySQL substitution in the exact database-skills row.
    // Keep any other skills explicitly added by the user.
    return line.replace(/\bMySQL\s*,\s*SQL Server\s*\(SSMS\)/i, 'SQL, SQL Server (SSMS)');
  }).join('\n');
  const sectionOrder = draft.sectionOrder.includes('certifications')
    ? draft.sectionOrder
    : [...draft.sectionOrder.slice(0, draft.sectionOrder.indexOf('languages') >= 0 ? draft.sectionOrder.indexOf('languages') : draft.sectionOrder.length),
       'certifications' as const,
       ...draft.sectionOrder.slice(draft.sectionOrder.indexOf('languages') >= 0 ? draft.sectionOrder.indexOf('languages') : draft.sectionOrder.length)];
  return { ...draft, projects, skills, sectionOrder };
}

export function loadCvDraft(language: CvLanguage = 'EN', plan: CvPlan = 'A'): CvDraft {
  // Keep application drafts separate from the generic CV.
  try {
    const review = JSON.parse(localStorage.getItem('monstage:application-review:v1') || 'null');
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    if (review?.offerId && params.get('offer') === review.offerId && review.language === language) {
      const key = 'monstage:application-dossiers:v1:' + encodeURIComponent(review.offerId) + ':' + language;
      const dossier = JSON.parse(localStorage.getItem(key) || 'null');
      if (dossier?.cv && dossier.offerId === review.offerId) return dossier.cv as CvDraft;
    }
  } catch { /* use master CV when there is no valid application dossier */ }
  try {
    // Plan B has its own keys. Plan A stays under the original names.
    const storageKey = KEY_PREFIX + language + (plan === 'B' ? ':B' : '');
    const raw = localStorage.getItem(storageKey);
    if (raw) return normalizePlanBDraft({ ...freshCvDraft(language, plan), ...JSON.parse(raw), language, plan }); 
    if (plan === 'B') return freshCvDraft(language, 'B');

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
  try {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    const offerId = params.get('offer');
    if ((window.location.pathname.endsWith('/cv') || window.location.hash.startsWith('#/cv?')) && offerId) {
      const key = 'monstage:application-dossiers:v1:' + encodeURIComponent(offerId) + ':' + draft.language;
      const dossier = JSON.parse(localStorage.getItem(key) || 'null');
      if (dossier?.offerId === offerId) {
        localStorage.setItem(key, JSON.stringify({ ...dossier, cv: draft, updatedAt: new Date().toISOString() }));
        return;
      }
    }
  } catch { /* fall back to master save */ }
  localStorage.setItem(KEY_PREFIX + draft.language + (draft.plan === 'B' ? ':B' : ''), JSON.stringify(draft));
}

export function resetCvDraft(language: CvLanguage, plan: CvPlan = 'A'): CvDraft {
  localStorage.removeItem(KEY_PREFIX + language + (plan === 'B' ? ':B' : ''));
  return freshCvDraft(language, plan);
}
