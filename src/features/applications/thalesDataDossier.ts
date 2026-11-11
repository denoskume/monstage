import type { CvDraft, CvLanguage } from '../cv/cvStorage';
import type { CoverLetterDraft } from '../cl/clStorage';
import { freshCoverLetter } from '../cl/clStorage';
import { loadApplicationDossier, saveApplicationDossier } from './applicationDossiers';
import { buildEdfEodCv } from './edfEodDossier';
import { selectedCertifications } from '../cv/cvEvidenceCatalog';

// The user's EDF CV is the verified presentation baseline. This separate,
// per-offer dossier cannot modify the EDF dossier or either master CV.
export const THALES_DATA_DOSSIER_ID = 'external:thales:ai-data:R0343178';
export const THALES_DATA_TITLE = 'Stage – Intelligence Artificielle & Analyse de données (H/F)';

export function buildThalesDataCv(language: CvLanguage = 'FR'): CvDraft {
  const fr = language === 'FR';
  const draft = buildEdfEodCv(language);
  draft.headline = fr
    ? 'Analyse de données | SQL & Python | Qualité des données'
    : 'Data Analysis | SQL & Python | Data Quality';
  draft.summary = fr
    ? "Je souhaite mobiliser SQL, Python et l'analyse de données pour contrôler la cohérence de bases industrielles, repérer les informations manquantes et automatiser des restitutions utiles aux équipes. En dernière année du MSc Control and Robotics à Centrale Nantes, je recherche un stage de six mois dès février 2027."
    : "I aim to use SQL, Python and data analysis to check industrial data consistency, identify missing information and automate useful reporting for operational teams. I am a final-year MSc Control and Robotics student at Centrale Nantes seeking a six-month internship from February 2027.";
  draft.keySkills = fr
    ? 'SQL · Python · Analyse de données · Contrôles de cohérence · Automatisation'
    : 'SQL · Python · Data Analysis · Consistency Checks · Automation';
  // Strategic application: one directly relevant and defensible project.
  // Avoid copying the EDF project list into an unrelated Thales application.
  const monstage = draft.projects.find(project => project.id === 'monstage');
  if (!monstage) throw new Error('Thales CV requires the verified MonStage project');
  draft.projects = [{
    ...monstage,
    name: fr ? 'MonStage — Automatisation et qualité des données'
      : 'MonStage — Data Automation and Data Quality',
    period: fr ? '2026–En cours' : '2026–Present',
    description: fr
      ? 'Plateforme de collecte multi-sources, de contrôle de cohérence et de suivi des candidatures.'
      : 'Platform for multi-source data collection, consistency checks and application tracking.',
    bullets: fr ? [
      'Structuré des offres multi-sources par entreprise, poste, localisation, date et statut pour centraliser leur suivi.',
      'Développé des filtres multicritères et des contrôles de cohérence pour fiabiliser les informations exploitées.',
      'Automatisé la collecte et la synchronisation des offres et statuts avec Google Apps Script et des flux API.',
      'Conçu un tableau de bord et un dossier par candidature pour prioriser les actions et tracer les documents.',
    ] : [
      'Structured multi-source job postings by company, role, location, date and status for centralized tracking.',
      'Built multi-criteria filters and consistency checks to improve the reliability of information used.',
      'Automated collection and synchronization of postings and statuses with Google Apps Script and API feeds.',
      'Built a dashboard and per-application dossier to prioritize actions and track supporting documents.',
    ],
  }];

  // Two one-line education summaries and only courses relevant to this offer.
  // Course labels are deliberately shortened, without inventing new subjects.
  draft.education = draft.education.map(entry => ({
    ...entry,
    details: entry.id === 'ecn'
      ? (fr ? 'Analyse de données, apprentissage automatique et méthodes statistiques appliquées.'
        : 'Applied data analysis, machine learning and statistical methods.')
      : entry.id === 'kju'
        ? (fr ? 'Programmation, bases de données et traitement de données.'
          : 'Programming, databases and data processing.')
        : entry.details,
    keyCourses: entry.id === 'ecn'
      ? (fr ? 'Analyse de données · Machine Learning · Méthodes stochastiques'
        : 'Data Analysis · Machine Learning · Stochastic Methods')
      : entry.id === 'kju'
        ? (fr ? 'Bases de données · Programmation Python'
          : 'Databases · Python Programming')
        : entry.keyCourses,
  }));
  draft.skills = fr
    ? '**SQL & bases de données :** SQL, jointures, agrégations, sous-requêtes, extraction et contrôle des données\n**Python & analyse :** Python, pandas, NumPy, nettoyage, analyse exploratoire, détection d’anomalies\n**ML & outils :** scikit-learn, statistiques, régression, Matplotlib, Jupyter, Git'
    : '**SQL & databases:** SQL, joins, aggregations, subqueries, data extraction and validation\n**Python & analysis:** Python, pandas, NumPy, cleaning, exploratory analysis, anomaly detection\n**ML & tools:** scikit-learn, statistics, regression, Matplotlib, Jupyter, Git';
  // These certificates were verified against the PDFs provided by the
  // candidate on 11 November 2026. Keep the Thales CV concise (two only);
  // all five certificates remain available in the Studio catalog.
  draft.certifications = selectedCertifications(['google-advanced', 'sql-az']);
  draft.sectionOrder = ['education', 'experience', 'projects', 'skills', 'certifications', 'languages'];
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
    "Mon parcours en informatique et en data science comprend SQL (jointures, agrégations et sous-requêtes), Python, statistiques et machine learning. J'ai également obtenu une certification SQL. Lors de mon stage Data Analyst, j'ai travaillé sur la préparation, l'analyse et la visualisation de données. J'ai aussi développé MonStage, une plateforme personnelle combinant collecte multi-sources, filtres et contrôles de cohérence, ainsi qu'une étude de cas de modélisation de coûts hospitaliers avec scikit-learn. Ces expériences m'ont appris à vérifier les résultats et à documenter les choix techniques.",
    "Rigoureux, curieux et conscient des compétences qu'il me reste à développer, je serais heureux d'apprendre auprès de votre équipe et de contribuer à des solutions utiles, pragmatiques et maintenables. Je serais ravi d'échanger avec vous sur ma candidature.",
  ] : [
    "I am completing my MSc Control and Robotics, specializing in Data Science, Signal & Image Processing at Centrale Nantes, and seeking a six-month final-year internship from February 2027. Your AI and data analysis internship in Cannes interests me because it addresses practical operational needs in the space industry.",
    "Within Bids & Programs Management, identifying missing or inconsistent information, improving database reliability and prioritizing updates are meaningful challenges. I would like to help explore the existing data, evaluate analytical and algorithmic checks, and present useful findings to operational teams.",
    "My computer science and data science training covers SQL (joins, aggregations and subqueries), Python, statistics and machine learning, and I have also earned a SQL course certificate. During my Data Analyst internship, I worked on data preparation, analysis and visualization. I also built MonStage, a personal multi-source tracking platform with filtering and consistency checks, and completed a predictive hospital-cost modeling case study using scikit-learn. These projects taught me to verify results and document technical decisions.",
    "I am curious, rigorous and motivated to keep learning. I would welcome the opportunity to contribute to practical, maintainable solutions with your team and discuss my application.",
  ];
  letter.closing = fr
    ? "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
    : 'Yours sincerely,';
  return letter;
}

// Revision marker is based on content, so old browser drafts created before
// version metadata existed can be recognized without destroying user edits.
export const THALES_CV_REVISION = 2;

export function isCurrentThalesCv(cv: CvDraft): boolean {
  const monstage = cv.projects.find(project => project.id === 'monstage');
  const degree = cv.education.find(item => item.id === 'ecn');
  const bachelor = cv.education.find(item => item.id === 'kju');
  const fr = cv.language === 'FR';
  return cv.projects.length === 1
    && monstage?.bullets.length === 4
    && monstage.bullets.some(bullet => bullet.includes(fr ? 'tableau de bord' : 'dashboard'))
    && Boolean(degree?.keyCourses?.includes(fr ? 'Analyse de données' : 'Data Analysis'))
    && Boolean(bachelor?.keyCourses?.includes(fr ? 'Bases de données' : 'Databases'))
    && !/Java|PHP/i.test(bachelor?.keyCourses ?? '');
}

// Only classify the *original auto-generated* Thales CV as safe for automatic
// migration. A user's edited project or course selection needs explicit consent.
export function isLegacyGeneratedThalesCv(cv: CvDraft): boolean {
  const monstage = cv.projects.find(project => project.id === 'monstage');
  const insurance = cv.projects.find(project => project.id === 'insurance');
  const bachelor = cv.education.find(entry => entry.id === 'kju');
  const language = cv.language;
  return cv.projects.length === 2
    && Boolean(insurance && monstage)
    && monstage?.bullets.length === 3
    && monstage.bullets[0] === (language === 'FR'
      ? 'Centralisé des données issues de plusieurs sources dans un outil de suivi structuré.'
      : 'Centralized data from multiple sources in a structured tracking platform.')
    && monstage.bullets[1] === (language === 'FR'
      ? 'Développé des filtres multicritères et des contrôles de cohérence des informations.'
      : 'Implemented multi-criteria filters and information consistency checks.')
    && Boolean(bachelor?.keyCourses?.includes('Programming (C, Java, PHP, Python)'));
}

// Keep personal contact details, the user's chosen visual design, the original
// work experiences and the existing cover letter intact. Only replace the
// sections the user explicitly asked to retarget for Thales.
export function refreshThalesCvContent(previous: CvDraft): CvDraft {
  const target = buildThalesDataCv(previous.language);
  return {
    ...previous,
    projects: target.projects,
    education: previous.education.map(entry => {
      const relevant = target.education.find(candidate => candidate.id === entry.id);
      if (!relevant) return entry;
      return { ...entry, details: relevant.details, keyCourses: relevant.keyCourses };
    }),
    sectionOrder: target.sectionOrder,
  };
}

export function prepareThalesDataDossier(language: CvLanguage = 'FR') {
  const existing = loadApplicationDossier(THALES_DATA_DOSSIER_ID, language);
  if (existing) {
    // Refresh only recognizable old generator output, not hand-edited dossiers.
    if (isLegacyGeneratedThalesCv(existing.cv)) {
      const updated = {
        ...existing,
        cv: refreshThalesCvContent(existing.cv),
        selectionReasons: language === 'FR'
          ? ['MonStage : structuration de données multi-sources, contrôles, automatisation et tableau de bord']
          : ['MonStage: multi-source data structuring, validation, automation and reporting dashboard'],
      };
      saveApplicationDossier(updated);
      return updated;
    }
    return existing;
  }
  const dossier = {
    offerId: THALES_DATA_DOSSIER_ID,
    company: 'Thales Alenia Space',
    title: THALES_DATA_TITLE,
    language,
    cv: buildThalesDataCv(language),
    letter: buildThalesDataLetter(language),
    selectionReasons: language === 'FR'
      ? ['MonStage : structuration de données multi-sources, contrôles, automatisation et tableau de bord']
      : ['MonStage: multi-source data structuring, validation, automation and reporting dashboard'],
    state: 'awaiting_review' as const,
    preparedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveApplicationDossier(dossier);
  return dossier;
}
