import type { CvDraft, CvLanguage } from '../cv/cvStorage';
import type { CoverLetterDraft } from '../cl/clStorage';
import { freshCoverLetter } from '../cl/clStorage';
import { loadApplicationDossier, saveApplicationDossier } from './applicationDossiers';
import { buildEdfEodCv } from './edfEodDossier';

// The user's EDF CV is the verified presentation baseline. This separate,
// per-offer dossier cannot modify the EDF dossier or either master CV.
export const THALES_DATA_DOSSIER_ID = 'external:thales:ai-data:R0343178';
export const THALES_DATA_TITLE = 'Stage – Intelligence Artificielle & Analyse de données (H/F)';

export function buildThalesDataCv(language: CvLanguage = 'FR'): CvDraft {
  const fr = language === 'FR';
  const draft = buildEdfEodCv(language);
  draft.headline = fr
    ? 'Data Science | Qualité des données | Python'
    : 'Data Science | Data Quality | Python';
  draft.summary = fr
    ? "Je souhaite appliquer Python, l'analyse de données et l'automatisation à la fiabilisation de bases industrielles, à la détection d'incohérences et à la restitution d'informations utiles aux équipes. En dernière année du MSc Control and Robotics à Centrale Nantes, je recherche un stage de six mois dès février 2027."
    : "I want to apply Python, data analysis and automation to improve industrial data quality, identify inconsistencies and deliver useful information to operational teams. I am a final-year MSc Control and Robotics student at Centrale Nantes seeking a six-month internship from February 2027.";
  draft.keySkills = fr
    ? 'Python · Analyse exploratoire · Qualité des données · Automatisation · ML'
    : 'Python · Exploratory Analysis · Data Quality · Automation · ML';
  // The EDF baseline contains only demonstrable experience and projects.
  // Put the automation/data-quality project first for this specific role.
  draft.projects = [...draft.projects].sort((a, b) => a.id === 'monstage' ? -1 : b.id === 'monstage' ? 1 : 0);
  draft.projects = draft.projects.map(project => project.id === 'monstage' ? {
    ...project,
    name: fr ? 'MonStage — Automatisation et qualité des données' : 'MonStage — Data Automation and Quality',
    description: fr
      ? 'Plateforme personnelle de collecte, de structuration et de suivi de données multi-sources.'
      : 'Personal platform for collecting, structuring and tracking multi-source data.',
    bullets: fr ? [
      'Centralisé des données issues de plusieurs sources dans un outil de suivi structuré.',
      'Développé des filtres multicritères et des contrôles de cohérence des informations.',
      'Automatisé le suivi des candidatures et la préparation de documents avec React/TypeScript et Google Sheets.',
    ] : [
      'Centralized data from multiple sources in a structured tracking platform.',
      'Implemented multi-criteria filters and information consistency checks.',
      'Automated application tracking and document preparation using React/TypeScript and Google Sheets.',
    ],
  } : project);
  draft.skills = fr
    ? '**Python & données :** Python, pandas, NumPy, SQL, nettoyage, jointures, agrégations\n**Analyse & contrôle :** analyse exploratoire, cohérence des données, statistiques, détection d’anomalies\n**ML & outils :** scikit-learn, régression, évaluation de modèles, Matplotlib, Jupyter, Git'
    : '**Python & data:** Python, pandas, NumPy, SQL, cleaning, joins, aggregations\n**Analysis & checks:** exploratory analysis, data consistency, statistics, anomaly detection\n**ML & tools:** scikit-learn, regression, model evaluation, Matplotlib, Jupyter, Git';
  draft.certifications = [];
  draft.sectionOrder = ['education', 'projects', 'experience', 'skills', 'languages'];
  return draft;
}

export function buildThalesDataLetter(language: CvLanguage = 'FR'): CoverLetterDraft {
  const fr = language === 'FR';
  const letter = freshCoverLetter(language);
  letter.date = new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  letter.company = 'Thales Alenia Space';
  letter.team = 'Direction Bids & Programs Management (BPM)';
  letter.recipientName = '';
  letter.recipientRole = fr ? "À l'attention de l'équipe de recrutement" : 'Recruitment Team';
  letter.recipientLocation = 'Cannes, France';
  letter.internshipTitle = THALES_DATA_TITLE + ' — Réf. R0343178';
  letter.greeting = fr ? 'Madame, Monsieur,' : 'Dear Hiring Team,';
  letter.paragraphs = fr ? [
    "Actuellement en dernière année du MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d'études de six mois dès février 2027. Votre offre en intelligence artificielle et analyse de données à Cannes a retenu mon attention pour son ancrage dans les besoins opérationnels du secteur spatial.",
    "Au sein de la direction Bids & Programs Management, identifier des informations manquantes ou incohérentes, améliorer la fiabilité des bases et faciliter leur mise à jour représente un défi concret. J'aimerais contribuer à l'exploration des données existantes, à l'évaluation de contrôles et d'approches algorithmiques, puis à des restitutions simples pour les équipes.",
    "Ma formation en data science et mon BSc en informatique et électronique m'ont apporté des bases en Python, statistiques et machine learning. Lors de mon stage Data Analyst, j'ai travaillé sur la préparation, l'analyse et la visualisation de données. J'ai aussi développé MonStage, une plateforme personnelle combinant collecte multi-sources, filtres et contrôles de cohérence, ainsi qu'une étude de cas de modélisation de coûts hospitaliers avec scikit-learn. Ces expériences m'ont appris à vérifier les résultats et à documenter les choix techniques.",
    "Rigoureux, curieux et conscient des compétences qu'il me reste à développer, je serais heureux d'apprendre auprès de votre équipe et de contribuer à des solutions utiles, pragmatiques et maintenables. Je serais ravi d'échanger avec vous sur ma candidature.",
  ] : [
    "I am completing my MSc Control and Robotics, specializing in Data Science, Signal & Image Processing at Centrale Nantes, and seeking a six-month final-year internship from February 2027. Your AI and data analysis internship in Cannes interests me because it addresses practical operational needs in the space industry.",
    "Within Bids & Programs Management, identifying missing or inconsistent information, improving database reliability and prioritizing updates are meaningful challenges. I would like to help explore the existing data, evaluate analytical and algorithmic checks, and present useful findings to operational teams.",
    "My MSc and BSc in Computer Science & Electronics have given me foundations in Python, statistics and machine learning. During my Data Analyst internship, I worked on data preparation, analysis and visualization. I also built MonStage, a personal multi-source tracking platform with filtering and consistency checks, and completed a predictive hospital-cost modeling case study using scikit-learn. These projects taught me to verify results and document technical decisions.",
    "I am curious, rigorous and motivated to keep learning. I would welcome the opportunity to contribute to practical, maintainable solutions with your team and discuss my application.",
  ];
  letter.closing = fr
    ? "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
    : 'Yours sincerely,';
  return letter;
}

export function prepareThalesDataDossier(language: CvLanguage = 'FR') {
  const existing = loadApplicationDossier(THALES_DATA_DOSSIER_ID, language);
  if (existing) return existing; // Never overwrite the user's reviewed edits.
  const dossier = {
    offerId: THALES_DATA_DOSSIER_ID,
    company: 'Thales Alenia Space',
    title: THALES_DATA_TITLE,
    language,
    cv: buildThalesDataCv(language),
    letter: buildThalesDataLetter(language),
    selectionReasons: language === 'FR'
      ? ['MonStage : collecte, contrôles de cohérence et automatisation', 'Modélisation prédictive : analyse de données et évaluation de modèles']
      : ['MonStage: data integration, consistency checks and automation', 'Predictive modeling: data analysis and model evaluation'],
    state: 'awaiting_review' as const,
    preparedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveApplicationDossier(dossier);
  return dossier;
}
