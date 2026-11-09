import type { CvDraft, CvLanguage } from '../cv/cvStorage';
import { defaultCvFr, freshPlanBCvDraft, loadCvDraft } from '../cv/cvStorage';
import type { CoverLetterDraft } from '../cl/clStorage';
import { freshCoverLetter } from '../cl/clStorage';
import { loadApplicationDossier, saveApplicationDossier } from './applicationDossiers';
import { cvPresets, selectedCertifications } from '../cv/cvEvidenceCatalog';

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
  draft.showMissionLabels = false;
  draft.headline = fr
    ? 'Data Science | Prévision & modélisation | Python'
    : 'Data Science | Forecasting & Modeling | Python';
  draft.summary = fr
    ? 'La prévision de la consommation électrique à moyen terme m’intéresse particulièrement, notamment à travers l’analyse de nouvelles données, l’optimisation des flux de traitement et le développement d’outils Python utiles aux équipes opérationnelles. Je souhaite contribuer à ces travaux d’Équilibre Offre-Demande dans le cadre d’un stage de fin d’études de six mois dès février 2027.'
    : 'Medium-term electricity consumption forecasting interests me particularly, from analyzing new data and improving data-processing flows to building Python tools for operational teams. I would like to contribute to this supply-demand balancing work through a six-month final-year internship starting in February 2027.';
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
      ? cvPresets.EDF.ecn.join(' · ')
      : cvPresets.EDF.kju.join(' · '),
  }));

  // Only substantiated contributions: no claim of electricity forecasting or
  // professional time-series experience. Three bullets plus a one-line summary.
  draft.projects = fr ? [
    {
      id: 'insurance',
      name: 'Étude de cas — Modélisation prédictive de coûts hospitaliers',
      period: '2026',
      description: 'Étude de cas : modélisation de coûts hospitaliers à partir de données structurées.',
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
      description: 'Plateforme personnelle de collecte, d’automatisation et de suivi des offres de stage.',
      bullets: [
        'Centralisé des données issues de plusieurs sources dans un outil de suivi structuré.',
        'Développé des filtres multicritères et des contrôles pour améliorer la cohérence des informations.',
        'Automatisé le suivi des candidatures et la préparation de documents grâce à React/TypeScript et Google Sheets.',
      ],
    },
  ] : [
    {
      id: 'insurance', name: 'Case Study — Predictive Hospital Cost Modeling', period: '2026',
      description: 'Case study: predictive hospital cost modeling using structured data.',
      bullets: [
        'Prepared data with patient-separated training and test sets.',
        'Built and compared cost regression and high-cost classification models using scikit-learn.',
        'Evaluated MAE, RMSE, R² and PR-AUC; obtained R² = 0.926 on the regression test set.',
      ],
    },
    {
      id: 'monstage', name: 'MonStage — Data Workflow Automation', period: '2026–Present',
      description: 'Personal platform for collecting, automating and tracking internship offers.',
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
      description: item.id === 'unified' ? 'Préparation, analyse exploratoire et visualisation de données avec Python.' : 'Évaluation de réponses de modèles d’IA selon des critères de qualité définis.',
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
      description: item.id === 'unified' ? 'Data cleaning, exploratory analysis and visualization using Python.' : 'Evaluation of AI model outputs against defined quality criteria.',
    }));
  }
  draft.skills = fr
    ? '**Python & données :** Python, pandas, NumPy, SQL, jointures, agrégations, sous-requêtes\n**Modélisation & ML :** statistiques, régression, scikit-learn, évaluation de modèles\n**Visualisation & outils :** Matplotlib, Jupyter, Git, Linux, PyTorch'
    : '**Python & data:** Python, pandas, NumPy, SQL, joins, aggregations, subqueries\n**Modeling & ML:** statistics, regression, scikit-learn, model evaluation\n**Visualization & tools:** Matplotlib, Jupyter, Git, Linux, PyTorch';
  draft.leadership = [];
  draft.certifications = selectedCertifications(cvPresets.EDF.certificates);
  draft.interests = '';
  draft.education = draft.education.map(item => item.id === 'kju' ? { ...item, details: '' } : item);
  draft.sectionOrder = ['education', 'projects', 'experience', 'skills', 'certifications', 'languages', 'interests'];
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
    "Actuellement en dernière année du MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Votre offre de stage consacrée à la prévision de la consommation électrique en France a particulièrement retenu mon attention.",
    "Prévoir l’évolution de la consommation à moyen terme pour contribuer à l’équilibre entre l’offre et la demande représente un sujet concret qui m’intéresse. Le travail sur les données de consommation, l’amélioration des traitements et le développement d’outils de prévision en Python correspondent aux missions que j’aimerais découvrir au sein de votre équipe SoDATA.",
    "Ma formation, complétée par un BSc en informatique et électronique, m’a apporté des bases en programmation, statistiques, analyse de données et modélisation. Lors de mon stage Data Analyst, j’ai travaillé sur la préparation, l’analyse et la visualisation de données avec Python. J’ai également comparé des modèles de régression dans une étude de cas sur les coûts hospitaliers et développé MonStage, une plateforme personnelle qui automatise la collecte et le suivi de données. Ces expériences m’ont appris à vérifier mes résultats et à documenter mon travail.",
    "Curieux, rigoureux et conscient des compétences qu’il me reste à développer, je serais heureux de rejoindre votre équipe, d’apprendre vos méthodes de prévision et de contribuer à vos travaux. Je reste disponible pour échanger avec vous sur ma candidature et sur les possibilités de stage au sein d’EDF.",
  ] : [
    "I am currently completing my MSc Control and Robotics, specializing in Data Science, Signal & Image Processing at Centrale Nantes. I am looking for a six-month final-year internship starting in February 2027. Your internship focused on forecasting electricity consumption in France particularly caught my attention.",
    "Forecasting medium-term consumption to support the balance between electricity supply and demand is a practical challenge I would like to explore. Working with consumption data, improving data-processing workflows, and developing forecasting tools in Python are closely aligned with what I hope to learn within your SoDATA team.",
    "My studies, alongside a BSc in Computer Science & Electronics, have given me foundations in programming, statistics, data analysis and modeling. During my Data Analyst internship I worked on data preparation, analysis and visualization with Python. I also compared regression models in a hospital-cost case study and built MonStage, a personal platform that automates data collection and tracking. These experiences taught me to check my results carefully and document my work.",
    "I am curious, thorough and aware that I still have much to learn. I would be pleased to join your team, learn your forecasting methods and contribute to your work. I would welcome the opportunity to discuss my application with you.",
  ];
  letter.closing = fr
    ? 'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.'
    : 'Yours sincerely,';
  return letter;
}

// Surgical migration of the first EDF export: preserve all user-edited project
// names, dates, bullets, contacts, and the existing letter. Only compact default
// boilerplate that caused the CV to spill onto a mostly empty second page.
function compactExistingEdfCv(cv: CvDraft): CvDraft {
  const next = structuredClone(cv);
  const oldSummary = 'Étudiant en dernière année de MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Je souhaite appliquer Python, l’analyse de données et la modélisation à la prévision de consommation électrique, tout en développant mes compétences auprès d’une équipe opérationnelle.';
  // Refresh previous generated EDF profiles only; keep manually edited profiles.
  const previousGeneratedProfiles = [oldSummary, 'Étudiant en dernière année du MSc Control and Robotics à Centrale Nantes, parcours Data Science, Signal & Image Processing, je recherche un stage de six mois dès février 2027 pour contribuer avec Python à l’exploitation des données, à la modélisation et à la prévision de consommation électrique.', 'Final-year MSc Control and Robotics student at Centrale Nantes (Data Science, Signal & Image Processing), seeking a six-month internship from February 2027 to contribute to data processing, modeling and electricity consumption forecasting with Python.'];
  if (previousGeneratedProfiles.includes(next.summary)) {
    next.summary = next.language === 'FR'
      ? 'La prévision de la consommation électrique à moyen terme m’intéresse particulièrement, notamment à travers l’analyse de nouvelles données, l’optimisation des flux de traitement et le développement d’outils Python utiles aux équipes opérationnelles. Je souhaite contribuer à ces travaux d’Équilibre Offre-Demande dans le cadre d’un stage de fin d’études de six mois dès février 2027.'
      : 'Medium-term electricity consumption forecasting interests me particularly, from analyzing new data and improving data-processing flows to building Python tools for operational teams. I would like to contribute to this supply-demand balancing work through a six-month final-year internship starting in February 2027.';
  }
  // Apply the requested LinkedIn layout to this EDF dossier only:
  // one concise description followed by exactly three evidence-based bullets.
  // Keep manually edited non-empty descriptions when present.
  const descriptions: Record<CvLanguage, Record<string, string>> = {"FR":{"insurance":"Étude de cas : modélisation de coûts hospitaliers à partir de données structurées.","monstage":"Plateforme personnelle de collecte, d’automatisation et de suivi des offres de stage.","unified":"Préparation, analyse exploratoire et visualisation de données avec Python.","rws":"Évaluation de réponses de modèles d’IA selon des critères de qualité définis."},"EN":{"insurance":"Case study: predictive hospital cost modeling using structured data.","monstage":"Personal platform for collecting, automating and tracking internship offers.","unified":"Data cleaning, exploratory analysis and visualization using Python.","rws":"Evaluation of AI model outputs against defined quality criteria."}};
  const obsoleteDescriptions = new Set([
    'Modèles de régression et de classification sur des données structurées.',
    'Plateforme personnelle de collecte et de suivi d’offres de stage.',
    'Regression and classification models on structured data.',
    'Personal platform aggregating and tracking internship offers.',
    'Nettoyage, analyse exploratoire et visualisation de données.',
    'Évaluation structurée de réponses de modèles d’intelligence artificielle.',
    'Data preparation, exploratory analysis and visualization.',
    'Structured evaluation of AI model outputs.',
  ]);
  const normalizeEntry = <T extends { id: string; description?: string; bullets: string[] }>(entry: T): T => {
    const knownDescription = descriptions[next.language][entry.id];
    if (!knownDescription) return entry;
    const currentDescription = (entry.description || '').trim();
    return {
      ...entry,
      description: !currentDescription || obsoleteDescriptions.has(currentDescription) ? knownDescription : entry.description,
      bullets: entry.bullets.filter(Boolean).slice(0, 3),
    };
  };
  next.projects = next.projects.map(normalizeEntry);
  next.experience = next.experience.map(normalizeEntry);
  next.showMissionLabels = false;
  next.education = next.education.map(e => e.id === 'kju' && /^(Bases en programmation Python, systèmes de bases de données, algorithmique et développement logiciel\\.|Foundations in Python, database systems, algorithms and software development\\.)$/.test(e.details) ? { ...e, details: '' } : e);
  if (next.skills === '**Programmation & données :** Python, pandas, NumPy, SQL, jointures, agrégations, sous-requêtes\n**Analyse & modélisation :** statistiques, régression, évaluation de modèles\n**Machine Learning :** scikit-learn, PyTorch\n**Visualisation & outils :** Matplotlib, Jupyter, Git, Linux') {
    next.skills = '**Python & données :** Python, pandas, NumPy, SQL, jointures, agrégations, sous-requêtes\n**Modélisation & ML :** statistiques, régression, scikit-learn, évaluation de modèles\n**Visualisation & outils :** Matplotlib, Jupyter, Git, Linux, PyTorch';
  }
  if (next.interests === 'Négociation • Échanges interculturels • Cuisine') next.interests = '';
  if (next.certifications === undefined) next.certifications = selectedCertifications(cvPresets.EDF.certificates);
  if (!next.sectionOrder.includes('certifications')) {
    const idx = next.sectionOrder.indexOf('languages');
    next.sectionOrder = [...next.sectionOrder.slice(0, idx < 0 ? next.sectionOrder.length : idx),
      'certifications', ...next.sectionOrder.slice(idx < 0 ? next.sectionOrder.length : idx)];
  }
  next.education = next.education.map(e => {
    const known = e.id === 'ecn' ? cvPresets.EDF.ecn : e.id === 'kju' ? cvPresets.EDF.kju : null;
    if (!known) return e;
    const oldEcn = 'Data Analysis · Machine Learning · Stochastic Methods · Numerical Optimization';
    const oldKju = 'Python Programming · Database Management Systems · Data Structures';
    return e.keyCourses === (e.id === 'ecn' ? oldEcn : oldKju) ? {...e,keyCourses:known.join(' · ')} : e;
  });
  next.skills = next.skills.replace(/SQL \(bases\)/g, 'SQL, jointures, agrégations, sous-requêtes');
  next.projects = next.projects.map(project => project.id === 'insurance' && project.name === 'Modélisation prédictive — Analyse de coûts hospitaliers'
    ? {...project,name:'Étude de cas — Modélisation prédictive de coûts hospitaliers'} : project);
  return next;
}

// Upgrade only letters still containing the exact original generated text.
// A hand-edited letter must never be overwritten when MonStage reloads.
const legacyEdfLetterParagraphs: Record<CvLanguage, string[]> = {
  FR: [
    "Actuellement en dernière année du MSc Control and Robotics, parcours Data Science, Signal & Image Processing à Centrale Nantes, je recherche un stage de fin d’études de six mois dès février 2027. Je vous adresse ma candidature pour le stage de prévision de la consommation France au sein de l’Équilibre Offre-Demande Moyen Terme (réf. 2026-185820).",
    "Ce qui m’attire dans cette mission, c’est le lien direct entre les données, les modèles et les décisions opérationnelles. Anticiper l’évolution de la consommation électrique sur plusieurs années, dans un contexte de transformation des usages, est un sujet que je souhaite découvrir. Le travail de votre équipe sur l’intégration de nouvelles données et l’amélioration des outils Python correspond à ce que je recherche.",
    "Ma formation m’apporte des bases en analyse de données, machine learning, méthodes stochastiques et optimisation. Lors de mon stage en analyse de données, j’ai travaillé sur le nettoyage, l’exploration et la visualisation de jeux de données avec Python. Dans un projet personnel de modélisation prédictive, j’ai comparé des modèles de régression et évalué leurs résultats. MonStage m’a également permis de développer des flux de données automatisés. Je n’ai pas encore d’expérience en prévision de la demande électrique, mais je souhaite apprendre vos méthodes et contribuer avec rigueur.",
    "Je serais heureux de rejoindre l’équipe SoDATA, de travailler aux côtés des référents métier et d’échanger avec les ingénieurs-chercheurs de la R&D. Je vous remercie pour l’attention portée à ma candidature et serais ravi de présenter plus en détail ma motivation lors d’un entretien.",
  ],
  EN: [
    "I am in the final year of my MSc Control and Robotics at Centrale Nantes, specializing in Data Science, Signal & Image Processing, and seeking a six-month internship from February 2027. I am applying for the EDF medium-term electricity consumption forecasting internship (ref. 2026-185820).",
    "I am drawn to the close connection between data, models and operational decisions. Forecasting electricity demand over several years as consumption patterns change is exactly the kind of real-world problem I would like to learn about. I am particularly interested in your team’s work on integrating new data and improving Python tools.",
    "My studies cover data analysis, machine learning, stochastic methods and numerical optimization. In my Data Analyst internship I cleaned, explored and visualized datasets using Python. I have also evaluated regression models on a predictive modeling project, and automated data workflows through MonStage. While I have not yet worked on electricity demand forecasting, I am eager to learn your methods and contribute carefully.",
    "I would welcome the opportunity to join SoDATA, work alongside operational specialists and interact with R&D engineers. Thank you for considering my application. I would be happy to discuss my motivation in an interview.",
  ],
};
function refreshOldEdfLetter(letter: CoverLetterDraft): CoverLetterDraft {
  const known = legacyEdfLetterParagraphs[letter.language];
  if (letter.paragraphs.length !== known.length || !letter.paragraphs.every((p, i) => p === known[i])) return letter;
  const adapted = buildEdfEodLetter(letter.language);
  return { ...letter, paragraphs: adapted.paragraphs, closing: adapted.closing };
}

export function prepareEdfEodDossier(language: CvLanguage = 'FR') {
  const existing = loadApplicationDossier(EDF_EOD_DOSSIER_ID, language);
  if (existing) {
    const nextCv = compactExistingEdfCv(existing.cv);
    const nextLetter = refreshOldEdfLetter(existing.letter);
    if (JSON.stringify(nextCv) !== JSON.stringify(existing.cv) || JSON.stringify(nextLetter) !== JSON.stringify(existing.letter)) {
      const updated = { ...existing, cv: nextCv, letter: nextLetter };
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
