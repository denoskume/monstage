import type { CvDraft, CvLanguage } from '../cv/cvStorage';
import { defaultCvFr, freshPlanBCvDraft, loadCvDraft } from '../cv/cvStorage';
import type { CoverLetterDraft } from '../cl/clStorage';
import { freshCoverLetter } from '../cl/clStorage';
import { loadApplicationDossier, saveApplicationDossier } from './applicationDossiers';

// EDF 2026-185820 is a one-off targeted application: outside the 30-company feed.
// Its drafts are kept in an application dossier, never in either master CV.
export const EDF_EOD_DOSSIER_ID = 'external:edf:eod:2026-185820';
export const EDF_EOD_TITLE = 'STAGE - Prévision de la consommation France au sein de l’Équilibre Offre-Demande (ÉOD) Moyen Terme F/H';

export function buildEdfEodCv(language: CvLanguage = 'FR'): CvDraft {
  const fr = language === 'FR';
  // Carry over the existing Plan B presentation, contact data and layout.
  const draft = structuredClone(loadCvDraft(language, 'B'));
  const reference = freshPlanBCvDraft(language);
  draft.plan = 'B';
  draft.template = draft.template ?? 'modern';
  draft.pageColor = 'white';
  draft.summaryHeading = 'profile';
  draft.headline = fr
    ? 'Data Science | Prévision & modélisation | Python'
    : 'Data Science | Forecasting & Modeling | Python';
  draft.summary = fr
    ? 'Étudiant en dernière année du MSc Control and Robotics à Centrale Nantes, parcours Data Science, Signal & Image Processing, je recherche un stage de six mois dès février 2027 pour contribuer avec Python à l’exploitation des données, à la modélisation et à la prévision de consommation électrique.'
    : 'Final-year MSc Control and Robotics student at Centrale Nantes (Data Science, Signal & Image Processing), seeking a six-month internship from February 2027 to contribute to data processing, modeling and electricity consumption forecasting with Python.';
  draft.keySkills = fr
    ? 'Python · Analyse de données · Modélisation · SQL · Visualisation'
    : 'Python · Data Analysis · Modeling · SQL · Visualization';

  // Retain the degrees, institutions and dates from the user's Plan B CV.
  draft.education = reference.education.map(entry => ({
    ...entry,
    details: entry.id === 'ecn'
      ? (fr ? 'Formation en analyse de données, apprentissage automatique, méthodes stochastiques et optimisation numérique.'
        : 'Studies in data analysis, machine learning, stochastic methods and numerical optimization.')
      : (fr ? 'Bases en programmation Python, systèmes de bases de données, algorithmique et développement logiciel.'
        : 'Foundations in Python, database systems, algorithms and software development.'),
    keyCourses: entry.id === 'ecn'
      ? 'Data Analysis · Machine Learning · Stochastic Methods · Numerical Optimization'
      : 'Python Programming · Database Management Systems · Data Structures',
  }));

  // Only substantiated contributions: no claim of electricity forecasting or
  // professional time-series experience. Three bullets plus a one-line summary.
  draft.projects = fr ? [
    {
      id: 'insurance',
      name: 'Modélisation prédictive — Analyse de coûts hospitaliers',
      period: '2026',
      description: '',
      bullets: [
        'Préparé les données et constitué des jeux d’entraînement et de test séparés par patient.',
        'Développé et comparé des modèles de prédiction de coûts et de détection des coûts élevés avec scikit-learn.',
        'Évalué les résultats avec MAE, RMSE, R² et PR-AUC ; obtenu R² = 0,926 sur le test de régression.',
      ],
    },
    {
      id: 'monstage',
      name: 'MonStage — Automatisation et exploitation de données',
      period: '2026–En cours',
      description: '',
      bullets: [
        'Centralisé des données issues de plusieurs sources dans un outil de suivi structuré.',
        'Développé des filtres multicritères et des contrôles pour améliorer la cohérence des informations.',
        'Automatisé le suivi des candidatures et la préparation de documents grâce à React/TypeScript et Google Sheets.',
      ],
    },
  ] : [
    {
      id: 'insurance', name: 'Predictive Modeling — Hospital Cost Analysis', period: '2026',
      description: '',
      bullets: [
        'Prepared data with patient-separated training and test sets.',
        'Built and compared cost regression and high-cost classification models using scikit-learn.',
        'Evaluated MAE, RMSE, R² and PR-AUC; obtained R² = 0.926 on the regression test set.',
      ],
    },
    {
      id: 'monstage', name: 'MonStage — Data Workflow Automation', period: '2026–Present',
      description: '',
      bullets: [
        'Centralized multi-source data in a structured tracking application.',
        'Implemented multi-criteria filtering and data consistency checks.',
        'Automated application tracking and document preparation with React/TypeScript and Google Sheets.',
      ],
    },
  ];

  // Use the previously verified master-CV experience, not speculative DAX/SQL
  // claims in other optional Plan B variants.
  if (fr) {
    draft.experience = [...defaultCvFr.experience].reverse().map(item => ({
      ...structuredClone(item),
      period: item.id === 'rws' ? 'Août 2026' : item.period,
      description: '',
      bullets: item.bullets.slice(0, 3),
    }));
  } else {
    draft.experience = reference.experience.map(item => ({
      ...item,
      bullets: item.id === 'unified' ? [
        'Cleaned and structured datasets using Python and pandas.',
        'Performed exploratory analysis to identify trends and anomalies.',
        'Created visualizations and clear reports to communicate findings.',
      ] : [
        'Evaluated model responses using consistent quality criteria.',
        'Identified errors and recurring limitations across outputs.',
        'Documented judgments with concise, evidence-based explanations.',
      ],
      period: item.id === 'rws' ? 'Aug 2026' : item.period,
      description: '',
    }));
  }
  draft.skills = fr
    ? '**Programmation & données :** Python, pandas, NumPy, SQL (bases)\n**Analyse & modélisation :** statistiques, régression, évaluation de modèles\n**Machine Learning :** scikit-learn, PyTorch\n**Visualisation & outils :** Matplotlib, Jupyter, Git, Linux'
    : '**Programming & data:** Python, pandas, NumPy, SQL (fundamentals)\n**Analysis & modeling:** statistics, regression, model evaluation\n**Machine Learning:** scikit-learn, PyTorch\n**Visualization & tools:** Matplotlib, Jupyter, Git, Linux';
  draft.leadership = [];
  draft.interests = '';
  draft.education = draft.education.map(item => item.id === 'kju' ? { ...item, details: '' } : item);
  draft.sectionOrder = ['education', 'projects', 'experience', 'skills', 'languages', 'interests'];
  return draft;
}

export function buildEdfEodLetter(language: CvLanguage = 'FR'): CoverLetterDraft {
  const fr = language === 'FR';
  const letter = freshCoverLetter(language);
  letter.date = new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  letter.company = 'EDF';
  letter.team = fr ? 'DOAAT — SoDATA, Équipe Expertises & Prévisions' : 'DOAAT — SoDATA, Expertise & Forecasting Team';
  letter.recipientRole = fr ? 'À l’attention de l’équipe de recrutement' : 'Recruitment Team';
  letter.recipientLocation = 'Saint-Denis, France';
  letter.internshipTitle = EDF_EOD_TITLE + ' — Réf. 2026-185820';
  letter.greeting = fr ? 'Madame, Monsieur,' : 'Dear Hiring Team,';
  letter.paragraphs = fr ? [
    'Actuellement en dernière année du MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Je vous adresse ma candidature pour le stage de prévision de la consommation France au sein de l’Équilibre Offre-Demande Moyen Terme (réf. 2026-185820).',
    'Ce qui m’attire dans cette mission, c’est le lien direct entre les données, les modèles et les décisions opérationnelles. Anticiper l’évolution de la consommation électrique sur plusieurs années, dans un contexte de transformation des usages, est un sujet que je souhaite découvrir. Le travail de votre équipe sur l’intégration de nouvelles données et l’amélioration des outils Python correspond à ce que je recherche.',
    'Ma formation m’apporte des bases en analyse de données, machine learning, méthodes stochastiques et optimisation. Lors de mon stage en analyse de données, j’ai travaillé sur le nettoyage, l’exploration et la visualisation de jeux de données avec Python. Dans un projet personnel de modélisation prédictive, j’ai comparé des modèles de régression et évalué leurs résultats. MonStage m’a également permis de développer des flux de données automatisés. Je n’ai pas encore d’expérience en prévision de la demande électrique, mais je souhaite apprendre vos méthodes et contribuer avec rigueur.',
    'Je serais heureux de rejoindre l’équipe SoDATA, de travailler aux côtés des référents métier et d’échanger avec les ingénieurs-chercheurs de la R&D. Je vous remercie pour l’attention portée à ma candidature et serais ravi de présenter plus en détail ma motivation lors d’un entretien.',
  ] : [
    'I am in the final year of my MSc Control and Robotics at Centrale Nantes, specializing in Data Science, Signal & Image Processing, and seeking a six-month internship from February 2027. I am applying for the EDF medium-term electricity consumption forecasting internship (ref. 2026-185820).',
    'I am drawn to the close connection between data, models and operational decisions. Forecasting electricity demand over several years as consumption patterns change is exactly the kind of real-world problem I would like to learn about. I am particularly interested in your team’s work on integrating new data and improving Python tools.',
    'My studies cover data analysis, machine learning, stochastic methods and numerical optimization. In my Data Analyst internship I cleaned, explored and visualized datasets using Python. I have also evaluated regression models on a predictive modeling project, and automated data workflows through MonStage. While I have not yet worked on electricity demand forecasting, I am eager to learn your methods and contribute carefully.',
    'I would welcome the opportunity to join SoDATA, work alongside operational specialists and interact with R&D engineers. Thank you for considering my application. I would be happy to discuss my motivation in an interview.',
  ];
  letter.closing = fr ? 'Bien cordialement,' : 'Kind regards,';
  return letter;
}

// Surgical migration of the first EDF export: preserve all user-edited project
// names, dates, bullets, contacts, and the existing letter. Only compact default
// boilerplate that caused the CV to spill onto a mostly empty second page.
function compactExistingEdfCv(cv: CvDraft): CvDraft {
  const next = structuredClone(cv);
  const oldSummary = 'Étudiant en dernière année de MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Je souhaite appliquer Python, l’analyse de données et la modélisation à la prévision de consommation électrique, tout en développant mes compétences auprès d’une équipe opérationnelle.';
  if (next.summary === oldSummary) next.summary = 'Étudiant en dernière année du MSc Control and Robotics à Centrale Nantes, parcours Data Science, Signal & Image Processing, je recherche un stage de six mois dès février 2027 pour contribuer avec Python à l’exploitation des données, à la modélisation et à la prévision de consommation électrique.';
  const descriptions = new Set([
    'Modèles de régression et de classification sur des données structurées.',
    'Plateforme personnelle de collecte et de suivi d’offres de stage.',
    'Regression and classification models on structured data.',
    'Personal platform aggregating and tracking internship offers.',
    'Nettoyage, analyse exploratoire et visualisation de données.',
    'Évaluation structurée de réponses de modèles d’intelligence artificielle.',
    'Data preparation, exploratory analysis and visualization.',
    'Structured evaluation of AI model outputs.',
  ]);
  next.projects = next.projects.map(p => descriptions.has(p.description ?? '') ? { ...p, description: '' } : p);
  next.experience = next.experience.map(e => descriptions.has(e.description ?? '') ? { ...e, description: '' } : e);
  next.education = next.education.map(e => e.id === 'kju' && /^(Bases en programmation Python, systèmes de bases de données, algorithmique et développement logiciel\\.|Foundations in Python, database systems, algorithms and software development\\.)$/.test(e.details) ? { ...e, details: '' } : e);
  if (next.skills === '**Programmation & données :** Python, pandas, NumPy, SQL (bases)\\n**Analyse & modélisation :** statistiques, régression, évaluation de modèles\\n**Machine Learning :** scikit-learn, PyTorch\\n**Visualisation & outils :** Matplotlib, Jupyter, Git, Linux') {
    next.skills = '**Python & données :** Python, pandas, NumPy, SQL (bases)\\n**Modélisation & ML :** statistiques, régression, scikit-learn, évaluation de modèles\\n**Visualisation & outils :** Matplotlib, Jupyter, Git, Linux, PyTorch';
  }
  if (next.interests === 'Négociation • Échanges interculturels • Cuisine') next.interests = '';
  return next;
}

export function prepareEdfEodDossier(language: CvLanguage = 'FR') {
  const existing = loadApplicationDossier(EDF_EOD_DOSSIER_ID, language);
  if (existing) {
    const nextCv = compactExistingEdfCv(existing.cv);
    if (JSON.stringify(nextCv) !== JSON.stringify(existing.cv)) {
      const updated = { ...existing, cv: nextCv };
      saveApplicationDossier(updated);
      return updated;
    }
    return existing;
  }
  const cv = buildEdfEodCv(language);
  const letter = buildEdfEodLetter(language);
  const dossier = {
    offerId: EDF_EOD_DOSSIER_ID, company: 'EDF', title: EDF_EOD_TITLE,
    language, cv, letter,
    selectionReasons: ['Prédiction et évaluation de modèles', 'Automatisation et structuration de données'],
    state: 'awaiting_review' as const,
    preparedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  saveApplicationDossier(dossier);
  return dossier;
}
